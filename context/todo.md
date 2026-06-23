# Done
## Misc
- [x] Proxying and cookies correctly implemented for prod env.

## Laboratorios
- [x] Los laboratorios se borran en modo LIVE.
- [x] Los laboratorios se crean en modo LIVE.
- [x] Los laboratorios se editan en modo LIVE.

## Análisis
- [x] Los análisis se borran en modo LIVE.
- [x] Los análisis se crean en modo LIVE.
- [x] Los análisis se editan en modo LIVE.

## Archivos
- [] Los archivos se borran en modo LIVE.
- [] Los archivos se crean en modo LIVE.
- [] Los aaaaa se editan en modo LIVE. (Bug critico, se genera un ciclo infinito de ediciones incorrectas que causan llamadas al backend)

## Divisas
- [] No eligen una divisa por laboratorio, solo formatean el precio comunicado al cliente
- [] Columna de Costo como base está bien, falta agregar algo
- [] Columna de Precio esa si formatearla
- Formatear toda la columna en "estilo de excepciones", que seleccionen las rows aplicables
- Selector/Visor que indique el precio que desea mostrar según el año seleccionado. Precio desde fecha de creación del análisis + (1+var_interés * años desde creación), y editable esa cantidad de interés.

## Reportes
- [] Descarga de EXCEL para catálogo de análisis
- [] Descarga de PDF para catálogo de análisis

## Sesiones
- [] Cuando ingresa una persona, saca a la otra si ingresa las mismas credenciales

## Notas
- LIVE funciona con realtime disabled.

##

1. Opción para que la edición sea mucho más cohesiva plis, estar saltando para crear un analisis no es nada comodo
2. Hola, ya le comenté a Elena de lo que mencionaste, comentó que en caso de que se quieran borrar los laboratorios se agregará el eliminar estos con una contraseña, pero que también existiera un respaldo de Excel  de lo eliminado
3. Eliminar análisis no borra sus archivos de la bucket cuando es called desde eliminar laboratorio madre... pues claro, solo responden al cascade de laboratorio, no al cascade de la row que indica el path de la bucket... sql fix
4. Ya existe `sanitizeFileName` y `uploadAnalysisFile`.

##

1. Corregir descarga de PDF
     a. Se calculan y no aparecen 
     b. El signo en el pdf
2. Crear un analisis lanza un error, es por los nombres de los archivos
3. Editable los Statics
4. PDF descargar análisis seleccionados

## 

1. Tablero de archivos para laboratorios
2. Ver archivos de acreditación de lab, columna de “valido hasta”
3. Staticly, indicar que laboratorios están con acreditación activa hasta el día de hoy.