# Auditoría UI Polisher: Admin Stock

> **Fecha**: 2026-01-29
> **Estado**: 🟡 REQUIERE AJUSTES
> **Standard**: `ui-polisher` (Golden: `admin-master-proveedores`)

## 🚨 Desviaciones (Must Fix)

### 1. Alien CSS / Inline Styles 👽
El skill `ui-polisher` prohíbe estilos en línea. Se detectaron:
- **HTML Line 63**: `style="display: flex; gap: 8px;"` en acciones del header.
    - *Solución*: Usar clase `.actions-group` o `.row-flex`.
- **JS Line 133**: `style="opacity: 0.6"` para items inactivos.
    - *Solución*: Usar clase CSS `.is-inactive` (como en Proveedores).
- **JS Line 140**: `style="transform: scale(0.75)"` en el switch.
    - *Solución*: Ajustar CSS del componente switch o crear variante `.switch-sm`.

### 2. State Management
- **Falta helper `setPageState`**: El código manipula `ui.pageCardLoading` y `ui.pageCardEmpty` directamente disperso en `loadData`.
    - *Solución*: Implementar la función centralizada `setPageState({ loading, empty })` para consistencia con el Golden Standard.

### 3. Typography Tokens
- **JS Line 135**: Uso de `font-mono` y `text-xs`.
    - *Verificación*: Confirmar si estas clases existen en `main.css`. El estándar usa `muted` y `text-sm` para datos secundarios.

## ✅ Puntos Aprobados
- [x] **Estructura Macro**: `page-card-wrap > page-card > #module-content`.
- [x] **Header**: Usa `dashboard-title-soft`.
- [x] **Filtros**: Estructura `filter-bar-compact` correcta.
- [x] **Tablas**: Usa `table-sticky` y `cell-pad`.

## Plan de Acción
1. Refactorizar `admin-stock.js` para añadir `setPageState`.
2. Mover estilos inline a clases CSS en `admin-stock.html` y JS.
3. Reemplazar opacidad manual por clase `.is-inactive`.
