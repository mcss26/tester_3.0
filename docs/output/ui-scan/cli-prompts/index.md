# Remediacion Golden Standard: index.html

## Contexto
Archivo: pages/prototypes/lab-workdays-night/index.html
Score actual: 0/100
Modulo: prototypes

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: falta (0%) -- Missing: page-shell, page-card-wrap, page-card
  * Navigation: falta (0%) -- Missing: topbar, topbar-start, topbar-center, topbar-end, breadcrumb, breadcrumb-item, breadcrumb-link, breadcrumb-sep
  * Header: falta (0%) -- Missing: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * Tables: falta (0%) -- Missing: table-viewport, table-shell, table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 16 attrs

### Elementos HTML:
  * textarea: 1
  * button: 9
  * table: 3

### Headings: h1(1)

### Hints de remediacion (priorizados):
  * HIGH: [Layout] Agregar: page-shell, page-card-wrap, page-card
  * HIGH: [Navigation] Agregar: topbar, topbar-start, topbar-center, topbar-end, breadcrumb, breadcrumb-item, breadcrumb-link, breadcrumb-sep
  * MED: [Header] Agregar: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * MED: [Tables] Agregar: table-viewport, table-shell, table-scroll, table, table-sticky, table-compact, table-head, table-cell, is-header, cell-pad, sortable, sort-icon

## Instrucciones

Crea un plan de implementacion para remediar index.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/index.css), refactoriza ahi
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
