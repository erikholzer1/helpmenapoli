#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/geocode-spots.mjs
//
// Verifies every mapped spot in constants/discover.ts against authoritative
// OpenStreetMap (Nominatim) data — the same source the in-app map renders.
//
//   node scripts/geocode-spots.mjs
//
// NON-DESTRUCTIVE. It never edits discover.ts. It writes:
//   • scripts/geocode-report-<date>.md   — human-readable verification table
//   • scripts/geocode-patches.json        — confident lat/lng corrections to apply
//
// Nominatim usage policy: max 1 req/sec, descriptive User-Agent. ~255 spots ≈ 5 min.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from 'fs';

const SRC = 'constants/discover.ts';
const UA = 'HelpMeNapoli/1.0 (erikholzer1@gmail.com)';

// Campania bounding box — accept results inside it (covers Naples + day trips
// like Pompeii, Caserta, Pozzuoli, Sorrento, the islands).
const BBOX = { latMin: 40.0, latMax: 41.3, lonMin: 13.5, lonMax: 15.7 };
// A "moved a lot" flag if the OSM pin is more than this from the stored pin.
const FAR_KM = 0.6;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Pull every spot line. Names may be single- or double-quoted (apostrophes).
const LINE_RE =
  /name:\s*(['"])(.*?)\1\s*,\s*area:\s*(['"])(.*?)\3[\s\S]*?lat:\s*(-?[\d.]+)\s*,\s*lng:\s*(-?[\d.]+)/;

function parseSpots(text) {
  const lines = text.split('\n');
  const spots = [];
  lines.forEach((line, i) => {
    const m = line.match(LINE_RE);
    if (m) {
      spots.push({
        lineIndex: i,
        name: m[2],
        area: m[4],
        lat: parseFloat(m[5]),
        lng: parseFloat(m[6]),
      });
    }
  });
  return spots;
}

async function geocode(query) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=it&q=' +
    encodeURIComponent(query);
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const r = data[0];
  return { lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name };
}

function inBox(lat, lng) {
  return lat >= BBOX.latMin && lat <= BBOX.latMax && lng >= BBOX.lonMin && lng <= BBOX.lonMax;
}

async function main() {
  const text = readFileSync(SRC, 'utf8');
  const spots = parseSpots(text);
  console.log(`Parsed ${spots.length} mapped spots from ${SRC}\n`);

  const results = [];
  const patches = [];

  for (let i = 0; i < spots.length; i++) {
    const s = spots[i];
    let hit = null;
    // Try most-specific query first, then fall back.
    const queries = [
      `${s.name}, ${s.area}, Napoli`,
      `${s.name}, Napoli`,
      `${s.name}, ${s.area}, Campania`,
    ];
    for (const q of queries) {
      try {
        const g = await geocode(q);
        await sleep(1100); // respect 1 req/sec
        if (g && inBox(g.lat, g.lng)) { hit = g; break; }
      } catch (e) {
        await sleep(1100);
      }
    }

    let status, dist = null;
    if (!hit) {
      status = 'NOT FOUND';
    } else {
      dist = haversineKm(s.lat, s.lng, hit.lat, hit.lng);
      status = dist > FAR_KM ? 'MOVED' : 'OK';
      patches.push({
        lineIndex: s.lineIndex,
        name: s.name,
        area: s.area,
        oldLat: s.lat, oldLng: s.lng,
        lat: +hit.lat.toFixed(5), lng: +hit.lng.toFixed(5),
        distKm: +dist.toFixed(2),
        osm: hit.label,
      });
    }
    results.push({ ...s, status, dist, found: hit });
    console.log(`[${i + 1}/${spots.length}] ${status.padEnd(9)} ${s.name} (${s.area})${dist != null ? ` — ${dist.toFixed(2)} km` : ''}`);
  }

  // ── reports ────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const counts = results.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});

  const md = [
    `# Map verification — ${today}`,
    ``,
    `Checked **${spots.length}** spots against OpenStreetMap (Nominatim).`,
    ``,
    `- ✅ OK (pin within ${FAR_KM} km of OSM): **${counts.OK || 0}**`,
    `- 📍 MOVED (OSM pin >${FAR_KM} km away — likely correction): **${counts.MOVED || 0}**`,
    `- ❓ NOT FOUND in OSM (keep manual pin / needs local check): **${counts['NOT FOUND'] || 0}**`,
    ``,
    `## 📍 Corrections found (>${FAR_KM} km off)`,
    ``,
    `| Spot | Area | Was | OSM says | Off by |`,
    `| --- | --- | --- | --- | --- |`,
    ...results.filter((r) => r.status === 'MOVED').map((r) =>
      `| ${r.name} | ${r.area} | ${r.lat}, ${r.lng} | ${r.found.lat.toFixed(5)}, ${r.found.lng.toFixed(5)} | ${r.dist.toFixed(2)} km |`),
    ``,
    `## ❓ Not found in OpenStreetMap (need your local eye)`,
    ``,
    ...results.filter((r) => r.status === 'NOT FOUND').map((r) => `- ${r.name} — ${r.area}`),
    ``,
  ].join('\n');

  writeFileSync(`scripts/geocode-report-${today}.md`, md, 'utf8');
  writeFileSync('scripts/geocode-patches.json', JSON.stringify(patches, null, 2), 'utf8');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`OK: ${counts.OK || 0}  |  MOVED: ${counts.MOVED || 0}  |  NOT FOUND: ${counts['NOT FOUND'] || 0}`);
  console.log(`Report : scripts/geocode-report-${today}.md`);
  console.log(`Patches: scripts/geocode-patches.json (${patches.length} confident pins)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
