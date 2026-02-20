# Remediacion Golden Standard: encargado-recepcion.html

## Contexto
Archivo: pages/encargados/encargado-recepcion.html
Score actual: 75/100
Modulo: encargados

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: parcial (67%) -- Missing: page-card
  * Navigation: pass (100%) -- Completo
  * Header: falta (0%) -- Missing: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * Tables: pass (83%) -- Missing: sortable, sort-icon
  * Buttons: parcial (50%) -- Missing: btn-ghost, btn-icon-plus, btn-danger, btn-sm
  * Modals: pass (89%) -- Missing: modal-content-md
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-xs, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 4 attrs

### Elementos HTML:
  * button: 5
  * dialog: 1
  * table: 1

### Headings: h3(1)

### Hints de remediacion (priorizados):
  * HIGH: [Layout] Agregar: page-card
  * MED: [Header] Agregar: dashboard-header, dashboard-title, dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * MED: [Tables] Agregar: sortable, sort-icon
  * LOW: [Buttons] Agregar: btn-ghost, btn-icon-plus, btn-danger, btn-sm
  * MED: [Modals] Agregar: modal-content-md
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-xs, text-muted, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar encargado-recepcion.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/encargado-recepcion.css), refactoriza ahi
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
