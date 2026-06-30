// MIT scioperi scraper — fetches the official Italian transport strike RSS feed
// and upserts upcoming, tourist-relevant strikes to Supabase.
//
// Source: http://scioperi.mit.gov.it/mit2/public/scioperi/rss
// Updated daily by the Ministry of Infrastructure and Transport.
//
// Filters kept:
//   Relevance  → Nazionale OR Interregionale OR Regionale (Campania) OR Provinciale (Napoli)
//   Sector     → Aereo, Ferroviario, Marittimo, Taxi, NCC, TPL/Trasporto locale,
//                Generale (all sectors), Plurisettoriale (multi-sector)

const RSS_URL = 'http://scioperi.mit.gov.it/mit2/public/scioperi/rss';

// Sectors worth showing to a Naples tourist.
const RELEVANT_SECTORS = new Set([
  'aereo',
  'ferroviario',
  'marittimo',
  'taxi',
  'ncc',
  'trasporto locale',
  'tpl',
  'generale',
  'plurisettoriale',
  'generale/plurisettoriale',
]);

// Regions that matter — national strikes plus Campania/Naples.
const RELEVANT_REGIONS = new Set([
  'italia',
  'nazionale',
  'campania',
  'napoli',
  '',          // empty = national
]);

// ─── XML helpers ─────────────────────────────────────────────────────────────

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i'))
           ?? xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}

function parseItalianDate(str) {
  // DD/MM/YYYY → YYYY-MM-DD
  const m = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

// Title format: "30/06/2026 | Trasporto merci | Regionale | Piemonte | TO"
function parseTitle(title) {
  const parts = title.split('|').map((s) => s.trim());
  return {
    startDateRaw: parts[0] || '',
    sector:       parts[1] || '',
    relevance:    parts[2] || '',
    region:       parts[3] || '',
    province:     parts[4] || '',
  };
}

// Description CDATA contains lines like:
//   Modalità: 24 ORE: DALLE 00.01 ALLE 24.00
//   Data fine: 05/07/2026
//   Sindacati: CUB TRASPORTI
//   Categoria: PERSONALE ...
function parseDescription(desc) {
  function field(label) {
    const m = desc.match(new RegExp(`${label}\\s*:\\s*([^\\n<]+)`, 'i'));
    return m ? m[1].trim() : '';
  }
  return {
    mode:       field('Modalità') || field('Modalita'),
    endDateRaw: field('Data fine'),
    union:      field('Sindacati'),
    category:   field('Categoria'),
  };
}

function isRelevant(sector, relevance, region) {
  const s = sector.toLowerCase();
  const r = region.toLowerCase();
  const rel = relevance.toLowerCase();

  const sectorOk = [...RELEVANT_SECTORS].some((k) => s.includes(k));
  if (!sectorOk) return false;

  // National / interregional = always show.
  if (rel.includes('nazio') || rel.includes('interregion') || r === 'italia' || r === '') return true;

  // Regional/local: only Campania or Naples.
  return RELEVANT_REGIONS.has(r) || r.includes('campania') || r.includes('napoli');
}

// ─── main ────────────────────────────────────────────────────────────────────

export async function scrapeStrikes(supabase) {
  let xml;
  try {
    const res = await fetch(RSS_URL, { headers: { 'User-Agent': 'HelpMeNapoli/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    xml = await res.text();
  } catch (err) {
    console.error('· strikes: RSS fetch failed —', err.message);
    return;
  }

  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  if (!itemMatches.length) {
    console.log('· strikes: no items found in RSS');
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = [];

  for (const [, item] of itemMatches) {
    const title       = extractTag(item, 'title');
    const description = extractTag(item, 'description');
    const guid        = extractTag(item, 'guid');

    const t = parseTitle(title);
    const d = parseDescription(description);

    const startDate = parseItalianDate(t.startDateRaw);
    const endDate   = parseItalianDate(d.endDateRaw) || null;

    if (!startDate) continue;

    // Skip strikes that have already ended.
    const start = new Date(startDate);
    if (start < today && (!endDate || new Date(endDate) < today)) continue;

    if (!isRelevant(t.sector, t.relevance, t.region)) continue;

    rows.push({
      external_id: guid || `${startDate}-${t.sector}-${t.union || 'X'}`,
      start_date:  startDate,
      end_date:    endDate,
      sector:      t.sector,
      relevance:   t.relevance,
      region:      t.region,
      province:    t.province,
      union_name:  d.union,
      mode:        d.mode,
      category:    d.category,
      title:       title,
      updated_at:  new Date().toISOString(),
    });
  }

  if (!rows.length) {
    console.log('· strikes: no upcoming relevant strikes found');
    return;
  }

  const { error } = await supabase
    .from('strikes')
    .upsert(rows, { onConflict: 'external_id' });

  if (error) {
    console.error('· strikes: upsert failed —', error.message);
  } else {
    console.log(`· strikes: ${rows.length} upcoming strike(s) upserted`);
  }

  // Clean up old strikes (>7 days past end date or start date).
  await supabase
    .from('strikes')
    .delete()
    .lt('start_date', new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
}
