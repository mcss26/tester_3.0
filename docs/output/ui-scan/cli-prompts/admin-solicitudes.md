# Remediacion Golden Standard: admin-solicitudes.html

## Contexto
Archivo: pages/admin/admin-solicitudes.html
Score actual: 73/100
Modulo: admin

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: pass (100%) -- Completo
  * Metrics: pass (100%) -- Completo
  * Sidebar: falta (0%) -- Missing: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * TabSystem: pass (100%) -- Completo
  * FilterBar: parcial (62%) -- Missing: search-input-wrap, search-icon, filter-counter
  * Tables: falta (17%) -- Missing: table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * Buttons: parcial (50%) -- Missing: btn-icon, btn-icon-flat, btn-icon-plus, btn-danger
  * Modals: pass (89%) -- Missing: modal-content-lg
  * Panels: pass (100%) -- Completo
  * CustomDropdowns: pass (100%) -- Completo
  * Charts: pass (100%) -- Completo
  * Forms: parcial (50%) -- Missing: input-compact, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 5 attrs

### Elementos HTML:
  * input: 1
  * textarea: 2
  * button: 15
  * dialog: 1
  * form: 1
  * canvas: 1
  * aside: 1

### Headings: h2(1) h3(2)

### Hints de remediacion (priorizados):
  * MED: [Sidebar] Agregar: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * LOW: [FilterBar] Agregar: search-input-wrap, search-icon, filter-counter
  * MED: [Tables] Agregar: table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-icon, btn-icon-flat, btn-icon-plus, btn-danger
  * MED: [Modals] Agregar: modal-content-lg
  * LOW: [Forms] Agregar: input-compact, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-muted, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar admin-solicitudes.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/admin-solicitudes.css), refactoriza ahi
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
