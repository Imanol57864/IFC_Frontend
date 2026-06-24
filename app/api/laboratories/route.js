import { withApiUser } from "@/lib/api";
import { jsonError, jsonOk } from "@/lib/http";

export const POST = withApiUser(async ({ supabase }) => {
  const { data, error } = await supabase
    .from("catLabos")
    .select("*")
    .order("nombre_lab", { ascending: true });
  if (error) return jsonError();
  if (!data?.length) return jsonOk({ message: "Crea el primer laboratorio.", data: [] });
  return jsonOk({ message: "", data });
});
