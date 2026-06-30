-- Add 'sport' to the events category constraint for Napoli home games.
alter table public.events
  drop constraint if exists events_category_check;

alter table public.events
  add constraint events_category_check
  check (category in ('music','theater','food','culture','wellness','business','sport'));
