"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_GRID_OPTIONS, GRID_CLASS_NAME, GRID_STYLE, applyRealtimeRowEvent, makeButton, postJson, readJsonResponse, sendCellChange, setRows, subscribeToTableChanges, useAgGrid, useQuickFilter } from "./agGridShared";
import { analysisPayloadEventForLab } from "@/lib/realtimePayloads";
import { CURRENCY_RATES_CHANGED_EVENT } from "./CurrencyRateInputs";

const DESCRIPTION_FIELDS = {
  desc_toptext: "Nombre: ",
  desc_metodo: "Metodología: ",
  desc_acred: "Acreditación: ",
  desc_respuesta: "Tiempo de respuesta: ",
  desc_muestra_tipo: "Tipo de muestra: ",
  desc_muestra_cantd: "Cantidad de muestra: ",
  desc_bottomtext: "Indicaciones especiales: "
};

const CATEGORY_OPTIONS = [
  "MICROBIOLÓGICO",
  "FISICOQUÍMICOS",
  "FITOSANIDAD",
  "RESIDUOS QUÍMICOS",
  "FERTILIZACIÓN",
  "MIGRACIÓN QUÍMICA",
  "OTROS"
];

const expandedDescriptionRows = new Set();
const FILE_FIELD = "analisis_file";

export default function CatalogAgGrid() {
  const gridRef = useRef(null);
  const rowsRef = useRef([]);
  const divisaDestinoRef = useRef("MXN");
  const divisaBaseRef = useRef("MXN");
  const analysisRealtimeRef = useRef(null);
  const labRealtimeRef = useRef(null);

  const apiRef = useAgGrid(gridRef, () => ({
    ...DEFAULT_GRID_OPTIONS,
    getRowId: (params) => String(params.data.id_analisis),
    columnDefs: [
      { headerName: "Código 2026", field: "id_analisis", editable: false, width: 140, cellEditor: "agTextCellEditor", pinned: 'left'},
      { headerName: "Laboratorio", field: "id_catLabos", width: 140, },
      { headerName: "Descripción", field: "descripcion", cellRenderer: descriptionRenderer, width: 430, autoHeight: true, wrapText: true, sortable: false },
      { headerName: "Cantidad", field: "y_cantidad", editable: true, width: 140, cellEditor: "agNumberCellEditor", valueParser: numberParser },
      { headerName: "Precio", field: "y_precio", width: 140, valueFormatter: (params) => currencyFormatter(params, divisaBaseRef, divisaDestinoRef) },
      { headerName: "Categoría", field: "y_categoria", editable: true, cellEditor: "agSelectCellEditor", cellEditorParams: { values: CATEGORY_OPTIONS }, width: 220 },
      { headerName: "Costo", field: "c_costo", editable: true, width: 140, cellEditor: "agNumberCellEditor", valueParser: numberParser, valueFormatter: (params) => currencyFormatter(params, divisaBaseRef, divisaDestinoRef) },
      { headerName: "Factor", field: "c_factor", editable: true, width: 140, cellEditor: "agNumberCellEditor", valueParser: numberParser },
      { headerName: "Envío", field: "c_envio", editable: true, width: 140, cellEditor: "agNumberCellEditor", valueParser: numberParser, valueFormatter: (params) => currencyFormatter(params, divisaBaseRef, divisaDestinoRef) },
      { headerName: "Utilidad", field: "c_utilidad", width: 140, valueFormatter: (params) => currencyFormatter(params, divisaBaseRef, divisaDestinoRef) },
      { headerName: "Acciones", cellRenderer: actionsRenderer, width: 110, sortable: false, filter: false },
      { headerName: "Archivos", cellRenderer: filesViewRenderer, width: 140, sortable: false, filter: false },
      ...Object.keys(DESCRIPTION_FIELDS).map((field) => ({ field, hide: true }))
    ],
    context: {
      reload: () => loadAnalisis(),
      closeSources,
      descriptionFields: DESCRIPTION_FIELDS
    },
    onCellValueChanged: async (event) => {
      const field = event.colDef.field;
      if (!field || event.oldValue === event.newValue) return;
      const newValue = typeof event.newValue === "string" ? event.newValue.trim() : event.newValue;
      const rowId = field === "id_analisis" ? event.oldValue : event.data.id_analisis;
      const ok = await sendTableChange(rowId, field, newValue);
      if (!ok || field === "id_analisis") await loadAnalisis();
    }
  }), []);

  async function loadAnalisis() {
    window.activateLoadScreen?.();
    try {
      const result = await postJson("/load-analisis");
      if (!result.ok) return false;

      rowsRef.current = result.data.data || [];
      setRows(apiRef.current, rowsRef.current);
      return true;
    } finally {
      window.deactivateLoadScreen?.();
    }
  }

  function closeSources() {
    analysisRealtimeRef.current?.close();
    labRealtimeRef.current?.close();
    analysisRealtimeRef.current = null;
    labRealtimeRef.current = null;
  }

  function createAnalysisRealtime() {
    analysisRealtimeRef.current?.close();
    analysisRealtimeRef.current = subscribeToTableChanges({
      channelName: `catAnalisis`,
      table: "catAnalisis",
      onPayload: (payload) => {
        const data = analysisPayloadEventForLab(payload);
        if (data) handleAnalisisEvent(data);
      }
    });
  }

  function handleAnalisisEvent(data) {
    return applyRealtimeRowEvent({
      api: apiRef.current,
      rowsRef,
      data,
      idField: "id_analisis",
      reload: () => loadAnalisis()
    });
  }

  function setNewDivisa(divisa, base) {
    window.activateLoadScreen?.();
    try {
      divisaDestinoRef.current = divisa;
      if (base) divisaBaseRef.current = base;
      apiRef.current?.refreshCells({ force: true });
    } finally {
      window.deactivateLoadScreen?.();
    }
  }

  useEffect(() => {
    window.triggerGrid = loadAnalisis;
    window.setNewDivisa = setNewDivisa;
    // createLabRealtime();
    let cancelled = false;

    async function initializeCatalog() {
      const loaded = await loadAnalisis();
      if (!cancelled && loaded) createAnalysisRealtime();
    }

    initializeCatalog();

    const logout = document.getElementById("logout-btn");
    const manageLabs = document.getElementById("getLabView_btn");
    const goToLabs = () => {
      closeSources();
      window.location.href = "/main_catalog/laboratories";
    };
    logout?.addEventListener("click", closeSources);
    manageLabs?.addEventListener("click", goToLabs);

    return () => {
      cancelled = true;
      closeSources();
      logout?.removeEventListener("click", closeSources);
      manageLabs?.removeEventListener("click", goToLabs);
      if (window.triggerGrid === loadAnalisis) delete window.triggerGrid;
      if (window.setNewDivisa === setNewDivisa) delete window.setNewDivisa;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useQuickFilter(apiRef);

  useEffect(() => {
    const mxnButton = document.getElementById("btn_changeto_mxn");
    const usdButton = document.getElementById("btn_changeto_usd");
    const eurButton = document.getElementById("btn_changeto_eur");
    const onMxnClick = () => setNewDivisa("MXN");
    const onUsdClick = () => setNewDivisa("USD");
    const onEurClick = () => setNewDivisa("EUR");
    const onRatesChanged = () => apiRef.current?.refreshCells({ force: true });

    mxnButton?.addEventListener("click", onMxnClick);
    usdButton?.addEventListener("click", onUsdClick);
    eurButton?.addEventListener("click", onEurClick);
    window.addEventListener(CURRENCY_RATES_CHANGED_EVENT, onRatesChanged);
    const pdfButton = document.getElementById("download-pdf");
    const onPdfClick = () => exportPdf(apiRef.current);
    pdfButton?.addEventListener("click", onPdfClick);
    const createButton = document.getElementById("create-analysis");
    const onCreateClick = () => createAnalysis(loadAnalisis);
    createButton?.addEventListener("click", onCreateClick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      mxnButton?.removeEventListener("click", onMxnClick);
      usdButton?.removeEventListener("click", onUsdClick);
      eurButton?.removeEventListener("click", onEurClick);
      window.removeEventListener(CURRENCY_RATES_CHANGED_EVENT, onRatesChanged);
      pdfButton?.removeEventListener("click", onPdfClick);
      createButton?.removeEventListener("click", onCreateClick);
    };
  }, []);

  return <div ref={gridRef} id="table" className={GRID_CLASS_NAME} style={GRID_STYLE} />;
}

async function createAnalysis(reload) {
  const fileInput = document.getElementById("file_input");
  const codeInput = document.getElementById("a_code_input");
  const labSelect = document.getElementById("createAnalisisPopup-lab");
  const resetUI = () => {
    if (fileInput) fileInput.value = "";
    if (codeInput) codeInput.value = "";
    if (labSelect) labSelect.value = "";
  };

  window.activateLoadScreen?.();
  let labsResult;
  try {
    labsResult = await postJson("/laboratories");
  } finally {
    window.deactivateLoadScreen?.();
  }

  if (!labsResult?.ok) return;
  const laboratories = labsResult.data.data || [];
  if (!laboratories.length) return alert("Primero crea un laboratorio.");

  const selection = await window.createAnalisisPopup?.(laboratories);
  if (!selection) return (resetUI(), false);
  window.activateLoadScreen?.();

  try {
    const formData = new FormData();
    formData.append(FILE_FIELD, fileInput.files[0]);
    formData.append("labname", selection.labname);
    formData.append("a_code", codeInput.value);
    const response = await fetch("/createanalisis", { method: "POST", body: formData });
    const result = await readJsonResponse(response);
    await reload();
    if (result.ok && !result.data.message) alert("Se creó el análisis con éxito.");
  } finally {
    resetUI();
    window.deactivateLoadScreen?.();
  }
}

function descriptionText(data) {
  const def = "[...]";
  return Object.entries(DESCRIPTION_FIELDS).map(([field, label]) => `${label}${data[field] || def}`).join("\n");
}

function descriptionRenderer(params) {
  const wrapper = document.createElement("div");
  const data = params.data;
  const rowId = String(data.id_analisis);
  data.description_at_pdf = descriptionText(data);

  async function editDescription() {
    const sendChange = await window.editdescPopup?.(data);
    if (!sendChange) return;
    window.activateLoadScreen?.();

    try {
      for (const [field, value] of Object.entries(sendChange)) {
        const ok = await sendTableChange(data.id_analisis, field, value);
        if (!ok) return params.context.reload();
        data[field] = value;
      }
      data.description_at_pdf = descriptionText(data);
      params.api.refreshCells({ rowNodes: [params.node], force: true });
    } finally {
      window.deactivateLoadScreen?.();
    }
  }

  function resetDescriptionHeight() {
    window.requestAnimationFrame(() => {
      params.api.resetRowHeights();
      params.api.refreshCells({ rowNodes: [params.node], columns: ["descripcion"], force: true });
    });
  }

  function render() {
    const expanded = expandedDescriptionRows.has(rowId);
    wrapper.replaceChildren();
    wrapper.className = `description-box${expanded ? " is-expanded" : " is-compact"}`;

    const toolbar = document.createElement("div");
    toolbar.className = "description-toolbar";

    const actions = document.createElement("div");
    actions.className = "description-actions";

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "description-link";
    toggleButton.textContent = expanded ? "Compactar" : "Ver más";
    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (expanded) {
        expandedDescriptionRows.delete(rowId);
      } else {
        expandedDescriptionRows.add(rowId);
      }
      render();
      resetDescriptionHeight();
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "description-link";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await editDescription();
    });

    actions.appendChild(toggleButton);
    actions.appendChild(editButton);
    toolbar.appendChild(actions);

    const content = document.createElement("div");
    content.className = "description-content";

    Object.entries(DESCRIPTION_FIELDS).forEach(([field, label]) => {
      const element = document.createElement("div");
      element.classList.add("desc-card", "desc-text");
      const bold = document.createElement("strong");
      bold.textContent = label;
      const value = document.createElement("a");
      value.textContent = data[field] || "[...]";
      element.appendChild(bold);
      element.appendChild(value);
      content.appendChild(element);
    });

    wrapper.appendChild(toolbar);
    wrapper.appendChild(content);
  }

  render();

  return wrapper;
}

function filesViewRenderer(params) {
  if (!params.data) return null;

  const hrefTarget = `/main_catalog/files/${params.data.id_analisis}`;

  // 1. Creamos la etiqueta <a> de forma nativa
  const link = document.createElement('a');
  
  // 2. Asignamos sus propiedades nativas
  link.href = hrefTarget;
  link.innerText = "Consultar";
  
  link.className = "action-button btn-secondary";
  link.style.textDecoration = 'none';
  link.style.display = 'inline-flex';

  // 4. Hack para AG-Grid: Evitamos que la tabla intercepte el clic derecho
  link.addEventListener('contextmenu', (e) => {
    e.stopPropagation();
  });

  // 5. Lógica para el clic izquierdo normal
  link.addEventListener('click', (e) => {
    if (params.context?.closeSources) {
      params.context.closeSources();
    }
  });

  // 6. Retornamos el nodo HTML real que AG-Grid sí puede procesar
  return link;
}

function actionsRenderer(params) {
  return makeButton("Eliminar", async () => {
    const id = params.data.id_analisis;
    const confirmacion = await window.confirmPopup?.(`¿Quieres borrar el análisis "${id}"?`, id, "análisis");
    if (!confirmacion) return false;
    window.activateLoadScreen?.();

    try {
      const response = await fetch("/deleteanalisis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_analisis: id })
      });
      const result = await readJsonResponse(response);
      if (result.ok && !result.data.message) alert("Se borró el análisis con éxito.");
    } finally {
      window.deactivateLoadScreen?.();
    }
  }, "danger");
}

async function sendTableChange(rowId, field, newValue) {
  return sendCellChange("/send-table-change/cell", rowId, field, newValue, (data, result) => !result.ok || data.IdDuplicate);
}

function numberParser(params) {
  if (params.newValue === "" || params.newValue == null) return null;
  return Number(params.newValue);
}

function currencyRates() {
  const mxnToUsd = positiveRateFromInput("estatico_1");
  const mxnToEur = positiveRateFromInput("estatico_2");
  return {
    MXN: { MXN: 1, USD: 1 / mxnToUsd, EUR: 1 / mxnToEur },
    USD: { MXN: mxnToUsd, USD: 1, EUR: mxnToEur / mxnToUsd },
    EUR: { MXN: mxnToEur, USD: mxnToUsd / mxnToEur, EUR: 1 }
  };
}

function positiveRateFromInput(id) {
  const value = Number(document.getElementById(id)?.querySelector("input")?.value);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function currencyFormatter(params, baseRef, destinoRef) {
  const rates = currencyRates();
  const valor = Number(params.value || 0);
  const convertido = valor * rates[baseRef.current][destinoRef.current];
  const [enteroRaw, decimal] = convertido.toFixed(2).split(".");
  const entero = enteroRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${destinoRef.current} $${entero}.${decimal}`;
}

async function exportPdf(api) {
  if (!api) return alert("No se pudo cargar el exportador PDF.");

  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  const autoTable = autoTableModule.default;

  const rows = [];
  api.forEachNodeAfterFilterAndSort((node) => {
    const row = node.data;
    rows.push([
      row.id_analisis,
      descriptionText(row),
      row.y_cantidad ?? "",
      row.y_precio ?? "",
      row.y_categoria ?? "",
      row.c_costo ?? "",
      row.c_factor ?? "",
      row.c_envio ?? "",
      row.c_utilidad ?? ""
    ]);
  });
  const doc = new jsPDF({ orientation: "landscape" });
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  const hoy = new Date().toLocaleDateString('es-ES', opciones);
  doc.text(`Reporte de los análisis a ${hoy}`, 14, 18);
  autoTable(doc, {
    startY: 26,
    head: [["Código", "Descripción", "Cantidad", "Precio", "Categoría", "Costo", "Factor", "Envío", "Utilidad"]],
    body: rows,
    styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak", valign: "top" },
    headStyles: { fillColor: [15, 81, 50], textColor: 255, fontStyle: "bold", halign: "center" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: { 1: { cellWidth: 90 } }
  });
  doc.save("data.pdf");
}









