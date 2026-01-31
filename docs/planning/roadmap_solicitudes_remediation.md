# Plan de Remediación: Módulo de Solicitudes

> **Fecha de Auditoría**: 2026-01-29
> **Estado Actual**: 🟢 APROBADO CON OBSERVACIONES
> **Score**: 8.5/10
> **Archivos Auditados**: operativo-solicitudes.js, admin-solicitudes.js, HTML asociados

---

El módulo de solicitudes ha sido remediado en sus puntos críticos y de alta prioridad. Se han corregido vulnerabilidades XSS, estandarizado el código al "Golden Standard" y optimizado el rendimiento.

---

## 🚨 Prioridad CRÍTICA (Hacer Ahora)

### 1. Fix XSS en operativo-solicitudes.js
**Impacto**: Seguridad
**Esfuerzo**: 15 minutos
**Blocker**: Sí (antes de producción)

**Problema**: Valores de base de datos se insertan sin sanitización en el DOM.

**Archivos**:
- `assets/js/modules/operativo/operativo-solicitudes.js`

**Líneas afectadas**:
- Línea 230: `${item.master_sku?.nombre || 'Unknown'}`
- Línea 231: Template literal con pack_qty
- Línea 456: `${grp.supplierName}`

**Solución**:
```javascript
// ANTES (línea 230)
<div class="cell-strong">${item.master_sku?.nombre || 'Unknown'}</div>

// DESPUÉS
<div class="cell-strong">${window.Utils.escapeHtml(item.master_sku?.nombre || 'Unknown')}</div>
```

**Aplicar en**:
1. Nombres de SKU (renderSkuTable)
2. Nombres de proveedor (renderSkuTable y renderSupplierTable)
3. Cualquier otro string dinámico de BD

- [x] Probar con nombre malicioso: `<script>alert('XSS')</script>`
- [x] Verificar que se renderiza como texto, no ejecuta
- [x] Comparar con admin-solicitudes que ya usa escapeHtml correctamente
🟢 **COMPLETADO** (2026-01-29)

---

### 2. Verificar CSS "Alien" en admin-solicitudes.js
**Impacto**: UI Consistency
**Esfuerzo**: 5 minutos
**Blocker**: Menor

**Problema**: Uso de clases tipo Tailwind no estándar del proyecto.

**Ubicación**: `assets/js/modules/admin/admin-solicitudes.js:735`

```javascript
<div class="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
```

**Acción**:
1. Buscar en `assets/css/main.css` y `assets/css/components.css` si existen:
   - `.grid`, `.grid-cols-2`, `.gap-y-4`, `.gap-x-6`
2. **Si NO existen**: Reemplazar con CSS semántico:
   ```html
   <div class="detail-grid">
     <!-- Definir .detail-grid en components.css -->
   ```
3. **Si existen**: Marcar como validado ✅

- [x] Verificar visualmente que el layout del panel no se rompa
- [x] Documentar resultado en admin-solicitudes-audit.md
🟢 **COMPLETADO** (2026-01-29) - Creada clase `.detail-grid` en `components.css`.

---

## ⚠️ Prioridad ALTA (Próximo Sprint)

### 3. Refactorizar operativo-solicitudes.js a patrón Golden Standard
**Impacto**: Mantenibilidad
**Esfuerzo**: 2-3 horas
**Blocker**: No

**Objetivo**: Alinear con el patrón IIFE + objeto `ui` que usa admin-solicitudes.

**Cambios requeridos**:

#### 3.1 Wrapper IIFE
```javascript
// ACTUAL (línea 1)
document.addEventListener('DOMContentLoaded', async () => {

// PROPUESTO
(async function() {
  'use strict';
  // código aquí
})();
```

#### 3.2 Objeto UI centralizado
```javascript
// ACTUAL (líneas 2-11)
const skuListContainer = document.getElementById('sku-list-container');
const supplierListContainer = document.getElementById('supplier-list-container');
// ... variables sueltas

// PROPUESTO
const ui = {
  containers: {
    skuList: document.getElementById('sku-list-container'),
    supplierList: document.getElementById('supplier-list-container'),
  },
  modals: {
    adjust: document.getElementById('modal-adjust'),
  },
  controls: {
    tabs: document.querySelectorAll('[data-tab]'),
  }
};
```

#### 3.3 Estado centralizado
```javascript
// ACTUAL (líneas 18-20)
let currentRequestId = null;
let providersMap = [];
let pendingAdjustmentItemId = null;

// PROPUESTO
const state = {
  currentRequestId: null,
  providers: [],
  items: [],
  orders: {},
  ui: {
    activeTab: 'sku-table',
    pendingAdjustmentItemId: null
  }
};
```

- [x] Todos los tests manuales pasan
- [x] No hay regresiones en funcionalidad
- [x] Código más legible para próximos devs
🟢 **COMPLETADO** (2026-01-29) - Implementado patrón IIFE, `ui` y `state`.

---

### 4. Eliminar duplicación en mapeo de estados
**Impacto**: DRY Principle
**Esfuerzo**: 1 hora
**Blocker**: No

**Problema**: Lógica de status badges repetida en múltiples lugares.

**Archivos afectados**:
- `operativo-solicitudes.js` líneas 214-220, 501-511, 509-512
- `admin-solicitudes.js` líneas 489-492

**Solución**: Crear helper unificado en `core/utils.js`

```javascript
// Agregar a window.Utils
window.Utils.renderStatusBadge = function(statusUI) {
  const config = {
    pendiente: { class: 'status-warning', label: 'PENDIENTE' },
    enviado: { class: 'status-info', label: 'ENVIADO' },
    aprobado: { class: 'status-success', label: 'APROBADO' },
    recibido: { class: 'status-success', label: 'RECIBIDO' },
    ready_for_approval: { class: 'status-warning', label: 'LISTO PARA APROBAR' },
    draft: { class: 'status-info', label: 'BORRADOR' }
  };

  const status = config[statusUI] || { class: 'status-neutral', label: statusUI.toUpperCase() };
  return `<span class="status-pill ${status.class}">${status.label}</span>`;
};
```

**Aplicar en**:
1. operativo-solicitudes.js líneas 254-256
2. operativo-solicitudes.js líneas 509-526
3. admin-solicitudes.js líneas 489-492

- [x] Todos los badges se renderizan correctamente
- [x] Estados custom no rompen la función
- [x] Reducer de ~40 líneas de código duplicado
🟢 **COMPLETADO** (2026-01-29) - Helper `window.Utils.renderStatusBadge` creado.

---

### 5. Agregar validación de fechas pasadas
**Impacto**: UX + Data Quality
**Esfuerzo**: 30 minutos
**Blocker**: No

**Problema**: Sistema permite fechas ETA en el pasado sin advertencia.

**Ubicación**: `operativo-solicitudes.js` función `onDateChange()` línea 289

**Solución**:
```javascript
async function onDateChange(e) {
  const input = e.target;
  const newDate = input.value;

  // NUEVO: Validar fecha pasada
  if (newDate) {
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      window.Toast.warning('⚠️ Fecha de entrega es en el pasado');
    }
  }

  // ... resto del código
}
```

**También aplicar en**:
- Inputs de fecha en vista "Por Proveedor" (línea 522-523)

- [x] Warning aparece cuando se selecciona fecha pasada
- [x] No bloquea guardado (es warning, no error)
- [x] Toast desaparece automáticamente
🟢 **COMPLETADO** (2026-01-29)

---

## 📋 Prioridad MEDIA (Backlog Q1)

### 6. Centralizar strings hardcodeados
**Impacto**: i18n + Mantenibilidad
**Esfuerzo**: 1 hora

**Crear**: `assets/js/core/constants.js`

```javascript
window.Constants = {
  LABELS: {
    UNKNOWN_SKU: 'Producto Desconocido',
    UNKNOWN_SUPPLIER: 'Proveedor Desconocido',
    NO_SUPPLIER: 'Sin Proveedor',
    UNASSIGNED: 'Sin Asignar',
    NO_DATA: 'Sin datos'
  },

  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    DRAFT: 'draft',
    READY_FOR_APPROVAL: 'ready_for_approval'
  },

  MESSAGES: {
    LOADING: 'Cargando...',
    NO_ITEMS: 'No hay items para mostrar',
    ERROR_GENERIC: 'Ha ocurrido un error',
    CONFIRM_ACTION: '¿Confirmar acción?'
  }
};
```

**Reemplazar en**:
- operativo-solicitudes.js: "Unknown" (230), "Sin Proveedor" (456)
- admin-solicitudes.js: "Unknown" (246), "Desconocido" (458), "Sin asignar" (235)

**Beneficio**: Facilita futura traducción a inglés/portugués.

---

### 7. Optimizar queries con Promise.all
**Impacto**: Performance
**Esfuerzo**: 30 minutos

**Problema**: Queries secuenciales innecesarios en `loadSkuTable()`

**Actual** (operativo-solicitudes.js líneas 127-164):
```javascript
const { data: items } = await window.sb.from('replenishment_items').select(...);
// Espera...
const { data: stocks } = await window.sb.from('vw_stock_global').select(...);
// Espera...
const { data: orders } = await window.sb.from('replenishment_supplier_orders').select(...);
```

**Optimizado**:
```javascript
const { data: items } = await window.sb.from('replenishment_items').select(...);

const skuIds = items.map(i => i.sku_id).filter(Boolean);
const orderIds = items.map(i => i.supplier_order_id).filter(Boolean);

// Paralelizar queries independientes
const [stocksResult, ordersResult] = await Promise.all([
  window.sb.from('vw_stock_global').select('*').in('sku_id', skuIds),
  window.sb.from('replenishment_supplier_orders').select('*').in('id', orderIds)
]);

const stockMap = {};
(stocksResult.data || []).forEach(s => stockMap[s.sku_id] = s);

const orderMap = {};
(ordersResult.data || []).forEach(o => orderMap[o.id] = o);
```

**Ganancia**: ~200-300ms por carga en conexiones lentas.
🟢 **COMPLETADO** (2026-01-29) - Implementado en `operativo-solicitudes.js`.

---

### 8. Implementar debouncing en date inputs
**Impacto**: Performance + UX
**Esfuerzo**: 20 minutos

**Problema**: Cada cambio de fecha dispara request inmediato.

**Solución**:
```javascript
// En core/utils.js, agregar:
window.Utils.debounce = function(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// En operativo-solicitudes.js
const debouncedDateChange = window.Utils.debounce(onDateChange, 500);
document.querySelectorAll('.js-date').forEach(el =>
  el.addEventListener('change', debouncedDateChange)
);
```

**Beneficio**: Evita múltiples requests si usuario ajusta fecha varias veces.
🟢 **COMPLETADO** (2026-01-29) - Implementado en `operativo-solicitudes.js`.

---

## 📊 Prioridad BAJA (Backlog Q2)

### 9. Mejorar feedback de loading en operativo
**Impacto**: UX Polish
**Esfuerzo**: 1 hora

**Objetivo**: Alinear con sistema de estados de admin-solicitudes.

**Actual**:
```javascript
skuListContainer.innerHTML = '<div class="empty-state">Cargando...</div>';
```

**Propuesto**: Usar mismo sistema que admin con spinner animado.

---

### 10. Implementar tests automatizados
**Impacto**: Calidad a largo plazo
**Esfuerzo**: 4-6 horas

**Crear**:
- `tests/unit/utils.test.js` - Testear calcReplenishment, mapSolicitudEstadoUI
- `tests/integration/solicitudes.test.js` - Flujos críticos E2E

**Framework sugerido**: Vitest + Testing Library

---

### 11. Logging centralizado para errores
**Impacto**: Debugging + Monitoring
**Esfuerzo**: 2 horas

**Problema**: `console.error()` dispersos, difícil trackear errores en producción.

**Solución**: Crear `core/logger.js` con integración a Sentry/Rollbar.

---

## 📅 Timeline Propuesto

| Semana | Acciones | Responsable | Validación |
|:-------|:---------|:------------|:-----------|
| **Semana 1** | Items 1-2 (Críticos) | Dev + QA | Auditoría de seguridad |
| **Semana 2-3** | Items 3-5 (Alta) | Dev | Code review + tests manuales |
| **Semana 4-6** | Items 6-8 (Media) | Dev | Performance benchmarks |
| **Q2** | Items 9-11 (Baja) | Según capacidad | Tests automatizados |

---

## ✅ Criterios de Aceptación

### Para marcar remediación como COMPLETA:
- [x] **Seguridad**: Zero vulnerabilidades XSS detectadas
- [ ] **Consistencia**: Ambos módulos usan mismo patrón (IIFE + ui object)
- [ ] **Performance**: Tiempo de carga < 500ms (3G)
- [ ] **Mantenibilidad**: DRY score > 90% (sin duplicación crítica)
- [ ] **Documentación**: Docs actualizadas con cambios

### Métricas de Éxito:
- Score de auditoría: **8.5/10 → 9.5/10**
- Bugs reportados post-deploy: **< 2 en primer mes**
- Satisfacción de equipo dev: **NPS > 8**

---

## 🔗 Referencias

- [Auditoría Original](../qa/admin-solicitudes-audit.md)
- [Guía de Módulos](../architecture/standard-module-guide.md)
- [Estándares UI](../architecture/ui-standards.md)
- [operativo-solicitudes.js](../../assets/js/modules/operativo/operativo-solicitudes.js)
- [admin-solicitudes.js](../../assets/js/modules/admin/admin-solicitudes.js)

---

## 📝 Notas de Implementación

### Para Desarrolladores:
1. Crear branch: `fix/solicitudes-remediation`
2. Aplicar fixes en orden de prioridad
3. Commit atómicos por cada item
4. PR individual para críticos, agrupados para alta/media
5. Pedir code review antes de merge a main

### Para QA:
1. Validar cada item según checklist
2. Probar en staging antes de prod
3. Monitorear métricas post-deploy
4. Reportar regresiones inmediatamente

---

**Última Actualización**: 2026-01-29
**Próxima Revisión**: 2026-02-05 (post-fixes críticos)
