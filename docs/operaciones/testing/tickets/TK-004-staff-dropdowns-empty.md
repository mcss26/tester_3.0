# TK-004: Dropdowns de Asignación de Staff Vacíos / Opciones Incorrectas

> **Origen**: Verificación manual `admin-workdays.html` → Tab Planner → Staff Slots
> **Agente(s)**: logic
> **Severidad**: 🟡
> **Tier**: Tier1
> **Estado**: ✅ Cerrado (workaround Opción B)

---

## Contexto

Los dropdowns de asignación de staff (que aparecen al incrementar el cupo de un rol) no despliegan opciones correctas o están vacíos. El usuario no puede asignar personal a los slots.

## Causa Raíz

La función `renderStaffSlots()` (L755-796) filtra usuarios con una **heurística frágil** basada en string matching de nombres de rol:

```javascript
// L766-770 — Filtro actual:
const roleName =
  state.roles.find((r) => r.id === roleId)?.name.toLowerCase() || "";
const eligibleUsers = state.users.filter((u) => {
  const uRole = (u.role || "").toLowerCase();
  return (
    uRole.includes(roleName) || uRole.includes("staff") || uRole === "admin"
  );
});
```

### Problemas con esta lógica:

1. **Matching frágil:** Si el rol se llama "Bartender" pero el `profiles.role` del usuario es "encargado_barra", no matchea
2. **`profiles.role`** es un campo de auth/sistema (admin, encargado, operativo, staff), no un rol operativo (Bartender, Cajero, Seguridad)
3. **La query de perfiles** (L564) trae TODOS los perfiles: `profiles.select('id, full_name, role')` — puede devolver cientos de usuarios irrelevantes si role='staff' matchea muchos
4. **Sin vínculo datos maestros:** No hay JOIN con `master_staff_roles` para filtrar por capacidades/roles operativos

### Resultado:

- Si `profiles.role` no contiene substrings del nombre del rol maestro → dropdown vacío
- Si `profiles.role = 'staff'` → todos los staff aparecen en todos los roles → confusión

## Archivos Implicados

- `assets/js/modules/admin/admin-workdays.js`
  - L564: `loadInitialData()` → profiles query (sin filtro)
  - L755-796: `renderStaffSlots()` → filtro heurístico de usuarios
  - L782-790: `<select>` de asignación de usuario

## Fix Propuesto

### Opción A: Filtro por role_id en profiles (si existe columna)

Si `profiles` tiene una columna `staff_role_id` que referencia `master_staff_roles`:

```javascript
const eligibleUsers = state.users.filter((u) => u.staff_role_id === roleId);
```

### Opción B: Todos los staff en todos los dropdowns (quick fix)

Si no hay relación directa, mostrar todos los usuarios con `role = 'staff'` en todos los dropdowns, sin filtrar por nombre:

```javascript
const eligibleUsers = state.users.filter((u) =>
  ["staff", "encargado", "admin"].includes(u.role?.toLowerCase()),
);
```

### Opción C: Tabla intermedia (correct fix)

Crear tabla `staff_role_capabilities` que vincule `profile_id` ↔ `master_staff_role_id`. Esto permite que un bartender sea también cajero si tiene capacitación dual.

## Referencia Golden Standard

> Según `docs/ui-golden-standard.md` → Sección 4 (Custom Dropdown): Los dropdowns siguen el patrón `.custom-dropdown` con `data-value` y `data-action`. Sin embargo, el staff assignment usa `<select>` nativo dentro de `.input.input-sm`. Considerar adoptar el patrón golden standard para consistencia visual.

## Criterio de Éxito

- [x] Al incrementar cupo de un rol, el dropdown muestra usuarios asignables
- [x] Los usuarios filtrados corresponden al rol seleccionado (o fallback razonable)
- [x] No aparecen duplicados ni opciones irrelevantes
- [x] Verificar en DB la relación `profiles` ↔ `master_staff_roles`

## Resolución

- **Fix aplicado**: Opción B — `renderStaffSlots()` ahora usa `state.users` sin filtro heurístico. Con 4 usuarios, todos aparecen en todos los dropdowns. Se eliminó la lógica frágil de string-matching.
- **Tablas existentes**: `staff_functions` (9 funciones) y `profile_functions` (bridge `profile_id ↔ function_id`) existen en DB pero `profile_functions` está vacía.
- **Path estructural**: Cuando se escale a más staff, poblar `profile_functions` y filtrar por `master_staff_roles.area ↔ staff_functions.name`.
- **Verificado**: 2026-02-21 — code audit + schema validation via Supabase SQL.
- **Cerrado por**: Code audit (verificación contra codebase + DB)
