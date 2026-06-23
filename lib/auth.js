import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createSupabaseClient } from "./supabase";

export async function getSessionContext() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken) {
    console.warn("Auth cookie unavailable", {
      hasAccessToken: false,
      hasRefreshToken: Boolean(refreshToken)
    });
    return { ok: false, supabase: null, user: null };
  }

  const supabase = createSupabaseClient(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data?.user) {
    console.warn("Auth token validation failed", {
      hasAccessToken: true,
      hasRefreshToken: Boolean(refreshToken),
      message: error?.message || "User unavailable"
    });
    return { ok: false, supabase: null, user: null };
  }

  return { ok: true, supabase, user: data.user, accessToken };
}

export async function requirePageUser() {
  const session = await getSessionContext();
  if (!session.ok) redirect("/login");
  return session;
}

export async function requireApiUser() {
  const session = await getSessionContext();
  if (session.ok) return session;

  const response = NextResponse.json(
    { message: "No autenticado.", data: [] },
    { status: 401 }
  );
  return { ok: false, response };
}

export function setAuthCookies(response, session) {
  const options = getAuthCookieOptions();

  response.cookies.set("access_token", session.access_token, options);

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
