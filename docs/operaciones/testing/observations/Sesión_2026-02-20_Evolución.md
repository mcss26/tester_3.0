# Sesión de Auditoría — Evolución y Puntos Clave

> **Fecha**: 2026-02-20
> **Tester**: Luciano
> **Rol probado**: Cross-rol (auditoría integral)
> **Sprint**: 0

---

## Hallazgos

### OBS-1: Auditoría de Fragilidad y Scope — reestructurada

- **Tipo**: Data
- **Severidad**: 🟢 Bajo
- **Descripción**: El archivo original era un bloque de texto sin formato. Se reestructuró al template estándar de observaciones extrayendo 5 hallazgos: barrera de especificidad CSS (142 `!important`, 89 `#id`), mutación de tokens, acoplamiento JS-CSS (312 selectores), riesgo de regresión funcional, e inconsistencia de datos fiscales.
- **Esperado**: ✅ Completado — archivo alineado al template.
- **Afecta a**: `Auditoría de Fragilidad y Scope.md`
- **Ticket**: —

### OBS-2: Auditoría de Seguridad y Arquitectura — generada desde codebase real

- **Tipo**: Auth
- **Severidad**: 🔴 Crítico
- **Descripción**: Escaneo del proyecto reveló 7 hallazgos de seguridad: credenciales hardcoded en `config.js` (ANON_KEY + EmailJS), `index.html` bypasea login, auth 100% client-side, RLS en solo ~6/29 tablas, policies genéricas sin rol, guard comentado en `scanner.js`, sin CSP/headers.
- **Esperado**: Documentado en `Seguridad_Arquitectura.md`. Requiere plan de remediación corregido.
- **Afecta a**: Toda la aplicación
- **Ticket**: pendiente

### OBS-3: Plan de Blindaje propuesto — revisado con 3 errores técnicos

- **Tipo**: Lógica
- **Severidad**: 🔴 Crítico
- **Descripción**: El plan de remediación propuesto contenía errores bloqueantes: (1) `session.user.app_metadata.role` no existe — el rol vive en tabla `profiles`, (2) `auth.jwt() ->> 'role'` retorna `'authenticated'`, no el rol de la app, (3) CSP incluía `cdn.tailwindcss.com` (no se usa) y omitía `cdn.jsdelivr.net` (SDK Supabase). Documentado en `Plan_Blindaje_Review.md`.
- **Esperado**: Corregir antes de ejecutar: usar `Auth.getMyProfile()`, implementar custom claims o sub-select para RLS, alinear CSP al stack real.
- **Afecta a**: Plan de remediación completo
- **Ticket**: pendiente

### OBS-4: Script Python de aplanamiento CSS — 3 bugs destructivos

- **Tipo**: Lógica
- **Severidad**: 🔴 Crítico
- **Descripción**: El script propuesto para convertir `#id` a `.is-legacy-id` en CSS tiene: (1) regex `#([a-zA-Z0-9_-]+)` captura colores hex (26+ instancias confirmadas como `#fff`, `#ef4444`), (2) solo existen 2 selectores `#id` reales en los 9 archivos `admin-*.css` (`#payModal`, `#btn-view-all-requests`), (3) el replace HTML duplicaría `class=""` en 600+ elementos que ya lo tienen.
- **Esperado**: No ejecutar. Relación daño/beneficio muy desfavorable para admin CSS.
- **Afecta a**: Archivos `admin-*.css` y `pages/admin/*.html`
- **Ticket**: —

### OBS-5: Encargados identificados como zona segura para transformación

- **Tipo**: UI/UX
- **Severidad**: 🟢 Bajo
- **Descripción**: Análisis de las 7 páginas de encargados revela: 0 selectores `#id`, 0 `!important`, solo 1 CSS propio (`encargado-noche.css`, 76 líneas, ya usa tokens). No necesitan aplanamiento de IDs. El problema real es que **nunca fueron diseñados** — usan clases genéricas de `components.css` sin estructura modular.
- **Esperado**: Candidatos ideales para transformación de bajo riesgo: auditar clases usadas vs disponibles, inyectar CSP, estandarizar estructura de layout. Usar `ds-verify.ps1` pre/post para medir impacto.
- **Afecta a**: 7 páginas de encargados
- **Ticket**: pendiente

### OBS-6: Flujo de herramientas validado — ds-verify.ps1 vs ui-component-scanner.ps1

- **Tipo**: Cross-rol
- **Severidad**: 🟢 Bajo
- **Descripción**: Se clarificó que `ds-verify.ps1` no aplana IDs — es un comparador de scores pre/post cambios que consume `summary.json` del scanner. El flujo correcto es: (1) `ds-verify.ps1 -SaveBaseline`, (2) ejecutar transformación, (3) `ds-verify.ps1` para detectar regresiones Tier0.
- **Esperado**: Usar este flujo como protocolo estándar antes de cualquier transformación CSS/HTML.
- **Afecta a**: Proceso de trabajo
- **Ticket**: —

---

## Resumen

| Métrica           | Valor |
| :---------------- | :---- |
| Total hallazgos   | 6     |
| 🔴 Críticos       | 3     |
| 🟡 Medios         | 0     |
| 🟢 Bajos          | 3     |
| Tickets generados | 0     |

---

## Decisiones Clave (CONFIRMAR CON EL USUARIO ANTES)

1. **No ejecutar** el script Python de aplanamiento CSS en admin — daño > beneficio.
2. **Encargados** = zona de bajo riesgo para primeras transformaciones de diseño.
3. **Plan de blindaje** requiere correcciones técnicas antes de implementar (rol en profiles, no en JWT).
4. **Protocolo de cambios**: baseline con `ds-verify.ps1` → transformar → verificar regresiones.

## Archivos Generados

- `Auditoría de Fragilidad y Scope.md` — reestructurado al template
- `Seguridad_Arquitectura.md` — 7 hallazgos desde codebase real
- `Plan_Blindaje_Review.md` — review técnico del plan de remediación
- `Sesión_2026-02-20_Evolución.md` — este archivo
