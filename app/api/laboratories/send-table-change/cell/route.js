import { requireApiUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { duplicateCellResponse, readCellChange, updateCell } from "@/lib/tableChange";

export async function POST(request) {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  const change = await readCellChange(request);
  if (!change.ok) return change.response;

  const { rowId, field, newValue } = change;
  const supabase = session.supabase;

  if (field === "nombre_lab") {
    const { data, error } = await supabase
      .from("catLabos")
      .select("*")
      .eq("nombre_lab", newValue);

    if (error) return jsonError();
    if (data?.length) {
      return duplicateCellResponse(`El nombre "${data[0].nombre_lab}" ya existe esta ocupado por un laboratorio.`);
    }
  }

  if (field === "cobertura_lab" && newValue === "Nacional - IFC LABS") {
    const { error } = await updateCell(supabase, "catLabos", "nombre_lab", rowId, "divisa_lab", "MXN");
    if (error) return jsonError();
  }

  if (field === "divisa_lab") {
    const { data, error } = await supabase
      .from("catLabos")
      .select("cobertura_lab")
      .eq("nombre_lab", rowId);

    if (error) return jsonError();
    if (data?.[0]?.cobertura_lab === "Nacional - IFC LABS") {
      return jsonOk({
        message: "Necesitas cambiar la cobertura antes de hacer ese cambio.",
        data: [],
        resetUI: true
      });
    }
  }

  const { error } = await updateCell(supabase, "catLabos", "nombre_lab", rowId, field, newValue);
  if (error) return jsonError();
  return jsonOk();
}
