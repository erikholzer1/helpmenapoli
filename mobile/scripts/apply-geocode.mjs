#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/apply-geocode.mjs
//
// Classifies the OSM matches in geocode-patches.json and applies ONLY the
// confidently-correct ones to constants/discover.ts.
//
// Confident (AUTO-APPLY) = name token present in the OSM label
//                          AND the match is a real POI (not a bare street)
//                          AND the pin moves ≤ MAX_KM.
// Everything else is left untouched and printed for manual review.
//
// Backs up discover.ts → discover.ts.bak first. Fully reversible.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, copyFileSync } from 'fs';

const SRC = 'constants/discover.ts';
const MAX_KM = 1.5;

const patches = JSON.parse(readFileSync('scripts/geocode-patches.json', 'utf8'));

// Words that don't help identify a specific venue.
const STOP = new Set([
  'the', 'la', 'le', 'il', 'lo', 'da', 'di', 'de', 'del', 'della', 'dei', 'delle',
  'e', 'a', 'o', 'of', 'al', 'ai', 'in', 'con',
  'ristorante', 'pizzeria', 'bar', 'trattoria', 'caffe', 'osteria', 'pub', 'store',
  'napoli', 'naples', 'campania', 'italia', 'italy', 'via', 'viale', 'piazza',
]);
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').trim();
const tokens = (n) => norm(n).split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

// A label whose first component is a street type = matched a street, not the venue.
const STREET_FIRST = /^(via|viale|vico|piazza|piazzetta|corso|largo|discesa|salita|calata|riviera|traversa|gradini|rampe|strada)\b/i;

function classify(p) {
  const label = norm(p.osm || '');
  const firstPart = (p.osm || '').split(',')[0].trim();
  const nameHit = tokens(p.name).some((t) => label.includes(t));
  const isStreet = STREET_FIRST.test(firstPart);
  if (nameHit && !isStreet && p.distKm <= MAX_KM) return 'APPLY';
  if (nameHit && !isStreet && p.distKm <= 4) return 'REVIEW';
  return 'IGNORE';
}

const apply = [], review = [], ignore = [];
for (const p of patches) {
  const c = classify(p);
  (c === 'APPLY' ? apply : c === 'REVIEW' ? review : ignore).push(p);
}

// ── apply confident pins to the source ───────────────────────────────────────
copyFileSync(SRC, SRC + '.bak');
const lines = readFileSync(SRC, 'utf8').split('\n');
let changed = 0;
for (const p of apply) {
  const line = lines[p.lineIndex];
  if (!line) continue;
  const updated = line.replace(
    /lat:\s*-?[\d.]+\s*,\s*lng:\s*-?[\d.]+/,
    `lat: ${p.lat}, lng: ${p.lng}`
  );
  if (updated !== line) { lines[p.lineIndex] = updated; changed++; }
}
writeFileSync(SRC, lines.join('\n'), 'utf8');

console.log(`Applied ${changed} confident pin corrections (backup: ${SRC}.bak)\n`);
console.log(`APPLY:  ${apply.length}   REVIEW: ${review.length}   IGNORE: ${ignore.length}\n`);

console.log('── REVIEW (name matches but moved 1.5–4 km — likely a branch or needs a look) ──');
for (const p of review.sort((a, b) => a.distKm - b.distKm))
  console.log(`  ${p.distKm}km  ${p.name} (${p.area})  ->  ${p.osm.slice(0, 64)}`);

console.log('\n── IGNORE (kept your pin — geocoder matched a different/distant place) ──');
for (const p of ignore.sort((a, b) => b.distKm - a.distKm))
  console.log(`  ${p.distKm}km  ${p.name} (${p.area})  ->  ${p.osm.slice(0, 56)}`);
