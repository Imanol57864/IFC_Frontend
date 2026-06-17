import { requireApiUser } from "@/lib/auth";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const { labName = "" } = await readJson(request);
  if (!labName) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const { error } = await session.supabase
    .from("catLabos")
    .delete()
    .eq("nombre_lab", labName);

  if (error) return jsonError();
  return jsonOk();
}
