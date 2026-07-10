// nomeaeventi.it scraper — uses the "The Events Calendar" plugin's REST API.
// ============================================================================
// API: https://www.nomeaeventi.it/wp-json/tribe/events/v1/events
// Fully structured: start/end date, venue object, cost, image — no HTML
// scraping or date-text parsing needed.

import { makeRow, decodeHtml } from './shared.mjs';

const API = 'https://www.nomeaeventi.it/wp-json/tribe/events/v1/events';

export async function scrapeNomea() {
  let data;
  try {
    const todayISO = new Date().toISOString().slice(0, 10);
    const res = await fetch(`${API}?per_page=50&start_date=${todayISO}`, {
      headers: { 'User-Agent': 'HelpMeNapoli/1.0' },
    });
    if (!res.ok) throw new Error(`nomea HTTP ${res.status}`);
    data = await res.json();
  } catch (err) {
    console.error('· nomea: fetch failed —', err.message);
    return [];
  }

  const rows = [];
  for (const e of data.events || []) {
    const title = decodeHtml(e.title || '');
    if (!title) continue;

    const row = makeRow({
      source:      'nomea',
      title,
      description: decodeHtml(e.description || ''),
      startISO:    e.start_date,
      endISO:      e.end_date,
      venue:       e.venue?.venue || null,
      area:        e.venue?.city || 'Napoli',
      priceText:   e.cost || null,
      isFree:      /gratis|gratuit/i.test(e.cost || ''),
      ticketUrl:   e.url || null,
      imageUrl:    e.image?.url || null,
    });
    if (row) rows.push(row);
  }

  console.log(`· nomea: ${rows.length} upcoming events`);
  return rows;
}
