import { NextResponse } from "next/server";

export async function GET(request) {
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
