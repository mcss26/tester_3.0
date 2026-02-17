# Remediacion Golden Standard: staff-caja-index.html

## Contexto
Archivo: pages/staff/staff-caja-index.html
Score actual: 49/100
Modulo: staff

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: parcial (75%) -- Missing: breadcrumb-link, breadcrumb-sep
  * Header: falta (0%) -- Missing: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * Buttons: parcial (50%) -- Missing: btn-secondary, btn-icon-flat, btn-icon-plus, btn-danger
  * Charts: falta (0%) -- Missing: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * Forms: falta (17%) -- Missing: input-compact, form-group, form-label, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-right, text-xs, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 1 attrs

### Elementos HTML:
  * input: 2
  * button: 4
  * form: 1
  * canvas: 1

### Headings: h3(1)

### Hints de remediacion (priorizados):
  * HIGH: [Navigation] Agregar: breadcrumb-link, breadcrumb-sep
  * MED: [Header] Agregar: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * LOW: [Buttons] Agregar: btn-secondary, btn-icon-flat, btn-icon-plus, btn-danger
  * LOW: [Charts] Agregar: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * LOW: [Forms] Agregar: input-compact, form-group, form-label, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-right, text-xs, text-muted, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar staff-caja-index.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/staff-caja-index.css), refactoriza ahi
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
