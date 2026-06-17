# Next.js Migration Diary

## 2026-06-16 - Apply Supabase realtime payloads to tables

- Hardened the shared AG Grid realtime handler so incoming Supabase payloads update existing rows, insert missing rows, remove deleted rows, or reload when the payload is incomplete.
- Updated catalog `catLabos` realtime handling so UPDATE payloads also refresh the visible lab panel, lab dropdown option, and analysis subscription when the selected laboratory changes.
- Updated files realtime handling to reload the current file table when `Archivo_Analisis` emits a relevant payload, including DELETE events where Supabase may not include the full old row.
- Changed the file delete API to remove the matching `Archivo_Analisis` relation after deleting the storage object, so file deletions emit realtime table changes.
- Verified `npm run build` succeeds without starting the dev server.
