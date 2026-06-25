# To Do List
https://internationalfoodscontrol.duckdns.org/login

## Misc
- [x] Proxying and cookies correctly implemented for prod env.
- [] CRON job para obtener archivo .tar de la base de datos semanalmente.
- [] [BUG] Restablecer los archivos rotos manualmente desde backup.
- [LAST] [] Mejorar el diseño.

## Laboratorios
- [x] Los laboratorios se borran en modo LIVE.
- [x] Los laboratorios se crean en modo LIVE.
- [x] Los laboratorios se editan en modo LIVE.
- [x] Eliminar laboratorios necesitan una validación escrita de un usuario de area administrativa.
- [x] [BUG] Alerta si el Código (palabra clave) o el nombre de un laboratorio ya está ocupado.
- [] Mejorar la UX de crear laboratorio.
- [] Si se cambia la palabra clave de análisis de un laboratorio, se refleja el cambio en todos los análisis. (toca quebrar el id_analisis).

## Análisis
- [x] Los análisis se borran en modo LIVE.
- [x] Los análisis se crean en modo LIVE.
- [x] Los análisis se editan en modo LIVE.
- [x] Creación cohesiva de análisis en el tablero correspondiente. 
- [x] Solo se normaliza la palabra clave del laboratorio para el ID del análisis.
- [x] Eliminar análisis necesitan una validación escrita de un usuario de area administrativa.
- [] Fitros en este tablero. 

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
- [x] Descarga de PDF de la vista actual formateada para catálogo de análisis.
- [x] Agregar diseño profesional de la empresa a la exportación de PDF.
- [x] [BUG] La creación de PDFs requiere tener chromium en el contenedor, por lo que ahora se instala con Dockerfile.

## Sesiones
- [] Cuando ingresa una persona, saca a la otra si ingresa las mismas credenciales.
- [] Crear vistas para los usuarios que no son area administrativa.
- [] Aumentar la duración de los tokens, expiran o no se refrezcan correctamente.
- [] [BUG] No se está refrezcando el token correctamente. (y existe un console.log console.warn )
Auth token validation failed {
  hasAccessToken: true,
  hasRefreshToken: true,
  message: 'invalid JWT: unable to parse or verify signature, token has invalid claims: token is expired'
}

## Notas del desarrollador
- LIVE funciona con realtime enabled, RLS activado y sin polizas.
- Revisar la carpeta ./context para más información.
- Eliminar un laboratorio o análisis no borra los archivos (PDFs) y quedan resguardados a nivel raíz. La única manera de borrar PDFs es a través del tablero de cada análisis.

### Posibles adiciones
- Tablero de archivos para laboratorios.
- Ver archivos de acreditación de lab, columna de “valido hasta”.
- Staticly, indicar que laboratorios están con acreditación activa hasta el día de hoy.
- Justo antes de eliminar un laboratorio, el usuario debe recibir un archivo Excel/PDF de todos los análisis y la información del laboratorio, y entonces allí podrá borrarlo.
- [] [REQUIERE ORDEN EN BIND] Integrar API de Bind para la actualización instantanea de los conceptos de venta ante el SAT.
- [] Existe un heartbeat de los realtime-tokens, puede afectar el rendimiento.