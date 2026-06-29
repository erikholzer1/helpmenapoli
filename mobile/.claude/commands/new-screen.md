---
description: Add a new screen to the HelpMeNapoli app (route, types, nav, states)
---

You are adding a new screen to the HelpMeNapoli Expo Router app. Follow the
project rules in CLAUDE.md exactly.

Screen to add: $ARGUMENTS

Do all of the following:

1. **Decide the route.** Tab screens live in `app/(tabs)/`; pushed detail/utility
   screens live in `app/` (e.g. `app/getaround.tsx`). Ask Erik before adding a
   new bottom-tab — never change the tab bar (Home, Language, Discover,
   Experiences, What's On) without his OK.

2. **Match the existing pattern.** Open a comparable screen first
   (`app/(tabs)/events.tsx` for data-driven, `app/dishes.tsx` for static glossary)
   and reuse its structure: `SafeAreaView edges={['top']}`, a header block
   (eyebrow + Playfair title + DM Sans subtitle), and `constants/Colors.ts`
   tokens (Colors / Shadow / Radius). No hardcoded hex or font names.

3. **Types.** Define TypeScript types for any data the screen uses. Dynamic
   content (events, lists, experiences) must come from Supabase via a typed
   fetch function in `lib/` — never hardcode it into the component.

4. **States.** If the screen fetches data, add loading, error (with retry), and
   empty states. Refresh on focus with `useFocusEffect` if freshness matters.

5. **Navigation.** Wire it up: a tab gets a `<Tabs.Screen>` in
   `app/(tabs)/_layout.tsx`; a pushed screen gets a `router.push('/route')`
   entry point (usually a card on Home or Discover).

6. **Accent color.** Give the section its own accent from the brand palette and
   use it consistently.

7. Report which existing files you touched and why.
