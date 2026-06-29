// Supabase client for HelpMeNapoli.
//
// WHY public reads only: the app never authenticates users — it just reads
// dynamic content (events, and later lists/experiences). So we disable session
// persistence to avoid pulling in AsyncStorage as a dependency. Row Level
// Security on Supabase is set to "anon can SELECT" only; all writes happen
// server-side (the scraper) with the service-role key, never from the app.
//
// Keys come from EXPO_PUBLIC_* env vars (see .env / .env.example). Expo inlines
// any EXPO_PUBLIC_-prefixed var at build time, so these are safe to reference
// directly. The anon key is a public key by design — it is NOT a secret.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaced in Metro logs during dev so a missing .env is obvious immediately.
  console.warn(
    '[supabase] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and fill in your project values.'
  );
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// WHY placeholders: createClient() throws on an empty URL, which would crash the
// whole app before the screen can show its friendly "not configured" state. We
// hand it valid-looking placeholders when unconfigured; no request is ever made
// because every fetch helper short-circuits on isSupabaseConfigured first.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
