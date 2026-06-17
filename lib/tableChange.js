import { jsonOk } from "./http";

export async function readCellChange(request) {
  const body = await request.json().catch(() => ({}));
  const { rowId, field, newValue } = body;
  if (field == null || rowId == null || newValue == null) {
    return { ok: false, response: jsonOk({ message: "Peticion incompleta", data: [] }) };
  }
  return { ok: true, rowId, field, newValue };
}

export function duplicateCellResponse(message) {
  return jsonOk({ message, data: [], IdDuplicate: true });
}

export async function updateCell(supabase, table, idField, rowId, field, newValue) {
  return supabase
    .from(table)
    .update({ [field]: newValue })
    .eq(idField, rowId);
}
