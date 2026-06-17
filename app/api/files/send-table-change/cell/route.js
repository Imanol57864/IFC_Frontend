import { requireApiUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { readCellChange, updateCell } from "@/lib/tableChange";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const change = await readCellChange(request);
  if (!change.ok) return change.response;

  const { rowId, field, newValue } = change;
  const { error } = await updateCell(session.supabase, "Archivo_Analisis", "id", rowId, field, newValue);

  if (error) return jsonError();
  return jsonOk();
}
