"use client";

import { lazyAgGrid } from "./lazyAgGrid";

const FilesAgGrid = lazyAgGrid(() => import("./FilesAgGrid"));

export default function LazyFilesAgGrid({ idAnalisis }) {
  return <FilesAgGrid idAnalisis={idAnalisis} />;
}
