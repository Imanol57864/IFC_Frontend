"use client";

import { lazyAgGrid } from "./lazyAgGrid";

const LaboratoriesAgGrid = lazyAgGrid(() => import("./LaboratoriesAgGrid"));

export default function LazyLaboratoriesAgGrid() {
  return <LaboratoriesAgGrid />;
}
