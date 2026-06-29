// Eventbrite adapter.
// ============================================================================
// Eventbrite removed its documented public event SEARCH (by city) in 2020 — the
// official REST API can now only return events from organizations your token
// manages (and Erik's account has none). So to get Naples events we call the
// SAME endpoint Eventbrite's own website uses for its search results:
//   POST /v3/destination/search/
// It's authenticated with the user's private token and is the only way to get a
// Naples-wide feed. It is INTERNAL/undocumented — Eventbrite could change it —
// so the field reads are defensive and it degrades to [] on any error.
//
// Config: EVENTBRITE_TOKEN (required). EVENTBRITE_ORG_IDS (optional) additionally
// pulls events from organizations Erik owns, once he creates one.
//
// Docs (for the org path): https://www.eventbrite.com/platform/api

import { makeRow, dedupe } from './shared.mjs';

const API = 'https://www.eventbriteapi.com/v3';
const NAPLES_AREA = /napoli|naples|campania|caserta|salerno|pozzuoli|aversa|portici|ercolano|sorrento|pompei/i;
const MAX_PAGES = 8;        // bound runtime; ~50/page
const PAGE_SIZE = 50;

// Eventbrite top-level category id → our bucket. Unmapped → let keyword
// categorization in makeRow decide (and drop if it fits nothing).
const EB_CATEGORY = {
  '103': 'music',     // Music
  '101': 'business',  // Business & Professional
  '102': 'business',  // Science & Technology
  '110': 'food',      // Food & Drink
  '113': 'culture',   // Community & Culture
  '105': 'theater',   // Performing & Visual Arts
  '107': 'wellness',  // Health & Wellbeing
  '108': 'wellness',  // Sports & Fitness
};

function categoryFromTags(tags = []) {
  for (const t of tags) {
    const m = /^EventbriteCategory\/(\d+)$/.exec(t.tag || '');
    if (m && EB_CATEGORY[m[1]]) return EB_CATEGORY[m[1]];
  }
  return null;
}

function venueInNaples(venue) {
  const addr = venue?.address || {};
  return NAPLES_AREA.test(`${venue?.name || ''} ${addr.city || ''} ${addr.localized_address_display || ''}`);
}

function mapResult(r) {
  const venue = r.primary_venue || {};
  const ta = r.ticket_availability || {};
  const min = ta.minimum_ticket_price;
  const isFree = ta.is_free === true || r.is_free === true;
  const priceText = !isFree && min?.major_value
    ? `${min.currency === 'EUR' ? '€' : ''}${Math.round(Number(min.major_value))}`
    : null;

  // start_date + start_time → ISO so makeRow can show the time.
  const startISO = r.start_time ? `${r.start_date}T${r.start_time}` : r.start_date;

  return makeRow({
    source: 'eventbrite',
    title: r.name,
    description: r.summary || r.full_description || '',
    startISO,
    endISO: r.end_date || null,
    venue: venue.name,
    area: venue.address?.city,
    isFree,
    priceText,
    ticketUrl: r.url || r.tickets_url,
    imageUrl: r.image?.url || null,
    category: categoryFromTags(r.tags), // accurate when Eventbrite tagged it
  });
}

async function searchCity(token, query) {
  const rows = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`${API}/destination/search/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_search: { q: query, dates: 'current_future', dedup: true, page, page_size: PAGE_SIZE },
        'expand.destination_event': ['primary_venue', 'image', 'ticket_availability'],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const results = data.events?.results ?? [];
    for (const r of results) {
      if (!venueInNaples(r.primary_venue)) continue; // keep it actually Naples-area
      const row = mapResult(r);
      if (row) rows.push(row);
    }
    const pageCount = data.events?.pagination?.page_count ?? 1;
    if (page >= pageCount || results.length === 0) break;
  }
  return rows;
}

// Optional: events from organizations the token owns (none for Erik yet).
async function orgEvents(token, orgId) {
  const rows = [];
  let continuation = null;
  do {
    const params = new URLSearchParams({ status: 'live', order_by: 'start_asc', expand: 'venue', page_size: '50' });
    if (continuation) params.set('continuation', continuation);
    const res = await fetch(`${API}/organizations/${orgId}/events/?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    for (const e of data.events ?? []) {
      const row = makeRow({
        source: 'eventbrite',
        title: e.name?.text,
        description: e.summary || e.description?.text || '',
        startISO: e.start?.local,
        endISO: e.end?.local,
        venue: e.venue?.name,
        area: e.venue?.address?.city,
        isFree: e.is_free,
        ticketUrl: e.url,
        imageUrl: e.logo?.url,
      });
      if (row) rows.push(row);
    }
    continuation = data.pagination?.has_more_items ? data.pagination.continuation : null;
  } while (continuation);
  return rows;
}

export async function scrapeEventbrite() {
  const token = process.env.EVENTBRITE_TOKEN;
  if (!token) {
    console.log('· eventbrite: skipped (set EVENTBRITE_TOKEN to enable)');
    return [];
  }

  const rows = [];
  try {
    rows.push(...(await searchCity(token, 'Napoli')));
  } catch (err) {
    console.warn(`· eventbrite city search FAILED: ${err.message}`);
  }

  const orgIds = (process.env.EVENTBRITE_ORG_IDS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  for (const orgId of orgIds) {
    try {
      rows.push(...(await orgEvents(token, orgId)));
    } catch (err) {
      console.warn(`· eventbrite org ${orgId} skipped: ${err.message}`);
    }
  }

  const out = dedupe(rows);
  console.log(`· eventbrite: ${out.length} Naples-area events`);
  return out;
}
