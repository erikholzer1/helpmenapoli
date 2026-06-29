-- HelpMeNapoli — "What's On" events table
--
-- Run this in the Supabase dashboard → SQL Editor (or via the Supabase CLI).
-- WHY this shape: the app reads upcoming events sorted by date; the scraper
-- (scripts/scrape-events.mjs) upserts rows every 24h. RLS lets anyone READ but
-- only the service-role key (server-side) WRITE — so the public app can never
-- mutate data.

create extension if not exists "pgcrypto";

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),

  title       text not null,
  description text,

  -- one of: music | theater | food | culture | wellness | business
  category    text not null check (
                category in ('music','theater','food','culture','wellness','business')
              ),

  venue       text,
  area        text,

  date        date not null,         -- event (start) date
  end_date    date,                  -- multi-day end; null = single day
  time        text,                  -- free-form, e.g. "21:00" or "21:00–23:30"

  price       text,                  -- free-form, e.g. "€15" or "€10–25"
  free        boolean not null default false,

  image_url   text,
  ticket_url  text,

  -- provenance: "eventbrite" | "dice" | "ticketone" | ... | "admin"
  -- WHY: manual admin entries take priority over aggregated sources on dedupe.
  source      text not null default 'admin',

  -- dedupe key for the scraper: a stable hash of source+title+date+venue.
  -- Null for hand-entered admin rows.
  external_id text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Upcoming-events query hits these constantly.
create index if not exists events_date_idx     on public.events (date);
create index if not exists events_end_date_idx on public.events (end_date);
create index if not exists events_category_idx on public.events (category);

-- Scraper upserts on (source, external_id); admin rows are exempt (external_id null).
create unique index if not exists events_source_external_idx
  on public.events (source, external_id);

-- Keep updated_at fresh on every write (drives the "Updated …" / 24h freshness UI).
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Public app uses the anon key → read-only. Writes require service_role, which
-- bypasses RLS, so no write policy is needed (and none is granted to anon).
alter table public.events enable row level security;

drop policy if exists "events are publicly readable" on public.events;
create policy "events are publicly readable"
  on public.events for select
  using (true);
