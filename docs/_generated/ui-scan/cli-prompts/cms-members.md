# Remediacion Golden Standard: cms-members.html

## Contexto
Archivo: pages/operativo/cms-members.html
Score actual: 67/100
Modulo: operativo

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: pass (100%) -- Completo
  * Metrics: pass (100%) -- Completo
  * TabSystem: parcial (67%) -- Missing: tab-content
  * FilterBar: pass (88%) -- Missing: filter-counter
  * Tables: falta (17%) -- Missing: table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * Buttons: parcial (50%) -- Missing: btn-primary, btn-ghost, btn-icon-plus, btn-danger
  * Panels: falta (14%) -- Missing: slide-panel, panel-header, panel-title, panel-close, panel-body, panel-footer
  * Forms: falta (33%) -- Missing: form-group, form-label, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 15 attrs

### Elementos HTML:
  * input: 4
  * button: 11

### Headings: h2(1)

### Hints de remediacion (priorizados):
  * MED: [TabSystem] Agregar: tab-content
  * LOW: [FilterBar] Agregar: filter-counter
  * MED: [Tables] Agregar: table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-primary, btn-ghost, btn-icon-plus, btn-danger
  * LOW: [Panels] Agregar: slide-panel, panel-header, panel-title, panel-close, panel-body, panel-footer
  * LOW: [Forms] Agregar: form-group, form-label, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar cms-members.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/cms-members.css), refactoriza ahi
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
