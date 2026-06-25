# Docker y Puppeteer

## Problema

La generacion de PDF falla en contenedor cuando Puppeteer no encuentra Chrome/Chromium. El error aparece como 500 en `/api/export-analysis-pdf` porque `puppeteer.launch()` no puede iniciar un navegador.

Se probaron dos enfoques dentro de la imagen de la app:

- Instalar `chromium` sobre `node:20-alpine`.
- Usar `ghcr.io/puppeteer/puppeteer` como imagen base.

Ambos corrigen la disponibilidad del navegador, pero hacen que el build de la app sea demasiado lento o pesado.

## Decision actual

La app vuelve a usar `node:20-alpine` y no instala Chrome/Chromium dentro de su imagen.

Chromium vive en un servicio separado de Docker Compose:

```yaml
browserless:
  image: ghcr.io/browserless/chromium:latest
```

La app se conecta a ese navegador remoto con Puppeteer usando WebSocket:

```env
BROWSERLESS_WS_ENDPOINT=ws://browserless:3000?token=ifc-browserless
```

En codigo, `/api/export-analysis-pdf` usa `puppeteer.connect()` cuando existe `BROWSERLESS_WS_ENDPOINT`. Si esa variable no existe, mantiene el fallback con `puppeteer.launch()` para entornos locales o alternativos.

## Por que esto mejora el build

El build de la app ya no descarga ni instala Chromium. La imagen de la app queda enfocada en Node, dependencias de npm y el build de Next.

La imagen pesada del navegador queda separada. Docker puede cachearla de forma independiente y no necesita reconstruirla cuando cambia codigo de la app.

## Por que no mezclar Alpine con una imagen Puppeteer

No conviene construir dependencias en `node:20-alpine` y ejecutar en una imagen Puppeteer basada en Debian/Ubuntu.

Alpine usa `musl`, mientras que Debian/Ubuntu usa `glibc`. Algunas dependencias nativas de Node, como binarios de Next/SWC u otros paquetes compilados, pueden instalar variantes distintas segun la distribucion. Copiar `node_modules` entre esas bases puede provocar errores en runtime.

Por eso, si se usa la imagen oficial de Puppeteer como base, deberia usarse en todas las etapas relevantes. Como ese enfoque fue lento, se eligio separar Chromium en otro servicio.

## Resumen

- `node:20-alpine` + `apk add chromium`: funciona, pero hace lento el build.
- `ghcr.io/puppeteer/puppeteer`: evita instalar Chromium manualmente, pero sigue siendo una base pesada.
- `node:20-alpine` + Browserless/Chromium separado: mantiene la app ligera y separa el navegador en otro contenedor.
