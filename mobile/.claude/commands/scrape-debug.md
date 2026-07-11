---
description: Diagnose a failed "Scrape Naples events" GitHub Actions run
---

The nightly scrape failed (or events look stale/wrong in the app). Extra
context from Erik, if any: $ARGUMENTS

Triage in this order — these are the failure modes that have actually
happened, most common first:

1. **Get the run status.** No `gh` CLI on this machine — use the public API:
   `https://api.github.com/repos/erikholzer1/helpmenapoli/actions/workflows/scrape-events.yml/runs?per_page=5`
   (WebFetch it). Note WHICH step failed via
   `.../actions/runs/<run_id>/jobs`. Raw log text needs auth — if you need the
   exact error line, ask Erik to open the failed step and paste the last
   ~20 lines.

2. **Supabase paused?** Free-tier Supabase auto-pauses after ~7 days without
   traffic, and every scraper write then fails. If failures started suddenly
   after a quiet period and the code hasn't changed, ask Erik to check the
   Supabase dashboard and unpause. (This was the July 10 failure.)

3. **Reproduce locally.** `cd mobile && node scripts/scrape-events.mjs --dry`.
   The `.env` there has the anon keys and Eventbrite/Bandsintown tokens, so
   all sources run. A crash here = code bug; clean run here + failing CI =
   environment/DB issue.

4. **Row-shape mismatch.** If the error is from the upsert step: check that
   every scraper builds rows via `shared.makeRow()`. One hand-built row object
   with extra/missing keys kills the whole PostgREST batch upsert ("exit code
   1" right after all sources print their counts). This broke every run for a
   week in July 2026. Quick check — print `Object.keys()` of one row per
   source and diff.

5. **Upsert conflict error** ("no unique or exclusion constraint matching the
   ON CONFLICT specification"): the unique index on `(source, external_id)`
   must be NON-partial. A `WHERE` clause on the index breaks
   `.upsert({ onConflict })`.

6. **A single source returning 0** is NOT a failure — sources self-skip and
   bot walls come and go (TicketOne/Dice need real Chrome; if they return 0,
   the wall changed). Only investigate if a normally-rich source stays at 0
   for several days.

7. **Secrets missing** ("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"):
   GitHub repo secrets are set at Settings → Secrets → Actions. Remember the
   workflow runs on BOTH `main` and `master` pushes — the branches must both
   be current (`git push origin HEAD:master && git push origin HEAD:main`).

After any fix: ask Erik to trigger the workflow manually (GitHub → Actions →
"Scrape Naples events" → Run workflow) rather than waiting for the 04:00 UTC
cron, and confirm it goes green.
