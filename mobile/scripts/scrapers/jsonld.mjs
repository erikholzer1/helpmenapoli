// schema.org JSON-LD extraction.
// ============================================================================
// Most listing/ticketing sites embed schema.org "Event" objects in
// <script type="application/ld+json">. Reading those is far more robust than
// scraping CSS selectors that change weekly.
//
// Two entry points:
//   scrapeJsonLd(source, urls)      — fetch each URL and extract (grandenapoli)
//   extractEventsFromHtml(source, html) — pure: parse already-fetched HTML
//                                          (reused by the TicketOne Playwright
//                                           adapter on the rendered DOM)

import { UA, makeRow } from './shared.mjs';

const EVENT_TYPES = new Set([
  'Event', 'MusicEvent', 'TheaterEvent', 'DanceEvent', 'FoodEvent',
  'ExhibitionEvent', 'Festival', 'ScreeningEvent', 'BusinessEvent',
  'EducationEvent', 'SocialEvent', 'VisualArtsEvent', 'ComedyEvent',
  'LiteraryEvent', 'SportsEvent', 'ChildrensEvent', 'PublicationEvent',
]);

function typesOf(node) {
  const t = node['@type'];
  return Array.isArray(t) ? t : [t];
}

function isEventNode(node) {
  return typesOf(node).some((t) => EVENT_TYPES.has(String(t)));
}

function placeName(loc) {
  if (!loc) return null;
  if (typeof loc === 'string') return loc;
  if (Array.isArray(loc)) return placeName(loc[0]);
  return loc.name ?? loc.address?.streetAddress ?? null;
}

function offerInfo(offers) {
  const o = Array.isArray(offers) ? offers[0] : offers;
  if (!o) return { isFree: false, priceText: null, ticketUrl: null };
  // Handles both Offer (price) and AggregateOffer (lowPrice/highPrice).
  const low = o.lowPrice ?? o.price;
  const num = low != null ? Number(low) : null;
  const isFree = num === 0 || /free|gratis|gratuito/i.test(JSON.stringify(o));
  let priceText = null;
  if (!isFree && num != null && !isNaN(num)) {
    const high = o.highPrice != null ? Number(o.highPrice) : null;
    priceText = high && high !== num ? `from €${num.toFixed(0)}` : `€${num.toFixed(0)}`;
  }
  return { isFree, priceText, ticketUrl: o.url ?? null };
}

function parseJsonLdNodes(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try { blocks.push(JSON.parse(m[1].trim())); } catch { /* skip malformed */ }
  }
  // Deep-walk every object so we find Event nodes however they're nested —
  // e.g. TicketOne wraps MusicEvents in ItemList → itemListElement → item.
  // isEventNode() filters afterward, so collecting sub-objects is harmless.
  const nodes = [];
  const seen = new Set();
  const walk = (n) => {
    if (!n || typeof n !== 'object' || seen.has(n)) return;
    seen.add(n);
    if (Array.isArray(n)) return n.forEach(walk);
    nodes.push(n);
    for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v);
  };
  blocks.forEach(walk);
  return nodes;
}

// Pure: turn a chunk of HTML into normalized rows. Exported so headless
// adapters can feed it the rendered DOM.
export function extractEventsFromHtml(source, html) {
  const nodes = parseJsonLdNodes(html).filter(isEventNode);
  const rows = [];
  for (const n of nodes) {
    const { isFree, priceText, ticketUrl } = offerInfo(n.offers);
    const image = Array.isArray(n.image) ? n.image[0] : (n.image?.url ?? n.image ?? null);
    const row = makeRow({
      source,
      title: n.name,
      description: n.description,
      startISO: n.startDate,
      endISO: n.endDate,
      venue: placeName(n.location),
      priceText,
      isFree,
      ticketUrl: ticketUrl ?? n.url,
      imageUrl: typeof image === 'string' ? image : null,
      types: typesOf(n),
    });
    if (row) rows.push(row);
  }
  return rows;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export async function scrapeJsonLd(source, urls) {
  const rows = [];
  for (const url of urls) {
    try {
      const html = await fetchHtml(url);
      const found = extractEventsFromHtml(source, html);
      rows.push(...found);
      console.log(`· ${source} ${url}: ${found.length} events`);
    } catch (err) {
      console.warn(`· ${source} ${url} FAILED: ${err.message}`);
    }
  }
  return rows;
}
