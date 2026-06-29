// Large English→Italian fallback dictionary for the phrasebook search.
//
// Source: FreeDict eng-ita (https://freedict.org), Creative Commons licensed —
// ~35k headwords parsed into a flat { english: "italian, italian" } map.
// `overrides` below is a small hand-curated layer for gaps/loanwords FreeDict
// misses (e.g. "cracker", which is just "cracker" in Italian) — extend freely.

const data: Record<string, string> = require('@/assets/dictionary.json');

const overrides: Record<string, string> = {
  cracker: 'cracker (i cracker)',
  crackers: 'cracker',
  wifi: 'wi-fi',
  smartphone: 'smartphone',
  charger: 'caricabatterie',
  hangover: 'i postumi della sbornia',
  straw: 'cannuccia',
  napkin: 'tovagliolo',
  receipt: 'scontrino',
  sunscreen: 'crema solare',
  sparkling: 'frizzante',
  still: 'naturale',
  takeaway: "da asporto",
  tip: 'mancia',
};

const merged: Record<string, string> = { ...data, ...overrides };
const keys = Object.keys(merged);

export type DictMatch = { english: string; italian: string };

// Returns best English→Italian matches for a query, most relevant first.
export function lookupDictionary(raw: string, limit = 25): DictMatch[] {
  const q = raw.trim().toLowerCase();
  if (q.length < 2) return [];

  const exact: string[] = [];
  const prefix: string[] = [];
  const plural: string[] = []; // query is a longer form of the headword (crackers → cracker)
  const includes: string[] = [];

  for (const k of keys) {
    if (k === q) exact.push(k);
    else if (k.startsWith(q)) prefix.push(k);
    else if (q.startsWith(k) && k.length >= 4) plural.push(k);
    else if (k.includes(q)) includes.push(k);
    if (exact.length + prefix.length >= limit && q.length >= 3) {
      // enough strong matches — stop scanning the long tail
      if (includes.length > limit) break;
    }
  }

  prefix.sort((a, b) => a.length - b.length);
  includes.sort((a, b) => a.length - b.length);

  const ordered = [...exact, ...prefix, ...plural, ...includes].slice(0, limit);
  return ordered.map((k) => ({ english: k, italian: merged[k] }));
}
