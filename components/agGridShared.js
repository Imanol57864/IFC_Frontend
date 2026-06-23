"use client";

import { AllCommunityModule, ModuleRegistry, createGrid } from "ag-grid-community";
import { useEffect, useRef } from "react";
import { getAuthenticatedBrowserSupabase } from "@/lib/supabaseBrowser";

let modulesRegistered = false;
let realtimeSubscriptionId = 0;

export const DEFAULT_GRID_OPTIONS = {
  rowData: [],
  theme: "legacy",
  domLayout: "autoHeight",
  pagination: true,
  paginationPageSize: 50,
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

export function makeButton(text, onClick, variant = "secondary") {
  const button = document.createElement("button");
  button.classList.add("action-button", variant === "danger" ? "btn-danger" : "btn-secondary");
  button.type = "button";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

export function setRows(api, rows) {
  api?.setGridOption("rowData", rows || []);
}

export function applyRealtimeRowEvent({ api, rowsRef, data, idField, reload }) {
  console.log("TEST_04!!", data); // TO DO

  if (!api || !data?.type || !data.id) return reload();

  console.log("TEST_01!!", data); // TO DO

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

export function subscribeToTableChanges({ channelName, table, onPayload }) { // filter, onPayload }) {
  const changes = { event: "*", schema: "public", table };
  // if (filter) changes.filter = filter;
  const subscriptionName = `${channelName}:${++realtimeSubscriptionId}`;
  let channel = null;
  let closed = false;
  let closePromise = null;

  const startPromise = getAuthenticatedBrowserSupabase()
    .then((supabase) => {
      if (closed) return supabase;

      channel = supabase
        .channel(subscriptionName)
        .on("postgres_changes", changes, onPayload)
        .subscribe((status, error) => {
          if (error || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Supabase realtime subscription failed", { channelName, status, error });
          }
        });

      return supabase;
    })
    .catch((error) => {
      console.error("Supabase realtime authentication failed", { channelName, error });
      return null;
    });

  return {
    close: () => {
      if (closePromise) return closePromise;
      closed = true;
      closePromise = startPromise.then((supabase) => {
        if (!supabase || !channel) return "ok";
        return supabase.removeChannel(channel);
      });
      return closePromise;
    }
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
  const data = await response.json();
  if (!response.ok) {
    console.error(data.message);
    return { ok: false, data };
  }
  if (data.message) alert(data.message);
  return { ok: true, data };
}






