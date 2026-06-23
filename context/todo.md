# To Do List
https://internationalfoodscontrol.duckdns.org/login

## Misc
- [x] Proxying and cookies correctly implemented for prod env.
- [] CRON job para obtener archivo .tar de la base de datos semanalmente.

## Laboratorios
- [x] Los laboratorios se borran en modo LIVE.
- [x] Los laboratorios se crean en modo LIVE.
- [x] Los laboratorios se editan en modo LIVE.
- [x] Eliminar laboratorios necesitan una validación escrita de un usuario de area administrativa.
- [] Justo antes de eliminar un laboratorio, el usuario debe recibir un archivo Excel/PDF de todos los análisis y la información del laboratorio, y entonces allí podrá borrarlo.
- [] [BUG] Eliminar laboratorios no borra los sus archivos anclados a sus análisis children. (pues claro, solo responden al cascade de laboratorio, no al cascade de la row que indica el path de la bucket... sql fix)

## Análisis
- [x] Los análisis se borran en modo LIVE.
- [x] Los análisis se crean en modo LIVE.
- [x] Los análisis se editan en modo LIVE.
- [x] Creación cohesiva de análisis en el tablero correspondiente. 
- [x] Solo se normaliza la palabra clave del laboratorio para el ID del análisis.
- [x] Eliminar análisis necesitan una validación escrita de un usuario de area administrativa.
- [] [BUG] La búsqueda universal en el tablero de análisis no busca a en la descripción porque es información que no existe en la celda. Cambialo para que búsque también en las celdas hidden, porque allí si se encuentra la información.

## Archivos
- [x] Los archivos se borran en modo LIVE.
- [x] Los archivos se crean en modo LIVE.
- [x] Los archivos se editan en modo LIVE. 
- [x] [BUG] Se genera un ciclo infinito de ediciones incorrectas que causan llamadas al backend.
- [x] [BUG] La subida de un archivo con nombres que incluyen "ñ" y "acentos" hace que se cree un error. Esto afecta hasta el crear un análisis. (Fixed at `sanitizeFileName`).
- [x] Los nombres de los archivos se normalizan antes de subirlos a la base de datos. (Se eliminan acentos, tildes, y Ñs).

## Divisas
- [x] Los divisas se editan en modo CACHÉ. 
- [x] La divisa seleccionada se actualiza en modo LIVE según su valor en la casilla.
- [x] La columna de Costo siempre utiliza la divisa seleccionada por el laboratorio.
- [x] Todas las demás columnas, deben iniciar con la divisa del laboratorio y después poder formatearse hacia la divisa indicada por el botón.
- [x] [BUG] Al editar la tabla de análisis mientras está seleccionada una divisa no-base se borra el estado de la divisa.
- [] Selector/Visor que indique el precio que desea mostrar según el año seleccionado. Precio desde fecha de creación del análisis + (1+var_interés * años desde creación), y editable esa cantidad de interés.

## Reportes
- [x] [BUG] El signo de divisa no aparece al descargar PDF.
- [] Descarga de EXCEL de la vista actual formateada para catálogo de análisis.
- [] Descarga de PDF de la vista actual formateada para catálogo de análisis.
- [] Agregar diseño profesional de la empresa.

## Sesiones
- [] Cuando ingresa una persona, saca a la otra si ingresa las mismas credenciales.
- [] Crear vistas para los usuarios que no son area administrativa.
- [] Aumentar la duración de los tokens, expiran o no se refrezcan correctamente.

## Notas del desarrollador
- LIVE funciona con realtime enabled, RLS activado y sin polizas.
- Revisar la carpeta ./context para más información.

## Posibles adiciones
- PDF descargar análisis seleccionados.
- Tablero de archivos para laboratorios.
- Ver archivos de acreditación de lab, columna de “valido hasta”.
- Staticly, indicar que laboratorios están con acreditación activa hasta el día de hoy.
- Los filtros de AG Table no son user-friendly.
- ... Hacer que si se cambia la palabra clave de análisis de un laboratorio, que se refleje el cambio en todos los análisis.