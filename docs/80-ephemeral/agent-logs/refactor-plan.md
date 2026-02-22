# Refactor Plan — Auditoría Arquitectónica

> Generated: 2026-02-21

## Resumen Ejecutivo

| Metric                             | Value      |
| ---------------------------------- | ---------- |
| Archivos JS analizados             | 62         |
| Funciones detectadas               | 710        |
| JSDoc coverage                     | 9%         |
| Violaciones DRY                    | 5 patrones |
| Violaciones SRP                    | 6 archivos |
| Acoplamiento directo (`window.sb`) | 42 módulos |

---

## Hallazgos Priorizados

### 🔴 Alta — Debe corregirse

#### H1. God Objects: archivos monolíticos > 1000 LOC

| Archivo                  | LOC  | Funciones | Responsabilidades mezcladas                                                                       |
| ------------------------ | ---- | --------- | ------------------------------------------------------------------------------------------------- |
| `admin-central-stock.js` | 3313 | 79        | CRUD stock + imports CSV/Excel + charts + recipes + profitability + code mappings                 |
| `admin-workdays.js`      | 2739 | 82+       | Workday CRUD + staff + costs + events + cierre noche + QR + accruals + fiscal + reports + polling |
| `admin-solicitudes.js`   | 1371 | 28        | Pre-approval + orders + audits + charts + supplier views                                          |
| `admin-pagos.js`         | 1323 | 40        | Payments + costs + nomina + parameters + bulk pay + suppliers                                     |

**Propuesta:** Extraer a sub-módulos por responsabilidad.

| Archivo actual           | Módulos propuestos                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `admin-central-stock.js` | `stock-crud.js`, `stock-imports.js`, `stock-charts.js`, `stock-recipes.js`, `stock-profitability.js`                       |
| `admin-workdays.js`      | `workday-core.js`, `workday-staff.js`, `workday-costs.js`, `workday-cierre.js`, `workday-reports.js`, `workday-polling.js` |
| `admin-solicitudes.js`   | `solicitudes-core.js`, `solicitudes-audit.js`, `solicitudes-charts.js`                                                     |
| `admin-pagos.js`         | `pagos-core.js`, `pagos-config.js`, `pagos-suppliers.js`                                                                   |

**Esfuerzo:** L (requiere refactorizar imports y exports window.X)

---

#### H2. Acoplamiento directo a `window.sb` (42 módulos)

**Problema:** 42 de 42 módulos acceden a `window.sb` (Supabase client) directamente. Existe `GbolService` como capa de abstracción pero no se usa universalmente.

**Impacto:**

- Imposible mockear para testing
- Sin retry/error-handling centralizado
- Sin cache layer
- Si la API de Supabase cambia, hay que tocar 42 archivos

**Propuesta:** Migrar gradualmente a `GbolService` como único punto de acceso:

1. Agregar métodos faltantes a `GbolService` (los que hoy se hacen con `sb.from().select()` directo)
2. Migrar módulo por módulo (empezar por los más simples: `login.js`, `logistica-index.js`)
3. Deprecar acceso directo con un wrapper que loguee warnings

**Esfuerzo:** L (42 módulos, migración gradual)

---

### 🟡 Media — Debería corregirse

#### H3. DRY — `errorState` reimplementada 8 veces

**Archivos:** `operativo-stock`, `operativo-master-sku`, `operativo-master-proveedores`, `logistica-stock`, `logistica-recepcion`, `logistica-distribucion`, `admin-master-proveedores`, `admin-master-nomina`

**Patrón repetido:**

```javascript
const errorState = (msg) => {
  container.innerHTML = `<div class="empty-state accent">${msg}</div>`;
};
```

**Propuesta:** Ya existe `Utils.assertSbOrShowBlockingError` pero es específico de Supabase. Agregar un `Utils.showError(container, message)` genérico:

```javascript
// En utils.js
const showError = (el, msg) => {
  if (el)
    el.innerHTML = `<div class="empty-state accent">${Utils.escapeHtml(msg)}</div>`;
};
```

Luego reemplazar las 8 implementaciones locales.

**Esfuerzo:** S

---

#### H4. DRY — `const fmt` redeclarado 13 veces

**Archivos:** `admin-workdays` (8x), `admin-pagos`, `admin-solicitudes`, `balance-semanal` (2x)

**Variantes encontradas:**

```javascript
// admin-workdays: envuelve Utils (redundante)
const fmt = window.Utils.formatARS;

// balance-semanal: reimplementa con diferente formato
const fmt = (n) => `$${parseFloat(n).toLocaleString('es-AR', ...)}`;

// admin-solicitudes: con fallback defensivo
const fmt = (v) => window.Utils?.formatARS?.(v) || ('$' + v.toLocaleString(...));
```

**Propuesta:**

1. `admin-workdays`: Usar `Utils.formatARS` directo en vez de re-asignar 8 veces
2. `balance-semanal`: Agregar variante `Utils.formatARS_short` (sin decimales)
3. `admin-solicitudes`: El fallback defensivo es innecesario si Utils siempre carga

**Esfuerzo:** S

---

#### H5. DRY — `setPageState`/`setLoading` pattern duplicado

**Problema:** `Utils.setPageState` existe en core, pero varios módulos definen su propio `setPageState` o `setLoading`:

- `admin-central-stock.js` → `setPageState` local
- `admin-solicitudes.js` → `setPageState` local
- `admin-config.js` → `setPageState` local
- `admin-reportes.js` → `setLoading` local
- `cms-members.js` → `setLoading` + `setEmpty` locales
- `operativo-master-sku.js` → `setLoading` + `setSectionVisibility` locales

**Propuesta:** Los locales usan IDs de DOM específicos del módulo. La solución: pasar un map de elementos al `Utils.setPageState` (que ya acepta un `ui` object).

**Esfuerzo:** M

---

### 🟢 Baja — Nice to have

#### H6. Archivos 400-700 LOC con responsabilidades mixtas

| Archivo                       | LOC | Nota                                       |
| ----------------------------- | --- | ------------------------------------------ |
| `gbol-service.js`             | 652 | Aceptable — es la capa de servicio central |
| `encargado-barra-personal.js` | 598 | CRUD + convocations + staff panel          |
| `operativo-workday.js`        | 592 | Links + staff + requests en un solo módulo |
| `scanner-mock.js`             | 591 | Scanner + camera + audio + history         |
| `admin-master-nomina.js`      | 545 | CRUD + profiles grid + dual view           |
| `staff-caja-index.js`         | 523 | Dashboard con múltiples widgets            |
| `admin-master-proveedores.js` | 481 | CRUD + categories + details                |
| `encargado-barra-noche.js`    | 457 | Cierre + signature pad + realtime          |

**Propuesta:** No son urgentes. Prioritizar H1-H5 primero.

---

## Orden de ejecución recomendado

| Prioridad | Hallazgo                             | Esfuerzo | Dependencias                                |
| --------- | ------------------------------------ | -------- | ------------------------------------------- |
| 1         | H3: `errorState` → `Utils.showError` | S        | Ninguna                                     |
| 2         | H4: `const fmt` consolidar           | S        | Ninguna                                     |
| 3         | H5: `setPageState` unificar          | M        | H3 done                                     |
| 4         | H1: Split god objects                | L        | H3, H4, H5 done (reduce LOC antes de split) |
| 5         | H2: `window.sb` → `GbolService`      | L        | H1 done (split first, then migrate)         |

---

## Riesgo

Todos los cambios propuestos son refactors internos (no cambian interfaces externas ni HTML). El riesgo principal es **regresión funcional** al mover lógica entre archivos. Mitigación:

1. Un módulo a la vez
2. Test manual post-cambio
3. `git stash` antes de cada batch
