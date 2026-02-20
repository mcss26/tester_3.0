# Remediacion Golden Standard: admin-pagos.html

## Contexto
Archivo: pages/admin/admin-pagos.html
Score actual: 72/100
Modulo: admin

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: pass (100%) -- Completo
  * Sidebar: falta (0%) -- Missing: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * TabSystem: pass (100%) -- Completo
  * FilterBar: parcial (50%) -- Missing: pill-group, pill, is-active, filter-counter
  * Tables: pass (83%) -- Missing: sortable, sort-icon
  * Buttons: parcial (50%) -- Missing: btn-icon, btn-icon-flat, btn-icon-plus, btn-danger
  * Modals: pass (89%) -- Missing: modal-content-lg
  * Panels: pass (100%) -- Completo
  * CustomDropdowns: falta (0%) -- Missing: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * Forms: parcial (50%) -- Missing: input-compact, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-muted, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 6
  * Cobertura ARIA total: 117 attrs

### Elementos HTML:
  * nativeSelect: 6
  * input: 29
  * button: 30
  * dialog: 2
  * table: 7
  * form: 3
  * aside: 3

### Headings: h2(1) h3(5) h4(5)

### Hints de remediacion (priorizados):
  * HIGH: Reemplazar 6 <select> nativos con .custom-dropdown
  * MED: [Sidebar] Agregar: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * LOW: [FilterBar] Agregar: pill-group, pill, is-active, filter-counter
  * MED: [Tables] Agregar: sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-icon, btn-icon-flat, btn-icon-plus, btn-danger
  * MED: [Modals] Agregar: modal-content-lg
  * MED: [CustomDropdowns] Agregar: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * LOW: [Forms] Agregar: input-compact, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-muted, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar admin-pagos.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/admin-pagos.css), refactoriza ahi
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
