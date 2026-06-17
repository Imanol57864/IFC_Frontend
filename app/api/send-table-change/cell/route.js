import { requireApiUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { duplicateCellResponse, readCellChange, updateCell } from "@/lib/tableChange";
import { FILE_BUCKET, FILE_LIST_LIMIT } from "@/lib/files";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const change = await readCellChange(request);
  if (!change.ok) return change.response;

  const { rowId, field, newValue } = change;
  const supabase = session.supabase;

  if (field === "id_analisis") {
    const { data, error } = await supabase
      .from("catAnalisis")
      .select("*, catLabos(nombre_lab)")
      .eq("id_analisis", newValue);

    if (error) return jsonError();
    if (data?.length) {
      return duplicateCellResponse(`El ID "${data[0].id_analisis}" ya existe para el laboratorio "${data[0].catLabos.nombre_lab}"`);
    }
  }

  const { error } = await updateCell(supabase, "catAnalisis", "id_analisis", rowId, field, newValue);
  if (error) return jsonError();
  if (field !== "id_analisis") return jsonOk();

  const { data: files, error: listError } = await supabase.storage
    .from(FILE_BUCKET)
    .list(rowId, { limit: FILE_LIST_LIMIT, recursive: true });

  if (listError) return jsonError();
  if (!files?.length) return jsonOk();

  const moves = files.map((file) => ({
    origin: `${rowId}/${file.name}`,
    destination: `${newValue}/${file.name}`
  }));

  await Promise.all(
    moves.map((file) => supabase.storage.from(FILE_BUCKET).move(file.origin, file.destination))
  );

  const { error: removeError } = await supabase.storage
    .from(FILE_BUCKET)
    .remove(moves.map((file) => file.origin));

  if (removeError) return jsonError();
  return jsonOk();
}
