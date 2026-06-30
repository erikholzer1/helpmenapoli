// Napoli home game scraper — TheSportsDB (free, no API key required)
// ============================================================================
// Fetches SSC Napoli's next upcoming fixtures and filters for home games.
// Upserts into the events table as category='sport'.
// The app uses these for the What's On display and to schedule morning
// traffic-warning notifications on game days.
//
// API: https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=133670
// Returns next 5 scheduled events for the team (runs daily so coverage stays current).

const NAPOLI_ID  = '133670';
const API_URL    = `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${NAPOLI_ID}`;
const VENUE      = 'Stadio Diego Armando Maradona, Fuorigrotta';
const TICKET_URL = 'https://www.sscnapoli.it/biglietti';

export async function scrapeNapoliMatches(supabase) {
  let events;
  try {
    const res = await fetch(API_URL, { headers: { 'User-Agent': 'HelpMeNapoli/1.0' } });
    if (!res.ok) throw new Error(`TheSportsDB HTTP ${res.status}`);
    const data = await res.json();
    events = data.events || [];
  } catch (err) {
    console.error('· napoli-matches: fetch failed —', err.message);
    return;
  }

  // Keep only home games.
  const homeGames = events.filter((e) => e.idHomeTeam === NAPOLI_ID);

  if (!homeGames.length) {
    console.log('· napoli-matches: no upcoming home fixtures in next 5 games');
    return;
  }

  const rows = homeGames.map((m) => {
    const date      = m.dateEvent;                          // "YYYY-MM-DD"
    const timeRaw   = (m.strTime || '').slice(0, 5);       // "HH:MM" (local Rome time)
    const opponent  = m.strAwayTeam || 'TBD';
    const league    = m.strLeague || 'Serie A';
    const round     = m.intRound ? ` — Round ${m.intRound}` : '';

    return {
      source:      'napoli_home',
      external_id: String(m.idEvent),
      title:       `Napoli vs ${opponent}`,
      description: `${league}${round}. Kickoff ${timeRaw || 'TBC'} at the Maradona. Expect heavy traffic around Fuorigrotta and the Tangenziale up to 4 hours before and after the match.`,
      category:    'sport',
      venue:       VENUE,
      area:        'Fuorigrotta',
      date,
      time:        timeRaw || null,
      free:        false,
      image_url:   m.strThumb || m.strPoster || null,
      ticket_url:  TICKET_URL,
      updated_at:  new Date().toISOString(),
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
