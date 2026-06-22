import { NextResponse } from "next/server";
import { getPublicUrl } from "@/lib/requestUrl";
import { clearAuthCookies } from "@/lib/auth";

export async function GET(request) {
  const response = NextResponse.redirect(getPublicUrl(request, "/login"), { status: 303 });
  clearAuthCookies(response);
  return response;
}
