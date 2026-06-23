# To Do List
https://internationalfoodscontrol.duckdns.org/login

## Misc
- [x] Proxying and cookies correctly implemented for prod env.
- [] Creación cohesiva de análisis en el tablero correspondiente. (Solo normaliza la palabra clave del laboratorio)

## Laboratorios
- [x] Los laboratorios se borran en modo LIVE.
- [x] Los laboratorios se crean en modo LIVE.
- [x] Los laboratorios se editan en modo LIVE.
- [] Eliminar laboratorios necesita una validación con contraseña de un administrador.
- [] Justo antes de eliminar un laboratorio, el usuario debe recibir un archivo Excel/PDF de todos los análisis y la información del laboratorio, y entonces allí podrá borrarlo.
- [] [BUG] Eliminar laboratorios no borra los sus archivos anclados a sus análisis children. (pues claro, solo responden al cascade de laboratorio, no al cascade de la row que indica el path de la bucket... sql fix)

## Análisis
- [x] Los análisis se borran en modo LIVE.
- [x] Los análisis se crean en modo LIVE.
- [x] Los análisis se editan en modo LIVE.
- [] Eliminar análisis necesita una validación con contraseña de un administrador.
- [] [BUG] Crear un analisis lanza un error, es por los nombres de los archivos (Ya existe `sanitizeFileName` y `uploadAnalysisFile`.)

## Archivos
- [x] Los archivos se borran en modo LIVE.
- [x] Los archivos se crean en modo LIVE.
- [x] Los archivos se editan en modo LIVE. 
- [x] [BUG] Se genera un ciclo infinito de ediciones incorrectas que causan llamadas al backend.

## Divisas
- [x] Los divisas se editan en modo CACHÉ. 
- [x] La divisa seleccionada se actualiza en modo LIVE según su valor en la casilla.
- [] La columna de Costo se formate según el botón clickeado de divisa correctamente.
- [] La columna de Precio se formatea según el botón clickeado de divisa correctamente.
### Notas
- Formatear toda la columna en "estilo de excepciones", que seleccionen las rows aplicables
- Selector/Visor que indique el precio que desea mostrar según el año seleccionado. Precio desde fecha de creación del análisis + (1+var_interés * años desde creación), y editable esa cantidad de interés.
- No eligen una divisa por laboratorio, solo formatean el precio comunicado al cliente.
- ? Eliminar la entidad Statics

## Reportes
- [] Descarga de EXCEL para catálogo de análisis.
- [] Descarga de PDF para catálogo de análisis.
- [] [BUG] Descargar PDF, las variables calculadas y el signo de divisa no aparecen.
- [] Agregar diseño profesional de la empresa.

## Sesiones
- [] Cuando ingresa una persona, saca a la otra si ingresa las mismas credenciales.

## Notas del desarrollador
- LIVE funciona con realtime enabled, RLS activado y sin polizas.
- Revisar la carpeta ./context para más información.

## Posibles adiciones
- PDF descargar análisis seleccionados.
- Tablero de archivos para laboratorios.
- Ver archivos de acreditación de lab, columna de “valido hasta”.
- Staticly, indicar que laboratorios están con acreditación activa hasta el día de hoy.
- Los filtros de AG Table no son user-friendly.