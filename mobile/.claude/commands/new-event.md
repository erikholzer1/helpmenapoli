---
description: Add or change event-related features in the What's On section
---

You are working on the What's On / events feature of HelpMeNapoli. Follow
CLAUDE.md, especially the "What's On Section — Special Rules".

Task: $ARGUMENTS

Ground rules for anything event-related:

1. **Never hardcode events.** Events come from Supabase (`events` table) via
   `lib/events.ts` (`fetchUpcomingEvents`). Screens import that — they never
   query Supabase inline and never embed event data.

2. **Schema is fixed.** Columns: `date, end_date, category, title, time, venue,
   area, price, free, image_url, ticket_url, source, external_id, description`.
   If you need a new column, add a numbered migration in
   `supabase/migrations/` and update the `NaplesEvent` type + `rowToEvent`
   mapper in `lib/events.ts` together.

3. **Categories are the 6 buckets only:** `music, theater, food, culture,
   wellness, business`. Defined with labels/icons/colors in `CATEGORY_META`.
   Don't invent new categories — if something doesn't fit, it's dropped.

4. **Freshness.** Events must never be older than 24h. The screen refetches on
   focus (`useFocusEffect`); the scraper refreshes the table every 24h.

5. **Sorting & filters.** Always sort ascending by date then time. Keep the
   three filter dimensions working: category chips, date range (Today /
   Weekend / This week / All), and the free-only toggle.

6. **Admin priority.** Manual entries have `source = 'admin'`; the scraper must
   never overwrite or delete them.

7. **Always handle loading / error / empty states.** Never skip error handling
   on the Supabase call.

If the task touches scraping, edit `scripts/scrape-events.mjs` and keep the
source list and category-mapping rules in sync with CLAUDE.md.
