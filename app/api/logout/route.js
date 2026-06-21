import { NextResponse } from "next/server";

export async function GET() {
  console.log({
    url: request.url,
    host: request.headers.get("host"),
    xfh: request.headers.get("x-forwarded-host"),
    xfp: request.headers.get("x-forwarded-proto"),
  });
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
