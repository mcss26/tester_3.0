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
        kpiIncome: document.getElementById('kpi-income'),
        kpiExpenses: document.getElementById('kpi-expenses'),
        kpiProfit: document.getElementById('kpi-profit'),
        kpiProfitMargin: document.getElementById('kpi-profit-margin'),
        btnRefresh: document.getElementById('btn-refresh'),
        filterYear: document.getElementById('filter-year'),
        filterMonth: document.getElementById('filter-month'),
    };

    const state = {
        weeklyData: [],
        year: new Date().getFullYear(),
        month: 'all' // 'all' or 1-12
    };

    // 1. Auth & Init
    const session = await window.Auth.guardOrRedirect(['admin', 'gerente', 'contable']);
    if (!session) return;
    if (!window.Utils.assertSbOrShowBlockingError()) return;

    // 2. Load Data
    async function loadData() {
        setLoading(true);
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
        } catch (error) {
            console.error(error);
            window.Toast?.error('Error cargando balance: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    // 3. Render
    function render() {
        if (state.weeklyData.length === 0) {
            ui.tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4 muted">No hay datos financieros para este período.</td></tr>`;
            return;
        }

        ui.tableBody.innerHTML = state.weeklyData.map(row => {
            const startDate = new Date(row.week_start).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
            const endDate = new Date(row.week_end).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
            
            // Calc profit class
            const profitClass = row.operating_profit > 0 ? 'text-success' : (row.operating_profit < 0 ? 'text-error' : 'muted');
            
            // Format Currency
            const fmt = (n) => `$${parseFloat(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

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

        const fmt = (n) => `$${parseFloat(n).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

        ui.kpiIncome.textContent = fmt(totalIncome);
        ui.kpiExpenses.textContent = fmt(totalExpenses);
        ui.kpiProfit.textContent = fmt(totalProfit);
        ui.kpiProfitMargin.textContent = `Margen: ${margin}%`;

        // Color logic
        ui.kpiProfit.className = `stat-value ${totalProfit >= 0 ? 'text-success' : 'text-error'}`;
    }

    function setLoading(isLoading) {
        if (isLoading) {
            ui.loadingState.classList.remove('hidden');
            ui.tableContainer.classList.add('hidden');
        } else {
            ui.loadingState.classList.add('hidden');
            ui.tableContainer.classList.remove('hidden');
        }
    }

    // 4. Events
    ui.btnRefresh?.addEventListener('click', loadData);
    
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
