export function tablePayloadEvent(payload, idField) {
  return {
    type: payload.eventType,
    id: payload.old?.[idField] || payload.new?.[idField],
    new_data: JSON.parse(JSON.stringify(payload.new || {}))
  };
}

export function analysisPayloadEventForLab(payload, labId) {
  const oldLabId = payload.old?.id_catLabos;
  const newLabId = payload.new?.id_catLabos;
  const row = payload.new || payload.old || {};
  const event = tablePayloadEvent(payload, "id_analisis");

  if (payload.eventType === "DELETE") return event;
  if (oldLabId !== newLabId && oldLabId === labId) return { ...event, type: "DELETE" };
  if (oldLabId !== newLabId && newLabId === labId) return { ...event, type: "INSERT" };
  if (row.id_catLabos === labId) return event;
  return null;
}

export function filePayloadMatchesAnalysis(payload, idAnalisis) {
  if (payload.eventType === "DELETE" && !payload.old?.id_analisis) return true;
  return payload.old?.id_analisis === idAnalisis || payload.new?.id_analisis === idAnalisis;
}

