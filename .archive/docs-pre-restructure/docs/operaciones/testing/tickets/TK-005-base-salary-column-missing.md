# TK-005: SELECT incluye columna `base_salary` inexistente — ROMPE TODA la carga

> **Origen**: Verificación Supabase + análisis de código post-fix CLI
> **Agente(s)**: logic
> **Severidad**: 🔴
> **Tier**: Tier0
> **Estado**: ✅ Cerrado

---

## Contexto

El fix aplicado por CLI para TK-003 agregó `base_salary` al SELECT de `master_staff_roles`, pero esa columna **no existe**. Supabase/PostgREST devuelve error `42703: column "base_salary" does not exist`, lo que rompe toda `loadInitialData()` y deja la página vacía.

## Causa Raíz

```javascript
// L561 — Estado actual (ROTO):
window.sb
  .from("master_staff_roles")
  .select("id, name, base_salary, base_rate") // ← base_salary NO EXISTE
  .eq("active", true)
  .order("name");
```

### Esquema real de `master_staff_roles`:

| Columna         | Tipo        | Existe       |
| --------------- | ----------- | ------------ |
| id              | uuid        | ✅           |
| name            | text        | ✅           |
| area            | text        | ✅           |
| base_rate       | numeric     | ✅           |
| active          | boolean     | ✅           |
| created_at      | timestamptz | ✅           |
| **base_salary** | —           | ❌ NO EXISTE |

### Error PostgreSQL confirmado:

```
ERROR: 42703: column "base_salary" does not exist
LINE 1: SELECT id, name, base_salary, base_rate FROM master_staff_roles...
```

### Impacto cascada:

1. `loadInitialData()` L557 → Promise.all falla completamente
2. `state.roles = []` (nunca se asigna)
3. `renderBasicPanels()` L576 → nunca se ejecuta
4. **Toda la tabla de dotación invisible**
5. **Toda la página inoperante** (staff, costos, KPIs — todo depende de esta carga)

## Archivos Implicados

- `assets/js/modules/admin/admin-workdays.js` L561

## Fix

```javascript
// L561 — Quitar base_salary, usar SOLO base_rate:
window.sb
  .from("master_staff_roles")
  .select("id, name, area, base_rate")
  .eq("active", true)
  .order("name");
```

También limpiar las referencias a `base_salary` en el JS:

- L730: `role.base_salary || role.base_rate` → `role.base_rate`
- L739: `role.base_salary || role.base_rate || 0` → `role.base_rate || 0`
- L829: `role.base_salary || role.base_rate || 0` → `role.base_rate || 0`

## Criterio de Éxito

- [x] Página carga sin errores en consola
- [x] Tabla de dotación muestra los 16 roles activos
- [x] KPIs de staff muestran valores reales
- [x] No quedan referencias a `base_salary` en el código

## Resolución

- **Fix**: `base_salary` eliminado del SELECT y de 3 referencias fallback en `admin-workdays.js`
- **Verificado**: 2026-02-17 — grep confirma 0 ocurrencias de `base_salary`
- **Cerrado por**: QA Agent (acciones automáticas post-auditoría)
