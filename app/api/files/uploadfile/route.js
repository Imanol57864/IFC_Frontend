import { requireApiUser } from "@/lib/auth";
import { FILE_BUCKET } from "@/lib/files";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const form = await request.formData();
  const file = form.get("analisis_file");
  const idAnalisis = String(form.get("id_analisis") || "");
  const isAnalisisCreation = form.get("isAnalisisCreation");

  if (!file || !idAnalisis) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const supabase = session.supabase;
  const buffer = Buffer.from(await file.arrayBuffer());
  const fullPath = `${idAnalisis}/${file.name}`;
  const { data: fileData, error: uploadError } = await supabase.storage
    .from(FILE_BUCKET)
    .upload(fullPath, buffer, { contentType: file.type || "application/octet-stream" });

  if (uploadError) return jsonError("Internal Server Error.", uploadError.status || 500);

  const { error: insertError } = await supabase
    .from("Archivo_Analisis")
    .insert([{ id_analisis: idAnalisis, uuid_archivo: fileData.id }]);

  if (insertError) return jsonError("Internal Server Error.", insertError.status || 500);

  if (isAnalisisCreation) {
    const { error: typeError } = await supabase
      .from("Archivo_Analisis")
      .update({ tipo_archivo: "Cotización" })
      .eq("uuid_archivo", fileData.id);

    if (typeError) return jsonError("Internal Server Error.", typeError.status || 500);
  }

  return jsonOk();
}
