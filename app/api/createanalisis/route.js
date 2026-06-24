import { requireApiUser } from "@/lib/auth";
import { FILE_BUCKET } from "@/lib/files";
import { jsonError, jsonOk } from "@/lib/http";
import { uploadAnalysisFile } from "@/lib/storageFiles";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const form = await request.formData();
  const file = form.get("analisis_file");
  const labname = String(form.get("labname") || "");
  const code = String(form.get("a_code") || "");

  if (!file || !labname || !code) {
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
    return jsonOk({ message: "El laboratorio no cuenta con un código de análisis definido.", data: [] });
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

  const { error: fileError } = await uploadAnalysisFile({
    supabase,
    bucket: FILE_BUCKET,
    idAnalisis,
    file,
    tipoArchivo: "Cotización"
  });

  if (fileError) return jsonError("Internal Server Error.", fileError.status || 500);
  return jsonOk();
}
