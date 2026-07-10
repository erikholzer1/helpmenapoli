// napoliateatro.it scraper — uses the WordPress REST API (no key needed)
// ============================================================================
// Fetches upcoming theater/arts articles from napoliateatro.it, extracts
// event dates from the Italian-language content, and upserts into the events
// table as category='theater'.
//
// API: https://www.napoliateatro.it/wp-json/wp/v2/posts
// Posts are editorial articles about Naples theater productions — one article
// typically covers one upcoming show or festival run.
//
// IMPORTANT: rows are built through the shared makeRow() helper (same as every
// other adapter) so the column set always matches exactly what the other
// scrapers produce — PostgREST's bulk upsert requires every row in a batch to
// have identical keys, and a mismatch here previously broke every daily run.

import { makeRow, decodeHtml, extractItalianDate } from './shared.mjs';

const API = 'https://www.napoliateatro.it/wp-json/wp/v2/posts';

async function fetchPosts() {
  // Fetch the 30 most recent posts — enough to cover upcoming weeks.
  const url = `${API}?per_page=30&_fields=id,date,title,excerpt,link&orderby=date&order=desc`;
  const res = await fetch(url, { headers: { 'User-Agent': 'HelpMeNapoli/1.0' } });
  if (!res.ok) throw new Error(`napoliateatro HTTP ${res.status}`);
  return res.json();
}

export async function scrapeNapoliateatro() {
  let posts;
  try {
    posts = await fetchPosts();
  } catch (err) {
    console.error('· napoliateatro: fetch failed —', err.message);
    return [];
  }

  const rows = [];
  for (const post of posts) {
    const rawTitle   = post.title?.rendered || '';
    const rawExcerpt = post.excerpt?.rendered || '';
    const title      = decodeHtml(rawTitle);
    const excerpt    = decodeHtml(rawExcerpt);
    if (!title) continue;

    // Try to pull an event date from the excerpt; fall back to publish date.
    const eventDate = extractItalianDate(excerpt + ' ' + title)
      || post.date?.slice(0, 10);
    if (!eventDate) continue;

    const row = makeRow({
      source:      'napoliateatro',
      title,
      description: excerpt,
      startISO:    eventDate,
      area:        'Napoli',
      isFree:      false,
      ticketUrl:   post.link || null,
      category:    'theater',
    });
    if (row) rows.push(row);
  }

  console.log(`· napoliateatro: ${rows.length} upcoming theater events`);
  return rows;
}
