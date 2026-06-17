"use client";

import { lazyAgGrid } from "./lazyAgGrid";

const CatalogAgGrid = lazyAgGrid(() => import("./CatalogAgGrid"));

export default function LazyCatalogAgGrid() {
  return <CatalogAgGrid />;
}
