# Remediacion Golden Standard: logistica-distribucion.html

## Contexto
Archivo: pages/logistica/logistica-distribucion.html
Score actual: 64/100
Modulo: logistica

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: pass (80%) -- Missing: actions-bar
  * FilterBar: falta (25%) -- Missing: pill, is-active, search-input-wrap, search-icon, filter-counter, filter-spacer
  * Tables: falta (25%) -- Missing: table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * Buttons: parcial (62%) -- Missing: btn-icon-flat, btn-icon-plus, btn-danger
  * Modals: parcial (78%) -- Missing: modal-content-md, modal-content-lg
  * Forms: falta (17%) -- Missing: input-compact, form-group, form-label, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-xs, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 7 attrs

### Elementos HTML:
  * input: 1
  * button: 9

### Headings: h2(2)

### Hints de remediacion (priorizados):
  * MED: [Header] Agregar: actions-bar
  * LOW: [FilterBar] Agregar: pill, is-active, search-input-wrap, search-icon, filter-counter, filter-spacer
  * MED: [Tables] Agregar: table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-icon-flat, btn-icon-plus, btn-danger
  * MED: [Modals] Agregar: modal-content-md, modal-content-lg
  * LOW: [Forms] Agregar: input-compact, form-group, form-label, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-xs, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar logistica-distribucion.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/logistica-distribucion.css), refactoriza ahi
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
