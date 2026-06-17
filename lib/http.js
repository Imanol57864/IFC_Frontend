import { NextResponse } from "next/server";

export function jsonOk(body = { message: "", data: [] }, init = {}) {
  return NextResponse.json(body, { status: 200, ...init });
}

export function jsonError(message = "Internal Server Error.", status = 500) {
  return NextResponse.json({ message, data: [] }, { status });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
