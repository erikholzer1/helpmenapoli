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
  { cat: 'music',    type: ['MusicEvent', 'Festival'], kw: ['concert', 'concerto', 'live', 'dj', 'club', 'disco', 'gig', 'band', 'festival musicale', 'rave', 'techno', 'jazz', 'rock', 'nightlife', 'serata', 'musica'] },
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

// ── Cross-source dedup ───────────────────────────────────────────────────────
// Different sites list the SAME real-world event under different titles,
// venues and (per-source) external_id hashes — e.g. "Coez in concerto" shows
// up on both iltaccodibacco and campaniaevents. dedupe() above only catches
// exact repeats within one source; this catches the same event across sources
// by matching a normalized title + date.

const ITALIAN_MONTHS = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

// Extracts the earliest future date mentioned in Italian text, e.g.
// "venerdì 3 luglio 2026", "dal 3 luglio 2026", "1° luglio 2026".
export function extractItalianDate(text) {
  const clean = text.toLowerCase();
  const monthNames = Object.keys(ITALIAN_MONTHS).join('|');
  const re = new RegExp(`(\\d{1,2})[°º]?\\s+(${monthNames})\\s+(20\\d{2})`, 'gi');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let earliest = null;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const day   = m[1].padStart(2, '0');
    const month = ITALIAN_MONTHS[m[2].toLowerCase()];
    const year  = m[3];
    const iso   = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (d >= today && (!earliest || d < new Date(earliest))) earliest = iso;
  }
  return earliest;
}

// Real listings for the same show vary wildly in wording across sites —
// "Coez in concerto all'Anfiteatro degli Scavi di Pompei" vs "Pompei | COEZ
// Live 2026 - From the Rooftop" — so exact-string matching after cleanup
// isn't enough. Instead: same date + significant-word overlap between titles.
const TITLE_STOPWORDS = new Set([
  'di', 'del', 'della', 'dei', 'degli', 'delle', 'la', 'lo', 'il', 'le', 'i', 'gli',
  'un', 'una', 'in', 'a', 'al', 'allo', 'alla', 'all', 'agli', 'con', 'e', 'per',
  'da', 'su', 'the', 'and', 'from', 'ore',
  'concerto', 'concert', 'live', 'tour', 'festival', 'show', 'evento', 'edizione',
  // Generic event-description nouns — too common across unrelated shows to be
  // a useful signal (caused "Premio Paolo Tesauro" to falsely match
  // "Premio Napoli in Danza" on the word "premio" alone).
  'premio', 'presentazione', 'anteprima', 'rassegna', 'mostra', 'giornata',
  'centro', 'dedicato', 'scavi', 'spettacolo',
  // City/venue names — real signal for confirming a match, but too weak to
  // be the ONLY shared word (many unrelated events share a city or venue).
  'napoli', 'pompei', 'caserta', 'arena', 'teatro', 'reggia', 'museo', 'palazzo',
  'piazza', 'anfiteatro', 'palapartenope', 'stadio', 'villa',
]);

function titleTokens(title) {
  return title
    .replace(/([a-z])([A-Z])/g, '$1 $2') // split glued camelCase, e.g. "TonyPitony"
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents (combining diacritical marks)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !TITLE_STOPWORDS.has(w) && !/^(19|20)\d{2}$/.test(w));
}

// Same event if they share enough distinctive words (e.g. the artist name) —
// requires at least one shared token of length >= 4 to avoid coincidental
// short-word matches, and that overlap covers at least half of the smaller
// title's significant words.
function sameEvent(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const shared = [...setA].filter((w) => setB.has(w));
  if (!shared.length || !shared.some((w) => w.length >= 4)) return false;
  const minSize = Math.min(setA.size, setB.size);
  return minSize > 0 && shared.length / minSize >= 0.5;
}

// Sources ranked by reliability/completeness — official ticketing platforms
// first, aggregator/blog sites last. Used to pick a winner when the same
// event is found on multiple sources.
const SOURCE_PRIORITY = [
  'eventbrite', 'ticketone', 'dice', 'bandsintown', 'xceed',
  'grandenapoli', 'napoliateatro', 'iltaccodibacco', 'nomea', 'campaniaevents',
  'coldiretti',
];

function sourceRank(source) {
  const i = SOURCE_PRIORITY.indexOf(source);
  return i === -1 ? SOURCE_PRIORITY.length : i;
}

function richness(row) {
  return [row.image_url, row.ticket_url, row.venue, row.price].filter(Boolean).length;
}

// Collapses rows that describe the same real-world event across different
// sources (same date, overlapping distinctive title words), keeping the
// single best row. Returns both the survivors and the dropped rows, so
// callers can also clean up any stale copies of the losers already sitting
// in the DB from a prior run.
export function resolveDuplicates(rows) {
  // Only compare titles that fall on the same day — keeps this cheap and
  // avoids cross-date false positives entirely.
  const byDate = new Map();
  rows.forEach((r, i) => {
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date).push(i);
  });

  const tokens = rows.map((r) => titleTokens(r.title));

  // Union-find so matches chain transitively (A~B, B~C ⇒ one group of 3).
  const parent = rows.map((_, i) => i);
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }

  for (const idxs of byDate.values()) {
    for (let i = 0; i < idxs.length; i++) {
      for (let j = i + 1; j < idxs.length; j++) {
        const a = idxs[i], b = idxs[j];
        if (rows[a].source === rows[b].source) continue; // same-source dupes already handled by dedupe()
        if (sameEvent(tokens[a], tokens[b])) union(a, b);
      }
    }
  }

  const groups = new Map();
  rows.forEach((r, i) => {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(r);
  });

  const kept = [];
  const dropped = [];
  for (const group of groups.values()) {
    if (group.length === 1) { kept.push(group[0]); continue; }
    let winner = group[0];
    for (const r of group.slice(1)) {
      const better = sourceRank(r.source) < sourceRank(winner.source)
        || (sourceRank(r.source) === sourceRank(winner.source) && richness(r) > richness(winner));
      if (better) winner = r;
    }
    kept.push(winner);
    dropped.push(...group.filter((r) => r !== winner));
  }
  return { kept, dropped };
}
