# Ficha de Remediación: encargado-caja-noche.html

## 1. Diagnóstico Actual
- **Dependencias**: Carga `components.css` (legacy) en lugar de `swiss-style.css`.
- **Clases Locales/Legacy**:
    - `.btn-danger-text`, `.btn-action`, `.btn-danger-outline` (No existen en el nuevo sistema).
    - `.label-xs`, `.label-sm`, `.label-lg`, `.value-sm` (Nomenclatura inconsistente con Swiss Style).
    - `.terminal-card`, `.terminal-header`, `.terminal-total` (Estilos estructurales embebidos en el JS).
- **Lógica JS**: 
    - Manipula visibilidad con `.hidden` y `.is-visible`.
    - Genera markup dinámico con clases de `components.css`.
    - Signature Pad usa `strokeStyle = '#fff'` (Hardcoded).
- **Modales**: Usa estructura legacy de `components.css` (`.modal-overlay` + `.modal-shell`).

## 2. Plan de Acción (Fase 2)
- **Infraestructura**:
    - Cambiar link de `components.css` por `swiss-style.css`.
    - Agregar link a `pages/encargado-noche.css`.
- **Layout**:
    - Migrar `.staff-dashboard` y `.stat-row` al nuevo archivo de página.
    - Estandarizar `.page-shell` y contenedores.
- **Componentes**:
    - Reemplazar botones por variantes Swiss (`btn-primary`, `btn-secondary`, `btn-danger`).
    - Mapear etiquetas de texto (`label-sm` -> `text-tertiary`, etc.).
- **JS Refactor (Visual only)**:
    - Actualizar el template literal en `renderDashboard()` para usar las nuevas clases.
    - Cambiar el color del Signature Pad por una variable CSS o token.
    - Sincronizar el manejo de clases de Modales con el Golden Standard.

## 3. Riesgos
- **Interrupción de Realtime**: No tocar la lógica de suscripción a Supabase.
- **IDs**: Mantener intactos todos los IDs (`stat-total-cash`, `btn-close-night-init`, etc.) para no romper la lógica de negocio.
