import { requireApiUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST() {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const { data, error } = await session.supabase
    .from("catLabos")
    .select("*")
    .order("nombre_lab", { ascending: true });

  if (error) return jsonError();
  if (!data?.length) return jsonOk({ message: "Crea el primer laboratorio.", data: [] });
  return jsonOk({ message: "", data });
}
