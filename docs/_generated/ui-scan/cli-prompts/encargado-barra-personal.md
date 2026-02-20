# Remediacion Golden Standard: encargado-barra-personal.html

## Contexto
Archivo: pages/encargados/encargado-barra-personal.html
Score actual: 59/100
Modulo: encargados

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: parcial (67%) -- Missing: page-card
  * Navigation: pass (100%) -- Completo
  * Header: parcial (40%) -- Missing: dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * Sidebar: falta (0%) -- Missing: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * TabSystem: falta (33%) -- Missing: tab-bar, tab-chip
  * Tables: parcial (67%) -- Missing: table-compact, cell-pad, sortable, sort-icon
  * Buttons: parcial (75%) -- Missing: btn-ghost, btn-danger
  * Modals: parcial (67%) -- Missing: modal-content-md, modal-content-lg, modal-title
  * Panels: pass (100%) -- Completo
  * CustomDropdowns: falta (0%) -- Missing: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * Forms: parcial (50%) -- Missing: form-label, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-xs, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 1
  * Cobertura ARIA total: 8 attrs

### Elementos HTML:
  * nativeSelect: 1
  * input: 4
  * button: 14
  * dialog: 2
  * table: 1
  * form: 1
  * aside: 1

### Headings: h2(4) h3(2)

### Hints de remediacion (priorizados):
  * HIGH: Reemplazar 1 <select> nativos con .custom-dropdown
  * HIGH: [Layout] Agregar: page-card
  * MED: [Header] Agregar: dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * MED: [Sidebar] Agregar: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * MED: [TabSystem] Agregar: tab-bar, tab-chip
  * MED: [Tables] Agregar: table-compact, cell-pad, sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-ghost, btn-danger
  * MED: [Modals] Agregar: modal-content-md, modal-content-lg, modal-title
  * MED: [CustomDropdowns] Agregar: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * LOW: [Forms] Agregar: form-label, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-xs, text-muted, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar encargado-barra-personal.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/encargado-barra-personal.css), refactoriza ahi
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
