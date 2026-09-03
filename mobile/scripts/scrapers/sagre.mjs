// Sagre & food festivals — scraped from sagr.it (Naples & surroundings).
// ============================================================================
// Source: https://sagr.it/campania/napoli-e-dintorni/<mese>-<anno>
//
// WHY THIS SOURCE: the existing sources are concert/theatre heavy — food was
// only 8 of 241 events, so sagre, the Bufala Fest, pasta and tomato festivals
// were all missing. iltaccodibacco's /sagre/ path looks promising but doesn't
// actually filter (it returns the same general listing), so it's no help here.
//
// Markup: each card is `<a class="bg-white ..." href=".../eventi/<slug>">`
// containing an <h3> title, a `calendar_today` span with an Italian date or
// date range, and a `location_on` span with the town.

import { makeRow, decodeHtml } from './shared.mjs';

const BASE = 'https://sagr.it/campania/napoli-e-dintorni';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const MONTHS_IT = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MONTH_INDEX = Object.fromEntries(MONTHS_IT.map((m, i) => [m, i + 1]));

// Which month pages to pull: this month plus the next two.
function monthsToFetch(count = 3) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    out.push(`${MONTHS_IT[d.getMonth()]}-${d.getFullYear()}`);
  }
  return out;
}

// "2 settembre – 6 settembre 2026" → { start: '2026-09-02', end: '2026-09-06' }
// "12 settembre 2026"              → { start: '2026-09-12', end: null }
// The opening date often omits the year — it's borrowed from the closing one.
function parseDateRange(text) {
  if (!text) return null;
  const clean = decodeHtml(text).toLowerCase();
  const monthNames = MONTHS_IT.join('|');
  const re = new RegExp(`(\\d{1,2})\\s*(${monthNames})?\\s*(20\\d{2})?`, 'g');

  const parts = [];
  let m;
  while ((m = re.exec(clean)) !== null) {
    if (!m[1] || (!m[2] && !m[3])) continue; // need at least a month or a year
    parts.push({ day: Number(m[1]), month: m[2] ? MONTH_INDEX[m[2]] : null, year: m[3] ? Number(m[3]) : null });
    if (parts.length === 2) break;
  }
  if (!parts.length) return null;

  const last = parts[parts.length - 1];
  const iso = (p) => {
    const month = p.month ?? last.month;
    const year = p.year ?? last.year ?? new Date().getFullYear();
    if (!month) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
  };

  const start = iso(parts[0]);
  const end = parts.length > 1 ? iso(parts[1]) : null;
  if (!start) return null;
  return { start, end: end && end !== start ? end : null };
}

function parseCards(html) {
  const out = [];
  for (const block of html.split(/<a class="bg-white/).slice(1)) {
    const b = block.slice(0, 2500);
    const title = decodeHtml((b.match(/<h3[^>]*>([^<]+)<\/h3>/) || [])[1] || '');
    const dateTxt = (b.match(/calendar_today<\/span><span>([^<]+)<\/span>/) || [])[1];
    const town = decodeHtml((b.match(/location_on<\/span><span>([^<]+)<\/span>/) || [])[1] || '');
    const href = (b.match(/href="([^"]+)"/) || [])[1];
    if (!title || !dateTxt) continue;

    const range = parseDateRange(dateTxt);
    if (!range) continue;

    out.push({ title, town, href, ...range });
  }
  return out;
}

export async function scrapeSagre() {
  const rows = [];
  const seenPages = monthsToFetch();

  for (const slug of seenPages) {
    try {
      const res = await fetch(`${BASE}/${slug}`, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'it-IT,it;q=0.9' },
      });
      if (!res.ok) { console.warn(`· sagre ${slug}: HTTP ${res.status}`); continue; }
      const html = await res.text();

      for (const c of parseCards(html)) {
        const row = makeRow({
          source:      'sagre',
          title:       c.town && !c.title.toLowerCase().includes(c.town.toLowerCase())
            ? `${c.title} — ${c.town}`
            : c.title,
          description: `Sagra / food festival in ${c.town || 'Campania'}.`,
          startISO:    c.start,
          endISO:      c.end,
          venue:       c.town || null,
          area:        c.town || 'Campania',
          isFree:      false,
          ticketUrl:   c.href ? `https://sagr.it${c.href}` : null,
          category:    'food', // sagre are food festivals by definition
        });
        if (row) rows.push(row);
      }
    } catch (err) {
      console.warn(`· sagre ${slug} failed: ${err.message}`);
    }
  }

  console.log(`· sagre: ${rows.length} food festivals across ${seenPages.length} month pages`);
  return rows;
}
