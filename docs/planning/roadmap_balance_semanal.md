# Plan de Desarrollo: Balance Semanal (Gerencia)

> **Fecha de Análisis**: 2026-01-29
> **Estado Actual**: 🔴 PLACEHOLDER / SIN IMPLEMENTAR
> **Prioridad**: MEDIA (Post Fase 2 - Barra)
> **Módulo**: balance-semanal.html
> **Rol Target**: admin, gerente, contable

---

## 📊 Estado Actual

### Archivos Existentes
- **HTML**: `/pages/gerencia/balance-semanal.html` ✅ (Placeholder básico)
- **JS**: ❌ No existe
- **CSS**: ✅ Usa main.css
- **Documentación**: ❌ No existe

### Análisis del Placeholder Actual

**Ubicación**: [balance-semanal.html](../../pages/gerencia/balance-semanal.html)

**Estructura presente**:
```html
<!-- Líneas 22-39: 3 KPI Cards hardcodeados -->
- Ingresos Totales: $0
- Gastos Operativos: $0
- Profit Semanal: $0

<!-- Líneas 42-50: Mensaje "En Desarrollo" -->
"Módulo de Reportes Avanzados en Desarrollo."
"Próximamente integración con Ventas y Stock Real."
```

**Problemas detectados**:
1. ❌ **CSS Alien**: Uso masivo de Tailwind (`grid grid-cols-1 md:grid-cols-3 gap-6`, línea 22)
2. ❌ **Sin estructura semántica**: No usa clases del proyecto (`page-card`, `dashboard-header`, etc.)
3. ❌ **Sin JS**: No hay módulo asociado, ni siquiera esqueleto
4. ❌ **Sin Auth Guard**: HTML tiene `data-allowed-roles` pero no hay módulo JS que lo valide

**Estado funcional**: **0% - Solo visual estático**

---

## 🎯 Objetivo del Módulo

Crear un **Dashboard Ejecutivo Semanal** que consolide:

### KPIs Principales
1. **Ingresos Totales**: Suma de todos los ingresos de la semana
   - Ventas de entradas (QR acreditados)
   - Ventas de barra (bar_session_sales)
   - Otros ingresos (cash_movements tipo "ingreso")

2. **Gastos Operativos**: Suma de egresos
   - Cuentas por pagar ejecutadas (accounts_payable)
   - Pagos a proveedores (finance_payments)
   - Movimientos de caja tipo "egreso" (cash_movements)
   - Nómina estimada (work_day_staff_planning)

3. **Profit Semanal**: Ingresos - Gastos

### Vistas Detalladas
- **Desglose Diario**: Tabla con ingresos/gastos por día
- **Por Categoría**: Ventas barra vs entradas vs otros
- **Por Proveedor**: Top gastos (finance_payments + accounts_payable)
- **Comparativa Semanal**: Gráfico de tendencia últimas 4 semanas

---

## 🗄️ Fuentes de Datos

### Tablas Involucradas

#### 1. Ingresos

**QR Codes (Entradas)**:
```sql
-- Tabla: qr_codes
SELECT
    COUNT(*) as tickets_vendidos,
    SUM(qr_batches.unit_price) as ingresos_entradas
FROM qr_codes
JOIN qr_batches ON qr_codes.batch_id = qr_batches.id
WHERE qr_codes.status = 'accredited'
AND qr_codes.work_day_id IN (SELECT id FROM work_days WHERE work_date BETWEEN 'inicio' AND 'fin');
```

**Ventas Barra**:
```sql
-- Tabla: bar_session_sales
SELECT
    SUM(total_amount) as ingresos_barra
FROM bar_session_sales
JOIN bar_sessions ON bar_session_sales.session_id = bar_sessions.id
WHERE bar_sessions.work_day_id IN (...);
```

**Otros Ingresos (Movimientos de Caja)**:
```sql
-- Tabla: cash_movements
SELECT
    SUM(amount) as otros_ingresos
FROM cash_movements
WHERE type = 'ingreso'
AND status = 'confirmed'
AND created_at BETWEEN 'inicio' AND 'fin';
```

---

#### 2. Gastos

**Cuentas por Pagar Ejecutadas**:
```sql
-- Tabla: accounts_payable
SELECT
    SUM(amount) as gastos_proveedores
FROM accounts_payable
WHERE status = 'paid'
AND work_day_id IN (...);
```

**Pagos a Proveedores**:
```sql
-- Tabla: finance_payments
SELECT
    supplier_id,
    master_proveedores.nombre_fantasia,
    SUM(amount) as total_pagado
FROM finance_payments
JOIN master_proveedores ON finance_payments.supplier_id = master_proveedores.id
WHERE payment_date BETWEEN 'inicio' AND 'fin'
AND status = 'completed'
GROUP BY supplier_id;
```

**Nómina Estimada (Dotación)**:
```sql
-- Tabla: work_day_staff_planning
SELECT
    SUM(approved_budget) as costo_nomina
FROM work_day_staff_planning
JOIN work_days ON work_day_staff_planning.work_day_id = work_days.id
WHERE work_days.work_date BETWEEN 'inicio' AND 'fin';
```

**Egresos de Caja**:
```sql
-- Tabla: cash_movements
SELECT
    SUM(amount) as egresos_caja
FROM cash_movements
WHERE type = 'egreso'
AND status = 'confirmed'
AND created_at BETWEEN 'inicio' AND 'fin';
```

---

## 🏗️ Arquitectura Propuesta

### Opción A: Vista Materializada (Recomendado)

**Crear**: `vw_weekly_balance`

```sql
CREATE MATERIALIZED VIEW vw_weekly_balance AS
SELECT
    date_trunc('week', wd.work_date) AS week_start,

    -- Ingresos
    COALESCE(SUM(qr.ingresos), 0) AS ingresos_entradas,
    COALESCE(SUM(bar.ingresos), 0) AS ingresos_barra,
    COALESCE(SUM(cm_in.ingresos), 0) AS otros_ingresos,
    COALESCE(SUM(qr.ingresos + bar.ingresos + cm_in.ingresos), 0) AS total_ingresos,

    -- Gastos
    COALESCE(SUM(ap.gastos), 0) AS gastos_proveedores,
    COALESCE(SUM(fp.pagos), 0) AS pagos_proveedores,
    COALESCE(SUM(sp.nomina), 0) AS costo_nomina,
    COALESCE(SUM(cm_out.egresos), 0) AS egresos_caja,
    COALESCE(SUM(ap.gastos + fp.pagos + sp.nomina + cm_out.egresos), 0) AS total_gastos,

    -- Profit
    COALESCE(SUM(qr.ingresos + bar.ingresos + cm_in.ingresos), 0) -
    COALESCE(SUM(ap.gastos + fp.pagos + sp.nomina + cm_out.egresos), 0) AS profit_semanal

FROM work_days wd

-- Left joins para cada fuente...
LEFT JOIN LATERAL (
    SELECT SUM(qb.unit_price) as ingresos
    FROM qr_codes qc
    JOIN qr_batches qb ON qc.batch_id = qb.id
    WHERE qc.work_day_id = wd.id AND qc.status = 'accredited'
) qr ON true

LEFT JOIN LATERAL (
    SELECT SUM(bss.total_amount) as ingresos
    FROM bar_session_sales bss
    JOIN bar_sessions bs ON bss.session_id = bs.id
    WHERE bs.work_day_id = wd.id
) bar ON true

-- ... (Similar para otros)

GROUP BY week_start
ORDER BY week_start DESC;
```

**Pros**:
- Performance óptimo (pre-calculado)
- Queries simples en frontend
- Refresh programable (1x al día, e.g., 6 AM)

**Cons**:
- Datos no en tiempo real (aceptable para reportes semanales)
- Requiere maintenance (refresh automático)

---

### Opción B: Helper JavaScript con Queries Directas

**Crear**: `assets/js/modules/gerencia/balance-helper.js`

```javascript
window.BalanceHelper = {
    async getWeeklyBalance(startDate, endDate) {
        // Ejecutar queries en paralelo
        const [ingresos, gastos] = await Promise.all([
            this.getIngresos(startDate, endDate),
            this.getGastos(startDate, endDate)
        ]);

        return {
            ingresos_totales: ingresos.entradas + ingresos.barra + ingresos.otros,
            gastos_totales: gastos.proveedores + gastos.pagos + gastos.nomina + gastos.caja,
            profit: (ingresos.entradas + ingresos.barra + ingresos.otros) -
                    (gastos.proveedores + gastos.pagos + gastos.nomina + gastos.caja),
            breakdown: { ingresos, gastos }
        };
    },

    async getIngresos(start, end) {
        // Query qr_codes + bar_session_sales + cash_movements (tipo ingreso)
        // ...
    },

    async getGastos(start, end) {
        // Query accounts_payable + finance_payments + work_day_staff_planning + cash_movements (tipo egreso)
        // ...
    }
};
```

**Pros**:
- Datos en tiempo real
- Flexibilidad para filtros custom
- No requiere infra adicional en BD

**Cons**:
- Más lento (múltiples queries)
- Lógica de negocio en frontend (mantenibilidad)

---

## 📋 Plan de Desarrollo Priorizado

### Fase 1: Fundación (2-3 horas)

#### 1.1 Refactorizar HTML a Golden Standard
**Esfuerzo**: 1 hora

**Acciones**:
- Eliminar CSS Tailwind (líneas 22-39)
- Usar estructura semántica:
  ```html
  <div class="page-card-wrap">
      <div class="page-card">
          <div id="module-content">
              <div class="staff-dashboard">
                  <div class="dashboard-header">...</div>
                  <div class="kpi-grid">...</div>
                  <div class="balance-details">...</div>
              </div>
          </div>
      </div>
  </div>
  ```
- Agregar loading/empty states
- Agregar date range picker (selector de semana)

**Archivos afectados**: `balance-semanal.html`

---

#### 1.2 Crear Módulo JS Base
**Esfuerzo**: 1 hora

**Crear**: `assets/js/modules/gerencia/balance-semanal.js`

**Estructura**:
```javascript
(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'gerente', 'contable']);
    if (!session) return;

    // 2. UI References
    const ui = {
        kpiIngresos: document.getElementById('kpi-ingresos'),
        kpiGastos: document.getElementById('kpi-gastos'),
        kpiProfit: document.getElementById('kpi-profit'),
        dateRangeStart: document.getElementById('date-start'),
        dateRangeEnd: document.getElementById('date-end'),
        btnRefresh: document.getElementById('btn-refresh'),
        detailsContainer: document.getElementById('details-container'),
        loadingState: document.getElementById('page-card-loading'),
        emptyState: document.getElementById('page-card-empty')
    };

    if (!window.Utils.assertSbOrShowBlockingError(ui.kpiIngresos)) return;

    // 3. State
    const state = {
        currentWeek: getCurrentWeek(),
        balanceData: null
    };

    // 4. Init
    async function init() {
        setDefaultWeek();
        bindEvents();
        await loadBalance();
    }

    // 5. Data Fetching
    async function loadBalance() {
        setLoading(true);
        try {
            // Opción A: Query a vista materializada
            const { data, error } = await window.sb
                .from('vw_weekly_balance')
                .select('*')
                .eq('week_start', state.currentWeek.start)
                .single();

            if (error) throw error;
            state.balanceData = data || getEmptyBalance();

            // Opción B: Usar helper
            // state.balanceData = await window.BalanceHelper.getWeeklyBalance(
            //     state.currentWeek.start,
            //     state.currentWeek.end
            // );

            renderKPIs();
            renderDetails();

        } catch (e) {
            console.error(e);
            window.Toast.error('Error cargando balance');
        } finally {
            setLoading(false);
        }
    }

    // 6. Rendering
    function renderKPIs() {
        const { total_ingresos, total_gastos, profit_semanal } = state.balanceData;

        ui.kpiIngresos.textContent = window.Utils.formatARS(total_ingresos);
        ui.kpiGastos.textContent = window.Utils.formatARS(total_gastos);
        ui.kpiProfit.textContent = window.Utils.formatARS(profit_semanal);

        // Colorear profit según signo
        ui.kpiProfit.classList.toggle('text-success', profit_semanal >= 0);
        ui.kpiProfit.classList.toggle('text-error', profit_semanal < 0);
    }

    function renderDetails() {
        // Tabla o cards con breakdown
        // ...
    }

    // 7. Utils
    function getCurrentWeek() {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return {
            start: startOfWeek.toISOString().split('T')[0],
            end: endOfWeek.toISOString().split('T')[0]
        };
    }

    function setLoading(isLoading) {
        ui.loadingState?.classList.toggle('is-visible', isLoading);
    }

    function bindEvents() {
        ui.btnRefresh?.addEventListener('click', loadBalance);
        ui.dateRangeStart?.addEventListener('change', onDateRangeChange);
        ui.dateRangeEnd?.addEventListener('change', onDateRangeChange);
    }

    init();
})();
```

**Archivos nuevos**: `balance-semanal.js`

---

#### 1.3 Decidir Arquitectura de Datos
**Esfuerzo**: 30 minutos (Decisión + Configuración)

**Opciones**:
1. ✅ **Vista Materializada** (Recomendado si Fase 2 ya completó barra)
   - Crear `vw_weekly_balance` en Supabase
   - Configurar refresh diario (trigger o cron job)

2. 🟡 **Helper con Queries Directas** (Si necesitas tiempo real)
   - Crear `balance-helper.js`
   - Implementar queries paralelas

**Decisión sugerida**: **Vista Materializada**
- Balance semanal no necesita tiempo real
- Performance crítico para dashboard gerencial
- Consistente con arquitectura actual (vw_stock_global, etc.)

---

### Fase 2: Funcionalidad Core (3-4 horas)

#### 2.1 Implementar Vista Materializada
**Esfuerzo**: 2 horas

**Crear en Supabase**:
```sql
-- Script completo con todos los LEFT JOINs
-- Ver sección "Opción A: Vista Materializada" arriba
```

**Validar**:
```sql
-- Test query
SELECT * FROM vw_weekly_balance
WHERE week_start >= NOW() - INTERVAL '4 weeks'
ORDER BY week_start DESC;
```

**Configurar Refresh**:
```sql
-- Option 1: Manual refresh (llamar desde cron o webhook)
REFRESH MATERIALIZED VIEW vw_weekly_balance;

-- Option 2: Trigger automático (cada INSERT/UPDATE en tablas fuente)
-- (Más complejo, no recomendado para v1)
```

---

#### 2.2 Implementar Rendering de KPIs
**Esfuerzo**: 1 hora

**Componentes**:
- Cards con formato ARS
- Colorización dinámica (verde/rojo para profit)
- Badges con % de variación vs semana anterior (opcional)

**CSS necesario** (agregar a `components.css`):
```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: var(--surface-1);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--surface-3);
}

.kpi-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.kpi-value {
  font-size: 2rem;
  font-family: var(--font-mono);
  font-weight: 700;
}

.kpi-value.text-success {
  color: var(--success-color);
}

.kpi-value.text-error {
  color: var(--error-color);
}
```

---

#### 2.3 Implementar Tabla de Detalles
**Esfuerzo**: 1 hora

**Vista**: Tabla con breakdown diario

**Columnas**:
- Fecha
- Ingresos (Entradas | Barra | Otros)
- Gastos (Proveedores | Nómina | Otros)
- Profit Diario

**Implementación**:
```javascript
function renderDetails() {
    // Fetch daily breakdown (nueva query o expand de vista)
    const dailyData = await fetchDailyBreakdown(state.currentWeek.start, state.currentWeek.end);

    const rows = dailyData.map(day => `
        <tr class="table-row">
            <td class="table-cell cell-pad">${window.Utils.formatDate(day.date)}</td>
            <td class="table-cell cell-pad text-right">${window.Utils.formatARS(day.ingresos_entradas)}</td>
            <td class="table-cell cell-pad text-right">${window.Utils.formatARS(day.ingresos_barra)}</td>
            <td class="table-cell cell-pad text-right">${window.Utils.formatARS(day.total_ingresos)}</td>
            <td class="table-cell cell-pad text-right text-error">${window.Utils.formatARS(day.total_gastos)}</td>
            <td class="table-cell cell-pad text-right font-bold ${day.profit >= 0 ? 'text-success' : 'text-error'}">
                ${window.Utils.formatARS(day.profit)}
            </td>
        </tr>
    `).join('');

    ui.detailsContainer.innerHTML = `
        <div class="table-scroll">
            <table class="table table-sticky">
                <thead>
                    <tr class="table-head">
                        <th class="table-cell is-header cell-pad">Fecha</th>
                        <th class="table-cell is-header cell-pad text-right">Entradas</th>
                        <th class="table-cell is-header cell-pad text-right">Barra</th>
                        <th class="table-cell is-header cell-pad text-right">Total Ingresos</th>
                        <th class="table-cell is-header cell-pad text-right">Total Gastos</th>
                        <th class="table-cell is-header cell-pad text-right">Profit</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}
```

---

### Fase 3: Features Avanzadas (2-3 horas) - OPCIONAL

#### 3.1 Selector de Rango de Fechas
**Esfuerzo**: 1 hora

**UI**: Date picker para seleccionar semana custom

**Implementación**:
```javascript
function onDateRangeChange() {
    const start = ui.dateRangeStart.value;
    const end = ui.dateRangeEnd.value;

    if (!start || !end) return;
    if (new Date(start) > new Date(end)) {
        window.Toast.warning('Fecha inicial debe ser menor a final');
        return;
    }

    state.currentWeek = { start, end };
    loadBalance();
}
```

---

#### 3.2 Comparativa de Tendencia (Últimas 4 Semanas)
**Esfuerzo**: 2 horas

**Componente**: Chart.js simple con líneas de ingresos/gastos/profit

**Query**:
```javascript
const { data } = await window.sb
    .from('vw_weekly_balance')
    .select('*')
    .gte('week_start', fourWeeksAgo)
    .order('week_start', { ascending: true });

renderTrendChart(data);
```

**Chart Config** (usar Chart.js o biblioteca ligera):
```javascript
function renderTrendChart(data) {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(w => formatWeek(w.week_start)),
            datasets: [
                {
                    label: 'Ingresos',
                    data: data.map(w => w.total_ingresos),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)'
                },
                {
                    label: 'Gastos',
                    data: data.map(w => w.total_gastos),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
```

**Nota**: Requiere agregar Chart.js a scripts:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

---

#### 3.3 Exportar a PDF/Excel
**Esfuerzo**: 1 hora

**Opción**: Botón "Exportar" que genera CSV descargable

```javascript
function exportToCSV() {
    const csv = [
        ['Fecha', 'Ingresos Entradas', 'Ingresos Barra', 'Total Ingresos', 'Total Gastos', 'Profit'],
        ...dailyData.map(d => [
            d.date,
            d.ingresos_entradas,
            d.ingresos_barra,
            d.total_ingresos,
            d.total_gastos,
            d.profit
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-semanal-${state.currentWeek.start}.csv`;
    a.click();
}
```

---

## ⚠️ Dependencias y Blockers

### Dependencias Críticas

1. **Fase 2 del Roadmap (Barra) debe estar completa**
   - `bar_sessions` con datos reales
   - `bar_session_sales` poblado con ventas
   - `bar_stock_snapshots` para conciliación

   **Estado actual**: 🔄 En Progreso (según estado-presente.md)

2. **Módulo de Caja Completado**
   - `cash_closings` con arqueos
   - `cash_movements` validados
   - `closing_terminals` con detalle

   **Estado actual**: 🟡 Beta (UX refinando)

3. **QR Codes Operativo**
   - `qr_codes` con status "accredited"
   - `qr_batches` con unit_price correcto

   **Estado actual**: ✅ Completo

4. **Finance Payments Funcional**
   - `finance_payments` con status "completed"
   - `accounts_payable` con status "paid"

   **Estado actual**: 🟡 Backend sólido, UI por verificar

---

### Gaps Identificados

#### 1. Falta Vista Materializada
**Impacto**: ALTO
**Acción**: Crear `vw_weekly_balance` en Supabase
**Esfuerzo**: 2 horas (SQL + validación)

---

#### 2. Falta Helper para Date Utils
**Impacto**: MEDIO
**Acción**: Extender `window.Utils` con:
```javascript
window.Utils.formatWeek = function(dateStr) {
    const d = new Date(dateStr);
    return `Semana del ${d.getDate()}/${d.getMonth()+1}`;
};

window.Utils.getCurrentWeek = function() {
    // Ver función en sección 1.2
};
```

**Esfuerzo**: 30 minutos

---

#### 3. Sin Integración con Sistema Externo (Gbol)
**Impacto**: CRÍTICO (para ventas barra)
**Acción**: Validar que `bar_session_sales` se esté poblando correctamente
**Esfuerzo**: Variable (depende de API Gbol)

**Verificación**:
```sql
SELECT COUNT(*) FROM bar_session_sales
WHERE imported_at >= NOW() - INTERVAL '7 days';

-- Si es 0, importación no está funcionando
```

---

## 📅 Timeline Propuesto

| Fase | Descripción | Esfuerzo | Dependencias | Inicio Sugerido |
|:-----|:------------|:---------|:-------------|:----------------|
| **Pre-requisitos** | Completar Fase 2 (Barra) + Caja | N/A | Roadmap principal | EN CURSO |
| **Fase 1** | Refactor HTML + JS Base + Decisión Arquitectura | 2-3h | Ninguna | Semana 5 (Feb 2026) |
| **Fase 2** | Vista Materializada + KPIs + Tabla | 3-4h | Fase 1 | Semana 5-6 |
| **Fase 3** | Date Picker + Tendencia + Export | 2-3h | Fase 2 | Semana 6 (Opcional) |
| **QA** | Auditoría + Tests + Validación con datos reales | 1-2h | Fase 2 o 3 | Semana 6 |

**Total esfuerzo**: 8-12 horas (depende de si se implementa Fase 3)

**Timeline optimista**: 2 semanas (si se trabaja 4-6h/semana)
**Timeline realista**: 3-4 semanas (considerando otros módulos)

---

## ✅ Criterios de Aceptación

### Funcionales
- [ ] KPIs se calculan correctamente desde datos reales
- [ ] Tabla de detalles muestra breakdown diario
- [ ] Selector de semana permite ver histórico
- [ ] Loading/empty states funcionan
- [ ] Auth guard valida roles correctamente

### Técnicos
- [ ] Sigue Golden Standard (IIFE + UI object + state)
- [ ] Zero CSS alien (solo clases del proyecto)
- [ ] Performance < 2s para carga de datos (con vista materializada)
- [ ] Sin vulnerabilidades XSS (todos los strings con escapeHtml)
- [ ] Documentación completa en `docs/modules/gerencia/`

### UX
- [ ] Números formateados con ARS (e.g., "$1.234,56")
- [ ] Profit coloreado (verde positivo, rojo negativo)
- [ ] Toast feedback en errores
- [ ] Responsive en tablet (opcional desktop-only es aceptable)

---

## 🔗 Referencias

- [Estado Presente del Proyecto](../estado-presente.md)
- [Roadmap Principal](../roadmap.md)
- [Esquema de BD](../scheme.md)
- [Golden Standard Guide](../architecture/standard-module-guide.md)
- [UI Components](../architecture/ui-components.md)

---

## 📝 Notas de Implementación

### Para Desarrolladores

1. **NO empezar hasta que Fase 2 (Barra) esté completa**
   - Validar que `bar_session_sales` tenga datos de últimos 7 días
   - Confirmar que `cash_closings` esté operativo

2. **Priorizar Vista Materializada sobre Helper**
   - Más rápido, más escalable, consistente con arquitectura

3. **Test con datos reales, no mocks**
   - Validar cálculos contra Excel manual
   - Comparar con reportes de Gbol (si existen)

4. **Considerar caché en frontend**
   - Si usuario navega entre semanas, guardar resultados en `state.cache`
   - Evitar re-queries innecesarios

---

### Para QA

1. **Validar integridad de datos**:
   ```sql
   -- Check que sumas cuadren
   SELECT
       'QR' as source, SUM(qb.unit_price) as total
   FROM qr_codes qc JOIN qr_batches qb ON qc.batch_id = qb.id
   WHERE qc.status = 'accredited' AND qc.work_day_id = '...'
   UNION ALL
   SELECT
       'Barra', SUM(total_amount)
   FROM bar_session_sales bss JOIN bar_sessions bs ON bss.session_id = bs.id
   WHERE bs.work_day_id = '...';
   ```

2. **Test edge cases**:
   - Semana sin ventas (debe mostrar $0, no error)
   - Semana con profit negativo (debe colorear en rojo)
   - Primera semana del mes (puede no tener comparativa)

3. **Performance**:
   - Load time < 2s con vista materializada
   - Si > 3s, investigar índices faltantes

---

## 🎯 Siguientes Pasos Inmediatos

1. **Decisión de Prioridad** (Usuario/PM):
   - ¿Cuándo se necesita este módulo? (Post Fase 2 o más adelante)
   - ¿Se requiere Fase 3 (gráficos)? (Nice-to-have vs must-have)

2. **Validar Dependencias** (Dev):
   - Verificar estado de `bar_session_sales`
   - Confirmar que `cash_closings` tiene datos últimos 7 días

3. **Crear Vista Materializada** (DBA/Dev):
   - Escribir SQL completo
   - Test en staging
   - Deploy a producción

4. **Comenzar Fase 1** (Dev):
   - Refactor HTML
   - Crear esqueleto JS
   - Integrar con vista materializada

---

**Última Actualización**: 2026-01-29
**Próxima Revisión**: Post Fase 2 del Roadmap Principal

