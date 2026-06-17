export async function queryLabsNames(supabase) {
  const { data, error } = await supabase
    .from("catLabos")
    .select("nombre_lab")
    .order("nombre_lab", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function queryStaticInfo(supabase) {
  const { data, error } = await supabase
    .from("catStatics")
    .select("id, marker, value")
    .order("id", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
