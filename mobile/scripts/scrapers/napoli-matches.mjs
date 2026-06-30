// Napoli home game scraper — football-data.org v4 API
// ============================================================================
// Free API key at https://www.football-data.org/client/register
// Add as GitHub Actions secret: FOOTBALL_DATA_API_KEY
//
// Fetches SSC Napoli's upcoming home fixtures and upserts them into the events
// table as category='sport'. The app uses these for the What's On display and
// to schedule morning traffic-warning notifications on game days.

const NAPOLI_ID = 1759;            // SSC Napoli team ID on football-data.org
const API_BASE  = 'https://api.football-data.org/v4';
const VENUE     = 'Stadio Diego Armando Maradona, Fuorigrotta';

async function fetchNapoliMatches(apiKey) {
  // Fetch next 60 days of scheduled matches for Napoli
  const from = new Date().toISOString().slice(0, 10);
  const to   = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10);

  const res = await fetch(
    `${API_BASE}/teams/${NAPOLI_ID}/matches?status=SCHEDULED&dateFrom=${from}&dateTo=${to}`,
    { headers: { 'X-Auth-Token': apiKey } }
  );

  if (res.status === 429) { console.log('· napoli-matches: rate limited, skipping'); return []; }
  if (!res.ok) throw new Error(`football-data.org HTTP ${res.status}`);

  const data = await res.json();
  return (data.matches || []).filter((m) => m.homeTeam?.id === NAPOLI_ID);
}

export async function scrapeNapoliMatches(supabase) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    console.log('· napoli-matches: skipped (set FOOTBALL_DATA_API_KEY to enable)');
    return;
  }

  let matches;
  try {
    matches = await fetchNapoliMatches(apiKey);
  } catch (err) {
    console.error('· napoli-matches: fetch failed —', err.message);
    return;
  }

  if (!matches.length) {
    console.log('· napoli-matches: no upcoming home fixtures found');
    return;
  }

  const rows = matches.map((m) => {
    const kickoffUtc = m.utcDate; // "2026-08-24T18:00:00Z"
    const date = kickoffUtc.slice(0, 10);

    // Convert UTC kickoff to Naples local time (Europe/Rome, UTC+2 summer)
    const localHour = new Date(kickoffUtc).toLocaleTimeString('it-IT', {
      timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hour12: false,
    });

    const opponent    = m.awayTeam?.name || 'TBD';
    const competition = m.competition?.name || 'Serie A';
    const matchday    = m.matchday ? ` — Matchday ${m.matchday}` : '';

    return {
      source:      'napoli_home',
      external_id: String(m.id),
      title:       `Napoli vs ${opponent}`,
      description: `${competition}${matchday}. Kickoff ${localHour} at the Maradona. Expect heavy traffic around Fuorigrotta and the Tangenziale up to 4 hours before and after the match.`,
      category:    'sport',
      venue:       VENUE,
      area:        'Fuorigrotta',
      date,
      time:        localHour,
      free:        false,
      ticket_url:  'https://www.sscnapoli.it/biglietti',
      updated_at:  new Date().toISOString(),
      // Store kickoff UTC so the app can schedule notifications precisely
      // (stored in image_url slot — we repurpose it; no image for these rows)
      image_url:   null,
    };
  });

  const { error } = await supabase
    .from('events')
    .upsert(rows, { onConflict: 'source,external_id', ignoreDuplicates: false });

  if (error) {
    console.error('· napoli-matches: upsert failed —', error.message);
  } else {
    console.log(`· napoli-matches: ${rows.length} home fixture(s) upserted`);
  }
}
