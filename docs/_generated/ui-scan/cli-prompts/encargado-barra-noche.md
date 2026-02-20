# Remediacion Golden Standard: encargado-barra-noche.html

## Contexto
Archivo: pages/encargados/encargado-barra-noche.html
Score actual: 67/100
Modulo: encargados

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: falta (33%) -- Missing: page-card-wrap, page-card
  * Navigation: pass (100%) -- Completo
  * Header: parcial (40%) -- Missing: dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * Buttons: parcial (62%) -- Missing: btn-ghost, btn-icon-plus, btn-sm
  * Modals: parcial (67%) -- Missing: modal-content-md, modal-content-lg, modal-title
  * Forms: falta (33%) -- Missing: input-compact, form-label, date-range-inline, date-separator
  * Utilities: falta (0%) -- Missing: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 0
  * Cobertura ARIA total: 4 attrs

### Elementos HTML:
  * textarea: 2
  * button: 11
  * dialog: 1

### Headings: h2(6)

### Hints de remediacion (priorizados):
  * HIGH: [Layout] Agregar: page-card-wrap, page-card
  * MED: [Header] Agregar: dashboard-title-soft, dashboard-subtitle-soft, actions-bar
  * LOW: [Buttons] Agregar: btn-ghost, btn-icon-plus, btn-sm
  * MED: [Modals] Agregar: modal-content-md, modal-content-lg, modal-title
  * LOW: [Forms] Agregar: input-compact, form-label, date-range-inline, date-separator
  * LOW: [Utilities] Agregar: u-hidden, u-visible, text-center, text-right, text-xs, text-muted, badge, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar encargado-barra-noche.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/encargado-barra-noche.css), refactoriza ahi
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
