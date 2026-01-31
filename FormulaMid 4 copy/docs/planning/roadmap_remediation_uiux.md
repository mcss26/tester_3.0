# Roadmap de Remediación UI/UX

> **Fecha**: 2026-01-29
> **Origen**: Auditoría UI/UX admin-modules-audit.md
> **Objetivo**: Eliminar Alien CSS y Blocking UX de módulos barras/qr/pagos

---

## Sprint 1: Módulo Barras (Prioridad Alta)

**ETA**: 4-5 horas | **Archivos**: 6 (3 HTML + 3 JS)

### 1.1 barras/index.html

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 24 | `flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-xl` | `class="dashboard-header"` |
| 26 | `text-xl font-bold` | `class="dashboard-title"` |
| 27 | `text-white/50 text-sm` | `class="dashboard-subtitle"` |
| 29 | `flex gap-2` | `class="actions-bar"` |
| 30 | `btn bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl flex items-center gap-2` | `class="btn btn-secondary"` |
| 34 | `btn btn-primary bg-purple-600 hover:bg-purple-500 font-bold px-6 py-3 rounded-xl flex items-center gap-2` | `class="btn btn-primary"` |
| 43 | `col-span-full text-center text-white/30 py-12` | `class="page-card-loading"` |
| 49 | `flex justify-between items-center mt-4` | `class="section-header"` |
| 50 | `text-lg font-bold text-white/70` | `class="section-title muted"` |
| 53 | `flex flex-col gap-2 opacity-60` | `class="list-stack opacity-60"` |
| 62 | `text-xl font-bold` | `class="modal-title"` |
| 79 | `flex gap-3 justify-end mt-4` | `class="modal-actions"` |
| 80 | `text-white/50 hover:text-white px-4` | `class="btn btn-ghost"` |
| 81 | `bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-500` | `class="btn btn-primary"` |

### 1.2 barras/session.html

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 39 | `input w-auto text-xs py-1` | `input input-compact` |
| 44 | `w-full text-left text-sm` | `table` |
| 45 | `bg-[#1c1c1e]` | `var(--surface-1)` → agregar clase |
| 57 | `p-4 border-t border-white/10 bg-white/5 flex justify-end gap-4` | `panel-footer` |
| 58 | `btn btn-primary bg-purple-600...` | `btn btn-primary` |
| 65 | `hidden flex-col gap-6` | `hidden stack-lg` |
| 67 | `grid grid-cols-2 md:grid-cols-4 gap-4` | `kpi-grid` |
| 85 | `w-full text-left text-sm` | `table` |
| 112-114 | Modal buttons | `btn btn-ghost` / `btn btn-primary` |

### 1.3 barras/recipes.html

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 23 | `flex justify-between items-center mb-6` | `filter-bar` |
| 24 | Input con Tailwind | `input filter-input` |
| 25 | Button con Tailwind | `btn btn-primary` |
| 32 | `w-full text-left text-sm` | `table` |
| 70 | `text-xs text-purple-400...` | `btn btn-link btn-sm` |
| 75-77 | Modal buttons | `modal-actions` + `btn` classes |
| 84 | `flex gap-2 items-center` | `ingredient-row` (crear clase) |

### 1.4 bar-dashboard.js

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 25 | `alert('No hay una Jornada...')` | `window.Toast.warning('...')` |
| 165 | `alert('Error al abrir sesión: '...)` | `window.Toast.error('...')` |

### 1.5 bar-session.js

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 14 | `alert("ID de sesión requerido")` | `window.Toast.error(...); return;` |
| 64 | `alert("Sesión no encontrada")` | `window.Toast.error(...)` |
| 170 | `confirm("¿Confirmas...?")` | Modal con `showConfirmModal()` |
| 189 | `confirm("¿Guardar inventario VACÍO?")` | Modal |
| 211 | `alert("Barra Cerrada...")` | `window.Toast.success(...)` |
| 214 | `alert("Apertura Guardada.")` | `window.Toast.success(...)` |
| 220, 254 | `alert("Error: "...)` | `window.Toast.error(...)` |
| 249 | `alert("Ventas importadas...")` | `window.Toast.success(...)` |

### 1.6 bar-recipes.js

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 120 | `alert("Nombre requerido")` | `window.Toast.warning(...)` |
| 134 | `alert("Debe tener al menos 1...")` | `window.Toast.warning(...)` |
| 156 | `alert("Error al guardar: "...)` | `window.Toast.error(...)` |

---

## Sprint 2: Módulo QR (Prioridad Media)

**ETA**: 3-4 horas | **Archivos**: 6 (3 HTML + 3 JS)

### 2.1 qr/index.html

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 12 | `h-[60px] flex items-center...` | `app-topbar` |
| 13 | `flex items-center gap-4` | `topbar-left` |
| 51 | `text-xl font-bold mb-4` | `section-title` |
| 74 | `mt-8` | Eliminar, agregar margin en CSS |
| 75 | `text-xl font-bold mb-4` | `section-title` |
| 76 | `grid gap-2` | `list-stack` |

### 2.2 qr/generator.html

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 15 | `h-[60px] flex items-center...` | `app-topbar` |
| 16 | `flex items-center gap-4` | `topbar-left` |
| (etc.) | Migrar todo el contenido | Usar `page-card-wrap`, `form-group` |

### 2.3 qr/monitor.html

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 12-13 | Topbar con Tailwind | `app-topbar` estándar |
| 28 | `max-w-[800px] mx-auto...` | `page-shell` |
| 32-34 | KPI layout | `kpi-grid` |
| 37 | `h-3 w-full bg-white/5...` | `progress-bar` (crear clase) |
| 56-57 | Grid layout | `kpi-grid` |
| 59 | Loading text | `page-card-loading` |

### 2.4 qr-generator.js

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 64 | `confirm(\`¿Confirmas generar...\`)` | Modal de confirmación |
| 85 | `alert('Error: '...)` | `window.Toast.error(...)` |
| 130 | `alert('Ingresa un nombre...')` | `window.Toast.warning(...)` |
| 134 | `alert('Para ventas debes...')` | `window.Toast.warning(...)` |

### 2.5 qr-dashboard.js

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 125 | `alert('Funcionalidad de detalle...')` | `window.Toast.info(...)` |

---

## Sprint 3: Cleanup Admin Pagos (Prioridad Baja)

**ETA**: 1-2 horas | **Archivos**: 3

### 3.1 admin-pagos.js

Todos son fallbacks condicionales `window.Toast ? ... : alert(...)`. 

**Acción**: Eliminar fallback `alert()` - asumir que Toast siempre existe.

| Líneas | Cambio |
|:-------|:-------|
| 430, 441, 470, 520, 531, 545, 586, 603, 655, 720 | `window.Toast.error(...)` directo |

### 3.2 admin-workdays.js

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 396 | `confirm(htmlMessage.replace...)` | Usar `#confirmModal` existente |

### 3.3 admin-master-tarifario.js

| Línea | Problema | Reemplazo |
|:------|:---------|:----------|
| 218 | `confirm('¿Estás seguro de eliminar?')` | Modal de confirmación |

---

## Clases CSS a Agregar en components.css

```css
/* Sprint 1 - Barras */
.list-stack { display: flex; flex-direction: column; gap: var(--space-2); }
.stack-lg { display: flex; flex-direction: column; gap: var(--space-6); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-4); }
.section-title.muted { color: var(--text-3); }
.panel-footer { padding: var(--space-4); border-top: 1px solid var(--border); background: var(--surface-2); display: flex; justify-content: flex-end; gap: var(--space-4); }
.ingredient-row { display: flex; gap: var(--space-2); align-items: center; }

/* Sprint 2 - QR */
.progress-bar { height: 0.75rem; width: 100%; background: var(--surface-2); border-radius: var(--radius-full); overflow: hidden; }
.progress-bar-fill { height: 100%; background: var(--accent); transition: width 0.3s ease; }
```

---

## Orden de Ejecución

1. [ ] Agregar clases CSS en `components.css`
2. [ ] Migrar `barras/index.html`
3. [ ] Migrar `barras/session.html`
4. [ ] Migrar `barras/recipes.html`
5. [ ] Limpiar `bar-dashboard.js`
6. [ ] Limpiar `bar-session.js`
7. [ ] Limpiar `bar-recipes.js`
8. [ ] Verificar Sprint 1 en browser
9. [ ] Migrar `qr/index.html`
10. [ ] Migrar `qr/generator.html`
11. [ ] Migrar `qr/monitor.html`
12. [ ] Limpiar `qr-generator.js`, `qr-dashboard.js`
13. [ ] Verificar Sprint 2 en browser
14. [ ] Cleanup `admin-pagos.js`
15. [ ] Cleanup `admin-workdays.js`, `admin-master-tarifario.js`
16. [ ] QA Final

---

## Métricas de Éxito

| Métrica | Antes | Después |
|:--------|:------|:--------|
| Clases Tailwind | 78+ | 0 |
| alert() calls | 33+ | 0 |
| confirm() calls | 6+ | 0 |
| Módulos conformes | 10/18 | 18/18 |
