# Remediacion Golden Standard: admin-master-tarifario.html

## Contexto
Archivo: pages/admin/admin-master-tarifario.html
Score actual: 52/100
Modulo: admin

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: parcial (60%) -- Missing: dashboard-subtitle-soft, actions-bar
  * Sidebar: falta (0%) -- Missing: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * FilterBar: parcial (62%) -- Missing: pill, is-active, filter-counter
  * Tables: falta (17%) -- Missing: table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * Buttons: parcial (50%) -- Missing: btn-ghost, btn-icon, btn-icon-flat, btn-icon-plus
  * Panels: pass (100%) -- Completo
  * CustomDropdowns: falta (0%) -- Missing: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * Forms: parcial (50%) -- Missing: input-compact, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-xs, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 1
  * Cobertura ARIA total: 5 attrs

### Elementos HTML:
  * nativeSelect: 1
  * input: 4
  * button: 13
  * form: 1
  * aside: 1

### Headings: h2(1) h3(1)

### Hints de remediacion (priorizados):
  * HIGH: Reemplazar 1 <select> nativos con .custom-dropdown
  * MED: [Header] Agregar: dashboard-subtitle-soft, actions-bar
  * MED: [Sidebar] Agregar: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * LOW: [FilterBar] Agregar: pill, is-active, filter-counter
  * MED: [Tables] Agregar: table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-ghost, btn-icon, btn-icon-flat, btn-icon-plus
  * MED: [CustomDropdowns] Agregar: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * LOW: [Forms] Agregar: input-compact, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-xs, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar admin-master-tarifario.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/admin-master-tarifario.css), refactoriza ahi
6. Elimina TODOS los inline style y reemplazalos con clases GS
7. Reemplaza select nativos con el patron .custom-dropdown
8. Asegura heading hierarchy correcta (h2, h3, h4 -- sin h1)
9. Agrega atributos ARIA a elementos interactivos

### Formato del plan:
Para cada archivo a modificar, indica:
  * Que cambia y por que
  * Lineas aproximadas afectadas
  * Patron GS de referencia (numero de seccion del golden standard)

### Criterio de exito:
  * Score de compliance mayor o igual a 85%
  * 0 inline styles
  * 0 native selects sin custom-dropdown
  * ARIA labels en todos los botones e inputs
