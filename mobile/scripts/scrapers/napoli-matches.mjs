// Napoli home fixtures — scraped from the official SSC Napoli site.
// ============================================================================
// Source: https://sscnapoli.it/en/fixtures/  (server-rendered HTML, no key)
//
// WHY NOT AN API: we originally used TheSportsDB, but its free tier was
// throttled to return exactly ONE event per endpoint (verified Sept 2026 —
// team fixtures, league fixtures and season endpoints all returned 1 or 0),
// so home games effectively never appeared. The club's own page carries the
// full season INCLUDING cup and European fixtures, which the API never had.
//
// Markup shape (one block per fixture):
//   <div class="schedule-single ... place-home|place-away">
//     <div class="date ..."><p class="number-stagione ...">30</p>
//                           <p class="text body m">Aug</p></div>
//     <div class="info-date"><p class="body s">2° Match Day</p>
//                            <p class="time ...">18:30</p></div>
//     <p class="team-name ...">Napoli</p>
//     <p class="team-name ...">Como</p>
//
// The page is bilingual in practice: month tokens come through as English
// (Aug, Sep…) plus Italian "Gen" for January — both are mapped below.

const URL = 'https://sscnapoli.it/en/fixtures/';
const VENUE = 'Stadio Diego Armando Maradona, Fuorigrotta';
const TICKET_URL = 'https://sscnapoli.it/en/tickets/';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const MONTHS = {
  jan: 1, gen: 1, feb: 2, mar: 3, apr: 4, may: 5, mag: 5, jun: 6, giu: 6,
  jul: 7, lug: 7, aug: 8, ago: 8, sep: 9, set: 9, oct: 10, ott: 10,
  nov: 11, dec: 12, dic: 12,
};

// The page has no year on a fixture — infer it from the season. A season runs
// Aug→May, so Aug–Dec belong to the season's opening year and Jan–Jul to the
// next one. Anchored on today so this keeps working season after season.
function inferYear(month) {
  const now = new Date();
  const seasonStart = now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return month >= 7 ? seasonStart : seasonStart + 1;
}

function parseFixtures(html) {
  const out = [];
  const blocks = html.split('schedule-single').slice(1);

  for (const raw of blocks) {
    const b = raw.slice(0, 3000); // one fixture's markup fits well inside this
    if (!/place-home/.test(b)) continue; // home games only

    const day = (b.match(/number-stagione[^>]*>\s*(\d{1,2})\s*</) || [])[1];
    const monTok = (b.match(/text body m[^>]*>\s*([A-Za-zÀ-ÿ]{3})/) || [])[1];
    if (!day || !monTok) continue;

    const month = MONTHS[monTok.toLowerCase()];
    if (!month) continue;

    const time = ((b.match(/class="time[^"]*"[^>]*>([^<]*)</) || [])[1] || '').trim();
    const names = [...b.matchAll(/class="team-name[^"]*"[^>]*>([^<]+)</g)].map((m) => m[1].trim());
    const opponent = names.find((n) => !/napoli/i.test(n));
    if (!opponent) continue;

    const competition = (b.match(/championship-(\d+)/) || [])[1] || '';
    const matchday = (b.match(/class="body s"[^>]*>([^<]*Match Day[^<]*)</) || [])[1] || '';

    const year = inferYear(month);
    const date = `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`;

    out.push({ date, time, opponent, competition, matchday: matchday.trim() });
  }
  return out;
}

export async function scrapeNapoliMatches(supabase) {
  let html;
  try {
    const res = await fetch(URL, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-GB,en;q=0.9,it;q=0.8' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    console.error('· napoli-matches: fetch failed —', err.message);
    return;
  }

  const fixtures = parseFixtures(html);
  if (!fixtures.length) {
    // Loud, because a silent zero is exactly how this broke before.
    console.error('· napoli-matches: parsed 0 home fixtures — the page markup likely changed');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = fixtures.filter((f) => f.date >= today);

  const rows = upcoming.map((f) => ({
    source:      'napoli_home',
    external_id: `${f.date}-${f.opponent}`.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    title:       `Napoli vs ${f.opponent}`,
    description: `${f.matchday ? f.matchday + '. ' : ''}Kickoff ${f.time || 'TBC'} at the Maradona. `
      + 'Expect heavy traffic on the Tangenziale (especially the Centro exit) and around '
      + 'Fuorigrotta from about 4 hours before kickoff.',
    category:    'sport',
    venue:       VENUE,
    area:        'Fuorigrotta',
    date:        f.date,
    end_date:    null,
    time:        f.time || null,
    price:       null,
    free:        false,
    image_url:   null,
    ticket_url:  TICKET_URL,
  }));

  if (!rows.length) {
    console.log(`· napoli-matches: ${fixtures.length} home fixtures found, none upcoming`);
    return;
  }

  const { error } = await supabase
    .from('events')
    .upsert(rows, { onConflict: 'source,external_id', ignoreDuplicates: false });

  if (error) {
    console.error('· napoli-matches: upsert failed —', error.message);
  } else {
    console.log(`· napoli-matches: ${rows.length} upcoming home fixture(s) upserted`);
  }
}
