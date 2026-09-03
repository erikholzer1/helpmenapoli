// napolidavivere.it — Naples' biggest what's-on blog, via the WordPress API.
// ============================================================================
// API: https://www.napolidavivere.it/wp-json/wp/v2/posts  (no key needed)
//
// WHY THIS SOURCE: the ticketing/venue sources cover concerts and theatre well
// but miss the local festival scene — Pomigliano Jazz, Bufala Fest, Cipolla
// Fest, free museum days, open-air cinema. This blog covers exactly that, and
// it's how Erik hears about them himself.
//
// Posts are editorial articles, so dates live in the prose ("dal 31 agosto al
// 6 settembre 2026", "il 5 settembre"). extractItalianDate() pulls the
// earliest FUTURE date mentioned, falling back to the publish date.

import { makeRow, decodeHtml, extractItalianDate } from './shared.mjs';

const API = 'https://www.napolidavivere.it/wp-json/wp/v2/posts';
const PAGES = 2;        // 2 x 50 = the ~100 most recent posts
const PER_PAGE = 50;

async function fetchPage(page) {
  const url = `${API}?per_page=${PER_PAGE}&page=${page}&_fields=id,date,title,excerpt,link&orderby=date&order=desc`;
  const res = await fetch(url, { headers: { 'User-Agent': 'HelpMeNapoli/1.0' } });
  if (!res.ok) throw new Error(`napolidavivere HTTP ${res.status}`);
  return res.json();
}

export async function scrapeNapolidavivere() {
  const posts = [];
  try {
    for (let p = 1; p <= PAGES; p++) {
      const batch = await fetchPage(p);
      if (!batch.length) break;
      posts.push(...batch);
    }
  } catch (err) {
    console.error('· napolidavivere: fetch failed —', err.message);
    return [];
  }

  const rows = [];
  for (const post of posts) {
    const title = decodeHtml(post.title?.rendered || '');
    const excerpt = decodeHtml(post.excerpt?.rendered || '');
    if (!title) continue;

    // Prefer a real date from the copy. Failing that, a RECENT post on a
    // what's-on blog is describing something happening now — multi-day
    // festivals are typically written up once, on day one, and often with a
    // year-less date ("domenica 30 agosto") the parser can't use. Without
    // this, Pomigliano Jazz (30 Aug - 12 Sep) was dropped as "past" while it
    // was still running. Older posts keep their publish date and fall away
    // naturally in makeRow's past-event check.
    const published = post.date?.slice(0, 10);
    const parsed = extractItalianDate(`${title} ${excerpt}`);
    const today = new Date().toISOString().slice(0, 10);
    const daysOld = published
      ? (Date.now() - new Date(published).getTime()) / 86400000
      : Infinity;

    const date = parsed
      ?? (published && published < today && daysOld <= 7 ? today : published);
    if (!date) continue;

    const row = makeRow({
      source:      'napolidavivere',
      title,
      description: excerpt,
      startISO:    date,
      area:        'Napoli',
      // The blog leads heavily on free events and says so in the copy;
      // makeRow's own free-text check picks "gratis"/"gratuito" up.
      priceText:   `${title} ${excerpt}`.match(/\b(gratis|gratuit\w+|ingresso libero)\b/i)?.[0] ?? null,
      ticketUrl:   post.link || null,
    });
    if (row) rows.push(row);
  }

  console.log(`· napolidavivere: ${rows.length} upcoming events`);
  return rows;
}
