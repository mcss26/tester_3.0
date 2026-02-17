# Remediacion Golden Standard: admin-workdays.html

## Contexto
Archivo: pages/admin/admin-workdays.html
Score actual: 64/100
Modulo: admin

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: pass (100%) -- Completo
  * Metrics: pass (100%) -- Completo
  * Sidebar: falta (0%) -- Missing: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * TabSystem: pass (100%) -- Completo
  * Tables: pass (83%) -- Missing: sortable, sort-icon
  * Buttons: parcial (75%) -- Missing: btn-icon-flat, btn-icon-plus
  * Modals: parcial (44%) -- Missing: modal, modal-content, modal-content-md, modal-content-lg, modal-close
  * Panels: parcial (71%) -- Missing: panel-close, panel-footer
  * CustomDropdowns: falta (0%) -- Missing: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * Charts: falta (0%) -- Missing: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * Forms: parcial (50%) -- Missing: input-compact, date-range-inline, date-separator
  * Stats: falta (29%) -- Missing: stats-header, stats-body, stats-compact, stat-item, toggle-icon
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-muted, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 2
  * Native select sin custom-dropdown: 5
  * Cobertura ARIA total: 34 attrs

### Elementos HTML:
  * nativeSelect: 5
  * input: 18
  * textarea: 2
  * button: 36
  * table: 9
  * canvas: 1
  * aside: 1

### Headings: h2(14) h3(8) h4(2)

### Hints de remediacion (priorizados):
  * HIGH: Reemplazar 5 <select> nativos con .custom-dropdown
  * HIGH: Eliminar 2 inline style= atributos
  * MED: [Sidebar] Agregar: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * MED: [Tables] Agregar: sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-icon-flat, btn-icon-plus
  * MED: [Modals] Agregar: modal, modal-content, modal-content-md, modal-content-lg, modal-close
  * LOW: [Panels] Agregar: panel-close, panel-footer
  * MED: [CustomDropdowns] Agregar: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * LOW: [Charts] Agregar: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * LOW: [Forms] Agregar: input-compact, date-range-inline, date-separator
  * LOW: [Stats] Agregar: stats-header, stats-body, stats-compact, stat-item, toggle-icon
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-muted, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar admin-workdays.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/admin-workdays.css), refactoriza ahi
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
