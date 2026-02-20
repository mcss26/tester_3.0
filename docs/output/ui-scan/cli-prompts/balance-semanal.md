# Remediacion Golden Standard: balance-semanal.html

## Contexto
Archivo: pages/gerencia/balance-semanal.html
Score actual: 55/100
Modulo: gerencia

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: pass (80%) -- Missing: actions-bar
  * Tables: parcial (50%) -- Missing: table-shell, table-compact, is-header, cell-pad, sortable, sort-icon
  * Buttons: falta (38%) -- Missing: btn-primary, btn-secondary, btn-icon-flat, btn-icon-plus, btn-danger
  * CustomDropdowns: falta (0%) -- Missing: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * Charts: falta (0%) -- Missing: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * Forms: falta (17%) -- Missing: input-compact, form-group, form-label, date-range-inline, date-separator
  * Stats: falta (29%) -- Missing: stats-header, stats-body, stats-compact, stat-item, toggle-icon
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-xs, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 2
  * Cobertura ARIA total: 7 attrs

### Elementos HTML:
  * nativeSelect: 2
  * input: 1
  * button: 3
  * table: 1
  * canvas: 1

### Headings: h1(1) h2(1) h3(4)

### Hints de remediacion (priorizados):
  * HIGH: Reemplazar 2 <select> nativos con .custom-dropdown
  * MED: [Header] Agregar: actions-bar
  * MED: [Tables] Agregar: table-shell, table-compact, is-header, cell-pad, sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-primary, btn-secondary, btn-icon-flat, btn-icon-plus, btn-danger
  * MED: [CustomDropdowns] Agregar: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * LOW: [Charts] Agregar: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * LOW: [Forms] Agregar: input-compact, form-group, form-label, date-range-inline, date-separator
  * LOW: [Stats] Agregar: stats-header, stats-body, stats-compact, stat-item, toggle-icon
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-xs, text-muted, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar balance-semanal.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/balance-semanal.css), refactoriza ahi
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
