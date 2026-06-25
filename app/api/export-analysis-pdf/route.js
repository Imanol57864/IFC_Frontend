import { readFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
import { NextResponse } from "next/server";
import { withApiUser } from "@/lib/api";
import { jsonError, readJson } from "@/lib/http";
import { analysisPdfTemplate } from "@/lib/analysisPdfTemplate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiUser(async ({ request }) => {
  const body = await readJson(request);
  const rows = Array.isArray(body.rows) ? body.rows.slice(0, 5000) : null;
  if (!rows) return jsonError("No se recibieron datos válidos para el reporte.", 400);

  let browser;
  try {
    const logo = await readFile(path.join(process.cwd(), "public", "favicon.jpg"));
    const generatedAt = new Intl.DateTimeFormat("es-MX", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Mexico_City"
    }).format(new Date());
    const html = analysisPdfTemplate({
      rows,
      generatedAt,
      logoDataUri: `data:image/jpeg;base64,${logo.toString("base64")}`,
      selectedCurrency: body.selectedCurrency || "Sin divisa. (Original)"
    });

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "Letter",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="width:100%;padding:0 9mm;color:#64736d;font-family:Arial,sans-serif;font-size:8px;display:flex;justify-content:space-between;"><span>© 2026 International Foods Control, México</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`
    });

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="reporte-analisis.pdf"',
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("No se pudo generar el PDF con Puppeteer.", error);
    return NextResponse.json({
      message: "No se pudo generar el PDF.",
      data: [],
      error: serializeError(error)
    }, { status: 500 });
  } finally {
    await browser?.close();
  }
});

function serializeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: serializeError(error.cause)
    };
  }

  return {
    name: typeof error,
    message: String(error)
  };
}
