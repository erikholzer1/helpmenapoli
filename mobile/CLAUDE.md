# HelpMeNapoli — Project Rules for Claude Code

## What This App Is
React Native / Expo app. "Your guide to living and loving Naples."
Target users: visitors, expats, and relocators in Naples, Italy.
Built by Erik (owner, local expert, American-Italian based in Chiaia).

## Sections (current)
- Home (dashboard with cards)
- Language Help — Italian phrases, vocab, grammar
- Top 10 Lists — curated eat/drink/explore lists
- What's On — events, gigs, markets happening this week
- Experiences — Erik's private tours, cooking classes, day trips, etc
- Getting Around — transport info
- Discover (bottom nav)

## Design Rules
- Dark warm color scheme (black, gold, deep red, teal, purple, blue)
- Each section has its own accent color — maintain these
- Logo and brand: HelpMeNapoli wordmark, keep consistent
- Cards on home screen: icon + title + subtitle + arrow button
- Bottom nav: Home, Language, Discover, Experiences, What's On
- Tokens live in `constants/Colors.ts` (Colors, Shadow, Radius, Gradients).
  Fonts: Playfair Display (serif headings) + DM Sans (body). Use these — never
  hardcode hex or font names in screens.

## Architecture Rules
- Never hardcode content that will change (events, lists, experiences)
- All dynamic content fetches from Supabase
- Use existing component patterns before creating new ones
- Always add loading states and error states to data-fetching screens
- TypeScript types required for all data schemas
- Data layer lives in `lib/` (e.g. `lib/supabase.ts`, `lib/events.ts`):
  screens import typed fetch functions, never query Supabase inline.

## Supabase
- Client: `lib/supabase.ts`. Public app uses the **anon key** (read-only via RLS).
- Keys come from `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  in `.env` (gitignored; template in `.env.example`).
- Schema migrations live in `supabase/migrations/`. Run them in the Supabase
  SQL editor or via the CLI.
- Writes happen server-side only (the scraper, with the service-role key).
  Never write to Supabase from the app.

## What's On Section — Special Rules
- Events data must never be older than 24 hours (refresh on screen focus —
  see `useFocusEffect` in `app/(tabs)/events.tsx`).
- Events table columns (snake_case in DB, camelCase in `lib/events.ts`):
  `date, end_date, category, title, time, venue, area, price, free,
  image_url, ticket_url, source, external_id, description`
- Categories (the 6 the scraper maps into — anything that doesn't fit is dropped):
  `music` (music/nightlife), `theater`, `food` (food/drink), `culture`,
  `wellness`, `business` (business/networking).
- Sort: ascending by date, then time.
- Filters: by category (chips), by date range (Today / Weekend / This week /
  All), and by free (prominent central toggle).
- Manual admin entries (`source = 'admin'`) take priority over aggregated
  sources on dedupe — the scraper never overwrites an admin row.
- Scraping: `scripts/scrape-events.mjs` orchestrates per-source adapters in
  `scripts/scrapers/` (each self-skips when unconfigured; all funnel through
  `shared.makeRow` for categorization/dedupe). Only events that clearly fit one
  of the 6 categories are kept. Flags: `--dry`, `--only=a,b`. Runs every 24h via
  `.github/workflows/scrape-events.yml`.
  - `grandenapoli` — schema.org JSON-LD over plain fetch. WORKS (~30 events).
  - `eventbrite` — needs `EVENTBRITE_TOKEN`. Public REST search was removed in
    2020, so this calls the internal `/v3/destination/search/` endpoint (the one
    eventbrite.it itself uses) for Naples, maps Eventbrite category tags → our 6
    buckets, and filters to Naples-area venues. WORKS (~104 events).
    `EVENTBRITE_ORG_IDS` optionally adds events from orgs Erik owns.
  - `bandsintown` — official API, ARTIST-scoped (no public city endpoint),
    filtered to Naples area. Needs `BANDSINTOWN_APP_ID` + `BANDSINTOWN_ARTISTS`.
  - `ticketone`, `dice` — Playwright + stealth (`playwright-extra` +
    `puppeteer-extra-plugin-stealth`) driving REAL Chrome
    (`npx playwright install chrome`). Both sites have bot walls (TicketOne=
    Akamai, Dice=Cloudflare) that stealth+real-Chrome gets past. WORKS:
    TicketOne ~18 (JSON-LD), Dice ~30 (Next.js `__NEXT_DATA__`). If they start
    returning 0 again, the bot wall changed — bundled Chromium won't do, real
    Chrome is required.

## Experiences Section — Special Rules
- These are Erik's personal offerings — never auto-populate.
- Schema: `{ id, title, description, duration, category, booking_url,
  image_url, featured }`
- Booking goes to WhatsApp (`+39 333 148 9859` → `wa.me/393331489859`) via
  `components/ContactSheet.tsx`.

## Working Style
- When building a feature, flag related components that need updating.
- If a pattern repeats 2+ times, extract it into a reusable component.
- When adding a screen, also update navigation and add TypeScript types.
- Suggest improvements but ask before changing existing structure.
- Add comments explaining WHY decisions were made, not just what.

## Never Do
- Never change navigation structure without asking Erik first.
- Never remove existing sections or rename routes.
- Never hardcode event data into components.
- Never skip error handling on API calls.
- Never commit `.env` or the service-role key.
