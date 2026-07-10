// xceed.me scraper — Naples nightlife/club events.
// ============================================================================
// Embeds real schema.org Event JSON-LD (verified: top-level array of Event
// nodes), but titles are often just artist/party names with no genre
// keywords ("TENDENZA FESTIVAL - 19 JULY - DAY 2"), so the generic keyword
// categorizer in makeRow() silently drops them as "doesn't fit a category".
// Every event on this platform is nightlife/clubbing, so we force
// category: 'music' rather than relying on the heuristic.

import { UA, makeRow } from './shared.mjs';

const URL = 'https://xceed.me/it/napoli/events';

function parseJsonLdEventNodes(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try { blocks.push(JSON.parse(m[1].trim())); } catch { /* skip malformed */ }
  }
  const nodes = [];
  const walk = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n['@type'] === 'Event') nodes.push(n);
    for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v);
  };
  blocks.forEach(walk);
  return nodes;
}

function offerInfo(offers) {
  const list = Array.isArray(offers) ? offers : offers ? [offers] : [];
  if (!list.length) return { isFree: false, priceText: null };
  const prices = list.map((o) => Number(o.price)).filter((n) => !isNaN(n));
  if (!prices.length) return { isFree: false, priceText: null };
  const min = Math.min(...prices);
  return { isFree: min === 0, priceText: min > 0 ? `from €${min.toFixed(0)}` : null };
}

export async function scrapeXceed() {
  let html;
  try {
    const res = await fetch(URL, { headers: { 'User-Agent': UA, 'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    console.error('· xceed: fetch failed —', err.message);
    return [];
  }

  const nodes = parseJsonLdEventNodes(html);
  const rows = [];
  for (const n of nodes) {
    const { isFree, priceText } = offerInfo(n.offers);
    const image = Array.isArray(n.image) ? n.image[0] : n.image || null;

    const row = makeRow({
      source:      'xceed',
      title:       n.name,
      description: n.description || '',
      startISO:    n.startDate,
      endISO:      n.endDate,
      venue:       n.location?.name || null,
      area:        n.location?.address?.addressLocality || 'Napoli',
      priceText,
      isFree,
      ticketUrl:   n.url || null,
      imageUrl:    typeof image === 'string' ? image : null,
      category:    'music',
    });
    if (row) rows.push(row);
  }

  console.log(`· xceed: ${rows.length} upcoming events`);
  return rows;
}
