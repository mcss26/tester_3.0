# Checklist de Cierre: admin-workdays

> Generado automáticamente basado en la auditoría `docs/qa/admin-workdays-audit.md` y los skills `frontend-developer` y `logic-engineer`.
> **Fecha de Auditoría**: 2026-01-29 | **Score Actual**: 7.5/10 🟡

---

## 🚨 1. BLOCKERS (Antes de Deploy)

### XSS Crítico
- [x] **L284**: Escapar nombre de rol → `${window.Utils.escapeHtml(role.name)}`
- [x] **L168**: Escapar notas → `${window.Utils.escapeHtml(item.notes) || '-'}`

### Event Handlers Inline
- [x] **L199, L211**: Eliminar `onclick=` → Usar event delegation con `data-action` y `data-id`
- [x] Eliminar objeto global `window.WorkDayActions` (L88-99)
- [x] Agregar listener centralizado en `bindEvents()` para `.js-close-day` y `.js-open-day`

---

## ⚠️ 2. Alta Prioridad (Próximo Sprint)

### Validación de Inputs
- [x] **L308-310**: Validar fecha no esté en pasado
- [x] **L308-310**: Validar fecha no sea mayor a 90 días adelante
- [x] **L332-337**: Validar `quantity` entre 1 y 100
- [x] **L332-337**: Validar que `data-rate` no sea NaN o negativo

### CSS Alien → Clases Semánticas
- [x] **L233**: Reemplazar `flex items-baseline gap-1` → `.stat-row`
- [x] **L282**: Reemplazar `flex items-center justify-between` → `.role-card`
- [x] **L283**: Reemplazar `flex flex-col` → `.role-info`
- [x] Agregar clases a `assets/css/components.css`:
  ```css
  .stat-row { display: flex; align-items: baseline; gap: 0.25rem; }
  .role-card { display: flex; align-items: center; justify-content: space-between; }
  .role-info { display: flex; flex-direction: column; }
  ```

---

## 3. Media Prioridad (Backlog)

### Modal Confirmation
- [ ] **L414-422**: Reemplazar clone hack con `AbortController`

### Refactorización de Código
- [ ] **L140-193**: Separar `renderTable()` en funciones más pequeñas (`renderRow`, `showEmptyState`)

---

## 4. Estándares Globales ✓ Verificados

### Arquitectura (OK)
- [x] **Auth Guard**: `Auth.guardOrRedirect(['admin', 'contable'])` (L9)
- [x] **IIFE Pattern**: Wrapper async + strict mode (L5)
- [x] **UI Object Centralizado**: Organización correcta (L13-43)
- [x] **State Management**: Objeto `state` centralizado (L49-53)
- [x] **Safety Check**: `assertSbOrShowBlockingError` presente (L46)

### UX/Feedback (OK)
- [x] **Loading State**: Helper `setLoading()` correcto
- [x] **Empty State**: Helper `toggleEmptyState()` correcto
- [x] **Toast Feedback**: Consistente en todas las operaciones

---

## 5. Protocolo de Cierre

1. ❌ **RECHAZADO** hasta aplicar fixes de Sección 1 (BLOCKERS)
2. Aplicar fixes XSS (5 min) + Event delegation (30 min)
3. Re-auditar con `ui-ux-auditor`
4. Si score ≥ 8.5 → Aprobar para producción
5. Commitear y actualizar ficha con `documentation-generator`

---

> **Esfuerzo total estimado para aprobación**: ~1h 10min
