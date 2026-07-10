// campaniaevents.eu scraper — custom "event" post type via the WordPress
// REST API. Excerpts follow a consistent pattern:
//   "Coez – Anfiteatro degli Scavi di Pompei – sabato 11 luglio 2026 ore 21:00
//    🎟️ ... a partire da € 39,00 ..."
// so venue, date and price are all extractable from the excerpt text.

import { makeRow, decodeHtml, extractItalianDate } from './shared.mjs';

const API = 'https://campaniaevents.eu/wp-json/wp/v2/event';
const PAGES_TO_FETCH = 3; // ~150 most-recently-published posts, enough to catch upcoming events

async function fetchPage(page) {
  const url = `${API}?per_page=50&page=${page}&_fields=id,date,title,excerpt,link`;
  const res = await fetch(url, { headers: { 'User-Agent': 'HelpMeNapoli/1.0' } });
  if (!res.ok) throw new Error(`campaniaevents HTTP ${res.status}`);
  return res.json();
}

// The excerpt usually starts "Artist/Show – Venue – weekday D month YYYY ore HH:MM".
// Take everything before the date fragment as a venue guess.
function extractVenue(excerpt, title) {
  const parts = excerpt.split('–').map((s) => s.trim());
  if (parts.length < 2) return null;
  // parts[0] is often the artist/title repeat; the venue is usually parts[1].
  const candidate = parts[1];
  if (!candidate || /^\d{1,2}[°º]?\s/.test(candidate)) return null; // looks like a date, not a venue
  return candidate.length < 80 ? candidate : null;
}

function extractPrice(text) {
  const m = text.match(/€\s*([\d.,]+)/);
  return m ? `da €${m[1]}` : null;
}

export async function scrapeCampaniaEvents() {
  let posts = [];
  try {
    for (let page = 1; page <= PAGES_TO_FETCH; page++) {
      const batch = await fetchPage(page);
      if (!batch.length) break;
      posts.push(...batch);
    }
  } catch (err) {
    console.error('· campaniaevents: fetch failed —', err.message);
    return [];
  }

  const rows = [];
  for (const post of posts) {
    const title   = decodeHtml(post.title?.rendered || '');
    const excerpt = decodeHtml(post.excerpt?.rendered || '');
    if (!title) continue;

    const eventDate = extractItalianDate(excerpt + ' ' + title);
    if (!eventDate) continue; // no clear future date found — skip rather than misfile

    const row = makeRow({
      source:      'campaniaevents',
      title,
      description: excerpt,
      startISO:    eventDate,
      venue:       extractVenue(excerpt, title),
      area:        'Campania',
      priceText:   extractPrice(excerpt),
      ticketUrl:   post.link || null,
    });
    if (row) rows.push(row);
  }

  console.log(`· campaniaevents: ${rows.length} upcoming events`);
  return rows;
}
