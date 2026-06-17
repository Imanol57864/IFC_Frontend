"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_GRID_OPTIONS, GRID_CLASS_NAME, GRID_STYLE, applyRealtimeRowEvent, makeButton, postJson, readJsonResponse, sendCellChange, setRows, subscribeToTableChanges, useAgGrid, useQuickFilter } from "./agGridShared";
import { analysisPayloadEventForLab, tablePayloadEvent } from "@/lib/realtimePayloads";

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

export default function CatalogAgGrid() {
  const gridRef = useRef(null);
  const rowsRef = useRef([]);
  const selectedLabRef = useRef("");
  const divisaDestinoRef = useRef("MXN");
  const divisaBaseRef = useRef("MXN");
  const analysisRealtimeRef = useRef(null);
  const labRealtimeRef = useRef(null);

  const apiRef = useAgGrid(gridRef, () => ({
    ...DEFAULT_GRID_OPTIONS,
    getRowId: (params) => String(params.data.id_analisis),
    columnDefs: [
      { headerName: "Acciones", cellRenderer: actionsRenderer, width: 110, sortable: false, filter: false },
      { headerName: "Código 2026", field: "id_analisis", editable: true, width: 140, cellEditor: "agTextCellEditor" },
      { headerName: "Descripción", field: "descripcion", cellRenderer: descriptionRenderer, width: 430, autoHeight: true, wrapText: true, sortable: false },
      { headerName: "Cantidad", field: "y_cantidad", editable: true, width: 140, cellEditor: "agNumberCellEditor", valueParser: numberParser },
      { headerName: "Precio", field: "y_precio", width: 140, valueFormatter: (params) => currencyFormatter(params, divisaBaseRef, divisaDestinoRef) },
      { headerName: "Categoría", field: "y_categoria", editable: true, cellEditor: "agSelectCellEditor", cellEditorParams: { values: CATEGORY_OPTIONS }, width: 220 },
      { headerName: "Costo", field: "c_costo", editable: true, width: 140, cellEditor: "agNumberCellEditor", valueParser: numberParser, valueFormatter: (params) => currencyFormatter(params, divisaBaseRef, divisaDestinoRef) },
      { headerName: "Factor", field: "c_factor", editable: true, width: 140, cellEditor: "agNumberCellEditor", valueParser: numberParser },
      { headerName: "Envío", field: "c_envio", editable: true, width: 140, cellEditor: "agNumberCellEditor", valueParser: numberParser, valueFormatter: (params) => currencyFormatter(params, divisaBaseRef, divisaDestinoRef) },
      { headerName: "Utilidad", field: "c_utilidad", width: 140, valueFormatter: (params) => currencyFormatter(params, divisaBaseRef, divisaDestinoRef) },
      { headerName: "Archivos", cellRenderer: filesViewRenderer, width: 140, sortable: false, filter: false },
      ...Object.keys(DESCRIPTION_FIELDS).map((field) => ({ field, hide: true }))
    ],
    context: {
      reload: () => loadAnalisis(selectedLabRef.current),
      closeSources,
      descriptionFields: DESCRIPTION_FIELDS
    },
    onCellValueChanged: async (event) => {
      const field = event.colDef.field;
      if (!field || event.oldValue === event.newValue) return;
      const newValue = typeof event.newValue === "string" ? event.newValue.trim() : event.newValue;
      const rowId = field === "id_analisis" ? event.oldValue : event.data.id_analisis;
      const ok = await sendTableChange(rowId, field, newValue);
      if (!ok || field === "id_analisis") await loadAnalisis(selectedLabRef.current);
    }
  }), []);

  async function loadAnalisis(labnameInput) {
    window.activateLoadScreen?.();
    const labname = labnameInput || "";
    if (!labname) return false;
    selectedLabRef.current = labname;

    const result = await postJson("/load-analisis", { labname });
    if (!result.ok) return false;

    rowsRef.current = result.data.data || [];
    setRows(apiRef.current, rowsRef.current);
    return true;
  }

  function closeSources() {
    analysisRealtimeRef.current?.close();
    labRealtimeRef.current?.close();
    analysisRealtimeRef.current = null;
    labRealtimeRef.current = null;
  }

  function createAnalysisRealtime(labname) {
    analysisRealtimeRef.current?.close();
    if (!labname) return;
    analysisRealtimeRef.current = subscribeToTableChanges({
      channelName: `catAnalisis:${labname}`,
      table: "catAnalisis",
      onPayload: (payload) => {
        const data = analysisPayloadEventForLab(payload, labname);
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
      reload: () => loadAnalisis(selectedLabRef.current)
    });
  }

  function createLabRealtime() {
    labRealtimeRef.current?.close();
    const source = subscribeToTableChanges({
      channelName: "catLabos:catalog-options",
      table: "catLabos",
      onPayload: async (payload) => {
        const data = tablePayloadEvent(payload, "nombre_lab");
        const currentLab = document.getElementById("lab-title")?.textContent;
        const nextLabName = data.new_data?.nombre_lab || data.id;

        if (data.type === "DELETE" && data.id === currentLab) {
          alert("Se ha borrado el laboratorio actual");
          window.location.reload();
          return;
        }

        const labOptionsList = document.getElementById("labOptionsList");
        if (labOptionsList) syncLabOption(labOptionsList, data, nextLabName);

        if (data.type === "UPDATE" && (currentLab === data.id || currentLab === nextLabName)) {
          applyLabInfo(data.new_data);
          if (nextLabName && selectedLabRef.current !== nextLabName) {
            selectedLabRef.current = nextLabName;
            await loadAnalisis(nextLabName);
            createAnalysisRealtime(nextLabName);
          }
        }
      }
    });
    labRealtimeRef.current = source;
  }

  function syncLabOption(labOptionsList, data, nextLabName) {
    const currentOption = labOptionsList.querySelector(`[data-labname="${data.id}"]`);
    const nextOption = nextLabName ? labOptionsList.querySelector(`[data-labname="${nextLabName}"]`) : null;

    if (data.type === "INSERT" && nextLabName && !nextOption) {
      labOptionsList.appendChild(makeLabOption(nextLabName));
      return;
    }

    if (data.type === "UPDATE" && currentOption && nextLabName) {
      const updated = makeLabOption(nextLabName);
      updated.className = currentOption.className;
      currentOption.replaceWith(updated);
      return;
    }

    if (data.type === "DELETE" && currentOption) currentOption.remove();
  }

  function makeLabOption(labname) {
    const item = document.createElement("div");
    item.classList.add("option-item");
    item.setAttribute("data-labname", labname);
    item.innerHTML = `<strong>${labname}</strong>`;
    item.addEventListener("click", () => selectLab(labname));
    return item;
  }

  async function selectLab(labname) {
    window.activateLoadScreen?.();
    document.getElementById("bottomTables")?.classList.remove("hide");
    const info = await queryLabInfo(labname);
    if (!info) return;

    const divisa = applyLabInfo(info);

    await loadAnalisis(labname);
    createAnalysisRealtime(labname);
    setNewDivisa(divisa, divisa);
  }


  function applyLabInfo(info) {
    const def = "[...]";
    const divisa = info?.divisa_lab || "MXN";
    document.getElementById("lab-title").textContent = info?.nombre_lab || def;
    document.getElementById("lab-country").textContent = info?.pais_lab || def;
    document.getElementById("lab-info-location").textContent = info?.direccion_lab || def;
    document.getElementById("lab-info-contact").textContent = info?.contacto_lab || def;
    document.getElementById("lab-divisa").textContent = divisa;
    return divisa;
  }
  function setNewDivisa(divisa, base) {
    window.activateLoadScreen?.(666);
    divisaDestinoRef.current = divisa;
    if (base) divisaBaseRef.current = base;
    apiRef.current?.refreshCells({ force: true });
  }

  useEffect(() => {
    window.triggerGrid = loadAnalisis;
    window.setNewDivisa = setNewDivisa;
    createLabRealtime();

    const logout = document.getElementById("logout-btn");
    const manageLabs = document.getElementById("getLabView_btn");
    const goToLabs = () => {
      closeSources();
      window.location.href = "/main_catalog/laboratories";
    };
    logout?.addEventListener("click", closeSources);
    manageLabs?.addEventListener("click", goToLabs);

    return () => {
      closeSources();
      logout?.removeEventListener("click", closeSources);
      manageLabs?.removeEventListener("click", goToLabs);
      if (window.triggerGrid === loadAnalisis) delete window.triggerGrid;
      if (window.setNewDivisa === setNewDivisa) delete window.setNewDivisa;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const options = document.querySelectorAll(".option-item");
    const handlers = [];
    options.forEach((item) => {
      const labname = item.getAttribute("data-labname");
      const handler = () => selectLab(labname);
      handlers.push([item, handler]);
      item.addEventListener("click", handler);
    });
    return () => handlers.forEach(([item, handler]) => item.removeEventListener("click", handler));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useQuickFilter(apiRef);

  useEffect(() => {
    document.getElementById("btn_changeto_mxn")?.addEventListener("click", () => setNewDivisa("MXN"));
    document.getElementById("btn_changeto_usd")?.addEventListener("click", () => setNewDivisa("USD"));
    document.getElementById("btn_changeto_eur")?.addEventListener("click", () => setNewDivisa("EUR"));
    const pdfButton = document.getElementById("download-pdf");
    const onPdfClick = () => exportPdf(apiRef.current);
    pdfButton?.addEventListener("click", onPdfClick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => pdfButton?.removeEventListener("click", onPdfClick);
  }, []);

  useEffect(() => {
    const searchInput = document.getElementById("labSearchInput");
    const optionsList = document.getElementById("labOptionsList");
    const bottomTables = document.getElementById("bottomTables");
    if (!searchInput || !optionsList) return undefined;

    const show = () => optionsList.classList.remove("hide");
    const filter = (event) => {
      const value = event.target.value.toLowerCase();
      optionsList.querySelectorAll(".option-item").forEach((item) => {
        const labname = item.getAttribute("data-labname")?.toLowerCase() || "";
        item.classList.toggle("hide", !labname.includes(value));
      });
    };
    const click = (event) => {
      const item = event.target.closest(".option-item");
      if (item) {
        optionsList.classList.add("hide");
        searchInput.value = "";
        optionsList.querySelectorAll(".option-item").forEach((candidate) => {
          candidate.classList.remove("hide", "hide-already-selected");
        });
        item.classList.add("hide-already-selected");
        bottomTables?.classList.remove("hide");
      }
    };
    const outside = (event) => {
      if (!event.target.closest(".searchable-dropdown")) optionsList.classList.add("hide");
    };

    searchInput.addEventListener("focus", show);
    searchInput.addEventListener("input", filter);
    optionsList.addEventListener("click", click);
    document.addEventListener("click", outside);
    return () => {
      searchInput.removeEventListener("focus", show);
      searchInput.removeEventListener("input", filter);
      optionsList.removeEventListener("click", click);
      document.removeEventListener("click", outside);
    };
  }, []);

  return <div ref={gridRef} id="table" className={GRID_CLASS_NAME} style={GRID_STYLE} />;
}

function descriptionText(data) {
  const def = "[...]";
  return Object.entries(DESCRIPTION_FIELDS).map(([field, label]) => `${label}${data[field] || def}`).join("\n");
}

function descriptionRenderer(params) {
  const wrapper = document.createElement("div");
  const data = params.data;
  data.description_at_pdf = descriptionText(data);

  Object.entries(DESCRIPTION_FIELDS).forEach(([field, label]) => {
    const element = document.createElement("div");
    element.classList.add("desc-card", "desc-text");
    const bold = document.createElement("strong");
    bold.textContent = label;
    const value = document.createElement("a");
    value.textContent = data[field] || "[...]";
    element.appendChild(bold);
    element.appendChild(value);
    wrapper.appendChild(element);
  });

  wrapper.addEventListener("click", async () => {
    const sendChange = await window.editdescPopup?.(data);
    if (!sendChange) return;
    window.activateLoadScreen?.();

    for (const [field, value] of Object.entries(sendChange)) {
      const ok = await sendTableChange(data.id_analisis, field, value);
      if (!ok) return params.context.reload();
      data[field] = value;
    }
    data.description_at_pdf = descriptionText(data);
    params.api.refreshCells({ rowNodes: [params.node], force: true });
  });

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
  
  // 3. Agregamos las clases de CSS para que luzca como botón
  link.className = "inline-flex items-center justify-center w-full h-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium transition-colors";
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
    const confirmacion = await window.confirmPopup?.(`¿Quieres borrar el análisis "${id}"?`);
    if (!confirmacion) return false;
    window.activateLoadScreen?.();

    const response = await fetch("/deleteanalisis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_analisis: id })
    });
    const result = await readJsonResponse(response);
    if (result.ok && !result.data.message) alert("Se borró el análisis con éxito.");
  });
}

async function queryLabInfo(labname) {
  const response = await fetch("/labinfo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ labname })
  });
  const result = await readJsonResponse(response);
  return result.ok ? result.data.data?.[0] : null;
}

async function sendTableChange(rowId, field, newValue) {
  return sendCellChange("/send-table-change/cell", rowId, field, newValue, (data, result) => !result.ok || data.IdDuplicate);
}

function numberParser(params) {
  if (params.newValue === "" || params.newValue == null) return null;
  return Number(params.newValue);
}

function currencyRates() {
  const mxnToUsdText = document.getElementById("estatico_1")?.querySelector("p")?.textContent || "$ 1";
  const mxnToEurText = document.getElementById("estatico_2")?.querySelector("p")?.textContent || "$ 1";
  const mxnToUsd = parseFloat(mxnToUsdText.replace("$", "").trim()) || 1;
  const mxnToEur = parseFloat(mxnToEurText.replace("$", "").trim()) || 1;
  return {
    MXN: { MXN: 1, USD: 1 / mxnToUsd, EUR: 1 / mxnToEur },
    USD: { MXN: mxnToUsd, USD: 1, EUR: mxnToEur / mxnToUsd },
    EUR: { MXN: mxnToEur, USD: mxnToUsd / mxnToEur, EUR: 1 }
  };
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

  const labname = document.getElementById("lab-title")?.textContent || "[...]";
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
  doc.text(`Reporte de los análisis del laboratorio ${labname}`, 14, 18);
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








