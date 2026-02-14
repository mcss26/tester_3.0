/**
 * APP.JS — Night Chief (Stock Audit + Caja + Nómina)
 * Renders all panels, KPIs, sparklines, and interactive filters.
 * ES Module — imports data from mock-data.js
 */
import {
  stockAudit,
  cajaTerminals,
  nomina,
  acceso,
  imports,
  currentEvent,
  historicalPerformance,
  formatCurrency,
  computeStockKPIs,
  computeCajaKPIs,
} from './mock-data.js';

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderStockTable(stockAudit);
  renderCajaTable();
  renderNomina();
  renderKPIs();
  renderAcceso();
  renderImports();
  renderSparklines();
  bindFilters();
  bindActions();
});

// ── Stock Audit Table ──
function renderStockTable(items) {
  const tbody = document.getElementById('stock-tbody');
  tbody.innerHTML = items.map(i => {
    const diff = i.system - i.counted;
    const diffValue = diff * i.cost;
    const cls = diff > 0 ? 'nc-diff--negative' : diff < 0 ? 'nc-diff--positive' : 'nc-diff--zero';
    return `<tr>
      <td>${i.sku}</td>
      <td>${i.system}</td>
      <td>${i.counted}</td>
      <td class="${cls}">${diff > 0 ? '-' : diff < 0 ? '+' : ''}${Math.abs(diff)}</td>
      <td class="${diff !== 0 ? cls : ''}">${diff !== 0 ? formatCurrency(Math.abs(diffValue)) : '—'}</td>
    </tr>`;
  }).join('');

  const withDiff = items.filter(i => i.system !== i.counted);
  document.getElementById('stock-items-count').textContent = withDiff.length;
  const totalDiff = withDiff.reduce((sum, i) => sum + (i.system - i.counted) * i.cost, 0);
  const diffEl = document.getElementById('stock-total-diff');
  diffEl.textContent = formatCurrency(Math.abs(totalDiff));
  diffEl.classList.remove('nc-diff--negative', 'nc-diff--positive', 'nc-diff--zero');
  diffEl.classList.add(totalDiff > 0 ? 'nc-diff--negative' : totalDiff < 0 ? 'nc-diff--positive' : 'nc-diff--zero');
}

// ── Caja Table ──
function renderCajaTable() {
  const tbody = document.getElementById('caja-tbody');
  tbody.innerHTML = cajaTerminals.map(t => {
    const diff = t.declaredCash - t.systemCash;
    const cls = diff < 0 ? 'nc-diff--negative' : diff > 0 ? 'nc-diff--positive' : 'nc-diff--zero';
    const total = t.declaredCash + t.declaredDigital;
    return `<tr>
      <td>${t.name}</td>
      <td>${formatCurrency(t.systemCash)}</td>
      <td>${formatCurrency(t.declaredCash)}</td>
      <td class="${cls}">${formatCurrency(diff)}</td>
      <td>${formatCurrency(t.declaredDigital)}</td>
      <td>${formatCurrency(t.withdrawals)}</td>
      <td class="nc-table__cell--bold">${formatCurrency(total)}</td>
    </tr>`;
  }).join('');

  const kpis = computeCajaKPIs(cajaTerminals);
  const cls = kpis.diffCash < 0 ? 'nc-diff--negative' : 'nc-diff--zero';
  const grandTotal = kpis.totalDeclared + kpis.totalDigDeclared;
  tbody.innerHTML += `<tr class="nc-table__summary-row">
    <td class="nc-table__cell--bold">TOTAL</td>
    <td class="nc-table__cell--bold">${formatCurrency(kpis.totalSystem)}</td>
    <td class="nc-table__cell--bold">${formatCurrency(kpis.totalDeclared)}</td>
    <td class="${cls} nc-table__cell--heavy">${formatCurrency(kpis.diffCash)}</td>
    <td class="nc-table__cell--bold">${formatCurrency(kpis.totalDigDeclared)}</td>
    <td class="nc-table__cell--bold">${formatCurrency(kpis.totalWithdrawals)}</td>
    <td class="nc-table__cell--bold nc-table__cell--heavy">${formatCurrency(grandTotal)}</td>
  </tr>`;

  const diffEl = document.getElementById('caja-total-diff');
  diffEl.textContent = formatCurrency(kpis.diffCash);
  diffEl.classList.remove('nc-diff--negative', 'nc-diff--positive', 'nc-diff--zero');
  diffEl.classList.add(kpis.diffCash < 0 ? 'nc-diff--negative' : 'nc-diff--positive');

  const badge = document.getElementById('caja-status');
  const diffTerms = cajaTerminals.filter(t => t.declaredCash !== t.systemCash);
  if (diffTerms.length > 0) {
    badge.textContent = `${diffTerms.length} con diferencia`;
    badge.className = 'nc-panel__badge nc-panel__badge--warn';
  } else {
    badge.textContent = 'Sin diferencias';
    badge.className = 'nc-panel__badge nc-panel__badge--ok';
  }
}

// ── Nómina ──
function renderNomina() {
  const container = document.getElementById('nomina-list');
  let totalStaff = 0, totalAmount = 0;
  container.innerHTML = nomina.map(n => {
    totalStaff += n.staff;
    totalAmount += n.total;
    return `<div class="nc-nomina-row">
      <span class="nc-nomina-row__area">${n.area} <span class="nc-nomina-row__staff">${n.staff}p</span></span>
      <span class="nc-nomina-row__total">${formatCurrency(n.total)}</span>
    </div>`;
  }).join('');

  document.getElementById('nomina-staff-count').textContent = `${totalStaff} personas`;
  document.getElementById('nomina-total').textContent = formatCurrency(totalAmount);
}

// ── KPIs ──
function renderKPIs() {
  const stockKPI = computeStockKPIs(stockAudit);
  const cajaKPI = computeCajaKPIs(cajaTerminals);
  const nominaTotal = nomina.reduce((s, n) => s + n.total, 0);

  document.getElementById('kpi-revenue').textContent = formatCurrency(cajaKPI.totalRevenue);
  document.getElementById('kpi-merma').textContent = formatCurrency(Math.abs(stockKPI.totalDiffValue));

  const cajaDiffEl = document.getElementById('kpi-caja-diff');
  cajaDiffEl.textContent = formatCurrency(cajaKPI.diffCash);
  cajaDiffEl.className = `nc-kpi__value ${cajaKPI.diffCash < 0 ? 'nc-kpi__value--danger' : 'nc-kpi__value--success'}`;

  document.getElementById('kpi-precision').textContent = `${stockKPI.precision}%`;
  document.getElementById('kpi-nomina').textContent = formatCurrency(nominaTotal);
}

// ── Acceso / QR Propio ──
function renderAcceso() {
  document.getElementById('qr-passline').textContent = acceso.passlineValidated;
  document.getElementById('qr-boleteria').textContent = acceso.boleteriaVendidos;
  document.getElementById('qr-expected').textContent = acceso.qrExpected;
  document.getElementById('qr-scanned').textContent = acceso.qrEscaneados;

  const diff = acceso.qrEscaneados - acceso.qrExpected;
  const diffEl = document.getElementById('qr-diff');
  diffEl.textContent = diff === 0 ? '0 OK' : `${diff > 0 ? '+' : ''}${diff}`;
  diffEl.classList.remove('nc-diff--negative', 'nc-diff--positive', 'nc-diff--zero');
  diffEl.classList.add(diff === 0 ? 'nc-diff--positive' : 'nc-diff--negative');

  document.getElementById('guardarropas-info').textContent = formatCurrency(acceso.guardarropas);

  // Per cápita = revenue / QR escaneados
  const cajaKPI = computeCajaKPIs(cajaTerminals);
  const perCapita = acceso.qrEscaneados > 0
    ? Math.round(cajaKPI.totalRevenue / acceso.qrEscaneados)
    : 0;
  document.getElementById('percapita-info').textContent = formatCurrency(perCapita);

  // Conciliation status
  const concEl = document.getElementById('qr-conciliation-status');
  const absDiff = Math.abs(diff);
  const threshold = Math.round(acceso.qrExpected * 0.02); // 2% tolerance
  if (absDiff === 0) {
    concEl.textContent = 'Conciliado';
    concEl.classList.add('nc-diff--positive');
  } else if (absDiff <= threshold) {
    concEl.textContent = `${absDiff} de diff`;
    concEl.classList.add('nc-diff--warning');
  } else {
    concEl.textContent = `${absDiff} sin conciliar`;
    concEl.classList.add('nc-diff--negative');
  }
}

// ── Imports (inline pills) ──
function renderImports() {
  const container = document.getElementById('import-sources');
  container.innerHTML = imports.map(imp => {
    const dotCls = imp.status === 'synced' ? 'nc-import-pill__dot--synced'
      : imp.status === 'pending' ? 'nc-import-pill__dot--pending' : 'nc-import-pill__dot--error';
    return `<span class="nc-import-pill" title="${imp.source} · ${imp.records} reg · ${imp.lastSync}">
      <span class="nc-import-pill__dot ${dotCls}"></span>${imp.icon}
    </span>`;
  }).join('');
}

// ── Sparklines (Historical Performance) ──
function renderSparklines() {
  const h = historicalPerformance;
  const grid = document.getElementById('spark-grid');
  const metrics = [
    { label: 'Revenue / Cápita', data: h.revenuePerCapita, tonight: h.tonight.revenuePerCapita, fmt: v => formatCurrency(v), unit: '', better: 'up' },
    { label: 'Precisión Stock', data: h.stockPrecision, tonight: h.tonight.stockPrecision, fmt: v => `${v.toFixed(1)}%`, unit: 'pp', better: 'up' },
    { label: 'Diff Caja %', data: h.cashDiffPct, tonight: h.tonight.cashDiffPct, fmt: v => `${v.toFixed(2)}%`, unit: 'pp', better: 'zero' },
    { label: 'Merma Valorizada', data: h.mermaValorizada, tonight: h.tonight.mermaValorizada, fmt: v => formatCurrency(v), unit: '', better: 'down' },
  ];
  grid.innerHTML = metrics.map(m => {
    const all = [...m.data, m.tonight];
    const max = Math.max(...all.map(Math.abs));
    const avg = m.data.reduce((a, b) => a + b, 0) / m.data.length;
    const diff = m.tonight - avg;
    const pct = avg !== 0 ? ((diff / Math.abs(avg)) * 100).toFixed(0) : '0';
    const isGood = m.better === 'up' ? diff > 0 : m.better === 'down' ? diff < 0 : Math.abs(m.tonight) < Math.abs(avg);
    const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
    const clr = isGood ? 'nc-diff--positive' : 'nc-diff--negative';
    const bars = all.map((v, i) =>
      `<div class="nc-spark-bar${i === all.length - 1 ? ' nc-spark-bar--tonight' : ''}" style="height:${Math.round((Math.abs(v) / max) * 100)}%"></div>`
    ).join('');
    return `<div class="nc-spark-card">
      <div class="nc-spark-card__label">${m.label}</div>
      <div class="nc-spark-card__row">
        <div class="nc-spark-chart">${bars}</div>
        <div class="nc-spark-card__value">${m.fmt(m.tonight)}</div>
      </div>
      <div class="nc-spark-card__compare ${clr}">avg: ${m.fmt(avg)} ${arrow}${Math.abs(pct)}%</div>
    </div>`;
  }).join('');
}

// ── Filter Chips ──
function bindFilters() {
  const container = document.getElementById('stock-filters');
  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.nc-chip');
    if (!chip) return;

    container.querySelectorAll('.nc-chip').forEach(c => {
      c.classList.remove('nc-chip--active');
      c.setAttribute('aria-pressed', 'false');
    });
    chip.classList.add('nc-chip--active');
    chip.setAttribute('aria-pressed', 'true');

    const cat = chip.dataset.cat;
    const filtered = cat === 'all' ? stockAudit : stockAudit.filter(i => i.cat === cat);
    renderStockTable(filtered);
  });
}

// ── Actions ──
function bindActions() {
  document.getElementById('btn-save-draft').addEventListener('click', () => {
    alert('Borrador guardado (prototipo — no persiste)');
  });
  document.getElementById('btn-close-night').addEventListener('click', () => {
    if (confirm('¿Confirmar cierre de noche?')) {
      alert('Noche cerrada. En producción esto persiste en Report.');
    }
  });
}
