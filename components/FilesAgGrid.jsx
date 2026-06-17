"use client";

import { useEffect, useRef } from "react";
import { filePayloadMatchesAnalysis } from "@/lib/realtimePayloads";
import {
  DEFAULT_GRID_OPTIONS,
  GRID_CLASS_NAME,
  GRID_STYLE,
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
const FILE_TYPE_OPTIONS = ["Acreditación", "Cotización", "Ficha Técnica", "Básico"];

export default function FilesAgGrid({ idAnalisis }) {
  const gridRef = useRef(null);
  const rowsRef = useRef([]);
  const realtimeRef = useRef(null);

  const apiRef = useAgGrid(gridRef, () => ({
    ...DEFAULT_GRID_OPTIONS,
    getRowId: (params) => String(params.data.basic_id),
    columnDefs: [
      { headerName: "Eliminar", cellRenderer: deleteRenderer, width: 120, sortable: false, filter: false },
      { headerName: "Nombre del archivo", field: "nombre", width: 600 },
      {
        headerName: "Tipo de archivo",
        field: "tipo",
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: FILE_TYPE_OPTIONS },
        width: 180
      },
      { headerName: "Fecha de creación", field: "fecha", valueFormatter: dateFormatter, width: 240 },
      { headerName: "Consultar", field: "url", cellRenderer: openFileRenderer, width: 130, sortable: false, filter: false },
      { headerName: "id", field: "basic_id", hide: true }
    ],
    context: { idAnalisis, reload: loadFiles, rowsRef },
    onCellValueChanged: async (event) => {
      if (event.oldValue === event.newValue) return;
      const ok = await sendCellChange("/files/send-table-change/cell", event.data.basic_id, "tipo_archivo", event.newValue);
      if (!ok) event.node.setDataValue(event.colDef.field, event.oldValue);
    }
  }), [idAnalisis]);

  async function loadFiles() {
    window.activateLoadScreen?.();
    if (!idAnalisis) return alert("Error. ID can not be empty.");

    const result = await postJson("/files/get-analisis-filesdata", { id_analisis: idAnalisis });
    if (!result.ok) return false;

    rowsRef.current = result.data.data || [];
    setRows(apiRef.current, rowsRef.current);
    return true;
  }

  useEffect(() => {
    window.triggerGrid = loadFiles;
    loadFiles();
    realtimeRef.current?.close();
    realtimeRef.current = subscribeToTableChanges({
      channelName: `Archivo_Analisis:${idAnalisis}`,
      table: "Archivo_Analisis",
      onPayload: (payload) => {
        if (filePayloadMatchesAnalysis(payload, idAnalisis)) loadFiles();
      }
    });

    return () => {
      realtimeRef.current?.close();
      realtimeRef.current = null;
      if (window.triggerGrid === loadFiles) delete window.triggerGrid;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAnalisis]);

  useQuickFilter(apiRef);

  useEffect(() => {
    const addButton = document.getElementById("add-file");
    const onClick = async () => {
      const confirmacion = await window.addFilePopup?.();
      if (!confirmacion) return false;
      window.activateLoadScreen?.();

      const fileInput = document.getElementById("file_input");
      const file = fileInput?.files?.[0];
      if (!file) return (alert("No se envió ningún archivo."), fileInput && (fileInput.value = ""));

      const exists = rowsRef.current.some((row) => row.nombre === file.name);
      if (exists) return (alert("Un archivo ya tiene ese nombre para este análisis."), fileInput.value = "");

      const formData = new FormData();
      formData.append(FILE_FIELD, file);
      formData.append("id_analisis", idAnalisis);
      const response = await fetch("/files/uploadfile", { method: "POST", body: formData });
      const result = await readJsonResponse(response);
      fileInput.value = "";
      await loadFiles();
      if (result.ok && !result.data.message) alert("Se añadió el archivo con éxito.");
    };

    addButton?.addEventListener("click", onClick);
    return () => addButton?.removeEventListener("click", onClick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAnalisis]);

  return <div ref={gridRef} id="table" className={GRID_CLASS_NAME} style={GRID_STYLE} />;
}

function openFileRenderer(params) {
  // Si no hay una URL en params.value, devolvemos un texto vacío o null
  if (!params.value) return null;

  // 1. Creamos la etiqueta <a> nativa
  const link = document.createElement('a');
  
  // 2. Asignamos la URL del archivo y configuramos para que abra en pestaña nueva por defecto
  link.href = params.value;
  link.target = "_blank"; // Clic izquierdo normal abrirá en pestaña nueva
  link.rel = "noopener noreferrer"; // Buenas prácticas de seguridad al usar _blank
  link.innerText = "Abrir";
  
  // 3. Estilos visuales (puedes cambiar los colores si quieres diferenciarlo del otro botón)
  link.className = "inline-flex items-center justify-center w-full h-full px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium transition-colors";
  link.style.textDecoration = 'none';
  link.style.display = 'inline-flex';

  // 4. Hack para AG-Grid: Evitamos que la tabla intercepte el clic derecho
  link.addEventListener('contextmenu', (e) => {
    e.stopPropagation();
  });

  // 5. Retornamos el nodo HTML real compatible con AG-Grid
  return link;
}

function deleteRenderer(params) {
  return makeButton("Eliminar", async () => {
    const nombreArchivo = params.data.nombre;
    const idAnalisis = params.context.idAnalisis;
    const confirmacion = await window.confirmPopup?.(`¿Quieres borrar el archivo "${nombreArchivo}"?`);
    if (!confirmacion) return false;
    window.activateLoadScreen?.();

    const result = await postJson("/files/removefile", { filename: nombreArchivo, id_analisis: idAnalisis });
    await params.context.reload();
    if (result.ok && !result.data.message) alert("Se eliminó el archivo con éxito.");
  });
}

function dateFormatter(params) {
  if (!params.value) return "";
  return new Date(params.value).toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short"
  });
}



