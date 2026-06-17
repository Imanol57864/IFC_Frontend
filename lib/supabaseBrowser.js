"use client";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient;

export function getBrowserSupabase() {
  if (browserClient) return browserClient;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing public Supabase configuration for browser realtime.");
  }

  browserClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
  return browserClient;
}
