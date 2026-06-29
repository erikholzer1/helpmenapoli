// Events data layer for the "What's On" screen.
//
// WHY here (not constants/): events are dynamic content fetched from Supabase
// per the project rules — they must never be hardcoded into components, and
// must never be older than 24 hours. The screen refreshes on focus.
//
// Category set: the 6 buckets the scraper maps every event into. We keep the
// list small and human ("would I understand this and know if I want to go?")
// — anything that doesn't fit one of these is dropped at scrape time.

import { supabase, isSupabaseConfigured } from './supabase';

export type EventCategory =
  | 'music'
  | 'theater'
  | 'food'
  | 'culture'
  | 'wellness'
  | 'business';

export type NaplesEvent = {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  venue: string | null;
  area: string | null;
  date: string;          // YYYY-MM-DD — event (start) date
  endDate: string | null; // YYYY-MM-DD — for multi-day events; null = single day
  time: string | null;
  price: string | null;
  free: boolean;
  imageUrl: string | null;
  ticketUrl: string | null;
  source: string | null;  // e.g. "eventbrite", "dice", "admin"
};

// Display metadata for each category — label, icon, accent colour.
// Colours stay within the brand palette (warm darks + section accents).
export const CATEGORY_META: Record<
  EventCategory,
  { label: string; icon: string; color: string }
> = {
  music:    { label: 'Music & Nightlife', icon: 'musical-notes-outline', color: '#C8392B' },
  theater:  { label: 'Theater',           icon: 'film-outline',          color: '#7B5EA7' },
  food:     { label: 'Food & Drink',      icon: 'restaurant-outline',    color: '#E07B3A' },
  culture:  { label: 'Culture',           icon: 'color-palette-outline', color: '#D4A843' },
  wellness: { label: 'Wellness',          icon: 'leaf-outline',          color: '#3E8E6B' },
  business: { label: 'Business & Networking', icon: 'briefcase-outline',  color: '#1C7C9C' },
};

export const CATEGORY_ORDER: EventCategory[] = [
  'music', 'theater', 'food', 'culture', 'wellness', 'business',
];

// Maps a raw Supabase row (snake_case) to our camelCase NaplesEvent.
// Kept isolated so the DB column names live in exactly one place.
function rowToEvent(row: any): NaplesEvent {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description ?? null,
    category: row.category,
    venue: row.venue ?? null,
    area: row.area ?? null,
    date: row.date,
    endDate: row.end_date ?? null,
    time: row.time ?? null,
    price: row.price ?? null,
    free: Boolean(row.free),
    imageUrl: row.image_url ?? null,
    ticketUrl: row.ticket_url ?? null,
    source: row.source ?? null,
  };
}

export type FetchEventsResult =
  | { ok: true; events: NaplesEvent[] }
  | { ok: false; error: string };

// Fetches upcoming events: today onward, sorted ascending by date (then time).
// WHY end_date filter: a multi-day event should keep showing until it ends,
// so we include rows whose end_date is today-or-later (falling back to date).
export async function fetchUpcomingEvents(): Promise<FetchEventsResult> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      error: 'Events aren\'t configured yet. Add your Supabase keys to .env.',
    };
  }

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .or(`end_date.gte.${today},and(end_date.is.null,date.gte.${today})`)
    .order('date', { ascending: true })
    .order('time', { ascending: true, nullsFirst: true });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, events: (data ?? []).map(rowToEvent) };
}
