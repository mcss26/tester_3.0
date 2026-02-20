# TK-003: Staff Costs No Recalculan al Cambiar Cantidad

> **Origen**: Verificación manual `admin-workdays.html` → Tab Planner → Staff Planning
> **Agente(s)**: logic
> **Severidad**: 🔴
> **Tier**: Tier0
> **Estado**: Abierto

---

## Contexto

Al modificar la cantidad de staff en el Planner, el costo del rol no se recalcula. Solo se actualiza si se modifica el costo unitario en otro campo. El badge de costo del rol siempre muestra `$0,00`.

## Causa Raíz

La función `calculateTotals()` (L823-851) multiplica `qty * rate` donde `rate = role.base_salary || role.base_rate || 0`. Sin embargo, la query en `loadInitialData()` (L561) solo selecciona columnas parciales:

```javascript
// L561 — Query actual:
window.sb.from("master_staff_roles").select("id, name").eq("active", true);

// L829 — calculateTotals intenta usar:
const rate = role.base_salary || role.base_rate || 0;
// ⚠️ Ambos campos son UNDEFINED porque no están en el SELECT
```

**Resultado:** `rate` siempre es `0`, `sub` siempre es `0`, KPIs de staff siempre `$0,00`.

Además, `renderStaffList()` L738 muestra un hardcoded `formatARS(0)` en lugar de calcular con la tarifa del rol en el render inicial.

## Archivos Implicados

- `assets/js/modules/admin/admin-workdays.js`
  - L561: `loadInitialData()` → SELECT incompleto
  - L729: `renderStaffList()` → budget display usa `role.base_salary || role.base_rate` (undefined)
  - L823-838: `calculateTotals()` → cálculo correcto pero rate=0 por dato faltante

## Fix Propuesto

```javascript
// L561 — Agregar columnas de tarifa al SELECT:
window.sb
  .from("master_staff_roles")
  .select("id, name, base_salary, base_rate")
  .eq("active", true)
  .order("name");
```

**Verificar también:** que la tabla `master_staff_roles` tenga las columnas `base_salary` y/o `base_rate` pobladas. Si solo tiene una de las dos, normalizar.

## Referencia Golden Standard

> Según `docs/ui-golden-standard.md` → Summary Metrics Cards (Sección 2): los KPIs deben reflejar datos dinámicos, no hardcodeados. El patrón `.summary-metric-value` debe actualizar en tiempo real.

## Criterio de Éxito

- [ ] Cambiar cantidad de staff → badge muestra `qty × tarifa` del rol
- [ ] KPIs (staff-subtotal, kpi-staff-cost, kpi-total-cost) actualizan inmediatamente
- [ ] `calculateTotals()` devuelve valores correctos con tarifas reales
- [ ] Verificar columnas de `master_staff_roles` en DB (base_salary / base_rate)

## Resolución

> Completar al cerrar:
>
> - Plan: `plans/TK-003-plan.md`
> - Commit: [ref]
> - Verificado: [fecha]
