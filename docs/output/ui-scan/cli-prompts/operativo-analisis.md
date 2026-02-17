# Remediacion Golden Standard: operativo-analisis.html

## Contexto
Archivo: pages/operativo/operativo-analisis.html
Score actual: 69/100
Modulo: operativo

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: parcial (60%) -- Missing: dashboard-subtitle-soft, actions-bar
  * TabSystem: parcial (67%) -- Missing: tab-content
  * Buttons: falta (25%) -- Missing: btn-ghost, btn-icon, btn-icon-flat, btn-icon-plus, btn-danger, btn-sm
  * Charts: falta (0%) -- Missing: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * Forms: parcial (67%) -- Missing: date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-xs, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 2 attrs

### Elementos HTML:
  * input: 5
  * button: 5
  * canvas: 1

### Headings: h2(1)

### Hints de remediacion (priorizados):
  * MED: [Header] Agregar: dashboard-subtitle-soft, actions-bar
  * MED: [TabSystem] Agregar: tab-content
  * LOW: [Buttons] Agregar: btn-ghost, btn-icon, btn-icon-flat, btn-icon-plus, btn-danger, btn-sm
  * LOW: [Charts] Agregar: chart-section, chart-header, chart-kpis-grid, chart-kpi-card, chart-kpi-label, chart-kpi-value, chart-kpi-trend, chart-canvas-max
  * LOW: [Forms] Agregar: date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-xs, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar operativo-analisis.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/operativo-analisis.css), refactoriza ahi
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
