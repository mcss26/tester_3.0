# Roadmap: Remodelación Topbar & Standard UI

Este documento detalla el plan para reformular la barra superior (Topbar) de la aplicación, simplificándola para mejorar la jerarquía visual y la navegación.

## 🎯 Objetivo

Transformar el Topbar en un elemento **puramente navegacional**, moviendo controles operativos (pestañas, filtros, botones de acción) al cuerpo de la página.

**Nuevo Layout Topbar:**

- **Izquierda**: Migas de Pan (Breadcrumbs) alineadas a la izquierda (Home > Section > Page).
- **Derecha**: Nombre del Área (e.g., "ADMIN", "OPERATIVO").
- **Centro**: Vacío.

## 📋 Diagnóstico Actual

Actualmente (`admin-solicitudes.html` como ejemplo), el Topbar contiene:

- Breadcrumbs (Izquierda).
- Pestañas/Filtros de navegación local (Centro).
- Botones de acción y status pills (Derecha).

Esto sobrecarga el Topbar y mezcla "Navegación Global" con "Control Local".

## 🛠 Plan de Acción

### FASE 1: Definición de Estilos (CSS)

- [x] Modificar `.app-topbar` en `assets/css/components.css`.
- [x] Crear clase `.area-brand` para el nombre del área (Izquierda).
- [x] Ajustar `.breadcrumbs` para alineación y estilo minimalista.
- [x] Crear estilos para `page-header` (donde irán los tabs y botones movidos).

### FASE 2: Lógica Navigation Core

- [x] Actualizar `assets/js/core/breadcrumbs.js`:
  - Validar renderizado en contendor alineado a la derecha.
  - Asegurar que el path inverso no confunda al usuario (Home > Section > Page).

### FASE 3: Implementación Piloto (`admin-solicitudes.html`)

- [x] **HTML Refactor**:
  - Limpiar `<header class="app-topbar">`.
  - Insertar `<div class="topbar-right"><span class="area-brand">ADMIN</span></div>`.
  - Mover `#breadcrumbs` a `<div class="topbar-left">`.
  - Mover `#solicitudes-tabs` (filtros) dentro de `.staff-dashboard` / `.page-header`.
  - Mover `#btn-refresh` y Status Pills al header de la página.
- [x] **JS Updates**:
  - Asegurar que los tabs sigan funcionando en su nueva ubicación.

### FASE 4: Despliegue Global (Incremental)

- [ ] Aplicar el patrón a otros módulos clave (`admin-stock`, `admin-master-nomina`, etc.).

## 🧩 Mockup Visual (CSS Grid)

```css
.app-topbar {
  display: flex;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-1);
}

.area-brand {
  font-family: var(--font-brand); /* Oswald/Chakra */
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.1em;
  color: var(--text-1);
  text-transform: uppercase;
}

.topbar-left .breadcrumbs {
  /* Aligned left */
  justify-content: flex-start;
}
```

## ✅ Criterios de Éxito

1.  El Topbar se ve limpio.
2.  La navegación es clara ("Sé dónde estoy").
3.  Los controles operativos están cerca del contenido que controlan.
