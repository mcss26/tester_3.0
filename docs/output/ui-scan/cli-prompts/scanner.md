# Remediacion Golden Standard: scanner.html

## Contexto
Archivo: pages/operativo/scanner.html
Score actual: 53/100
Modulo: operativo

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: falta (33%) -- Missing: page-card-wrap, page-card
  * Navigation: pass (100%) -- Completo
  * Header: falta (0%) -- Missing: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * Buttons: parcial (50%) -- Missing: btn-ghost, btn-icon, btn-icon-flat, btn-icon-plus
  * Forms: falta (17%) -- Missing: input-compact, form-group, form-label, date-range-inline, date-separator
  * Stats: falta (29%) -- Missing: stats-header, stats-body, stats-compact, stat-item, toggle-icon
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 5 attrs

### Elementos HTML:
  * input: 1
  * button: 3

### Headings: h2(1) h3(2)

### Hints de remediacion (priorizados):
  * HIGH: [Layout] Agregar: page-card-wrap, page-card
  * MED: [Header] Agregar: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * LOW: [Buttons] Agregar: btn-ghost, btn-icon, btn-icon-flat, btn-icon-plus
  * LOW: [Forms] Agregar: input-compact, form-group, form-label, date-range-inline, date-separator
  * LOW: [Stats] Agregar: stats-header, stats-body, stats-compact, stat-item, toggle-icon
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-muted, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar scanner.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/scanner.css), refactoriza ahi
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
