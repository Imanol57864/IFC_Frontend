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
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return { ok: false, response };
}

export function setAuthCookies(response, session) {
  response.cookies.set("access_token", session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/"
  });

  response.cookies.set("refresh_token", session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 24 * 60 * 60,
    path: "/"
  });
}
