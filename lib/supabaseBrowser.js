"use client";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient;
let realtimeAuthPromise;

async function getRealtimeAccessToken() {
  const response = await fetch("/api/realtime-token", {
    credentials: "same-origin",
    cache: "no-store"
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.accessToken) {
    throw new Error(data.message || "Unable to authenticate Supabase Realtime.");
  }

  return data.accessToken;
}

export function getBrowserSupabase() {
  if (browserClient) return browserClient;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing public Supabase configuration for browser realtime.");
  }

  browserClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    accessToken: getRealtimeAccessToken,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
  return browserClient;
}

export async function getAuthenticatedBrowserSupabase() {
  const supabase = getBrowserSupabase();

  if (!realtimeAuthPromise) {
    realtimeAuthPromise = supabase.realtime.setAuth().catch((error) => {
      realtimeAuthPromise = null;
      throw error;
    });
  }

  await realtimeAuthPromise;
  return supabase;
}
