import { withApiUser } from "@/lib/api";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export const POST = withApiUser(async ({ request, supabase }) => {
  await readJson(request);

  // Remote Procedure Call, filters READ logic based on area.id
  const { data , error } = await supabase.rpc("get_analisis");

  if (error) return jsonError();
  return jsonOk({ message: "", data: data ?? [] });
});