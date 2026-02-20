# Remediacion Golden Standard: admin-central-stock.html

## Contexto
Archivo: pages/admin/admin-central-stock.html
Score actual: 91/100
Modulo: admin

## Estado actual del componente

### Compliance por categoria (solo relevantes):
  * Layout: pass (100%) -- Completo
  * Navigation: pass (100%) -- Completo
  * Header: parcial (40%) -- Missing: dashboard-title, dashboard-title-soft, dashboard-subtitle-soft
  * Metrics: pass (100%) -- Completo
  * Sidebar: pass (100%) -- Completo
  * TabSystem: pass (100%) -- Completo
  * FilterBar: parcial (75%) -- Missing: pill, is-active
  * Tables: pass (100%) -- Completo
  * Buttons: pass (88%) -- Missing: btn-danger
  * Modals: parcial (78%) -- Missing: modal-content-md, modal-content-lg
  * Panels: pass (100%) -- Completo
  * CustomDropdowns: pass (100%) -- Completo
  * Charts: pass (100%) -- Completo
  * Dropbox: pass (80%) -- Missing: dropbox-subtitle
  * Forms: pass (83%) -- Missing: input-compact
  * Stats: pass (100%) -- Completo
  * Utilities: falta (0%) -- Missing: u-visible, text-xs, badge-quiet

### Anti-patrones detectados:
  * Inline styles: 0
  * Native select sin custom-dropdown: 8
  * Cobertura ARIA total: 78 attrs

### Elementos HTML:
  * nativeSelect: 8
  * input: 22
  * textarea: 1
  * button: 35
  * dialog: 2
  * table: 6
  * form: 1
  * canvas: 2
  * aside: 3

### Headings: h3(10) h4(2)

### Hints de remediacion (priorizados):
  * MED: [Header] Agregar: dashboard-title, dashboard-title-soft, dashboard-subtitle-soft
  * LOW: [FilterBar] Agregar: pill, is-active
  * LOW: [Buttons] Agregar: btn-danger
  * MED: [Modals] Agregar: modal-content-md, modal-content-lg
  * LOW: [Dropbox] Agregar: dropbox-subtitle
  * LOW: [Forms] Agregar: input-compact
  * LOW: [Utilities] Agregar: u-visible, text-xs, badge-quiet

## Instrucciones

Crea un plan de implementacion para remediar admin-central-stock.html al Golden Standard.

### Reglas:
1. Consulta docs/ui-golden-standard.md como referencia absoluta
2. Referencia de implementacion: pages/admin/admin-central-stock.html
3. Solo modifica HTML y CSS. NO toques logica JS (Supabase, state, event handlers)
4. Usa clases de components.css, no inventes clases nuevas
5. Si la pagina tiene CSS propio (ej: assets/css/admin-central-stock.css), refactoriza ahi
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
