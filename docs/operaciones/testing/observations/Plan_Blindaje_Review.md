# Plan de Blindaje — Review Técnico

> **Fecha**: 2026-02-20
> **Tester**: Luciano
> **Rol probado**: Cross-rol (validación de plan)
> **Sprint**: 0

---

## Hallazgos

### OBS-1: Guardia en index.html — rol no existe en app_metadata

- **Tipo**: Lógica
- **Severidad**: 🔴 Crítico
- **Descripción**: El plan propone `session.user.app_metadata.role` para resolver el rol. En la arquitectura actual, el rol vive en la tabla `profiles` (columna `role`), no en `app_metadata` del JWT. `auth.js` ya lo resuelve via `getMyProfile()` (select a `profiles`). Además, `Auth.getSession()` retorna `data.session`, no `{ session }`.
- **Esperado**: Usar `Auth.getMyProfile()` para obtener el rol y `Auth.roleLanding(role)` para resolver la URL destino — ambos ya existen en `auth.js`. También requiere cargar `config.js`, `supabase-client.js` y `auth.js` en `index.html` (actualmente no los incluye).
- **Afecta a**: `index.html` — punto de entrada principal
- **Ticket**: pendiente

### OBS-2: RLS — auth.jwt() ->> 'role' no retorna el rol de la app

- **Tipo**: Data
- **Severidad**: 🔴 Crítico
- **Descripción**: El plan propone usar `auth.jwt() ->> 'role'` en policies RLS para filtrar por rol. Ese campo retorna `'authenticated'` o `'anon'` (rol de Supabase), **no** el rol de la aplicación (admin, contable, operativo, etc.).
- **Esperado**: Dos opciones viables: **(A)** Custom claims — función `set_claim` que copie `profiles.role` al JWT en `app_metadata.app_role`, luego policy con `auth.jwt() -> 'app_metadata' ->> 'app_role'`. **(B)** Sub-select — policy con `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`. Opción A es más eficiente; Opción B es más simple de implementar.
- **Afecta a**: Toda la capa RLS propuesta
- **Ticket**: pendiente

### OBS-3: RLS sin policies de escritura bloquea operación

- **Tipo**: Lógica
- **Severidad**: 🔴 Crítico
- **Descripción**: Habilitar `ENABLE ROW LEVEL SECURITY` sin crear policies `INSERT`/`UPDATE`/`DELETE` bloquea instantáneamente la escritura en esas tablas. Los módulos de workdays, stock, importers (GBOL, Passline, AFIP) y solicitudes dejarían de funcionar.
- **Esperado**: Por cada tabla, crear el set completo de policies (SELECT + INSERT + UPDATE + DELETE) con los roles autorizados **antes** de activar RLS. Ejecutar en una sola migración atómica.
- **Afecta a**: Módulos de escritura — workdays, stock, importers, solicitudes, pagos
- **Ticket**: pendiente

### OBS-4: Blindaje de módulos — solo scanner.js afectado

- **Tipo**: Lógica
- **Severidad**: 🟢 Bajo
- **Descripción**: El plan indica "forzar `guardOrRedirect` en todos los archivos de `./assets/js/modules/`". En realidad, de 38 módulos escaneados, solo `scanner.js` tiene el guard comentado (línea 8). Los otros 37 ya lo tienen activo.
- **Esperado**: Descomentar el guard solo en `scanner.js`. La propuesta de `display: none` en `<body>` requiere agregar `document.body.style.display = 'block'` post-auth en el callback exitoso — actualmente ningún módulo lo hace. Centralizar en `auth.js` dentro de `guardOrRedirect`.
- **Afecta a**: `scanner.js` (operativo)
- **Ticket**: pendiente

### OBS-5: CSP incluye dominios incorrectos y omite los reales

- **Tipo**: Cross-rol
- **Severidad**: 🟡 Medio
- **Descripción**: El CSP propuesto incluye `cdn.tailwindcss.com` y `www.gstatic.com` — no se usan en el proyecto. Omite `cdn.jsdelivr.net` (SDK Supabase, línea 16 de `login.html`) y `api.emailjs.com` (EmailJS en `config.js`).
- **Esperado**: CSP alineado al stack real: `default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://*.supabase.co https://api.emailjs.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:;`
- **Afecta a**: Todos los HTML del proyecto
- **Ticket**: pendiente

---

## Resumen

| Métrica           | Valor |
| :---------------- | :---- |
| Total hallazgos   | 5     |
| 🔴 Críticos       | 3     |
| 🟡 Medios         | 1     |
| 🟢 Bajos          | 1     |
| Tickets generados | 0     |
