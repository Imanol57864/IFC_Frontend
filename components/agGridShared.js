"use client";

import { AllCommunityModule, ModuleRegistry, createGrid } from "ag-grid-community";
import { useEffect, useRef } from "react";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";

let modulesRegistered = false;

export const DEFAULT_GRID_OPTIONS = {
  rowData: [],
  theme: "legacy",
  pagination: true,
  paginationPageSize: 24,
  paginationPageSizeSelector: false,
  animateRows: true,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    editable: false
  }
};

export const GRID_CLASS_NAME = "table ag-theme-quartz";
export const GRID_STYLE = { maxWidth: "100%", marginTop: 0 };

export function ensureAgGridModules() {
  if (modulesRegistered) return;
  ModuleRegistry.registerModules([AllCommunityModule]);
  modulesRegistered = true;
}

export function useAgGrid(gridRef, optionsFactory, dependencies = []) {
  const apiRef = useRef(null);

  useEffect(() => {
    ensureAgGridModules();
    if (!gridRef.current || apiRef.current) return undefined;

    apiRef.current = createGrid(gridRef.current, optionsFactory());

    return () => {
      apiRef.current?.destroy();
      apiRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return apiRef;
}

export function useQuickFilter(apiRef, inputId = "search") {
  useEffect(() => {
    const search = document.getElementById(inputId);
    const onInput = (event) => apiRef.current?.setGridOption("quickFilterText", event.target.value);
    search?.addEventListener("input", onInput);
    return () => search?.removeEventListener("input", onInput);
  }, [apiRef, inputId]);
}

export function makeButton(text, onClick) {
  const button = document.createElement("button");
  button.classList.add("action-button");
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

export function setRows(api, rows) {
  api?.setGridOption("rowData", rows || []);
}

export function applyRealtimeRowEvent({ api, rowsRef, data, idField, reload }) {
  if (!api || !data?.type || !data.id) return reload();

  try {
    if (data.type === "INSERT") {
      const incomingId = data.new_data?.[idField];
      if (!incomingId) return reload();

      const existingNode = api.getRowNode(String(incomingId));
      if (existingNode) {
        api.applyTransaction({ update: [data.new_data] });
        rowsRef.current = rowsRef.current.map((row) => row[idField] === incomingId ? data.new_data : row);
        return true;
      }

      api.applyTransaction({ add: [data.new_data], addIndex: 0 });
      rowsRef.current = [data.new_data, ...rowsRef.current];
      api.paginationGoToFirstPage();
      return true;
    }

    if (data.type === "UPDATE") {
      const incomingId = data.new_data?.[idField];
      if (!incomingId) return reload();

      const node = api.getRowNode(String(data.id));
      if (!node || data.id !== incomingId) return reload();
      api.applyTransaction({ update: [data.new_data] });
      rowsRef.current = rowsRef.current.map((row) => row[idField] === data.id ? data.new_data : row);
      return true;
    }

    if (data.type === "DELETE") {
      const node = api.getRowNode(String(data.id));
      if (node) api.applyTransaction({ remove: [node.data] });
      rowsRef.current = rowsRef.current.filter((row) => row[idField] !== data.id);
      return true;
    }

    return reload();
  } catch {
    return reload();
  }
}

export function subscribeToTableChanges({ channelName, table, filter, onPayload }) {
  const supabase = getBrowserSupabase();
  const changes = { event: "*", schema: "public", table };
  if (filter) changes.filter = filter;

  const channel = supabase
    .channel(channelName)
    .on("postgres_changes", changes, onPayload)
    .subscribe((status, error) => {
      if (error || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("Supabase realtime subscription failed", { channelName, status, error });
      }
    });

  return {
    close: () => supabase.removeChannel(channel)
  };
}

export async function postJson(url, body = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return readJsonResponse(response);
}

export async function sendCellChange(url, rowId, field, newValue, isBlocked = (data) => !data.ok) {
  const result = await postJson(url, { rowId, field, newValue });
  return !isBlocked(result.data, result);
}

export async function readJsonResponse(response) {
  console.log("tagged", response)
  const data = await response.json();
  if (!response.ok) {
    console.error(data.message);
    return { ok: false, data };
  }
  if (data.message) alert(data.message);
  return { ok: true, data };
}



