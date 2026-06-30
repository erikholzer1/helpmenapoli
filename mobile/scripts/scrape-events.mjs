#!/usr/bin/env node
// HelpMeNapoli — events scraper (orchestrator)
// ============================================================================
// Pulls upcoming Naples-area events from every configured source, maps each
// into one of our 6 categories (dropping anything that doesn't fit), de-dupes,
// and UPSERTS into the Supabase `events` table. Runs every 24h (see
// .github/workflows/scrape-events.yml).
//
// Sources (each lives in scripts/scrapers/ and self-skips when not configured):
//   • grandenapoli — schema.org JSON-LD over plain fetch (always on)
//   • eventbrite   — official API, org-scoped     (needs EVENTBRITE_TOKEN)
//   • bandsintown  — official API, artist-scoped   (needs BANDSINTOWN_APP_ID + _ARTISTS)
//   • ticketone    — Playwright (JS-rendered)      (needs `npx playwright install chromium`)
//   • dice         — Playwright (intercepts api.dice.fm)
//   • admin rows in Supabase are never touched (source='admin', external_id null)
//
// Run:  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/scrape-events.mjs
//   --dry            print what WOULD be written, don't touch the DB
//   --only=a,b       run only these sources (e.g. --only=grandenapoli,dice)
// ============================================================================

import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { dedupe, todayISO } from './scrapers/shared.mjs';

// Auto-load mobile/.env for local runs so `node scripts/scrape-events.mjs` just
// works. CI passes env via Actions secrets, where this file is absent — hence
// the try/catch.
try { process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url))); } catch { /* no .env */ }
import { scrapeJsonLd } from './scrapers/jsonld.mjs';
import { scrapeEventbrite } from './scrapers/eventbrite.mjs';
import { scrapeBandsintown } from './scrapers/bandsintown.mjs';
import { scrapeTicketone } from './scrapers/ticketone.mjs';
import { scrapeDice } from './scrapers/dice.mjs';
import { scrapeColdiretti } from './scrapers/coldiretti.mjs';
import { scrapeStrikes } from './scrapers/strikes.mjs';
import { scrapeNapoliMatches } from './scrapers/napoli-matches.mjs';

const DRY_RUN = process.argv.includes('--dry');
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '')
  .split('=')[1]?.split(',').map((s) => s.trim()).filter(Boolean);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DRY_RUN && (!SUPABASE_URL || !SERVICE_ROLE_KEY)) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

// Registry: id → scrape function. Each returns a list of normalized rows.
const SOURCES = [
  ['grandenapoli', () => scrapeJsonLd('grandenapoli', [
    'https://grandenapoli.it/eventi/categoria/eventi/',
    'https://grandenapoli.it',
  ])],
  ['eventbrite',  scrapeEventbrite],
  ['bandsintown', scrapeBandsintown],
  ['ticketone',   scrapeTicketone],
  ['dice',        scrapeDice],
  ['coldiretti',  () => scrapeColdiretti()],
];

async function main() {
  console.log(`HelpMeNapoli event scrape — ${new Date().toISOString()}${DRY_RUN ? ' (dry run)' : ''}`);
  if (ONLY) console.log(`(only: ${ONLY.join(', ')})`);

  const all = [];
  for (const [id, fn] of SOURCES) {
    if (ONLY && !ONLY.includes(id)) continue;
    try {
      all.push(...(await fn()));
    } catch (err) {
      console.warn(`· ${id} crashed: ${err.message}`);
    }
  }

  const rows = dedupe(all);

  console.log(`\nTotal: ${rows.length} unique upcoming events across categories:`);
  console.log(rows.reduce((a, r) => ((a[r.category] = (a[r.category] || 0) + 1), a), {}));
  console.log('By source:', rows.reduce((a, r) => ((a[r.source] = (a[r.source] || 0) + 1), a), {}));

  if (DRY_RUN) {
    console.log('\n--dry: not writing. Sample:');
    console.log(JSON.stringify(rows.slice(0, 3), null, 2));
    return;
  }

  if (rows.length === 0) {
    console.log('No rows to upsert. (Sources may be blocking, unconfigured, or empty.)');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // Upsert on (source, external_id). Admin rows have external_id = null, so the
  // unique index never collides with them — admin entries are never touched.
  const { error } = await supabase
    .from('events')
    .upsert(rows, { onConflict: 'source,external_id', ignoreDuplicates: false });
  if (error) {
    console.error('Upsert failed:', error.message);
    process.exit(1);
  }

  // Prune scraped events that have ended (keep the table to "upcoming"). Admin
  // rows are left alone.
  const today = todayISO();
  const { error: pruneErr } = await supabase
    .from('events')
    .delete()
    .neq('source', 'admin')
    .or(`end_date.lt.${today},and(end_date.is.null,date.lt.${today})`);
  if (pruneErr) console.warn('Prune warning:', pruneErr.message);

  console.log(`\nDone. Upserted ${rows.length} events.`);

  // Strikes — separate table, scraper handles its own upsert + cleanup.
  console.log('\n── Strike calendar ──');
  try {
    await scrapeStrikes(supabase);
  } catch (err) {
    console.warn('· strikes crashed:', err.message);
  }

  // Napoli home fixtures — upserts directly into events table.
  console.log('\n── Napoli home fixtures ──');
  try {
    await scrapeNapoliMatches(supabase);
  } catch (err) {
    console.warn('· napoli-matches crashed:', err.message);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
