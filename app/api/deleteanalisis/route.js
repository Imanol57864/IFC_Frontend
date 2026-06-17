import { requireApiUser } from "@/lib/auth";
import { jsonError, jsonOk, readJson } from "@/lib/http";
import { FILE_BUCKET, FILE_LIST_LIMIT } from "@/lib/files";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const { id_analisis = "" } = await readJson(request);
  const supabase = session.supabase;

  const { error } = await supabase
    .from("catAnalisis")
    .delete()
    .eq("id_analisis", id_analisis);

  if (error) return jsonError();

  const { data: files, error: listError } = await supabase.storage
    .from(FILE_BUCKET)
    .list(id_analisis, { limit: FILE_LIST_LIMIT, recursive: true });

  if (listError) return jsonError();
  if (!files?.length) return jsonOk();

  const { data, error: removeError } = await supabase.storage
    .from(FILE_BUCKET)
    .remove(files.map((file) => `${id_analisis}/${file.name}`));

  if (removeError) return jsonError();
  return jsonOk({ message: "", data: data ?? [] });
}
