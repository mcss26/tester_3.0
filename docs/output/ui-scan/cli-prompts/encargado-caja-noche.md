# Remediacion Golden Standard: encargado-caja-noche.html

## Contexto
Archivo: pages/encargados/encargado-caja-noche.html
Score actual: 35/100
Modulo: encargados

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: parcial (50%) -- Missing: breadcrumb, breadcrumb-item, breadcrumb-link, breadcrumb-sep
  * Header: falta (0%) -- Missing: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * TabSystem: parcial (67%) -- Missing: tab-content
  * Buttons: falta (25%) -- Missing: btn-secondary, btn-ghost, btn-icon, btn-icon-flat, btn-icon-plus, btn-sm
  * Modals: falta (33%) -- Missing: modal, modal-content, modal-content-md, modal-content-lg, modal-close, modal-footer
  * CustomDropdowns: falta (0%) -- Missing: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * Charts: falta (0%) -- Missing: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * Forms: falta (33%) -- Missing: input-compact, form-label, date-range-inline, date-separator
  * Stats: parcial (43%) -- Missing: stats-header, stats-body, stats-compact, toggle-icon
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 3
  * Cobertura ARIA total: 9 attrs

### Elementos HTML:
  * nativeSelect: 3
  * input: 7
  * textarea: 1
  * button: 19
  * form: 4
  * canvas: 1

### Headings: h3(5)

### Hints de remediacion (priorizados):
  * HIGH: Reemplazar 3 <select> nativos con .custom-dropdown
  * HIGH: [Navigation] Agregar: breadcrumb, breadcrumb-item, breadcrumb-link, breadcrumb-sep
  * MED: [Header] Agregar: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * MED: [TabSystem] Agregar: tab-content
  * LOW: [Buttons] Agregar: btn-secondary, btn-ghost, btn-icon, btn-icon-flat, btn-icon-plus, btn-sm
  * MED: [Modals] Agregar: modal, modal-content, modal-content-md, modal-content-lg, modal-close, modal-footer
  * MED: [CustomDropdowns] Agregar: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * LOW: [Charts] Agregar: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * LOW: [Forms] Agregar: input-compact, form-label, date-range-inline, date-separator
  * LOW: [Stats] Agregar: stats-header, stats-body, stats-compact, toggle-icon
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar encargado-caja-noche.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/encargado-caja-noche.css), refactoriza ahi
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
