import { requireApiUser } from "@/lib/auth";
import { FILE_BUCKET } from "@/lib/files";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const { filename = "", id_analisis: idAnalisis = "" } = await readJson(request);
  if (!filename || !idAnalisis) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const path = `${idAnalisis}/${filename}`;
  const supabase = session.supabase;
  const { data: object, error: objectError } = await supabase
    .schema("storage")
    .from("objects")
    .select("id")
    .eq("bucket_id", FILE_BUCKET)
    .eq("name", path)
    .maybeSingle();

  if (objectError) return jsonError();

  const { error: removeError } = await supabase.storage
    .from(FILE_BUCKET)
    .remove([path]);

  if (removeError) return jsonError("Internal Server Error.", removeError.status || 500);

  if (object?.id) {
    const { error: relationError } = await supabase
      .from("Archivo_Analisis")
      .delete()
      .eq("id_analisis", idAnalisis)
      .eq("uuid_archivo", object.id);

    if (relationError) return jsonError();
  }

  return jsonOk();
}
