// Bandsintown adapter — venue-first strategy for Naples.
// ============================================================================
// Bandsintown's public API is artist-scoped, but it also exposes a venue
// search + venue-events endpoint. We query a curated list of Naples venues
// and collect every upcoming show, which gives us a near-complete city picture
// without needing to know artist names in advance.
//
// Fallback: if BANDSINTOWN_ARTISTS is also set, those are queried too.
//
// Docs: https://rest.bandsintown.com
//   GET /venues/search?query={name}&app_id=...
//   GET /venues/{id}/events?app_id=...
//   GET /artists/{name}/events?app_id=...       (artist fallback)

import { makeRow, NAPLES, haversineKm } from './shared.mjs';

const API = 'https://rest.bandsintown.com';
const NAPLES_REGION = /napoli|naples|campania|caserta|salerno|pozzuoli|aversa|portici|ercolano/i;

// Major Naples live-music & event venues.
const NAPLES_VENUES = [
  'Teatro San Carlo',
  'Palapartenope',
  'Augusteo Teatro',
  'Teatro Bellini Napoli',
  'Teatro Mercadante',
  'Bourbon Street Napoli',
  'Lanificio 25 Napoli',
  'Duel Beat Napoli',
  'Arenile di Bagnoli',
  'Galleria Toledo',
  'Teatro Trianon Viviani',
  'Casa della Musica Napoli',
  'Cortile delle Statue Napoli',
  'Riot Club Napoli',
  'Tg Media Village Napoli',
  'Nord Napoli',
  'Hall Napoli',
  'Horus Club Napoli',
  'Camplus Napoli',
  'Teatro Sannazaro',
  'Teatro Acacia',
  'Teatro Cilea',
  'Sala Assoli',
  'TNT - Teatro Nuovo di Napoli',
  'Complesso Monumentale di Santa Chiara',
  'Piazza del Plebiscito',
  'Arena Flegrea',
  'Fortezza Rovigliano',
];

function isNaplesArea(venue = {}) {
  const lat = parseFloat(venue.latitude);
  const lon = parseFloat(venue.longitude);
  if (!isNaN(lat) && !isNaN(lon) && haversineKm(NAPLES, { lat, lon }) <= 60) return true;
  return NAPLES_REGION.test(`${venue.city || ''} ${venue.region || ''} ${venue.name || ''}`);
}

async function searchVenue(name, appId) {
  try {
    const res = await fetch(
      `${API}/venues/search?query=${encodeURIComponent(name)}&app_id=${encodeURIComponent(appId)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function fetchVenueEvents(venueId, appId) {
  try {
    const res = await fetch(
      `${API}/venues/${venueId}/events?app_id=${encodeURIComponent(appId)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function fetchArtistEvents(artist, appId) {
  try {
    const res = await fetch(
      `${API}/artists/${encodeURIComponent(artist)}/events?app_id=${encodeURIComponent(appId)}&date=upcoming`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function eventToRow(e, fallbackVenueName) {
  const venue = e.venue || {};
  if (!isNaplesArea(venue)) return null;
  const artist = e.artist?.name || e.lineup?.[0] || '';
  const lineup = Array.isArray(e.lineup) ? e.lineup.join(', ') : artist;
  return makeRow({
    source: 'bandsintown',
    title: e.title || (artist ? `${artist} live in Naples` : 'Live event in Naples'),
    description: lineup ? `Live: ${lineup}.` : undefined,
    startISO: e.datetime,
    venue: venue.name || fallbackVenueName,
    area: venue.city,
    isFree: false,
    ticketUrl: e.offers?.[0]?.url || e.url,
    imageUrl: e.artist?.image_url || null,
    types: ['MusicEvent'],
  });
}

export async function scrapeBandsintown() {
  const appId = process.env.BANDSINTOWN_APP_ID;
  if (!appId) {
    console.log('· bandsintown: skipped (set BANDSINTOWN_APP_ID to enable)');
    return [];
  }

  const rows = [];
  const seen = new Set();

  function addRow(row) {
    if (!row) return;
    const key = `${row.source}|${row.external_id}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push(row);
  }

  // ── Venue-based queries ──────────────────────────────────────────────────
  let venueHits = 0;
  for (const venueName of NAPLES_VENUES) {
    const candidates = await searchVenue(venueName, appId);
    // Pick the first candidate that looks like it's in Naples.
    const venue = candidates.find((v) => isNaplesArea(v)) ?? candidates[0];
    if (!venue?.id) continue;
    const events = await fetchVenueEvents(venue.id, appId);
    for (const e of events) addRow(eventToRow(e, venueName));
    venueHits++;
  }

  // ── Artist fallback (optional) ───────────────────────────────────────────
  const artists = (process.env.BANDSINTOWN_ARTISTS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  for (const artist of artists) {
    const events = await fetchArtistEvents(artist, appId);
    for (const e of events) addRow(eventToRow(e, ''));
  }

  console.log(`· bandsintown: ${rows.length} Naples events (${venueHits}/${NAPLES_VENUES.length} venues matched${artists.length ? `, ${artists.length} artists` : ''})`);
  return rows;
}
