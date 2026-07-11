---
description: Commit and push HelpMeNapoli changes to both remote branches
---

Commit and push the current HelpMeNapoli changes. Extra instructions, if
any: $ARGUMENTS

This repo has a branch quirk: local `main` tracks `origin/master`, but GitHub
Actions runs off `origin/main` — BOTH must be pushed or CI runs stale code.

1. `cd /Users/erikholzer/Desktop/helpmenapoli && git status` — review what's
   changed. Quote paths containing `(tabs)` when staging (zsh globbing).
2. Stage intentionally. Don't blindly `git add -A` if there are unrelated
   files (e.g. `.DS_Store`, stray experiment folders) — stage the files that
   belong to this change.
3. Check nothing staged contains secrets. `mobile/.env` is gitignored;
   anything with keys/tokens in it must never be committed.
4. Commit with a message that says WHY, not just what. Multi-line body for
   non-trivial changes. End with:
   `Co-Authored-By: Claude <noreply@anthropic.com>`
5. Push to BOTH branches — this is the step that gets forgotten:
   ```
   git push origin HEAD:master && git push origin HEAD:main
   ```
6. If the change touches the scraper or workflow file, remind Erik he can
   trigger a manual run (GitHub → Actions → "Scrape Naples events" → Run
   workflow) instead of waiting for the nightly cron.
