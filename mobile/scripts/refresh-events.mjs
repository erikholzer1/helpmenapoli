#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/refresh-events.mjs
//
// Run every Thursday from the helpmenapoli/mobile/ directory:
//   node scripts/refresh-events.mjs
//
// What it does:
//   1. Fetches the 6 event source pages
//   2. Strips HTML to plain text
//   3. Dumps a raw snapshot to scripts/events-raw-YYYY-MM-DD.txt
//
// After running, open the .txt file and paste it into Claude Code with:
//   "Translate these events into English and update constants/events.ts"
// ─────────────────────────────────────────────────────────────────────────────

import { writeFileSync } from 'fs';

const SOURCES = [
  { label: 'GrandeNapoli — All events',   url: 'https://grandenapoli.it/eventi/' },
  { label: 'NapoliDaVivere — Concerts',   url: 'https://www.napolidavivere.it/category/eventi/concerti-musica-napoli/' },
  { label: 'NapoliDaVivere — Exhibitions',url: 'https://www.napolidavivere.it/category/arte-e-cultura/mostre/' },
  { label: 'NapoliDaVivere — Festivals',  url: 'https://www.napolidavivere.it/category/eventi/sagre-e-feste/' },
  { label: 'NapoliDaVivere — Theater',    url: 'https://www.napolidavivere.it/category/eventi/spettacoli-teatrali-napoli/' },
  { label: 'NapoliDaVivere — Free',       url: 'https://www.napolidavivere.it/tag/gratis/' },
];

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s{3,}/g, '\n\n')
    .trim();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HelpMeNapoli/1.0)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  return stripHtml(html).slice(0, 8000); // cap per source
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  const outFile = `scripts/events-raw-${today}.txt`;
  const lines = [`Naples Events — Raw fetch ${today}\n${'='.repeat(60)}\n`];

  for (const { label, url } of SOURCES) {
    console.log(`Fetching: ${label}`);
    try {
      const text = await fetchText(url);
      lines.push(`\n${'─'.repeat(60)}\n${label}\n${url}\n${'─'.repeat(60)}\n${text}\n`);
    } catch (err) {
      lines.push(`\n[FAILED] ${label}: ${err.message}\n`);
      console.error(`  ✗ ${err.message}`);
    }
  }

  writeFileSync(outFile, lines.join(''), 'utf8');
  console.log(`\n✓ Raw dump saved to: ${outFile}`);
  console.log('\nNext step: paste this file into Claude Code with:');
  console.log('  "Translate these events and update constants/events.ts"\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
