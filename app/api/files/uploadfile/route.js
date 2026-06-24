import { requireApiUser } from "@/lib/auth";
import { FILE_BUCKET } from "@/lib/files";
import { jsonError, jsonOk } from "@/lib/http";
import { uploadAnalysisFile } from "@/lib/storageFiles";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const form = await request.formData();
  const file = form.get("analisis_file");
  const idAnalisis = String(form.get("id_analisis") || "");

  if (!file || !idAnalisis) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const { error } = await uploadAnalysisFile({
    supabase: session.supabase,
    bucket: FILE_BUCKET,
    idAnalisis,
    file
  });

  // Catch error, if "The object exceeded the maximum allowed size"
  if ((error.statusCode === "413" || error.message?.includes("maximum allowed size"))
  ) return jsonOk({ message: "El archivo excede el peso máximo permitido (12 MB).", data: [] });

  if (error) return jsonError("Internal Server Error.", error.status || 500);
  return jsonOk();
}
