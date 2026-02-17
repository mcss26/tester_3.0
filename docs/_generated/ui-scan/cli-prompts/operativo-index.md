# Remediacion Golden Standard: operativo-index.html

## Contexto
Archivo: pages/operativo/operativo-index.html
Score actual: 53/100
Modulo: operativo

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: falta (33%) -- Missing: page-card-wrap, page-card
  * Navigation: parcial (75%) -- Missing: breadcrumb-link, breadcrumb-sep
  * Header: pass (80%) -- Missing: actions-bar
  * FilterBar: falta (12%) -- Missing: sku-filter-bar, pill-group, pill, is-active, search-input-wrap, filter-counter, filter-spacer
  * Forms: falta (0%) -- Missing: input, input-compact, form-group, form-label, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 9 attrs

### Elementos HTML:
  * input: 1
  * button: 1

### Headings: h2(1)

### Hints de remediacion (priorizados):
  * HIGH: [Layout] Agregar: page-card-wrap, page-card
  * HIGH: [Navigation] Agregar: breadcrumb-link, breadcrumb-sep
  * MED: [Header] Agregar: actions-bar
  * LOW: [FilterBar] Agregar: sku-filter-bar, pill-group, pill, is-active, search-input-wrap, filter-counter, filter-spacer
  * LOW: [Forms] Agregar: input, input-compact, form-group, form-label, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar operativo-index.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/operativo-index.css), refactoriza ahi
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
