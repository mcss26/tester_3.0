/**
 * Balance Semanal v4 — Compact App Controller
 * Layout: KPI strip hero + sidebar + chart + 4-col detail
 */
(function () {
    'use strict';

    const { WEEKS, CHART_HISTORY, DOCUMENTS, FISCAL_PARAMS, getWeekSummary } = window.MockData;

    let currentWeek = WEEKS[0].id;
    let chartInstance = null;

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    function fmt(n) {
        if (n == null || isNaN(n)) return '—';
        return '$' + Math.round(n).toLocaleString('es-AR');
    }
    function fmtPct(n) {
        if (n == null || isNaN(n)) return '—';
        return parseFloat(n).toFixed(1) + '%';
    }
    function fmtNum(n) {
        if (n == null || isNaN(n)) return '—';
        return Math.round(n).toLocaleString('es-AR');
    }

    // ─── Init ───────────────────────────────────────────────
    function init() {
        populateWeekSelector();
        bindEvents();
        render();
    }

    function populateWeekSelector() {
        const sel = $('#weekSelector');
        sel.innerHTML = WEEKS.map(w =>
            `<option value="${w.id}"${w.id === currentWeek ? ' selected' : ''}>${w.label}</option>`
        ).join('');
    }

    function bindEvents() {
        $('#weekSelector').addEventListener('change', e => {
            currentWeek = e.target.value;
            render();
        });

        $$('#chartPills .pill').forEach(pill => {
            pill.addEventListener('click', () => {
                $$('#chartPills .pill').forEach(p => {
                    p.classList.remove('is-active');
                    p.setAttribute('aria-selected', 'false');
                });
                pill.classList.add('is-active');
                pill.setAttribute('aria-selected', 'true');
                renderChart(parseInt(pill.dataset.range));
            });
        });

        $('#btnSaveDraft')?.addEventListener('click', () => showToast('Borrador guardado'));
        $('#btnFreeze')?.addEventListener('click', () => {
            if (confirm('¿Congelar esta semana?')) {
                showToast('Semana congelada ✓');
                const bar = $('.bal-status-bar');
                bar.querySelector('.bal-status-bar__dot').style.background = 'var(--blue-400)';
                bar.querySelector('.bal-status-bar__dot').style.animation = 'none';
                $('#weekStatus').textContent = 'Congelada';
            }
        });
        $('#btnExportExcel')?.addEventListener('click', () => showToast('Exportando...'));
    }

    // ─── Render All ─────────────────────────────────────────
    function render() {
        const data = getWeekSummary(currentWeek);
        const week = WEEKS.find(w => w.id === currentWeek);

        // Header
        $('#weekLabel').textContent = week?.label?.replace(/^Sem \d+ — /, '') || '';
        $('#nightCount').textContent = data.nights?.length || 0;

        // KPI Strip
        renderKPIs(data);

        // Sidebar stats
        renderSidebar(data);

        // 4 Columns
        renderIngresos(data);
        renderFiscal(data);
        renderStock(data);
        renderEgresos(data);

        // Discrepancies
        renderDiscrepancies(data);

        // Documents
        renderDocuments();

        // Chart
        const activePill = $('#chartPills .pill.is-active');
        renderChart(activePill ? parseInt(activePill.dataset.range) : 8);
    }

    // ─── KPIs ───────────────────────────────────────────────
    function renderKPIs(data) {
        const resEl = $('#kpiResultado');
        resEl.textContent = fmt(data.resultadoFinal);
        resEl.className = 'kpi-hero__value ' + (data.resultadoFinal >= 0 ? 'text-success' : 'text-error');

        $('#kpiMargen').textContent = `Margen ${fmtPct(data.margenPct)}`;
        $('#kpiIncomeBruto').textContent = fmt(data.incomeBruto);
        $('#kpiEgresoNeto').textContent = fmt(data.totalEgresosNeto);
    }

    // ─── Sidebar ────────────────────────────────────────────
    function renderSidebar(data) {
        $('#kpiAttendance').textContent = fmtNum(data.totalAttendance);
        $('#cmvTeorico').textContent = fmt(data.stock?.cmvTeorico);
        $('#cmvReal').textContent = fmt(data.stock?.cmvReal);

        const mermaEl = $('#mermaValue');
        const mClass = data.stock?.mermaPct <= 2 ? 'text-success' : data.stock?.mermaPct <= 5 ? 'text-warning' : 'text-error';
        mermaEl.textContent = `${fmtPct(data.stock?.mermaPct)} (${fmt(data.stock?.merma)})`;
        mermaEl.className = `sidebar-field__value ${mClass}`;

        $('#freeDrinks').textContent = fmt(data.stock?.freeDrinksCost);

        const perCapita = data.totalAttendance > 0 ? data.incomeBruto / data.totalAttendance : 0;
        $('#perCapita').textContent = fmt(perCapita);
        $('#margenStat').textContent = fmtPct(data.margenPct);
    }

    // ─── Chart ──────────────────────────────────────────────
    function renderChart(range) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const historySlice = range >= 999 ? CHART_HISTORY : CHART_HISTORY.slice(-range);
        if (chartInstance) chartInstance.destroy();

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historySlice.map(h => h.week),
                datasets: [
                    {
                        label: 'Recaudación',
                        data: historySlice.map(h => h.income),
                        borderColor: '#4ade80',
                        backgroundColor: 'rgba(74, 222, 128, 0.12)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                    },
                    {
                        label: 'Costo Consumo',
                        data: historySlice.map(h => h.expenses),
                        borderColor: '#f87171',
                        backgroundColor: 'rgba(248, 113, 113, 0.06)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: reducedMotion ? 0 : 600 },
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            color: '#71717a',
                            font: { family: 'Inter', size: 10 },
                            boxWidth: 10,
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                        },
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.92)',
                        titleFont: { family: 'Inter', size: 10 },
                        bodyFont: { family: 'Inter', size: 10 },
                        padding: 8,
                        callbacks: {
                            label: (c) => `${c.dataset.label}: ${fmt(c.parsed.y)}`,
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: { color: '#52525b', font: { family: 'Inter', size: 9 } },
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: {
                            color: '#52525b',
                            font: { family: 'Inter', size: 9 },
                            callback: v => '$' + (v / 1000000).toFixed(1) + 'M',
                        },
                    },
                },
            },
        });
    }

    // ─── Col A: Ingresos ────────────────────────────────────
    function renderIngresos(data) {
        const { nights, cashBruto, cashDelta, digital, totalQR } = data;
        let html = `<div class="bal-col-sub">Efectivo por Noche</div>`;
        nights.forEach(n => html += row(n.event, fmt(n.cashSystem)));
        html += rowSub('Subtotal', fmt(cashBruto));
        html += sep();
        html += `<div class="bal-col-sub">Digital (Zoco)</div>`;
        html += row('Bruto terminales', fmt(digital.brutoTerminal));
        html += row('Neto a acreditar', fmt(digital.netoAcreditar));
        html += sep();
        html += row('QR / Otros', fmt(totalQR));
        html += rowTotal('TOTAL BRUTO', fmt(data.incomeBruto));

        const deltaAbs = Math.abs(cashDelta);
        const cls = deltaAbs === 0 ? 'ok' : deltaAbs < 5000 ? 'warn' : 'err';
        html += `<div class="arqueo-indicator arqueo-indicator--${cls}">Caja: ${cls === 'ok' ? '✓' : `Δ ${fmt(deltaAbs)}`}</div>`;
        $('#colIngresosBody').innerHTML = html;
    }

    // ─── Col B: Fiscal + Digital ────────────────────────────
    function renderFiscal(data) {
        const { digital } = data;
        let html = `<div class="bal-col-sub">Impuestos</div>`;
        html += row(`IVA ${(FISCAL_PARAMS.iva * 100)}%`, fmt(data.ivaVentas));
        html += row(`IIBB ${(FISCAL_PARAMS.iibb * 100).toFixed(1)}%`, fmt(data.iibb));
        html += row(`Municipal`, fmt(data.municipal));
        html += rowSub('Total imp.', fmt(data.totalImpuestosIngresos));
        html += sep();
        html += `<div class="bal-col-sub">Descuentos Zoco</div>`;
        html += row('Arancel', fmt(digital.arancel));
        html += row('IVA Arancel', fmt(digital.ivaArancel));
        html += row('Costo fin.', fmt(digital.costoFinanciero));
        html += row('Ret. IIBB', fmt(digital.retencionIIBB));
        html += sep();
        html += `<div class="bal-col-sub">Desfase</div>`;
        html += row('Acreditado', fmt(digital.acreditadoEstaSemana), 'text-success');
        html += row('Pendiente', fmt(digital.pendienteAcreditar), 'text-warning');

        const total = digital.acreditadoEstaSemana + digital.pendienteAcreditar;
        const pct = total > 0 ? (digital.acreditadoEstaSemana / total * 100) : 100;
        html += `<div class="desfase-bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-label="Acreditación"><div class="desfase-bar__fill desfase-bar__fill--received" style="width:${pct}%"></div><div class="desfase-bar__fill desfase-bar__fill--pending" style="width:${100-pct}%"></div></div>`;

        html += rowTotal('NETO', fmt(data.incomeNeto));

        const dz = Math.abs(digital.brutoZoco - digital.brutoTerminal);
        const fCls = dz < 2000 ? 'ok' : dz < 10000 ? 'warn' : 'err';
        html += `<div class="arqueo-indicator arqueo-indicator--${fCls}">Zoco: ${fCls === 'ok' ? '✓' : `Δ ${fmt(dz)}`}</div>`;
        $('#colFiscalBody').innerHTML = html;
    }

    // ─── Col C: Cruce Stock ─────────────────────────────────
    function renderStock(data) {
        const { stock } = data;
        let html = `<div class="bal-col-sub">CMV</div>`;
        html += row('Teórico', fmt(stock.cmvTeorico), 'text-info');
        html += row('Real', fmt(stock.cmvReal));

        const mCls = stock.mermaPct <= 2 ? 'ok' : stock.mermaPct <= 5 ? 'warn' : 'err';
        html += `<div class="bal-row"><span class="bal-row__label">Merma</span><span class="merma-badge merma-badge--${mCls}">${fmtPct(stock.mermaPct)} ${fmt(stock.merma)}</span></div>`;
        html += sep();
        html += `<div class="bal-col-sub">No Facturados</div>`;
        html += row(`Free (${stock.freeDrinksQty})`, fmt(stock.freeDrinksCost));
        html += row(`VIP (${stock.vipDrinksQty})`, fmt(stock.vipDrinksCost));

        if (stock.topMerma?.length) {
            html += sep();
            html += `<div class="bal-col-sub">Top Merma</div>`;
            stock.topMerma.forEach(item => {
                html += `<div class="bal-row"><span class="bal-row__label"><span class="bal-dot bal-dot--err"></span>${item.sku}</span><span class="bal-row__value text-error">${fmt(item.perdida)}</span></div>`;
            });
        }

        html += rowTotal('TOTAL CMV', fmt(stock.cmvReal + stock.freeDrinksCost + stock.vipDrinksCost));
        html += `<div class="arqueo-indicator arqueo-indicator--${mCls}">Stock: ${mCls === 'ok' ? '✓' : `⚠ ${fmtPct(stock.mermaPct)}`}</div>`;
        $('#colStockBody').innerHTML = html;
    }

    // ─── Col D: Egresos ─────────────────────────────────────
    function renderEgresos(data) {
        const { expenses } = data;
        let html = `<div class="bal-col-sub">Variables</div>`;
        html += row('Staff', fmt(expenses.staff));
        html += row('Compras', fmt(expenses.compras));
        html += row('Insumos', fmt(expenses.insumosOp));
        html += sep();
        html += `<div class="bal-col-sub">Ocultos</div>`;
        html += row('Free Drinks', fmt(expenses.freeDrinks), 'text-warning');
        html += row('Merma', fmt(expenses.merma), 'text-error');
        html += sep();
        html += `<div class="bal-col-sub">Fijos</div>`;
        html += row('Licencias', fmt(expenses.licencias));
        html += row('Alquiler/Serv.', fmt(expenses.costosFijos));
        html += row('Extras', fmt(expenses.extras));
        html += sep();
        html += row('IVA Cred. Fiscal', `- ${fmt(expenses.ivaCreditoFiscal)}`, 'text-success');
        html += rowTotal('EGRESOS NETO', fmt(data.totalEgresosNeto));
        html += sep();
        html += `<div class="bal-col-sub">Ganancias</div>`;
        html += row(`${(FISCAL_PARAMS.ganancias * 100)}% s/util.`, fmt(data.impGanancias));
        const cls = data.resultadoFinal >= 0 ? 'text-success' : 'text-error';
        html += `<div class="bal-row bal-row--total"><span class="bal-row__label">RESULTADO</span><span class="bal-row__value ${cls}">${fmt(data.resultadoFinal)}</span></div>`;
        $('#colEgresosBody').innerHTML = html;
    }

    // ─── Discrepancies ──────────────────────────────────────
    function renderDiscrepancies(data) {
        const section = $('#balDiscrepancies');
        const body = $('#discrepanciesBody');
        if (!data.discrepancies?.length) { section.hidden = true; return; }
        section.hidden = false;
        let html = `<table class="disc-table"><thead><tr><th>Área</th><th>Fecha</th><th>Resp.</th><th>Delta</th></tr></thead><tbody>`;
        data.discrepancies.forEach(d => {
            html += `<tr><td><span class="bal-dot bal-dot--${d.type === 'cash' ? 'err' : 'warn'}"></span> ${d.area}</td><td>${d.date}</td><td>${d.responsible}</td><td class="disc-delta">${fmt(d.delta)}</td></tr>`;
        });
        html += `</tbody></table>`;
        body.innerHTML = html;
    }

    // ─── Documents ──────────────────────────────────────────
    function renderDocuments() {
        $('#documentsBody').innerHTML = DOCUMENTS.map(doc => `
            <div class="doc-item" tabindex="0" role="button" aria-label="Abrir ${doc.name}">
                <div class="doc-item__icon">${doc.type}</div>
                <span class="doc-item__name">${doc.name}</span>
                <span class="doc-item__meta">${doc.size}</span>
            </div>
        `).join('');
    }

    // ─── Row Helpers ────────────────────────────────────────
    function row(label, value, cls = '') {
        return `<div class="bal-row"><span class="bal-row__label">${label}</span><span class="bal-row__value ${cls}">${value}</span></div>`;
    }
    function rowSub(label, value) {
        return `<div class="bal-row bal-row--subtotal"><span class="bal-row__label">${label}</span><span class="bal-row__value">${value}</span></div>`;
    }
    function rowTotal(label, value) {
        return `<div class="bal-row bal-row--total"><span class="bal-row__label">${label}</span><span class="bal-row__value">${value}</span></div>`;
    }
    function sep() { return '<div class="bal-sep"></div>'; }

    // ─── Toast ──────────────────────────────────────────────
    function showToast(msg) {
        const old = document.querySelector('.bal-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'bal-toast';
        t.textContent = msg;
        Object.assign(t.style, {
            position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.95)', color: '#000', padding: '6px 16px',
            borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '11px',
            fontWeight: '600', zIndex: '1500', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        });
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }

    // ─── Boot ───────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
