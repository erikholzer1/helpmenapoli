#!/usr/bin/env node
// HelpMeNapoli — weekly scraper health check
// ============================================================================
// Runs every source live AND inspects the Supabase table, then asserts a set
// of invariants. Exits non-zero when something looks wrong, which makes the
// GitHub Actions job fail and emails Erik — that's the alerting mechanism.
//
// WHY THIS EXISTS: two silent failures went unnoticed for weeks. TheSportsDB
// throttled its free tier and Napoli fixtures quietly became zero, and stale
// rows piled up as duplicates without anything complaining. Every check below
// corresponds to a real failure that actually happened.
//
// Run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/health-check.mjs

import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

try { process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))); } catch { /* CI has no .env */ }

import { dedupe, resolveDuplicates, todayISO } from './scrapers/shared.mjs';
import { scrapeJsonLd } from './scrapers/jsonld.mjs';
import { scrapeEventbrite } from './scrapers/eventbrite.mjs';
import { scrapeTicketone } from './scrapers/ticketone.mjs';
import { scrapeDice } from './scrapers/dice.mjs';
import { scrapeColdiretti } from './scrapers/coldiretti.mjs';
import { scrapeNapoliateatro } from './scrapers/napoliateatro.mjs';
import { scrapeNomea } from './scrapers/nomea.mjs';
import { scrapeCampaniaEvents } from './scrapers/campaniaevents.mjs';
import { scrapeXceed } from './scrapers/xceed.mjs';
import { scrapeSagre } from './scrapers/sagre.mjs';

// Minimum rows a source should return when healthy. Set below the observed
// norm so normal week-to-week variation doesn't cry wolf; the point is to
// catch a source going to ~0, not to police exact counts.
const SOURCES = [
  ['grandenapoli',   10, () => scrapeJsonLd('grandenapoli', ['https://grandenapoli.it/eventi/categoria/eventi/'])],
  ['eventbrite',     20, () => scrapeEventbrite()],
  ['ticketone',       5, () => scrapeTicketone()],
  ['dice',            5, () => scrapeDice()],
  ['coldiretti',      0, () => scrapeColdiretti()], // 0 between monthly calendar posts
  ['napoliateatro',   1, () => scrapeNapoliateatro()],
  ['iltaccodibacco', 15, () => scrapeJsonLd('iltaccodibacco', ['https://iltaccodibacco.it/napoli/'])],
  ['nomea',           0, () => scrapeNomea()],       // small venue, often quiet
  ['campaniaevents', 10, () => scrapeCampaniaEvents()],
  ['xceed',           0, () => scrapeXceed()],       // nightlife, sparse midweek
  ['sagre',           3, () => scrapeSagre()],
];

const problems = [];
const warnings = [];
const notes = [];

function fail(msg) { problems.push(msg); }
function warn(msg) { warnings.push(msg); }

// Same normalization the dedup uses, so "duplicate" here means what a user
// would call a duplicate on screen.
function norm(s) {
  return (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  console.log(`HelpMeNapoli health check — ${new Date().toISOString()}\n`);

  // ── 1. Live source check ──────────────────────────────────────────────────
  console.log('── Sources ──');
  const all = [];
  for (const [id, min, fn] of SOURCES) {
    let rows = [];
    let errored = false;
    try {
      rows = await fn();
    } catch (err) {
      errored = true;
      fail(`Source "${id}" CRASHED: ${err.message}`);
    }
    all.push(...rows);
    const flag = errored ? 'CRASH' : rows.length < min ? 'LOW  ' : 'ok   ';
    console.log(`  ${flag} ${id.padEnd(16)} ${String(rows.length).padStart(4)} events (min ${min})`);
    if (!errored && rows.length < min) {
      fail(`Source "${id}" returned ${rows.length} events, expected at least ${min} — likely broken or blocked.`);
    }
  }

  const deduped = dedupe(all);
  const { kept, dropped } = resolveDuplicates(deduped);
  console.log(`\n  scraped ${all.length} → ${deduped.length} after hash-dedup → ${kept.length} after cross-source dedup (${dropped.length} merged)`);

  if (!kept.length) fail('Scrape produced ZERO events overall.');

  // ── 2. Category sanity ────────────────────────────────────────────────────
  console.log('\n── Categories (live scrape) ──');
  const cats = kept.reduce((a, r) => ((a[r.category] = (a[r.category] || 0) + 1), a), {});
  console.log(' ', cats);
  for (const c of ['music', 'food', 'culture', 'theater']) {
    if (!cats[c]) fail(`Category "${c}" has ZERO events — categorization or a source is broken.`);
  }
  // A single category swallowing everything means the categorizer has drifted.
  const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] / kept.length > 0.75) {
    warn(`Category "${top[0]}" holds ${Math.round(top[1] / kept.length * 100)}% of all events — categorization may be skewed.`);
  }

  // ── 3. Database state ─────────────────────────────────────────────────────
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !KEY) {
    warn('No Supabase credentials — skipped database checks.');
  } else {
    const supabase = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });
    const today = todayISO();

    const { data: live, error } = await supabase
      .from('events')
      .select('title, date, source, category, updated_at')
      .gte('date', today)
      .limit(2000);

    if (error) {
      fail(`Database read failed: ${error.message}`);
    } else {
      console.log(`\n── Database ──\n  ${live.length} upcoming rows`);

      // Duplicates as a user would see them: same normalized title, same day.
      const seen = new Map();
      const dupes = [];
      for (const r of live) {
        const k = `${norm(r.title)}|${r.date}`;
        if (seen.has(k)) dupes.push(r); else seen.set(k, r);
      }
      if (dupes.length) {
        fail(`${dupes.length} duplicate row(s) visible in the app (same title + date).`);
        dupes.slice(0, 10).forEach((r) => notes.push(`   dup: ${r.date} "${r.title.slice(0, 60)}" (${r.source})`));
      } else {
        console.log('  no duplicate title+date pairs ✓');
      }

      // Coverage: something to show today and across the coming week.
      const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const todayCount = live.filter((r) => r.date === today).length;
      const weekCount = live.filter((r) => r.date >= today && r.date <= weekEnd).length;
      console.log(`  today: ${todayCount} · next 7 days: ${weekCount}`);
      if (!todayCount) warn('No events listed for TODAY — the app will look empty on open.');
      if (weekCount < 10) fail(`Only ${weekCount} events in the next 7 days — coverage is too thin.`);

      // Napoli fixtures — this is the check that would have caught the
      // TheSportsDB throttling within a week instead of never.
      const fixtures = live.filter((r) => r.source === 'napoli_home').length;
      console.log(`  Napoli home fixtures: ${fixtures}`);
      if (!fixtures) fail('No Napoli home fixtures in the database — the fixtures scraper is broken.');

      // Freshness: the daily job should have touched rows recently.
      const newest = live.reduce((m, r) => (r.updated_at > m ? r.updated_at : m), '');
      if (newest) {
        const ageHrs = (Date.now() - new Date(newest).getTime()) / 3600000;
        console.log(`  most recent write: ${ageHrs.toFixed(1)}h ago`);
        if (ageHrs > 48) fail(`Newest row is ${ageHrs.toFixed(0)}h old — the daily scrape has not run successfully.`);
      }

      // Strikes table reachable (separate table, separate failure mode).
      const { error: sErr } = await supabase.from('strikes').select('id').limit(1);
      if (sErr) fail(`Strikes table unreadable: ${sErr.message}`);
      else console.log('  strikes table reachable ✓');
    }
  }

  // ── Report ────────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  if (notes.length) { console.log('\nDetails:'); notes.forEach((n) => console.log(n)); }
  if (warnings.length) {
    console.log(`\nWARNINGS (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  ! ${w}`));
  }
  if (problems.length) {
    console.log(`\nPROBLEMS (${problems.length}):`);
    problems.forEach((p) => console.log(`  ✗ ${p}`));
    console.log('\nHealth check FAILED.');
    process.exit(1);
  }
  console.log('\nAll checks passed ✓');
}

main().catch((e) => { console.error('Health check crashed:', e); process.exit(1); });
