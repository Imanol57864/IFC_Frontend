const COLUMNS = [
  ["code", "Código"],
  ["description", "Descripción"],
  ["quantity", "Cantidad"],
  ["price", "Precio"],
  ["category", "Categoría"],
  ["cost", "Costo"],
  ["factor", "Factor"],
  ["shipping", "Envío"],
  ["profit", "Utilidad"]
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function analysisPdfTemplate({ rows, logoDataUri, generatedAt, selectedCurrency }) {
  const tableRows = rows.map((row) => `
    <tr>
      ${COLUMNS.map(([key]) => `<td class="cell-${key}">${escapeHtml(row[key])}</td>`).join("")}
    </tr>`).join("");

  const headers = COLUMNS.map(([, label]) => `<th>${label}</th>`).join("");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Reporte de análisis</title>
    <style>
      :root {
        --ink: #10201a;
        --muted: #64736d;
        --green: #0f5132;
        --green-light: #1f8a5b;
        --mint: #dff4ea;
        --border: #d8e4dd;
        --surface: #ffffff;
        --subtle: #f8fbf9;
      }

      * { box-sizing: border-box; }
      @page { size: Letter landscape; margin: 10mm 8mm 17mm; }
      body {
        margin: 0;
        color: var(--ink);
        background: var(--surface);
        font-family: "Segoe UI", Arial, sans-serif;
        font-size: 9.5px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .report-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 12px;
        padding: 10px 12px;
        border: 1px solid var(--border);
        border-left: 5px solid var(--green);
        border-radius: 8px;
        background: linear-gradient(110deg, #fff 0%, var(--subtle) 72%, var(--mint) 100%);
      }

      .brand { display: flex; align-items: center; gap: 12px; }
      .brand img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
      .eyebrow { margin: 0 0 3px; color: var(--green); font-size: 8px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
      h1 { margin: 0; font-size: 20px; line-height: 1.05; }
      .subtitle { margin: 4px 0 0; color: var(--muted); font-size: 9px; }
      .meta { display: grid; gap: 5px; min-width: 160px; text-align: right; }
      .meta strong { color: var(--green); }
      .currency-badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: var(--green); color: white; font-weight: 700; }

      .summary { margin: 0 0 7px; color: var(--muted); font-size: 8.5px; }
      table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
      thead { display: table-header-group; }
      th {
        padding: 6px 4px;
        border-right: 1px solid rgba(255,255,255,.18);
        background: var(--green);
        color: white;
        font-size: 8.5px;
        line-height: 1.15;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: .04em;
      }
      th:first-child { border-radius: 5px 0 0 0; }
      th:last-child { border-radius: 0 5px 0 0; border-right: 0; }
      td {
        padding: 5px 4px;
        border-right: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        vertical-align: top;
        line-height: 1.28;
        overflow-wrap: anywhere;
      }
      td:first-child { border-left: 1px solid var(--border); }
      tbody tr:nth-child(even) td { background: var(--subtle); }
      tbody tr { break-inside: avoid; page-break-inside: avoid; }
      .cell-description { white-space: pre-line; }
      .cell-category { font-weight: 650; color: var(--green); }
      .cell-quantity, .cell-factor { text-align: center; }
      .cell-price, .cell-cost, .cell-shipping, .cell-profit { text-align: right; white-space: nowrap; }

      th:nth-child(1), td:nth-child(1) { width: 8%; }
      th:nth-child(2), td:nth-child(2) { width: 31%; }
      th:nth-child(3), td:nth-child(3) { width: 6%; }
      th:nth-child(4), td:nth-child(4) { width: 9%; }
      th:nth-child(5), td:nth-child(5) { width: 11%; }
      th:nth-child(6), td:nth-child(6) { width: 9%; }
      th:nth-child(7), td:nth-child(7) { width: 6%; }
      th:nth-child(8), td:nth-child(8) { width: 10%; }
      th:nth-child(9), td:nth-child(9) { width: 10%; }
    </style>
  </head>
  <body>
    <header class="report-header">
      <div class="brand">
        <img src="${logoDataUri}" alt="IFC" />
        <div>
          <p class="eyebrow">International Foods Control</p>
          <h1>Lista de análisis</h1>
        </div>
      </div>
      <div class="meta">
        <span><strong>Fecha:</strong> ${escapeHtml(generatedAt)}</span>
        <span><strong>Registros:</strong> ${rows.length}</span>
        <span><span class="currency-badge">${escapeHtml(selectedCurrency)}</span></span>
      </div>
    </header>
    <table>
      <thead><tr>${headers}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </body>
</html>`;
}
