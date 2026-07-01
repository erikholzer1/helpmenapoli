// napoliateatro.it scraper — uses the WordPress REST API (no key needed)
// ============================================================================
// Fetches upcoming theater/arts articles from napoliateatro.it, extracts
// event dates from the Italian-language content, and upserts into the events
// table as category='theater'.
//
// API: https://www.napoliateatro.it/wp-json/wp/v2/posts
// Posts are editorial articles about Naples theater productions — one article
// typically covers one upcoming show or festival run.

const API = 'https://www.napoliateatro.it/wp-json/wp/v2/posts';

const ITALIAN_MONTHS = {
  gennaio: '01', febbraio: '02', marzo: '03', aprile: '04',
  maggio: '05', giugno: '06', luglio: '07', agosto: '08',
  settembre: '09', ottobre: '10', novembre: '11', dicembre: '12',
};

// Extract the earliest future date mentioned in Italian text.
// Handles: "3 luglio 2026", "venerdì 3 luglio 2026", "dal 3 luglio 2026", "1° luglio 2026"
function extractItalianDate(text) {
  const clean = text.replace(/<[^>]+>/g, ' ').toLowerCase();
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
    if (d >= today && (!earliest || d < new Date(earliest))) {
      earliest = iso;
    }
  }
  return earliest;
}

// Strip HTML tags and decode common entities.
function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&#8217;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = [];
  for (const post of posts) {
    const title   = stripHtml(post.title?.rendered || '');
    const excerpt = stripHtml(post.excerpt?.rendered || '');
    if (!title) continue;

    // Try to pull an event date from the excerpt; fall back to publish date.
    const eventDate = extractItalianDate(excerpt + ' ' + title)
      || post.date?.slice(0, 10);

    if (!eventDate) continue;

    // Skip if the event date is in the past.
    if (new Date(eventDate) < today) continue;

    rows.push({
      source:      'napoliateatro',
      external_id: String(post.id),
      title,
      description: excerpt || null,
      category:    'theater',
      venue:       null,   // not reliably extractable from listing; users tap through
      area:        'Napoli',
      date:        eventDate,
      time:        null,
      free:        false,
      image_url:   null,
      ticket_url:  post.link || null,
      updated_at:  new Date().toISOString(),
    });
  }

  console.log(`· napoliateatro: ${rows.length} upcoming theater events`);
  return rows;
}
