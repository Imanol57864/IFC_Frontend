export function tablePayloadEvent(payload, idField) {
  return {
    type: payload.eventType,
    id: payload.old?.[idField] || payload.new?.[idField],
    new_data: JSON.parse(JSON.stringify(payload.new || {}))
  };
}

export function analysisPayloadEventForLab(payload) {
  const event = tablePayloadEvent(payload, "id_analisis");
  return event;
}

export function filePayloadMatchesAnalysis(payload, idAnalisis) {
  if (payload.eventType === "DELETE" && !payload.old?.id_analisis) return true;
  const currentAnalysisId = String(idAnalisis);
  return (
    String(payload.old?.id_analisis ?? "") === currentAnalysisId ||
    String(payload.new?.id_analisis ?? "") === currentAnalysisId
  );
}
