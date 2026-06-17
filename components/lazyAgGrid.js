"use client";

import dynamic from "next/dynamic";

function GridLoading() {
  return <div id="table" className="table ag-theme-quartz grid place-items-center text-sm text-ifc-muted">Cargando tabla...</div>;
}

export function lazyAgGrid(loader) {
  return dynamic(loader, {
    ssr: false,
    loading: GridLoading
  });
}
