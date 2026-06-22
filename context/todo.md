## Done
* [X] Proxying and cookies correctly implemented for prod env.
* [X] Los análisis se borran en modo LIVE.
* [ ] Los análisis se crean en modo LIVE.
No recibe nada, no activa ningun console.log(test)


- Eliminar análisis no borra sus archivos de la bucket cuando es called desde eliminar laboratorio madre... pues claro, solo responden al cascade de laboratorio, no al cascade de la row que indica el path de la bucket... Eso es sql mijo


A. Total beatdown de tablero de laboratorios
- Actualización en tiempo real

B. Brainstorm una mejor UX de analisis, piensa sin limites


1. Los cambios de la tabla de analisis si llegan, pero no se actualizan en tiempo real.
2. Crear un analisis lanza un error, es por los nombres de los archivos



1. Corregir descarga de PDF
     a. Se calculan y no aparecen 
     b. El signo en el pdf
4. Editable los Statics
5. PDF descargar análisis seleccionados

Opción para que la edición sea mucho más cohesiva plis, estar saltando para crear un analisis no es nada comodo

Hola, ya le comenté a Elena de lo que mencionaste, comentó que en caso de que se quieran borrar los laboratorios se agregará el eliminar estos con una contraseña, pero que también existiera un respaldo de Excel  de lo eliminado


Limbo
-> Codigo de los análisis
-> No eligen una divisa por laboratorio, solo formatean el precio comunicado al cliente


Tablero de archivos para laboratorios

- Ver archivos de acreditación de lab, columna de “valido hasta”
- Staticly, indicar que laboratorios están con acreditación activa hasta el día de hoy.
Columna de Costo está bien (yes)

Columna de Precio esa si formatearla

- Formatear toda la columna
- Formatear en estilo de excepciones, que seleccione la moneda según
- Botón de interés anual
    - Los interés está definidios desde que “nace” el analisis
        - Coloca un selector de año para mostrar el precio en el pdf

Columnas Costo, factor,e envio utilidad en MXN

Precio ES EXTERNO, por eso en moneda destino y formateable

→ Botón de descargar EXCEL para Bind

- Cuando ingresa una persona, saca a la otra si ingresa las mismas credenciales



## Resuelto en esta pasada

- Compactar patrones repetidos de rutas API con `withApiUser` y helpers compartidos.
- Compactar popups con `PopupShell` y un runtime cliente único (`PopupRuntime`).
- Eliminar scripts públicos legacy reemplazados por componentes reutilizables.
- Crear partial compartido `BackToDashboard` para volver al tablero principal.
- Modernizar estilos Tailwind globales para login, header, cards, tablas, botones y popups.
- Corregir el login roto removiendo padding global y reemplazando el script por `LoginError`.
- Corregir el typo `buttonddFilePopup` en la página de archivos.
- Corregir subida/creación de análisis usando `sanitizeFileName` y `uploadAnalysisFile` compartidos.

## Pendiente funcional para validar manualmente

- Probar creación de análisis con archivos reales y nombres con acentos, espacios y caracteres especiales.
- Probar realtime multiusuario en catálogo, laboratorios y archivos con dos sesiones abiertas.
