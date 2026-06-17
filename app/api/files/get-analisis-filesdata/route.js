import { requireApiUser } from "@/lib/auth";
import { FILE_BUCKET, FILE_LIFETIME_SECONDS } from "@/lib/files";
import { jsonError, jsonOk, readJson } from "@/lib/http";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const { id_analisis: idAnalisis } = await readJson(request);
  if (!idAnalisis) return jsonOk({ message: "Peticion incompleta.", data: [] });

  const supabase = session.supabase;
  const { data: relations, error: relationError } = await supabase
    .from("Archivo_Analisis")
    .select("id, uuid_archivo, tipo_archivo")
    .eq("id_analisis", idAnalisis);

  if (relationError) return jsonError();

  const uuids = (relations ?? []).map((relation) => relation.uuid_archivo);
  if (!uuids.length) return jsonOk({ message: "Este analisis no tiene archivos.", data: [] });

  const { data: files, error: filesError } = await supabase
    .schema("storage")
    .from("objects")
    .select("name, created_at, id")
    .in("id", uuids);

  if (filesError) return jsonError();

  const paths = (files ?? []).map((file) => file.name);
  const { data: signedUrls, error: urlError } = await supabase.storage
    .from(FILE_BUCKET)
    .createSignedUrls(paths, FILE_LIFETIME_SECONDS);

  if (urlError) return jsonError();

  const signedByPath = new Map((signedUrls ?? []).map((item) => [item.path, item]));
  const typeByUuid = new Map((relations ?? []).map((item) => [item.uuid_archivo, item]));
  const data = (files ?? []).map((file) => {
    const relation = typeByUuid.get(file.id) ?? {};
    const path = file.name;
    return {
      basic_id: relation.id,
      nombre: path.slice(path.indexOf("/") + 1),
      fecha: file.created_at,
      tipo: relation.tipo_archivo,
      url: signedByPath.get(file.name)?.signedUrl
    };
  });

  return jsonOk({ message: "", data });
}
