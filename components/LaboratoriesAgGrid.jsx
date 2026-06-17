"use client";

import { useEffect, useRef } from "react";
import { countryData } from "@/lib/countries";
import { tablePayloadEvent } from "@/lib/realtimePayloads";
import {
  DEFAULT_GRID_OPTIONS,
  GRID_CLASS_NAME,
  GRID_STYLE,
  applyRealtimeRowEvent,
  makeButton,
  postJson,
  readJsonResponse,
  sendCellChange,
  setRows,
  subscribeToTableChanges,
  useAgGrid,
  useQuickFilter
} from "./agGridShared";

const FILE_FIELD = "analisis_file";
const DIVISAS = ["USD", "EUR", "MXN", "CAD", "CNY"];
const COBERTURAS = ["Internacional - IFC", "Nacional - IFC LABS"];

export default function LaboratoriesAgGrid() {
  const gridRef = useRef(null);
  const rowsRef = useRef([]);
  const realtimeRef = useRef(null);

  const apiRef = useAgGrid(gridRef, () => ({
    ...DEFAULT_GRID_OPTIONS,
    getRowId: (params) => String(params.data.nombre_lab),
    defaultColDef: { ...DEFAULT_GRID_OPTIONS.defaultColDef, editable: true },
    columnDefs: [
      { headerName: "Acciones", cellRenderer: actionsRenderer, width: 170, editable: false, sortable: false, filter: false, autoHeight: true },
      { headerName: "Laboratorio", field: "nombre_lab", width: 190, cellEditor: "agTextCellEditor" },
      { headerName: "Pais", field: "pais_lab", width: 160, cellEditor: "agSelectCellEditor", cellEditorParams: () => ({ values: countryData }) },
      { headerName: "Divisa", field: "divisa_lab", width: 135, cellEditor: "agSelectCellEditor", cellEditorParams: { values: DIVISAS } },
      { headerName: "Cobertura", field: "cobertura_lab", width: 210, cellEditor: "agSelectCellEditor", cellEditorParams: { values: COBERTURAS } },
      { headerName: "Código", field: "codigo_lab", width: 135, cellEditor: "agTextCellEditor" },
      { headerName: "Dirección", field: "direccion_lab", width: 230, cellEditor: "agLargeTextCellEditor", cellEditorPopup: true, wrapText: true, autoHeight: true },
      { headerName: "Contacto", field: "contacto_lab", width: 220, cellEditor: "agLargeTextCellEditor", cellEditorPopup: true, wrapText: true, autoHeight: true }
    ],
    context: { reload: loadLabs },
    onCellValueChanged: async (event) => {
      const field = event.colDef.field;
      if (!field) return;
      const newValue = typeof event.newValue === "string" ? event.newValue.trim() : event.newValue;
      if (event.oldValue === newValue) return;

      const rowId = field === "nombre_lab" ? event.oldValue : event.data.nombre_lab;
      const ok = await sendTableChange(rowId, field, newValue);
      if (!ok || field === "nombre_lab") await loadLabs();
    }
  }), []);

  async function loadLabs() {
    window.activateLoadScreen?.();
    const result = await postJson("/laboratories");
    if (!result.ok) return false;
    rowsRef.current = result.data.data || [];
    setRows(apiRef.current, rowsRef.current);
    return true;
  }

  useEffect(() => {
    window.triggerGrid = loadLabs;
    loadLabs();
    realtimeRef.current = createRealtimeSubscription(apiRef, rowsRef, loadLabs);
    return () => {
      realtimeRef.current?.close();
      if (window.triggerGrid === loadLabs) delete window.triggerGrid;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useQuickFilter(apiRef);

  useEffect(() => {
    const addButton = document.getElementById("add-lab");
    const onClick = async () => {
      window.activateLoadScreen?.();
      const result = await postJson("/laboratories/create");
      if (result.ok && !result.data.message) alert(`Se creó el laboratorio ${result.data.nuevo} con éxito.`);
    };
    addButton?.addEventListener("click", onClick);
    return () => addButton?.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const returnHome = document.getElementById("returnHome");
    const onClick = () => {
      realtimeRef.current?.close();
      window.location.href = "/main_catalog";
    };
    returnHome?.addEventListener("click", onClick);
    return () => returnHome?.removeEventListener("click", onClick);
  }, []);

  return <div ref={gridRef} id="table" className={GRID_CLASS_NAME} style={GRID_STYLE} />;
}

function createRealtimeSubscription(apiRef, rowsRef, reload) {
  return subscribeToTableChanges({
    channelName: "catLabos:laboratories-grid",
    table: "catLabos",
    onPayload: (payload) => applyRealtimeRowEvent({
      api: apiRef.current,
      rowsRef,
      data: tablePayloadEvent(payload, "nombre_lab"),
      idField: "nombre_lab",
      reload
    })
  });
}

function actionsRenderer(params) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("action-container");
  const row = params.data;

  wrapper.appendChild(makeButton("Crear análisis", async () => {
    if (!row.codigo_lab) return alert(`Necesitas establecer el código identificador de análisis para ${row.nombre_lab}.`);

    const fileInput = document.getElementById("file_input");
    const codeInput = document.getElementById("a_code_input");
    const resetUI = () => {
      if (fileInput) fileInput.value = "";
      if (codeInput) codeInput.value = "";
    };

    const confirmacion = await window.createAnalisisPopup?.(row.nombre_lab, row.codigo_lab);
    if (!confirmacion) return (resetUI(), false);
    window.activateLoadScreen?.();

    const formData = new FormData();
    formData.append(FILE_FIELD, fileInput.files[0]);
    formData.append("labname", row.nombre_lab);
    formData.append("a_code", codeInput.value);
    const response = await fetch("/createanalisis", { method: "POST", body: formData });
    const result = await readJsonResponse(response);
    await params.context.reload();
    resetUI();
    if (result.ok && !result.data.message) alert("Se creó el análisis con éxito.");
  }));

  wrapper.appendChild(makeButton("Eliminar", async () => {
    const confirmacion = await window.confirmPopup?.(`¿Quieres borrar el laboratorio "${row.nombre_lab}"?`);
    if (!confirmacion) return false;
    window.activateLoadScreen?.();

    const result = await postJson("/laboratories/delete", { labName: row.nombre_lab });
    if (result.ok && !result.data.message) alert("Se eliminó el laboratorio con éxito.");
  }));

  return wrapper;
}

async function sendTableChange(rowId, field, newValue) {
  return sendCellChange(
    "/laboratories/send-table-change/cell",
    rowId,
    field,
    newValue,
    (data, result) => !result.ok || data.IdDuplicate || data.resetUI
  );
}


