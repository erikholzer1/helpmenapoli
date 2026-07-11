---
description: Add a new event source to the What's On scraper
---

You are adding a new event-source scraper to HelpMeNapoli. Follow CLAUDE.md
("What's On Section — Special Rules"). The target site/URL is: $ARGUMENTS

Work through this checklist IN ORDER — each step is cheaper than the next,
and most sites fall to step 1 or 2:

1. **Try the generic JSON-LD adapter first.** Run:
   ```
   node -e "import('./scripts/scrapers/jsonld.mjs').then(async ({scrapeJsonLd}) =>
     console.log((await scrapeJsonLd('test', ['<URL>'])).length))"
   ```
   If it returns events, you're done writing scrape logic — just register the
   source in `scripts/scrape-events.mjs` with `scrapeJsonLd('<source>', [urls])`.
   (This is how `grandenapoli` and `iltaccodibacco` work.)

2. **Check for a WordPress REST API.** Fetch `<site>/wp-json/wp/v2/types` and
   look for:
   - `tribe_events` → The Events Calendar plugin. Use
     `<site>/wp-json/tribe/events/v1/events?per_page=50&start_date=<today>` —
     fully structured (dates, venue object, cost, image). See `nomea.mjs`.
   - A custom post type like `event` → `<site>/wp-json/wp/v2/<type>?per_page=50`.
     Dates usually need extracting from excerpt text with the shared
     `extractItalianDate()` helper. See `campaniaevents.mjs`.
   - Plain `post` only → editorial site; extract dates from excerpts like
     `napoliateatro.mjs` does. Only worth it if the site is events-focused.

3. **JS-rendered / bot-walled sites** → Playwright + stealth with REAL Chrome
   (bundled Chromium gets blocked). See `ticketone.mjs` / `dice.mjs`. Only do
   this if the site is high-value; ask Erik first.

Hard rules (violating these broke production for a week once):

- **Every row MUST be built through `shared.makeRow()`.** Never hand-build row
  objects — PostgREST bulk upsert requires identical keys on every row in the
  batch, and a mismatched shape kills the entire nightly run with exit 1.
- If the source has no genre keywords in titles (e.g. club nights named after
  the party), pass an explicit `category:` override to `makeRow` instead of
  relying on the keyword categorizer — otherwise events get silently dropped.
- Register the source in the `SOURCES` array in `scripts/scrape-events.mjs`
  AND add it to `SOURCE_PRIORITY` in `scripts/scrapers/shared.mjs` (official
  ticketing platforms rank above aggregator/blog sites — the rank decides who
  wins when the cross-source dedup finds the same event on multiple sites).
- Use `decodeHtml()` from shared.mjs for any title/description text — raw
  WordPress output is full of `&#8211;`-style entities.

Verify before committing:

1. `node --check` on every touched file.
2. `node scripts/scrape-events.mjs --dry --only=<newsource>` — expect > 0 events
   with sensible titles, dates, and categories.
3. Full `node scripts/scrape-events.mjs --dry` — read the "Cross-source dedup"
   output and eyeball that any dropped duplicates are REAL duplicates (same
   show, different wording), not false merges of unrelated events.
4. Update the source list in CLAUDE.md ("Always-on" / "Needs env vars" /
   "Playwright" buckets).

Commit and push to BOTH branches:
`git push origin HEAD:master && git push origin HEAD:main`
