// Bandsintown official API adapter.
// ============================================================================
// IMPORTANT LIMITATION: Bandsintown's public API is ARTIST-based — you query an
// artist's upcoming events. There is no public "events in a city" endpoint
// (location discovery needs a paid partner deal). So this adapter takes a list
// of artists you care about (BANDSINTOWN_ARTISTS) and keeps only the dates that
// land in the Naples area (within 60 km of the city, or whose venue city/region
// matches Campania). Grow the artist list over time with acts that tour Naples.
//
// Get an app_id: register at https://artists.bandsintown.com/support/api-installation
// (any registered string works for the artist endpoint). Set BANDSINTOWN_APP_ID
// + BANDSINTOWN_ARTISTS (comma-separated) in env.
//
// Docs: https://rest.bandsintown.com (GET /artists/{name}/events?app_id=...)

import { makeRow, NAPLES, haversineKm } from './shared.mjs';

const API = 'https://rest.bandsintown.com';
const NAPLES_REGION = /napoli|naples|campania|caserta|salerno|pozzuoli|aversa|portici|ercolano/i;

function isNaplesArea(venue = {}) {
  const lat = parseFloat(venue.latitude);
  const lon = parseFloat(venue.longitude);
  if (!isNaN(lat) && !isNaN(lon) && haversineKm(NAPLES, { lat, lon }) <= 60) return true;
  return NAPLES_REGION.test(`${venue.city || ''} ${venue.region || ''} ${venue.name || ''}`);
}

async function fetchArtistEvents(artist, appId) {
  const res = await fetch(
    `${API}/artists/${encodeURIComponent(artist)}/events?app_id=${encodeURIComponent(appId)}&date=upcoming`,
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const events = await res.json();
  return Array.isArray(events) ? events : [];
}

export async function scrapeBandsintown() {
  const appId = process.env.BANDSINTOWN_APP_ID;
  const artists = (process.env.BANDSINTOWN_ARTISTS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);

  if (!appId) {
    console.log('· bandsintown: skipped (set BANDSINTOWN_APP_ID to enable)');
    return [];
  }
  if (artists.length === 0) {
    console.log('· bandsintown: skipped (set BANDSINTOWN_ARTISTS, comma-separated)');
    return [];
  }

  const rows = [];
  for (const artist of artists) {
    try {
      const events = await fetchArtistEvents(artist, appId);
      for (const e of events) {
        const venue = e.venue || {};
        if (!isNaplesArea(venue)) continue;
        const lineup = Array.isArray(e.lineup) ? e.lineup.join(', ') : artist;
        const row = makeRow({
          source: 'bandsintown',
          title: e.title || `${artist} live in Naples`,
          description: `Live: ${lineup}.`,
          startISO: e.datetime,
          venue: venue.name,
          area: venue.city,
          isFree: false,
          ticketUrl: e.offers?.[0]?.url || e.url,
          imageUrl: e.artist?.image_url || null,
          types: ['MusicEvent'], // Bandsintown is concerts → force music bucket
        });
        if (row) rows.push(row);
      }
    } catch (err) {
      console.warn(`· bandsintown "${artist}" FAILED: ${err.message}`);
    }
  }
  console.log(`· bandsintown: ${rows.length} Naples-area events from ${artists.length} artist(s)`);
  return rows;
}
