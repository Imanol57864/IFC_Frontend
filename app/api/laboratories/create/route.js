import { requireApiUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST() {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const num = Math.floor(Math.random() * 999) + 1;
  const newName = `${num}_NUEVO_LABORATORIO`;
  const { error } = await session.supabase
    .from("catLabos")
    .insert([{ nombre_lab: newName }]);

  if (error) return jsonError();
  return jsonOk({ message: "", data: [], nuevo: newName });
}
