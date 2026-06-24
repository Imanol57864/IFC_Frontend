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

  if (error) {

    // Catch unique key errors
    if ((error.code === "23505" || error.message?.includes("violates unique constraint"))) {
      if (error.message?.includes("catLabos_codigo_lab_key")
      ) return duplicateCellResponse(`El código identificador ${newValue} ya se encuentra ocupado.`);
    
      if (error.message?.includes("catLabos_nombre_lab_key")
      ) return duplicateCellResponse(`El nombre de laboratorio ${newValue} ya se encuentra ocupado.`);
    } 
    
    return jsonError();
  }

  return jsonOk();
}
