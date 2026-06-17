import { requireApiUser } from "@/lib/auth";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const { labname = "" } = await readJson(request);
  if (!labname) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const { data, error } = await session.supabase
    .from("catAnalisis")
    .select("*")
    .eq("id_catLabos", labname)
    .order("id_analisis", { ascending: true });

  if (error) return jsonError();
  return jsonOk({ message: "", data: data ?? [] });
}
