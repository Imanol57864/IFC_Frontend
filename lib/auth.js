import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createSupabaseClient } from "./supabase";

export async function getSessionContext() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken || !refreshToken) {
    return { ok: false, supabase: null, user: null };
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (error || !data?.user) {
    return { ok: false, supabase: null, user: null };
  }

  return { ok: true, supabase, user: data.user };
}

export async function requirePageUser() {
  const session = await getSessionContext();
  if (!session.ok) redirect("/api/logout");
  return session;
}

export async function requireApiUser() {
  const session = await getSessionContext();
  if (session.ok) return session;

  const response = NextResponse.json(
    { message: "No autenticado.", data: [] },
    { status: 401 }
  );
  clearAuthCookies(response);
  return { ok: false, response };
}

export function setAuthCookies(response, session) {
  const options = getAuthCookieOptions();

  response.cookies.set("access_token", session.access_token, {
    ...options,
    maxAge: Math.max(1, session.expires_at - Math.floor(Date.now() / 1000))
  });

  response.cookies.set("refresh_token", session.refresh_token, {
    ...options,
    maxAge: 15 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(response) {
  const options = getAuthCookieOptions();

  response.cookies.set("access_token", "", { ...options, maxAge: 0 });
  response.cookies.set("refresh_token", "", { ...options, maxAge: 0 });
}

function getAuthCookieOptions() {
  const appUrl = process.env.APP_URL ? new URL(process.env.APP_URL) : null;

  return {
    httpOnly: true,
    secure: appUrl ? appUrl.protocol === "https:" : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(appUrl ? { domain: appUrl.hostname } : {})
  };
}
