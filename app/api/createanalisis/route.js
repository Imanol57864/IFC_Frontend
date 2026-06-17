import { requireApiUser } from "@/lib/auth";
import { FILE_BUCKET } from "@/lib/files";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const form = await request.formData();
  const file = form.get("analisis_file");
  const labname = String(form.get("labname") || "");
  const code = String(form.get("a_code") || "");
  const regex = /^\d{3}$/;

  if (!file || !labname || !regex.test(code)) {
    return jsonOk({ message: "Peticion incompleta.", data: [] });
  }

  const supabase = session.supabase;
  const { data: labs, error: labError } = await supabase
    .from("catLabos")
    .select("codigo_lab")
    .eq("nombre_lab", labname);

  if (labError) return jsonError();
  const labCode = labs?.[0]?.codigo_lab;
  if (!labCode) {
    return jsonOk({ message: "El laboratorio no cuenta con un código de analisis definido.", data: [] });
  }

  const idAnalisis = `${labCode}${code}`;
  const { error: insertError } = await supabase
    .from("catAnalisis")
    .insert([{ id_analisis: idAnalisis, id_catLabos: labname }]);

  if (insertError) {
    if (insertError.code === "23505") {
      return jsonOk({ message: "Se intentó crear un análisis con un ID ocupado. Vuelve a intentar.", data: [] });
    }
    return jsonError();
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { data: fileData, error: uploadError } = await supabase.storage
    .from(FILE_BUCKET)
    .upload(`${idAnalisis}/${file.name}`, buffer, { contentType: file.type || "application/octet-stream" });

  console.log("found1", uploadError)
  if (uploadError) return jsonError("1Internal Server Error.", uploadError.status || 500);

  const { error: relationError } = await supabase
    .from("Archivo_Analisis")
    .insert([{ id_analisis: idAnalisis, uuid_archivo: fileData.id }]);

  console.log("found2", relationError)
  if (relationError) return jsonError("2Internal Server Error.", relationError.status || 500);

  const { error: typeError } = await supabase
    .from("Archivo_Analisis")
    .update({ tipo_archivo: "Cotización" })
    .eq("uuid_archivo", fileData.id);

  console.log("found3", typeError)
  if (typeError) return jsonError("3Internal Server Error.", typeError.status || 500);
  return jsonOk();
}
