# Autenticación de Supabase Realtime con RLS

## Problema observado

La aplicación recibía y procesaba eventos `DELETE` de Supabase Realtime, pero los eventos `INSERT` y `UPDATE` no llegaban correctamente a las tablas del navegador.

La suscripción no tenía un filtro que excluyera explícitamente esos eventos:

```js
{
  event: "*",
  schema: "public",
  table
}
```

El problema estaba en la identidad con la que el navegador se conectaba a Realtime.

## Causa

La aplicación autentica al usuario en el servidor y guarda los tokens de Supabase en cookies HTTP-only:

- `access_token`
- `refresh_token`

Estas cookies se utilizan en las páginas y rutas API del servidor. Sin embargo, el cliente Supabase del navegador solamente se creaba con la clave pública `anon`:

```js
createClient(SUPABASE_URL, SUPABASE_KEY, ...)
```

Como la cookie es HTTP-only, JavaScript no puede leer directamente su valor. Por lo tanto, la conexión WebSocket de Realtime no conocía la sesión del usuario y se identificaba con el rol `anon`.

Las políticas RLS de `catAnalisis` y `catLabos` no permiten que ese rol consulte las filas. Una comprobación REST usando la misma clave pública devolvió una respuesta exitosa, pero cero filas visibles para ambas tablas.

Realtime aplica las políticas de acceso de la identidad suscrita. Por ello, el servidor de Realtime no podía entregar normalmente las filas nuevas de `INSERT` y `UPDATE` al cliente anónimo.

## Objetivo de la solución

La solución debía cumplir lo siguiente:

1. Mantener la clave `service_role` fuera del navegador.
2. Conservar las cookies HTTP-only como fuente de la sesión.
3. Validar la sesión en el servidor antes de entregar un token.
4. Instalar el JWT del usuario en Supabase Realtime antes de crear el canal.
5. Permitir que Realtime obtenga un token vigente durante una reconexión.
6. Evitar canales abandonados si un componente se desmonta mientras espera la autenticación.

## Flujo resultante

```text
Navegador
   |
   | GET /api/realtime-token
   | Cookie HTTP-only incluida automáticamente
   v
Ruta API de Next.js
   |
   | requireApiUser()
   | valida access_token con Supabase Auth
   v
Respuesta no cacheable con el JWT validado
   |
   v
supabase.realtime.setAuth()
   |
   v
Creación del canal postgres_changes
   |
   v
Realtime evalúa RLS como el usuario autenticado
```

## Cambios realizados

### 1. El contexto de sesión conserva el access token

Archivo: `lib/auth.js`

`getSessionContext()` ya obtenía y validaba la cookie `access_token`. Ahora también incluye ese token en el objeto de sesión interno:

```js
return {
  ok: true,
  supabase,
  user: data.user,
  accessToken
};
```

El token solamente se añade después de que esta validación haya sido exitosa:

```js
await supabase.auth.getUser(accessToken);
```

Así, una cookie ausente, vencida o inválida no puede utilizarse para autenticar Realtime.

### 2. Endpoint protegido para obtener el JWT

Archivo: `app/api/realtime-token/route.js`

Se añadió una ruta `GET`:

```js
export async function GET() {
  const session = await requireApiUser();
  if (!session.ok) return session.response;

  return jsonOk(
    { accessToken: session.accessToken },
    { headers: { "Cache-Control": "no-store" } }
  );
}
```

La ruta tiene tres propiedades importantes:

- Lee la sesión desde la cookie HTTP-only enviada por el navegador.
- Usa `requireApiUser()` para validar el token antes de responder.
- Envía `Cache-Control: no-store` para impedir que el JWT se almacene en cachés HTTP.

Si la sesión no es válida, responde con `401` y no entrega ningún token.

### 3. Callback de acceso para el cliente Supabase

Archivo: `lib/supabaseBrowser.js`

Se agregó `getRealtimeAccessToken()`:

```js
async function getRealtimeAccessToken() {
  const response = await fetch("/api/realtime-token", {
    credentials: "same-origin",
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.accessToken) {
    throw new Error(
      data.message || "Unable to authenticate Supabase Realtime."
    );
  }

  return data.accessToken;
}
```

`credentials: "same-origin"` hace que el navegador incluya las cookies del sitio en la petición. JavaScript no necesita leer la cookie directamente.

`cache: "no-store"` evita reutilizar una respuesta con un token anterior.

El callback se entrega al cliente Supabase mediante `accessToken`:

```js
browserClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  accessToken: getRealtimeAccessToken,
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
```

Este callback permite a la biblioteca solicitar un JWT vigente cuando Realtime necesita autenticarse nuevamente.

La clave pública continúa siendo necesaria para construir el cliente y acceder al servicio, pero ya no es la identidad final usada para evaluar RLS en la suscripción.

### 4. Espera explícita antes de suscribirse

Archivo: `lib/supabaseBrowser.js`

Se añadió `getAuthenticatedBrowserSupabase()`:

```js
export async function getAuthenticatedBrowserSupabase() {
  const supabase = getBrowserSupabase();

  if (!realtimeAuthPromise) {
    realtimeAuthPromise = supabase.realtime.setAuth().catch((error) => {
      realtimeAuthPromise = null;
      throw error;
    });
  }

  await realtimeAuthPromise;
  return supabase;
}
```

Esta función impide que el canal se cree antes de que `setAuth()` termine.

`realtimeAuthPromise` también evita que varios componentes hagan peticiones de autenticación idénticas al mismo tiempo. Si la autenticación falla, la promesa se limpia para permitir un intento posterior.

### 5. Creación asíncrona y cierre seguro del canal

Archivo: `components/agGridShared.js`

`subscribeToTableChanges()` ya no crea el canal inmediatamente. Primero espera al cliente autenticado:

```js
const startPromise = getAuthenticatedBrowserSupabase()
  .then((supabase) => {
    if (closed) return supabase;

    channel = supabase
      .channel(subscriptionName)
      .on("postgres_changes", changes, onPayload)
      .subscribe(...);

    return supabase;
  });
```

Esto garantiza el orden:

1. Obtener el token validado.
2. Ejecutar `realtime.setAuth()`.
3. Crear el canal.
4. Registrar `postgres_changes`.
5. Suscribirse.

Cada suscripción recibe además un nombre único:

```js
const subscriptionName = `${channelName}:${++realtimeSubscriptionId}`;
```

Esto evita reutilizar accidentalmente un canal anterior que todavía se esté cerrando durante un montaje nuevo de React.

El método `close()` funciona incluso si el componente se desmonta antes de terminar la autenticación:

```js
close: () => {
  if (closePromise) return closePromise;
  closed = true;

  closePromise = startPromise.then((supabase) => {
    if (!supabase || !channel) return "ok";
    return supabase.removeChannel(channel);
  });

  return closePromise;
}
```

Si `closed` cambia a `true` mientras se obtiene el JWT, el canal nunca llega a crearse. Si ya existe, se elimina mediante `removeChannel()`.

## Comportamiento ante errores

Existen dos grupos de errores diferenciados.

### Error de autenticación

Si `/api/realtime-token` devuelve `401`, no contiene un token o falla la petición:

```js
console.error("Supabase realtime authentication failed", {
  channelName,
  error
});
```

En ese caso no se crea el canal con identidad anónima como respaldo. Esto es intencional: conectarse silenciosamente como `anon` volvería a producir el problema original.

### Error del canal

Si la autenticación fue exitosa pero el canal falla:

```js
console.error("Supabase realtime subscription failed", {
  channelName,
  status,
  error
});
```

Se registran los estados `CHANNEL_ERROR` y `TIMED_OUT` para facilitar el diagnóstico.

## Consideraciones de seguridad

### La clave `service_role` no debe usarse

La solución no utiliza ni expone `service_role`. Esa clave omite RLS y nunca debe incluirse en variables `NEXT_PUBLIC_*`, respuestas API o código del navegador.

### El JWT existe temporalmente en memoria

Aunque la cookie original continúa siendo HTTP-only, el navegador necesita disponer temporalmente del JWT para autenticar el WebSocket. El endpoint solamente lo entrega a una sesión ya validada, por el mismo origen y con una respuesta no cacheable.

Este patrón no protege el JWT frente a código JavaScript malicioso ejecutado dentro del mismo origen. Por ello continúa siendo indispensable evitar XSS y no registrar el token en consola.

### No registrar respuestas del endpoint

No debe agregarse un `console.log` del resultado de `/api/realtime-token`, ya que contendría el JWT completo.

## Relación con RLS

Autenticar el WebSocket no sustituye las políticas RLS. La base de datos todavía debe tener políticas `SELECT` que permitan al rol `authenticated` consultar las filas que debe recibir.

El resultado esperado es:

```text
Clave pública + sin JWT       -> rol anon
Clave pública + JWT de usuario -> rol authenticated
```

Realtime evalúa cada cambio según las políticas aplicables al segundo caso.

Si en el futuro una tabla nueva no entrega `INSERT` o `UPDATE`, se debe comprobar primero:

1. Que la tabla esté incluida en la publicación de Realtime.
2. Que el canal alcance el estado `SUBSCRIBED`.
3. Que `/api/realtime-token` responda `200` para la sesión.
4. Que el usuario autenticado tenga una política RLS de `SELECT` sobre la fila.
5. Que el payload contenga el identificador esperado por AG Grid.

## Validación realizada

Después de implementar el cambio se ejecutó:

```bash
npm run build
```

La compilación de producción terminó correctamente y Next.js reconoció `/api/realtime-token` como una ruta dinámica.

La validación funcional recomendada consiste en abrir dos sesiones autenticadas y probar, desde una de ellas:

- Crear una fila y comprobar `INSERT` en la otra sesión.
- Editar una fila y comprobar `UPDATE`.
- Eliminar una fila y comprobar `DELETE`.
- Desconectar y reconectar la red para confirmar que el canal vuelve a autenticarse.

## Resumen

El error no estaba en `event: "*"` ni en AG Grid. El WebSocket usaba el rol `anon` porque la sesión sólo existía en cookies HTTP-only del servidor.

La implementación añade un puente controlado entre esa sesión y Supabase Realtime: una ruta protegida entrega el JWT validado, el cliente lo instala antes de suscribirse y la biblioteca puede solicitarlo nuevamente durante las reconexiones.
