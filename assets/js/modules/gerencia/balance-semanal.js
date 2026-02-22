/**
 * Balance Semanal Controller
 * Consumes vw_finance_weekly to show financial status.
 */
(async function () {
    'use strict';

    const ui = {
        tableBody: document.getElementById('weekly-table-body'),
        tableContainer: document.getElementById('table-container'),
        loadingState: document.getElementById('loading-state'),
        moduleContent: document.getElementById('table-container'),
        kpiIncome: document.getElementById('kpi-income'),
        kpiExpenses: document.getElementById('kpi-expenses'),
        kpiProfit: document.getElementById('kpi-profit'),
        kpiProfitMargin: document.getElementById('kpi-profit-margin'),
        btnRefresh: document.getElementById('btn-refresh'),
        btnExport: document.getElementById('btn-export'),
        filterYear: document.getElementById('filter-year'),
        filterMonth: document.getElementById('filter-month'),
        chartCard: document.getElementById('chart-card'),
        trendChart: document.getElementById('trend-chart'),
    };

    const state = {
        weeklyData: [],
        year: new Date().getFullYear(),
        month: 'all',
        chartInstance: null
    };

    // 1. Auth & Init
    const session = await window.Auth.guardOrRedirect(['admin', 'gerente', 'contable']);
    if (!session) return;
    if (!window.Utils.assertSbOrShowBlockingError()) return;

    // 2. Load Data
    async function loadData() {
        Utils.setPageState(ui, { loading: true });
        try {
            let query = window.sb
                .from('vw_finance_weekly')
                .select('*')
                .eq('year_number', state.year)
                .order('week_number', { ascending: false });

            if (state.month !== 'all') {
                query = query.eq('month_number', parseInt(state.month));
            }

            const { data, error } = await query;
            if (error) throw error;

            state.weeklyData = data || [];
            render();
            updateKPIs();
            renderChart();
        } catch (error) {
            console.error(error);
            window.Toast?.error('Error cargando balance: ' + error.message);
        } finally {
            Utils.setPageState(ui, { loading: false });
        }
    }

    // 3. Render
    function render() {
        if (state.weeklyData.length === 0) {
            ui.tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 muted">No hay datos financieros para este período.</td></tr>`;
            return;
        }

        ui.tableBody.innerHTML = state.weeklyData.map(row => {
            const safeDateStr = (val) => {
                if (!val) return '—';
                const d = new Date(val);
                return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
            };
            const startDate = safeDateStr(row.week_start);
            const endDate = safeDateStr(row.week_end);
            
            // Calc profit class
            const profitClass = row.operating_profit > 0 ? 'text-success' : (row.operating_profit < 0 ? 'text-error' : 'muted');
            
            // Format Currency — null/undefined/NaN-safe
            const fmt = (n) => {
                const num = parseFloat(n);
                return isNaN(num) ? '$0' : `$${num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            };

            return `
                <tr class="table-row">
                    <td class="table-cell">
                        <span class="block font-medium">Semana ${row.week_number}</span>
                        <span class="text-xs muted">${startDate} - ${endDate}</span>
                    </td>
                    <td class="table-cell text-right text-success font-mono">${fmt(row.income_gross)}</td>
                    <td class="table-cell text-right text-error font-mono">${fmt(row.expenses_total)}</td>
                    <td class="table-cell text-right muted font-mono text-sm">
                        ${fmt(row.tax_vat_payable)}
                        <i class="block text-[10px]" title="IVA Ventas est.">Venta: ${fmt(row.tax_vat_sales)}</i>
                    </td>
                    <td class="table-cell text-right ${profitClass} font-bold font-mono">${fmt(row.operating_profit)}</td>
                    <td class="table-cell text-right font-mono">${fmt(row.net_cash_flow)}</td>
                </tr>
            `;
        }).join('');
    }

    function updateKPIs() {
        // Summarize current filtered view
        const totalIncome = state.weeklyData.reduce((acc, r) => acc + (r.income_gross || 0), 0);
        const totalExpenses = state.weeklyData.reduce((acc, r) => acc + (r.expenses_total || 0), 0);
        const totalProfit = state.weeklyData.reduce((acc, r) => acc + (r.operating_profit || 0), 0);

        const margin = totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : 0;

        const fmt = (n) => {
            const num = parseFloat(n);
            return isNaN(num) ? '$0.00' : `$${num.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
        };

        ui.kpiIncome.textContent = fmt(totalIncome);
        ui.kpiExpenses.textContent = fmt(totalExpenses);
        ui.kpiProfit.textContent = fmt(totalProfit);
        ui.kpiProfitMargin.textContent = `Margen: ${margin}%`;

        // Color logic
        ui.kpiProfit.className = `stat-value ${totalProfit >= 0 ? 'text-success' : 'text-error'}`;
    }



    // 5. Chart (lazy-loaded)
    async function renderChart() {
        if (!ui.trendChart || state.weeklyData.length < 2) {
            ui.chartCard?.classList.add('hidden');
            return;
        }

        try {
            await window.ChartLoader.load();
        } catch {
            return; // Chart.js not available — skip silently
        }

        ui.chartCard?.classList.remove('hidden');

        // Sort ascending for chart
        const sorted = [...state.weeklyData].sort((a, b) => a.week_number - b.week_number);
        const labels = sorted.map(r => `S${r.week_number}`);

        if (state.chartInstance) state.chartInstance.destroy();

        state.chartInstance = new Chart(ui.trendChart, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: sorted.map(r => r.income_gross || 0),
                        borderColor: 'rgb(34,197,94)',
                        backgroundColor: 'rgba(34,197,94,0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Gastos',
                        data: sorted.map(r => r.expenses_total || 0),
                        borderColor: 'rgb(239,68,68)',
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#ccc' } }
                },
                scales: {
                    x: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: {
                        ticks: {
                            color: '#888',
                            callback: v => `$${(v / 1000).toFixed(0)}k`
                        },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                }
            }
        });
    }

    // 6. CSV Export
    function exportCSV() {
        if (state.weeklyData.length === 0) {
            window.Toast?.warning('No hay datos para exportar.');
            return;
        }

        const headers = 'Semana,Inicio,Fin,Ingresos,Gastos,IVA Ventas,IVA Pagar,Utilidad,Flujo Neto';
        const rows = state.weeklyData.map(r => [
            r.week_number,
            new Date(r.week_start).toLocaleDateString('es-AR'),
            new Date(r.week_end).toLocaleDateString('es-AR'),
            r.income_gross || 0,
            r.expenses_total || 0,
            r.tax_vat_sales || 0,
            r.tax_vat_payable || 0,
            r.operating_profit || 0,
            r.net_cash_flow || 0
        ].join(','));

        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `balance_semanal_${state.year}_${state.month}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        window.Toast?.success('CSV exportado.');
    }

    // 7. Events
    ui.btnRefresh?.addEventListener('click', loadData);
    ui.btnExport?.addEventListener('click', exportCSV);
    
    ui.filterYear?.addEventListener('change', (e) => {
        state.year = e.target.value;
        loadData();
    });

    ui.filterMonth?.addEventListener('change', (e) => {
        state.month = e.target.value;
        loadData();
    });

    // Initial Load
    loadData();

})();
