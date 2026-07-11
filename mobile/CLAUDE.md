# HelpMeNapoli — Project Rules for Claude Code

## What This App Is
React Native / Expo app. "Your guide to living and loving Naples."
Built by Erik (owner, local expert, American-Italian based in Chiaia).

## Product Charter (July 2026 — check features against this)
- **Problem:** Naples is disorienting (language, culture, traffic, its own
  rules even by Italian standards). The app closes the *confidence gap* —
  a trusted local layer that turns anxiety into exploration. Events,
  transport, and language are means; *feeling at home* is the product.
- **Audience priority:** expats/relocators FIRST; locals and tourists equal
  second. When a tradeoff arises, the person living in Naples wins. Depth
  (strike alerts, funicular closures, game-day traffic) beats breadth
  (generic top-attractions content).
- **Business model:** the app is the funnel; Erik's experiences are the
  revenue. Targets: 1,000 downloads; €3,000/month from experiences. Judge
  features by "does this drive bookings or retention?" — the $10 unlock is
  margin, not the mission.
- **Hard boundaries:**
  - No service-directory sprawl (lawyers, real estate, visas). Scope is
    live/explore/enjoy, not administrate.
  - No features that create recurring manual work for Erik —
    automation-first (scrapers, feeds, scheduled notifications).
  - Third-party experiences / affiliate revenue only if passive
    (self-serve or API-driven; never manual provider outreach).

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
- Categories (the scraper maps into these — anything that doesn't fit is
  dropped): `music` (music/nightlife), `theater`, `food` (food/drink),
  `culture`, `wellness`, `business` (business/networking), `sport` (Napoli
  home games only — see Sport below).
- Sort: ascending by date, then time.
- Filters: by category (chips), by date range (Today / Weekend / This week /
  All), and by free (prominent central toggle).
- Manual admin entries (`source = 'admin'`) take priority over aggregated
  sources on dedupe — the scraper never overwrites an admin row.
- Scraping: `scripts/scrape-events.mjs` orchestrates per-source adapters in
  `scripts/scrapers/` (each self-skips when unconfigured; all funnel through
  `shared.makeRow` for categorization/per-source dedupe, then
  `shared.resolveDuplicates` for CROSS-source dedup — the same real event often
  gets listed under very different titles on different sites, so this matches
  by same-date + shared distinctive title words, not exact string equality).
  Flags: `--dry`, `--only=a,b`. Runs every 24h via
  `.github/workflows/scrape-events.yml`.
  - Always-on: `grandenapoli`, `iltaccodibacco` (both via the generic
    `scrapeJsonLd` adapter — reuse it for any new site with schema.org Event
    markup before writing a bespoke scraper), `coldiretti`, `napoliateatro`,
    `nomea`, `campaniaevents`, `xceed`.
  - Needs env vars: `eventbrite` (`EVENTBRITE_TOKEN`, optional
    `EVENTBRITE_ORG_IDS`), `bandsintown` (`BANDSINTOWN_APP_ID`, artist-scoped
    — no public city endpoint).
  - Playwright + stealth, driving REAL Chrome (bundled Chromium gets blocked
    by their bot walls): `ticketone`, `dice`.
  - New source checklist: try `scrapeJsonLd` against the listing page first;
    if 0 events, check for a WordPress REST API (`/wp-json/wp/v2/types` — look
    for a custom post type or a calendar plugin like The Events Calendar,
    `/wp-json/tribe/events/v1/events`) before writing HTML-scraping logic.

## Sport (Napoli home games)
- `scripts/scrapers/napoli-matches.mjs` — TheSportsDB (free, no key), upserts
  home fixtures into `events` as `category: 'sport'`.
- `hooks/useGameDayNotifications.ts` — schedules a 09:00 local notification on
  each game day warning about Tangenziale/Fuorigrotta traffic from 4h before
  kickoff. Wired into root `_layout.tsx`.

## Strikes (scioperi)
- Separate Supabase table (`strikes`, not `events`) — `scripts/scrapers/strikes.mjs`
  pulls the official MIT RSS feed, filters to national + Campania/Naples
  transport-relevant sectors. Displayed live on the Getting Around screen.

## Freemium / Paywall
- `hooks/usePremium.ts` (AsyncStorage-backed) + `components/PaywallSheet.tsx`.
- Free tier: weekend-only What's On, 4 curated Top 10 lists (pizzerias,
  aperitivo, artisan, museums), Basics + Pronunciation language sections.
  Everything else requires unlock. Never change what's free/gated without
  asking Erik first — this is a monetization decision, not a code decision.

## Experiences Section — Special Rules
- These are Erik's personal offerings — never auto-populate, edit
  `constants/experiences.ts` directly.
- Each experience has a `BookingConfig`: `rsvp` (fixed public dates only),
  `inquiry` (questionnaire only), or `hybrid` (both — public dates plus a
  private-request form). `components/BookingSheet.tsx` renders whichever flow
  applies. A `FixedDate` with `whatsappGroup` set skips the form entirely and
  opens that WhatsApp group link directly (used for events with a fixed
  group, e.g. the Capri boat day).
- All WhatsApp sends go through `sendWhatsApp()` / `sendEmail()` in
  `components/ContactSheet.tsx` — the single WhatsApp number
  (`+39 333 148 9589`) lives ONLY there. Never hardcode the number elsewhere;
  import and call these helpers (used by `BookingSheet.tsx` and
  `DriverSheet.tsx` too). Message format: greeting line, then `•`-bulleted
  fields, then a one-line next-step sign-off — keep new message builders
  consistent with this.
- `components/DriverSheet.tsx` (opened from the Getting Around screen) uses
  the same send helpers for private-driver requests.

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
