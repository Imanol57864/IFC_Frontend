import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("Missing SUPABASE_URL or SUPABASE_KEY environment variables.");
}

function realtimeOptions() {
  const options = {
    params: { apikey: SUPABASE_KEY },
    heartbeatIntervalMs: 15000,
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 10000),
    timeout: 10000
  };

  if (typeof globalThis.WebSocket === "function") {
    options.transport = globalThis.WebSocket;
  }

  return options;
}

export function createSupabaseClient(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    ...(accessToken
      ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      : {}),
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    realtime: realtimeOptions()
  });
}
