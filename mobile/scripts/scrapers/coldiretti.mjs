// Coldiretti Campagna Amica — Naples farmers' markets adapter.
// ============================================================================
// https://campania.coldiretti.it/calendari-mercati-napoli/ publishes a monthly
// table of "Campagna Amica" farmers' markets across Naples: a header naming the
// month ("CALENDARIO MESE GIUGNO 2026"), then rows of day ("Sabato 6") + one or
// more market locations (the day cell rowspans over its locations). Hours are
// 8:30–13:30. Plain fetch (no JS), parsed from the table.
//
// Each (date × location) becomes one free `food` event. The page is refreshed
// monthly, so the scraper picks up whatever month is published; past dates are
// dropped by makeRow.

import { UA, makeRow, dedupe } from './shared.mjs';

const DEFAULT_URL = 'https://campania.coldiretti.it/calendari-mercati-napoli/';

const MONTHS = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
};
// "Mercoledì 3", "Sabato 6" … — weekday name (accented or not) + day-of-month.
const DAY_RE = /(luned|marted|mercoled|gioved|venerd|sabato|domenica)[ìi']*\s+(\d{1,2})/i;

function clean(s) {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isHeader(s) {
  return /giorno|piazza\/via/i.test(s);
}

export async function scrapeColdiretti(url = DEFAULT_URL) {
  let html;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'it-IT,it;q=0.9' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    console.warn(`· coldiretti FAILED: ${err.message}`);
    return [];
  }

  // Detect the calendar's month/year from tag-stripped text ("…MESE GIUGNO
  // 2026…") so dates are stamped from the PAGE, not from today — the published
  // month can lag the current one. Fall back to today only if not found.
  const now = new Date();
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');
  const mm = text.match(/mese\s+([a-zàèéìòù]+)\s+(\d{4})/i);
  const month = mm && MONTHS[mm[1].toLowerCase()] ? MONTHS[mm[1].toLowerCase()] : now.getMonth() + 1;
  const year = mm ? Number(mm[2]) : now.getFullYear();

  const table = html.match(/<table[\s\S]*?<\/table>/i);
  if (!table) {
    console.log('· coldiretti: 0 events (market table not found — page layout may have changed)');
    return [];
  }
  const rows = table[0].match(/<tr[\s\S]*?<\/tr>/gi) || [];

  const out = [];
  let curDate = null;
  for (const r of rows) {
    const cells = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => clean(m[1]));
    if (cells.length === 0) continue;

    const locations = [];
    if (cells.length >= 2) {
      const d = cells[0].match(DAY_RE);
      if (d) {
        curDate = `${year}-${String(month).padStart(2, '0')}-${String(Number(d[2])).padStart(2, '0')}`;
      }
      for (const c of cells.slice(1)) if (c && !isHeader(c)) locations.push(c);
    } else if (!isHeader(cells[0])) {
      locations.push(cells[0]); // single cell → another location under current day
    }

    if (!curDate) continue;
    for (const loc of locations) {
      if (loc.length < 3) continue;
      // "Piazza X - Posillipo" → area = the neighbourhood after the dash.
      const parts = loc.split(/\s[-–]\s/);
      const area = parts.length > 1 ? parts[parts.length - 1] : null;
      const row = makeRow({
        source: 'coldiretti',
        title: `Mercato Campagna Amica — ${loc}`,
        description: 'Mercato contadino Coldiretti Campagna Amica: produttori locali, frutta, verdura e specialità del territorio (8:30–13:30).',
        startISO: `${curDate}T08:30`,
        venue: loc,
        area,
        isFree: true,
        ticketUrl: url,
        category: 'food', // farmers' market → always food
      });
      if (row) out.push(row);
    }
  }

  const deduped = dedupe(out);
  console.log(`· coldiretti: ${deduped.length} market dates (${mm ? mm[0] : 'month unknown'})`);
  return deduped;
}
