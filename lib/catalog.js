export async function queryLabsNames(supabase) {
  const { data, error } = await supabase
    .from("catLabos")
    .select("nombre_lab")
    .order("nombre_lab", { ascending: true });

  if (error) throw error;
  return data ?? [];
}