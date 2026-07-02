# P. Gestión de análisis 2026 - International Foods Control
https://internationalfoodscontrol.duckdns.org/login

## Misc
- [x] Proxying and cookies correctly implemented for prod env.
- [x] CRON job para obtener archivo .tar de la base de datos semanalmente. (Digital Ocean's Cold Storage.)
- [x] [BUG] Restablecer los archivos rotos manualmente desde backup.

## Laboratorios
- [x] Los laboratorios se borran en modo LIVE.
- [x] Los laboratorios se crean en modo LIVE.
- [x] Los laboratorios se editan en modo LIVE.
- [x] Eliminar laboratorios necesitan una validación escrita de un usuario de area administrativa.
- [x] [BUG] Alerta si el Código (palabra clave) o el nombre de un laboratorio ya está ocupado.
- [x] Si se cambia la palabra clave para análisis de un laboratorio, se refleja el cambio en todos sus análisis. 

## Análisis
- [x] Los análisis se borran en modo LIVE.
- [x] Los análisis se crean en modo LIVE.
- [x] Los análisis se editan en modo LIVE.
- [x] Creación cohesiva de análisis en el tablero correspondiente. 
- [x] Solo se normaliza la palabra clave del laboratorio para el ID del análisis.
- [x] Eliminar análisis necesitan una validación escrita de un usuario de area administrativa.

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

## Reportes
- [x] [BUG] El signo de divisa no aparece al descargar PDF.
- [x] Descarga de PDF de la vista actual formateada para catálogo de análisis.
- [x] Agregar diseño profesional de la empresa a la exportación de PDF.
- [x] [BUG] La creación de PDFs requiere tener chromium en el contenedor, por lo que ahora se instala con Dockerfile.

## Sesiones
- [x] IAM.json, role based access control.
- [x] [BUG] Los tokens no tenían arquitectura de refresh. Se implementó setSession de Supabase client.
- [x] [BUG] La sesión para modo LIVE falla aleatoriamente. Colocar una restricción que evite el uso de la página web hasta que la subscripción de realtime otorgue un status conectado.
- [x] RBAC + RLS + Views aplicadas al tablero de análisis.
- [x] RBAC + RLS + Views aplicadas al tablero de laboratorios.
- [x] RBAC + RLS aplicadas al tablero de archivos.
- [x] Todas las llamadas de load-data utilizan un RPC o usan RLS para un SELECT puro.
- [] Cuando ingresa una persona, saca a la otra si ingresa las mismas credenciales.

## Notas del desarrollador
- LIVE funciona con realtime enabled, RLS activado y sin polizas.
- Revisar la carpeta ./context para más información.
- Eliminar un laboratorio o análisis no borra los archivos (PDFs) y quedan resguardados a nivel raíz. La única manera de borrar PDFs es a través del tablero de cada análisis.
- Debido al riesgo de crear registros ambiguos, no está permitido editar el código de un análisis. Sin embargo, sí es posible modificar la palabra clave utilizada para identificar los análisis de un laboratorio.
- Los permisos funcionan tal que un diagrama de Venn, lo que se permite ya se construyó (g1), lo que no se permite no se construyó (g2), y la intersección de g1-g2 es donde existe el archivo [IAM.json](lib/IAM.json) que funciona como Policy Decision Point (PDP).

## Descripción de IAM.json
Este .json controla principalmente visibilidad y acciones de UI. Para seguridad real, los endpoints y Supabase RLS deben validar permisos del lado servidor/base de datos.

- `lib/IAM.json` define permisos por modulo usando el `areaId` del usuario.
- Valor `true`: acceso permitido para cualquier area.
- Valor `[1, 2]`: acceso permitido solo si `areaId` esta incluido en el array.
- Valor `false` ó `null`: acceso denegado.
- Los nombres exactos de las areas dependen de la base de datos.

### Analisis
- Area `1`: acceso completo a analisis, incluyendo borrar.
- Area `2`: puede ver, crear/editar, usar dinero y reportes, pero no borrar.
- Area `3`: solo lectura basica de analisis; ve codigo, laboratorio y descripcion, pero no datos monetarios/operativos.
- Area `4`: no tiene acceso a analisis.
- `access_view`: areas `1`, `2`, `3` pueden entrar a la vista de analisis.
- `create_update_actions`: areas `1`, `2` pueden crear y editar datos.
- `delete_actions`: solo area `1` puede borrar.
- `money_actions`: areas `1`, `2` pueden usar acciones de divisas/tipos de cambio.
- `report_actions`: areas `1`, `2` pueden generar reportes PDF.
- `codigo_clm`, `labname_clm`, `desc_clm`: areas `1`, `2`, `3`.
- `cantidad_clm`, `precio_clm`, `categoria_clm`, `costo_clm`, `factor_clm`, `envio_clm`, `utilidad_clm`: areas `1`, `2`.


### Laboratorios
- Area `1`: acceso completo a laboratorios, incluyendo borrar.
- Area `2`: puede ver y editar laboratorios, pero no borrar.
- Area `4`: lectura basica de laboratorios; no ve columnas internas como divisa, cobertura o codigo.
- Area `3`: no tiene acceso a laboratorios.
- `access_view`: areas `1`, `2`, `4` pueden entrar a laboratorios.
- `create_update_actions`: areas `1`, `2` pueden crear y editar.
- `delete_actions`: solo area `1` puede borrar.
- `labname_clm`, `pais_clm`, `direccion_clm`, `contacto_clm`: areas `1`, `2`, `4`.
- `divisa_clm`, `cobertura_clm`, `codigo_clm`: areas `1`, `2`.

### Archivos
- Area `1`: puede ver y borrar archivos.
- Area `2`: puede ver archivos, pero no borrar.
- Areas `3`, `4`: no tienen acceso a archivos.
- `access_view`: areas `1`, `2` pueden entrar o consultar archivos.
- `delete_actions`: solo area `1` puede borrar archivos.

## Posibles adiciones
- [LAST] [] Mejorar el diseño.
- [] Filtros especiales en el tablero de análisis.
- [] Mejorar la UX de crear laboratorio.
- Tablero de archivos para laboratorios.
- Ver archivos de acreditación de lab, columna de “valido hasta”.
- Staticly, indicar que laboratorios están con acreditación activa hasta el día de hoy.
- Justo antes de eliminar un laboratorio, el usuario debe recibir un archivo Excel/PDF de todos los análisis y la información del laboratorio, y entonces allí podrá borrarlo.
- [] [REQUIERE ORDEN EN BIND] Integrar API de Bind para la actualización instantanea de los conceptos de venta ante el SAT.
- Cambiar las rutas de files para que no muestren el id de la base de datos.
- [] Selector/Visor que indique el precio que desea mostrar según el año seleccionado. Precio desde fecha de creación del análisis + (1+var_interés * años desde creación), y editable esa cantidad de interés.