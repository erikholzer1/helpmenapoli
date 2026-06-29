---
description: Add or change an offering in the Experiences section
---

You are working on the Experiences section of HelpMeNapoli. Follow CLAUDE.md,
especially "Experiences Section — Special Rules".

Task: $ARGUMENTS

Ground rules for Experiences:

1. **These are Erik's personal offerings — never auto-populate or scrape them.**
   They are curated by hand.

2. **Schema:** `{ id, title, description, duration, category, booking_url,
   image_url, featured }`. Keep the data in its existing source
   (`constants/experiences.ts`) and types in sync.

3. **Booking goes to WhatsApp.** Reuse `components/ContactSheet.tsx`
   (WhatsApp `+39 333 148 9859` → `wa.me/393331489859`, or email
   `help.me.napoli@gmail.com`). Do not build a new contact flow.

4. **Card style.** Image-forward cards (scrim + title + tagline + "Info" pill),
   centered/capped column — match the existing `app/(tabs)/experiences.tsx`
   pattern. Use `constants/Colors.ts` tokens.

5. **Images** live in `assets/images/experiences/`. Add the file and reference
   it with `require()`.

6. If you add a `featured` flag or new field, update the TypeScript type and
   every card that renders it. Flag related components that need the change.

Report which files you touched and why.
