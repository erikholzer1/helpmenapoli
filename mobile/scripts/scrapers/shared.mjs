// Shared helpers for every event-source adapter.
// ============================================================================
// Each adapter (grandenapoli, eventbrite, bandsintown, ticketone, dice) builds
// rows through `makeRow()` so categorization, date handling, HTML cleanup and
// the dedupe key are defined in exactly ONE place. Adapters only do the
// source-specific work of fetching and mapping raw fields into makeRow's input.

import crypto from 'node:crypto';

export const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';

// Naples city centre — used to keep only Naples-area events from sources that
// return a wider region (e.g. an artist's whole tour from Bandsintown).
export const NAPLES = { lat: 40.8518, lon: 14.2681 };

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// ── Category mapping ─────────────────────────────────────────────────────────
// Keyword heuristics over title + description + schema type. Returns one of the
// 6 buckets, or null to DROP (per the rule: only events people clearly
// understand and would slot into one of these).
const CATEGORY_RULES = [
  { cat: 'music',    type: ['MusicEvent', 'Festival'], kw: ['concert', 'concerto', 'live', 'dj', 'club', 'disco', 'gig', 'band', 'festival musicale', 'rave', 'techno', 'jazz', 'rock', 'nightlife', 'serata'] },
  { cat: 'theater',  type: ['TheaterEvent', 'DanceEvent', 'ScreeningEvent'], kw: ['teatro', 'theatre', 'theater', 'spettacolo', 'opera', 'balletto', 'danza', 'cinema', 'film', 'commedia', 'musical'] },
  { cat: 'food',     type: ['FoodEvent'], kw: ['sagra', 'food', 'cibo', 'degustazione', 'tasting', 'wine', 'vino', 'birra', 'beer', 'street food', 'cena', 'gastronom', 'pizza', 'cocktail', 'aperitivo'] },
  { cat: 'wellness', type: [], kw: ['yoga', 'meditazion', 'wellness', 'benessere', 'pilates', 'trekking', 'hiking', 'escursione', 'fitness', 'retreat', 'spa', 'massa'] },
  { cat: 'business', type: ['BusinessEvent', 'EducationEvent'], kw: ['networking', 'business', 'startup', 'workshop', 'conferenza', 'conference', 'seminar', 'meetup', 'corso', 'formazione', 'webinar', 'pitch', 'imprend'] },
  { cat: 'culture',  type: ['ExhibitionEvent', 'VisualArtsEvent', 'SocialEvent'], kw: ['mostra', 'exhibition', 'arte', 'art', 'museo', 'museum', 'cultura', 'cultural', 'libro', 'reading', 'presentazione', 'storia', 'guided tour', 'visita guidata'] },
];

export function categorize(title = '', description = '', types = []) {
  const hay = `${title} ${description}`.toLowerCase();
  const typeSet = new Set(types.map((t) => String(t)));
  // 1) Strong signal: schema.org type.
  for (const rule of CATEGORY_RULES) {
    if (rule.type.some((t) => typeSet.has(t))) return rule.cat;
  }
  // 2) Keyword match (music/theater/food first — most common in Naples).
  for (const rule of CATEGORY_RULES) {
    if (rule.kw.some((k) => hay.includes(k))) return rule.cat;
  }
  return null; // doesn't clearly fit → drop
}

// HTML from listing sites is riddled with tags + entities. Decode common
// entities FIRST (markup is often entity-encoded, e.g. "&lt;p&gt;"), THEN strip
// the now-real tags, THEN collapse whitespace.
export function decodeHtml(s) {
  if (!s) return s;
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\[nrt]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toIsoDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString().split('T')[0];
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// Builds a normalized DB row from source-agnostic fields, or null if the event
// is unusable (no title/date), in the past, or doesn't fit one of the 6
// categories. This is the single chokepoint every adapter funnels through.
const VALID_CATEGORIES = new Set(['music', 'theater', 'food', 'culture', 'wellness', 'business', 'sport']);

export function makeRow({
  source,
  title,
  description = '',
  startISO,
  endISO = null,
  venue = null,
  area = null,
  priceText = null,
  isFree = false,
  ticketUrl = null,
  imageUrl = null,
  types = [],
  category: categoryOverride = null, // when the source already knows the bucket
}) {
  const cleanTitle = decodeHtml(title || '');
  const date = toIsoDate(startISO);
  if (!cleanTitle || !date) return null;

  const endDate = toIsoDate(endISO);
  if ((endDate ?? date) < todayISO()) return null; // past event

  const cleanDesc = decodeHtml(description || '').slice(0, 400) || null;
  // Trust an explicit, valid override; otherwise infer from text + types.
  const category = (categoryOverride && VALID_CATEGORIES.has(categoryOverride))
    ? categoryOverride
    : categorize(cleanTitle, cleanDesc ?? '', types);
  if (!category) return null;

  const cleanVenue = decodeHtml(venue || '') || null;

  // A "00:00" time is almost always a date-only artifact — drop it so the card
  // doesn't show a misleading midnight.
  const rawTime = startISO && String(startISO).includes('T') ? String(startISO).slice(11, 16) : null;
  const time = rawTime && rawTime !== '00:00' ? rawTime : null;

  const free = Boolean(isFree) || /\b(free|gratis|gratuito|ingresso libero)\b/i.test(priceText || '');

  const external_id = crypto
    .createHash('sha1')
    .update(`${source}|${cleanTitle}|${date}|${cleanVenue ?? ''}`)
    .digest('hex');

  return {
    title: cleanTitle,
    description: cleanDesc,
    category,
    venue: cleanVenue,
    area: area ? decodeHtml(area) : null,
    date,
    end_date: endDate && endDate !== date ? endDate : null,
    time,
    price: free ? null : (priceText || null),
    free,
    image_url: imageUrl || null,
    ticket_url: ticketUrl || null,
    source,
    external_id,
  };
}

// De-dupes a row list by external_id (used within and across adapters).
export function dedupe(rows) {
  const seen = new Map();
  for (const r of rows) if (r) seen.set(r.external_id, r);
  return [...seen.values()];
}
