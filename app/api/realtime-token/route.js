import { requireApiUser } from "@/lib/auth";
import { jsonOk } from "@/lib/http";

export async function GET() {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  return jsonOk(
    { accessToken: session.accessToken },
    { headers: { "Cache-Control": "no-store" } }
  );
}
