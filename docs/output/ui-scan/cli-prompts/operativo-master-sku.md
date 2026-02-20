# Remediacion Golden Standard: operativo-master-sku.html

## Contexto
Archivo: pages/operativo/operativo-master-sku.html
Score actual: 57/100
Modulo: operativo

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: pass (80%) -- Missing: actions-bar
  * TabSystem: parcial (67%) -- Missing: tab-content
  * FilterBar: falta (25%) -- Missing: pill-group, pill, is-active, search-input-wrap, search-icon, filter-counter
  * Tables: falta (17%) -- Missing: table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * Buttons: parcial (62%) -- Missing: btn-icon-flat, btn-icon-plus, btn-danger
  * Panels: pass (86%) -- Missing: panel-close
  * CustomDropdowns: falta (0%) -- Missing: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * Forms: parcial (50%) -- Missing: input-compact, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 3
  * Cobertura ARIA total: 8 attrs

### Elementos HTML:
  * nativeSelect: 3
  * input: 7
  * textarea: 1
  * button: 9

### Headings: h2(1) h3(1)

### Hints de remediacion (priorizados):
  * HIGH: Reemplazar 3 <select> nativos con .custom-dropdown
  * MED: [Header] Agregar: actions-bar
  * MED: [TabSystem] Agregar: tab-content
  * LOW: [FilterBar] Agregar: pill-group, pill, is-active, search-input-wrap, search-icon, filter-counter
  * MED: [Tables] Agregar: table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-icon-flat, btn-icon-plus, btn-danger
  * LOW: [Panels] Agregar: panel-close
  * MED: [CustomDropdowns] Agregar: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * LOW: [Forms] Agregar: input-compact, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar operativo-master-sku.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/operativo-master-sku.css), refactoriza ahi
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
