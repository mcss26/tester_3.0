# Plan de Remediacion: admin-workdays.html

> Generado por Gemini CLI | Score actual: 64/100 | Modulo: admin

---

## Resumen

1. Eliminar inline styles (2)
2. Reemplazar 5 `<select>` nativos por `.custom-dropdown`
3. Implementar `grid-sidebar-main` y `sidebar-filters` en pestana Planificacion
4. Refactorizar modales al estandar `<dialog class="modal">`
5. Completar clases de componentes faltantes
6. Mejorar accesibilidad (ARIA)

---

## 1. Archivo: pages/admin/admin-workdays.html

### Tarea 1: Eliminar Estilos Inline (Prioridad ALTA)

- **Que cambia**: Se eliminaran dos atributos de estilo en linea (style).
- **Por que**: Anti-patron explicito del Golden Standard. Centraliza estilos en CSS.
- **Lineas afectadas**:
  - Linea ~227 (`<div class="wd-breakeven-bar" id="be-progress-bar" style="width: 0%">`): Eliminar `style="width: 0%"`. El ancho es dinamico controlado por JS.
  - Linea ~730 (`<div class="staff-dashboard" style="margin-top: 24px;">`): Eliminar `style="margin-top: 24px;"` y reemplazar por clase `.form-group-spaced-top`.
- **Patron GS**: Seccion 1 (Overview), Seccion 11 (Utility Classes).

### Tarea 2: Reemplazar `<select>` nativos por custom-dropdown (Prioridad ALTA)

- **Que cambia**: 5 `<select>` -> estructura `.custom-dropdown`. Los `<select>` originales se mantienen con clase `u-hidden` para preservar funcionalidad JS.
- **Por que**: Cumplir estandar visual y eliminar anti-patron.
- **Lineas afectadas**: ~70-90 lineas.
  - `#select-event` (Linea ~251)
  - `#select-countdown-event` (Linea ~266)
  - `#select-template` (Linea ~274)
  - `#sa-filter-clasif` (Linea ~656)
  - `#rpt-chart-mode` (Linea ~710)
- **Patron GS**: Seccion 4 (Chart Section) y Seccion 6 (Data Table).

### Tarea 3: Implementar grid-sidebar-main y sidebar-filters (Prioridad MEDIA)

- **Que cambia**: Reestructurar pestana "Planificacion" (`#panelPlanner`). `<div class="planner-layout">` -> `<div class="grid-sidebar-main">`. `<aside class="planner-sidebar">` -> `<aside class="sidebar-filters">`. `<main class="planner-canvas">` -> `<div class="main-content-area">`.
- **Por que**: Layout actual es especifico y no sigue patron estandar sidebar (score 0%).
- **Lineas afectadas**: ~30-40 lineas.
- **Patron GS**: Seccion 11 (Tab Content Pattern - Recipes).

### Tarea 4: Refactorizar Modales al estandar `<dialog>` (Prioridad MEDIA)

- **Que cambia**: Modales `.modal-overlay + .modal-card` -> `<dialog class="modal">` con `.modal-content`, `.modal-header`, `.modal-body`, `.modal-footer`.
- **Por que**: Golden Standard, mejor semantica HTML y accesibilidad. Score Modales: 44%.
- **Lineas afectadas**: ~150-200 lineas.
  - `#confirmModal`
  - `#closeNightModal`
  - `#createEventModal`
  - `#costModal`
  - `#preFlightModal`
  - `#templateModal`
- **Patron GS**: Seccion 7 (Modal Dialog).

### Tarea 5: Completar clases de componentes (Prioridad BAJA)

- **Que cambia**: Agregar clases faltantes.
- **Lineas afectadas**: ~25-35 lineas.
  - **Tables**: `.sortable` en `<th>` + `<span class="sort-icon"></span>`
  - **Buttons**: `.btn-icon-flat` y `.btn-icon-plus`
  - **Panels**: `.panel-close` y `.panel-footer` en `#slide-panel`
  - **Forms**: `.input-compact` en inputs de tablas/filtros
  - **Stats**: `.stats-header`, `.stats-body`, `.stat-item`
  - **Utilities**: `u-hidden`, `text-muted`
- **Patron GS**: Secciones 1, 5, 8, 9, 10, 11, 12.

### Tarea 6: Mejorar Accesibilidad (ARIA)

- **Que cambia**: `aria-label` en botones de solo icono. Verificar jerarquia h2 > h3 > h4.
- **Lineas afectadas**: Integrado en todas las tareas.
- **Patron GS**: Seccion Accessibility Guidelines.

---

## 2. Archivo: assets/css/admin-workdays.css

### Tarea 1: Refactorizar estilos de planner-layout

- **Que cambia**: Eliminar/adaptar `.planner-layout`, `.planner-sidebar`, `.planner-canvas`. Migrar estilos a `.sidebar-filters`.
- **Lineas afectadas**: ~15-20 lineas.
- **Patron GS**: N/A (refactorizacion de codigo existente).
