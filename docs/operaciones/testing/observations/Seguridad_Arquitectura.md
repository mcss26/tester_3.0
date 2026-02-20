# Seguridad & Arquitectura

> **Fecha**: 2026-02-20
> **Tester**: Luciano
> **Rol probado**: Cross-rol (audit global)
> **Sprint**: 0

---

## Hallazgos

### OBS-1: Credenciales hardcoded en config.js (expuestas en repo)

- **Tipo**: Auth
- **Severidad**: 🔴 Crítico
- **Descripción**: `assets/js/core/config.js` expone en texto plano: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (JWT completo), `EMAILJS` public key, service ID y template IDs. Son visibles para cualquier usuario que inspeccione el código fuente del navegador.
- **Esperado**: La `ANON_KEY` de Supabase es pública por diseño, pero **requiere RLS estricto** como contraparte — que actualmente no existe (ver OBS-4). EMAILJS keys deberían estar en variables de entorno o en edge functions.
- **Afecta a**: Toda la aplicación — acceso a datos vía API directa
- **Ticket**: pendiente

### OBS-2: index.html bypasea login — redirige directo a admin

- **Tipo**: Auth
- **Severidad**: 🔴 Crítico
- **Descripción**: `index.html` ejecuta `window.location.href = "pages/admin/admin-index.html"` sin verificar sesión. Cualquier visita a la raíz del sitio accede al panel admin sin autenticación previa.
- **Esperado**: `index.html` debe verificar sesión via `Auth.getSession()` y redirigir a `login.html` si no hay sesión activa, o al landing del rol correspondiente si la hay.
- **Afecta a**: Punto de entrada principal de la aplicación
- **Ticket**: pendiente

### OBS-3: Autorización 100% client-side sin refuerzo server-side

- **Tipo**: Auth
- **Severidad**: 🔴 Crítico
- **Descripción**: `guardOrRedirect()` en `auth.js` valida roles en el navegador consultando la tabla `profiles`. Un atacante puede: (1) desactivar JS, (2) modificar el payload del profile, o (3) llamar directamente al API de Supabase con la ANON_KEY pública. No hay Edge Functions ni middleware server-side que valide roles.
- **Esperado**: La autorización por rol debe estar reforzada en server-side via RLS policies con `auth.jwt() ->> 'role'` o custom claims, o mediante Edge Functions con verificación de token.
- **Afecta a**: Todos los módulos — admin, encargados, operativo, logística, staff, gerencia
- **Ticket**: pendiente

### OBS-4: RLS habilitado solo en ~6 de 29+ tablas — GBOL comentado

- **Tipo**: Data
- **Severidad**: 🔴 Crítico
- **Descripción**: De 29 migraciones, solo 6 tablas tienen `ENABLE ROW LEVEL SECURITY` activo: `payment_reconciliation`, `payment_commission_config`, `sku_price_history`, `recipe_code_mappings`, `revenue_reports`, `revenue_details`. Las tablas GBOL tienen RLS **comentado** (`-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY`). Las tablas core (profiles, workdays, stock, etc.) no muestran RLS en las migraciones.
- **Esperado**: Todas las tablas deben tener RLS habilitado. Tablas sin RLS con la ANON_KEY expuesta permiten SELECT/INSERT/UPDATE/DELETE a cualquier usuario autenticado o incluso anónimo.
- **Afecta a**: Base de datos completa — riesgo de exfiltración y manipulación de datos
- **Ticket**: pendiente

### OBS-5: Policies RLS son "authenticated" genéricas — sin filtro por rol

- **Tipo**: Auth
- **Severidad**: 🟡 Medio
- **Descripción**: Las policies existentes usan `auth.role() = 'authenticated'` como única condición. Esto permite que **cualquier usuario logueado** (staff_caja, operativo, etc.) lea y escriba en tablas de payment, revenue y pricing — datos que deberían ser exclusivos de admin/contable.
- **Esperado**: Las policies deben filtrar por rol del usuario (`auth.jwt() -> 'app_metadata' ->> 'role'`) o por `user_id` según corresponda. Ejemplo: solo `admin` y `contable` deberían tener acceso a `payment_reconciliation`.
- **Afecta a**: Escalada de privilegios horizontal entre roles
- **Ticket**: pendiente

### OBS-6: Guard comentado en scanner.js — módulo sin protección

- **Tipo**: Auth
- **Severidad**: 🟡 Medio
- **Descripción**: En `modules/operativo/scanner.js` línea 8, el guard está comentado: `// const session = await window.Auth.guardOrRedirect(...)`. El módulo de scanner es accesible sin autenticación a nivel de UI.
- **Esperado**: Todo módulo debe tener `guardOrRedirect` activo con los roles permitidos explícitamente definidos.
- **Afecta a**: Módulo Scanner (operativo)
- **Ticket**: pendiente

### OBS-7: Sin Content Security Policy ni security headers

- **Tipo**: Cross-rol
- **Severidad**: 🟡 Medio
- **Descripción**: Ningún HTML incluye meta tags de CSP. No hay headers HTTP de seguridad configurados (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`). Supabase JS SDK se carga desde CDN sin SRI (Subresource Integrity hash).
- **Esperado**: Implementar CSP via meta tags o headers del hosting. Agregar SRI hash al script tag del SDK de Supabase. Configurar headers de seguridad en el deployment.
- **Afecta a**: Toda la aplicación — riesgo XSS y MITM
- **Ticket**: pendiente

---

## Resumen

| Métrica           | Valor |
| :---------------- | :---- |
| Total hallazgos   | 7     |
| 🔴 Críticos       | 4     |
| 🟡 Medios         | 3     |
| 🟢 Bajos          | 0     |
| Tickets generados | 0     |
