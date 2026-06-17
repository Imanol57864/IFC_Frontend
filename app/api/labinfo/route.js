import { requireApiUser } from "@/lib/auth";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const { labname = "" } = await readJson(request);
  if (!labname) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const { data, error } = await session.supabase
    .from("catLabos")
    .select("*")
    .eq("nombre_lab", labname);

  if (error) return jsonError();
  if (!data?.length) return jsonOk({ message: "No se encontro informacion de este laboratorio.", data: [] });
  return jsonOk({ message: "", data });
}
