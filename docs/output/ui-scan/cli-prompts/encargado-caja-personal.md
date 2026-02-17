# Remediacion Golden Standard: encargado-caja-personal.html

## Contexto
Archivo: pages/encargados/encargado-caja-personal.html
Score actual: 41/100
Modulo: encargados

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: falta (25%) -- Missing: topbar-start, topbar-end, breadcrumb, breadcrumb-item, breadcrumb-link, breadcrumb-sep
  * Header: falta (0%) -- Missing: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * Sidebar: falta (0%) -- Missing: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * TabSystem: parcial (67%) -- Missing: tab-content
  * Tables: parcial (67%) -- Missing: table-compact, cell-pad, sortable, sort-icon
  * Buttons: parcial (62%) -- Missing: btn-ghost, btn-icon-plus, btn-danger
  * Modals: falta (33%) -- Missing: modal, modal-content, modal-content-md, modal-content-lg, modal-title, modal-close
  * Panels: pass (100%) -- Completo
  * CustomDropdowns: falta (0%) -- Missing: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * Forms: parcial (50%) -- Missing: form-label, date-range-inline, date-separator
  * Stats: falta (29%) -- Missing: stats-header, stats-body, stats-compact, stat-item, toggle-icon
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-xs, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 1
  * Cobertura ARIA total: 0 attrs

### Elementos HTML:
  * nativeSelect: 1
  * input: 3
  * button: 11
  * table: 1
  * form: 1
  * aside: 1

### Headings: h2(1) h3(2)

### Hints de remediacion (priorizados):
  * HIGH: Reemplazar 1 <select> nativos con .custom-dropdown
  * HIGH: [Navigation] Agregar: topbar-start, topbar-end, breadcrumb, breadcrumb-item, breadcrumb-link, breadcrumb-sep
  * MED: [Header] Agregar: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * MED: [Sidebar] Agregar: sidebar-filters, sidebar-section-title, sidebar-section, sidebar-actions, grid-sidebar-main, main-content-area
  * MED: [TabSystem] Agregar: tab-content
  * MED: [Tables] Agregar: table-compact, cell-pad, sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-ghost, btn-icon-plus, btn-danger
  * MED: [Modals] Agregar: modal, modal-content, modal-content-md, modal-content-lg, modal-title, modal-close
  * MED: [CustomDropdowns] Agregar: custom-dropdown, custom-dropdown-trigger, custom-dropdown-menu, custom-dropdown-option, custom-dropdown-text, custom-dropdown-icon
  * LOW: [Forms] Agregar: form-label, date-range-inline, date-separator
  * LOW: [Stats] Agregar: stats-header, stats-body, stats-compact, stat-item, toggle-icon
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-xs, text-muted, badge, badge-quiet
  * MED: Agregar atributos ARIA a elementos interactivos

## Instrucciones

Crea un plan de implementacion para remediar encargado-caja-personal.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/encargado-caja-personal.css), refactoriza ahi
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
