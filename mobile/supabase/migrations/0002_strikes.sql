-- Strike calendar sourced from MIT (Ministero delle Infrastrutture e dei Trasporti)
-- RSS: http://scioperi.mit.gov.it/mit2/public/scioperi/rss
-- Scraper filters for: national strikes + Campania/Naples regional in tourist-relevant sectors.

create table if not exists public.strikes (
  id            bigint generated always as identity primary key,
  external_id   text        not null,
  start_date    date        not null,
  end_date      date,
  sector        text,          -- Aereo, Ferroviario, Marittimo, Taxi, TPL, Generale …
  relevance     text,          -- Nazionale, Regionale, Provinciale, Aziendale …
  region        text,
  province      text,
  union_name    text,
  mode          text,          -- e.g. "24 ORE: DALLE 00.01 ALLE 24.00"
  category      text,          -- affected personnel description
  title         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create unique index if not exists strikes_external_id_idx on public.strikes (external_id);

-- Only future/today rows need to be readable by the app anon key.
alter table public.strikes enable row level security;

create policy "public read upcoming strikes"
  on public.strikes for select
  using (start_date >= current_date - interval '1 day');
