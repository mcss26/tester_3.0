/**
 * admin-herramientas.js
 * Lógica para Análisis de Consumo - Versión Administración
 * Incluye: Importación de Excel, Análisis de Ideales, Comparativa Real vs Sistema y Gráfico Histórico.
 */
(async function() {
    'use strict';

    // 1. Guard de Autenticación
    const authResult = await window.Auth.guardOrRedirect(['admin', 'contable', 'logistico']);
    if (!authResult) return;
    const { profile } = authResult;

    // 2. Verificar Supabase
    if (!window.Utils.assertSbOrShowBlockingError()) return;
    const sb = window.sb;

    // 3. Referencias DOM
    // 3. Referencias DOM
    // 3. Referencias DOM
    const ui = {
        tabs: document.querySelectorAll('.filter-pill'),
        views: document.querySelectorAll('.view-container'),
        
        loadingState: document.getElementById('page-card-loading'),
        emptyState: document.getElementById('page-card-empty'),
        moduleContent: document.getElementById('module-content'),
        
        // Sections
        secResumen: document.getElementById('analysis-tab-resumen'),
        secImport: document.getElementById('analysis-tab-importar'),
        secAnalyze: document.getElementById('analysis-tab-analizar'),
        secComp: document.getElementById('analysis-tab-comparativa'),
        secHistory: document.getElementById('analysis-tab-historica'),
        
        // Dashboard Stats
        statTotalReports: document.getElementById('stat-total-reports'),
        statLastReport: document.getElementById('stat-last-report'),
        statTotalItems: document.getElementById('stat-total-items'),
        dashboardTopItems: document.getElementById('dashboard-top-items'),
        
        // Import
        importDate: document.getElementById('import-date'),
        importFile: document.getElementById('import-file'),
        fileNameDisplay: document.getElementById('import-file-name'),
        importPreview: document.getElementById('import-preview'),
        // Analyze
        analyzeStart: document.getElementById('analyze-date-start'),
        analyzeEnd: document.getElementById('analyze-date-end'),
        btnAnalyze: document.getElementById('btn-analyze-ideal'),
        analyzeResults: document.getElementById('analysis-results'),
        // Comp
        compStart: document.getElementById('comp-date-start'),
        compEnd: document.getElementById('comp-date-end'),
        btnComp: document.getElementById('btn-comp-run'),
        compResults: document.getElementById('comp-results'),
        // History
        historyCanvas: document.getElementById('history-chart'),
        btnRetry: document.getElementById('btn-retry')
    };

    // 4. Estado Local
    let state = {
        activeTab: 'resumen',
        importData: [],
        importFileName: '',
        chartInstance: null,
        isComparing: false,
        isAnalyzing: false,
        summary: {
            totalReports: 0,
            lastReport: null,
            totalItems: 0,
            topItems: []
        }
    };

    // --- LÓGICA DE INICIALIZACIÓN ---

    async function init() {
        setPageState('loading');
        try {
            bindEvents();
            setupDefaultDates();
            
            // Cargar datos iniciales para el dashboard
            await loadDashboardData();
            
            showTab('resumen');
            setPageState('ready');
        } catch (e) {
            console.error('Init error:', e);
            window.Toast?.error('Error inicializando herramientas');
            setPageState('empty');
        }
    }

    async function loadDashboardData() {
        try {
            // 1. Reportes Totales y Último Reporte
            const { data: reports, error: rErr } = await sb
                .from('consumption_reports')
                .select('id, operational_date')
                .order('operational_date', { ascending: false });

            if (rErr) throw rErr;

            state.summary.totalReports = reports.length;
            state.summary.lastReport = reports.length > 0 ? reports[0].operational_date : 'Ninguno';

            // 2. Total de Items vinculados (SKUs)
            const { count, error: cErr } = await sb
                .from('master_sku')
                .select('*', { count: 'exact', head: true });
            
            if (cErr) throw cErr;
            state.summary.totalItems = count || 0;

            // 3. Top Consumos (Últimos 30 días)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { data: topDetails, error: tErr } = await sb
                .from('consumption_details')
                .select('sku_id, quantity, sku:master_sku(nombre)')
                .gte('created_at', thirtyDaysAgo.toISOString());

            if (tErr) throw tErr;

            const map = {};
            (topDetails || []).forEach(d => {
                if (!map[d.sku_id]) map[d.sku_id] = { name: d.sku?.nombre || 'Desconocido', total: 0 };
                map[d.sku_id].total += d.quantity;
            });

            state.summary.topItems = Object.values(map)
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);

            renderDashboard();
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            throw err;
        }
    }

    function renderDashboard() {
        if (ui.statTotalReports) ui.statTotalReports.textContent = state.summary.totalReports;
        if (ui.statLastReport) ui.statLastReport.textContent = state.summary.lastReport;
        if (ui.statTotalItems) ui.statTotalItems.textContent = state.summary.totalItems;

        if (ui.dashboardTopItems) {
            if (state.summary.topItems.length === 0) {
                ui.dashboardTopItems.innerHTML = `
                    <div class="state-block">
                        <p class="state-desc muted">No hay consumos registrados en los últimos 30 días.</p>
                    </div>
                `;
            } else {
                ui.dashboardTopItems.innerHTML = state.summary.topItems.map(item => `
                    <div class="staff-item">
                        <div class="staff-info">
                            <span class="staff-name">${window.Utils.escapeHtml(item.name)}</span>
                            <span class="staff-role group-pill">Consumo Reciente</span>
                        </div>
                        <div class="staff-meta">
                            <span class="status-pill status-success topbar-pill topbar-pill-quiet">${item.total.toFixed(0)} u.</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    function setPageState(s) {
        if (!window.Utils?.setPageState) return;
        window.Utils.setPageState(s, {
            loadingHeader: 'Espere un momento...',
            loadingMsg: 'Preparando motores de inteligencia...',
            moduleContent: ui.moduleContent,
            loadingOverlay: ui.loadingState,
            emptyOverlay: ui.emptyState
        });
    }

    function setupDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (ui.importDate) ui.importDate.value = today;
        if (ui.analyzeEnd) ui.analyzeEnd.value = today;
        if (ui.compEnd) ui.compEnd.value = today;
        
        if (ui.analyzeStart) ui.analyzeStart.value = lastWeek;
        if (ui.compStart) ui.compStart.value = lastWeek;
    }

    function bindEvents() {
        ui.tabs.forEach(btn => {
            btn.onclick = () => showTab(btn.dataset.tab);
        });

        ui.btnAnalyze?.addEventListener('click', analyzeIdeals);
        ui.btnComp?.addEventListener('click', runComparison);
        ui.importFile?.addEventListener('change', handleFileSelect);
        ui.btnRetry?.addEventListener('click', () => location.reload());
    }

    function showTab(tabId) {
        state.activeTab = tabId;
        
        // Update Tabs UI
        ui.tabs.forEach(t => {
            if (t.dataset.tab === tabId) t.classList.add('is-active');
            else t.classList.remove('is-active');
        });

        // Toggle visibility
        ui.views.forEach(view => view.classList.add('hidden'));
        
        const activeSec = document.getElementById(`analysis-tab-${tabId}`);
        if (activeSec) activeSec.classList.remove('hidden');

        // Specific actions
        if (tabId === 'historica') loadHistoryChart();
        if (tabId === 'resumen') loadDashboardData().catch(() => {});
    }

    // --- LÓGICA DE IMPORTACIÓN ---

    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        state.importFileName = file.name;
        if (ui.fileNameDisplay) ui.fileNameDisplay.textContent = `Archivo: ${file.name}`;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const aoa = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

            // Buscar cabecera
            let headerIdx = 0;
            let found = false;
            for (let i = 0; i < Math.min(20, aoa.length); i++) {
                const rowStr = aoa[i].join(' ').toLowerCase();
                if (rowStr.match(/producto|nombre|item|articulo/)) {
                    headerIdx = i;
                    found = true;
                    break;
                }
            }

            let headerOverride = null;
            if (!found) {
                headerOverride = ['producto', 'cantidad']; // Default assumption
            }

            const json = XLSX.utils.sheet_to_json(firstSheet, { 
                range: headerIdx, 
                header: headerOverride || undefined, 
                defval: '' 
            });

            processImportData(json, found);
        };
        reader.readAsArrayBuffer(file);
    };

    async function processImportData(json, foundHeader) {
        setMessage(ui.importPreview, 'Procesando...', false);

        try {
            const { data: skus, error } = await sb.from('master_sku').select('id, nombre, external_id');
            if (error) throw error;

            if (!json || json.length === 0) {
                setMessage(ui.importPreview, 'No se encontraron filas en el archivo.', true);
                return;
            }

            state.importData = [];
            let matched = 0;

            json.forEach(row => {
                const keys = Object.keys(row);
                const pKey = keys.find(k => k.toLowerCase().match(/articulo|producto|nombre|item|descrip/));
                const qKey = keys.find(k => k.toLowerCase().match(/^cantidad$|^cant$|consumo|final|total/));

                const pName = pKey ? String(row[pKey]).trim() : null;
                const qty = qKey ? row[qKey] : 0;

                if (pName) {
                    const clean = normalize(pName);
                    const match = skus.find(s => normalize(s.nombre) === clean || normalize(s.external_id) === clean);

                    state.importData.push({
                        excelName: pName,
                        skuId: match ? match.id : null,
                        skuName: match ? match.nombre : 'NO ENCONTRADO',
                        quantity: parseQty(qty)
                    });
                    if (match) matched++;
                }
            });

            if (matched === 0) {
                renderNoMatches(foundHeader);
            } else {
                renderImportPreview(foundHeader);
            }

        } catch (err) {
            console.error(err);
            window.Toast.error('Error al procesar archivo');
        }
    }

    async function confirmImport() {
        const date = ui.importDate.value;
        if (!date) {
            window.Toast.warning('Seleccione una fecha operativa.');
            return;
        }

        if (state.importData.length === 0) return;

        const confirmed = await window.Utils.confirmModal?.('¿Está seguro de importar estos consumos?', {
            isDanger: false
        });
        if (!confirmed) return;

        try {
            // 1. Crear Reporte
            const { data: report, error: repErr } = await sb
                .from('consumption_reports')
                .insert({
                    operational_date: date,
                    file_name: state.importFileName || `Import ${date}`
                })
                .select().single();

            if (repErr) {
                if (repErr.code === '23505') throw new Error('Ya existe un reporte para esta fecha.');
                throw repErr;
            }

            // 2. Insertar Detalles
            const details = state.importData
                .filter(d => d.skuId)
                .map(d => ({
                    report_id: report.id,
                    sku_id: d.skuId,
                    quantity: d.quantity
                }));

            if (details.length === 0) throw new Error('No hay datos válidos para guardar.');

            const { error: detErr } = await sb.from('consumption_details').insert(details);
            if (detErr) throw detErr;

            window.Toast.success('Consumos importados con éxito');
            
            // Cleanup
            state.importData = [];
            ui.importPreview.innerHTML = `
                <div class="state-block">
                    <p class="state-desc muted">Previsualización de datos aquí</p>
                </div>
            `;
            ui.importFile.value = '';
            if (ui.fileNameDisplay) ui.fileNameDisplay.textContent = '';

            // Invalidar cache de ideales
            window.sessionStorage.removeItem('analysis-ideal-cache-v1');

        } catch (err) {
            console.error(err);
            window.Toast.error(err.message || 'Error al guardar importación');
        }
    }

    // --- LÓGICA DE ANÁLISIS ---

    async function analyzeIdeals() {
        const start = ui.analyzeStart.value;
        const end = ui.analyzeEnd.value;
        if (!start || !end) {
            window.Toast.warning('Seleccione un rango de fechas.');
            return;
        }

        state.isAnalyzing = true;
        ui.btnAnalyze.classList.add('btn-loading');
        setMessage(ui.analyzeResults, 'Calculando ideales...', false);

        try {
            // 1. Obtener reportes
            const { data: reports, error: rErr } = await sb
                .from('consumption_reports')
                .select('id')
                .gte('operational_date', start)
                .lte('operational_date', end);

            if (rErr) throw rErr;
            if (!reports?.length) {
                setMessage(ui.analyzeResults, 'No se encontraron reportes en este rango.', false);
                return;
            }

            const ids = reports.map(r => r.id);

            // 2. Detalles agregados
            const { data: details, error: dErr } = await sb
                .from('consumption_details')
                .select('sku_id, quantity, sku:master_sku(nombre)')
                .in('report_id', ids);

            if (dErr) throw dErr;

            // 3. Procesamiento
            const map = {};
            details.forEach(d => {
                if (!map[d.sku_id]) map[d.sku_id] = { name: d.sku?.nombre || '?', total: 0 };
                map[d.sku_id].total += d.quantity;
            });

            const days = ids.length;
            renderAnalysisResults(map, days);

        } catch (err) {
            console.error(err);
            window.Toast.error('Error al analizar datos');
        } finally {
            state.isAnalyzing = false;
            ui.btnAnalyze.classList.remove('btn-loading');
        }
    }

    // --- LÓGICA DE COMPARATIVA ---

    async function runComparison() {
        const start = ui.compStart.value;
        const end = ui.compEnd.value;
        if (!start || !end) {
            window.Toast.warning('Seleccione un rango de fechas.');
            return;
        }

        state.isComparing = true;
        ui.btnComp.classList.add('btn-loading');
        setMessage(ui.compResults, 'Cruzando datos...', false);

        try {
            // 1. Consumo Real (Importaciones)
            const { data: reports } = await sb.from('consumption_reports')
                .select('id')
                .gte('operational_date', start)
                .lte('operational_date', end);
            
            const repIds = (reports || []).map(r => r.id);
            const { data: realData } = repIds.length ? await sb.from('consumption_details')
                .select('sku_id, quantity, sku:master_sku(nombre)')
                .in('report_id', repIds) : { data: [] };

            // 2. Consumo Sistema (Movimientos de tipo 'consumption' o 'loss')
            const { data: sysData } = await sb.from('inventory_movements')
                .select('sku_id, quantity, movement_type, sku:master_sku(nombre)')
                .gte('created_at', `${start}T00:00:00Z`)
                .lte('created_at', `${end}T23:59:59Z`)
                .in('movement_type', ['CONSUMPTION', 'LOSS', 'SALE']);

            // 3. Agrupación
            const audit = {};
            realData.forEach(d => {
                const skuId = d.sku_id;
                if (!audit[skuId]) audit[skuId] = { name: d.sku?.nombre || '?', real: 0, sys: 0 };
                audit[skuId].real += d.quantity;
            });

            sysData.forEach(m => {
                const skuId = m.sku_id;
                const qty = Math.abs(m.quantity || 0);
                if (!audit[skuId]) audit[skuId] = { name: m.sku?.nombre || '?', real: 0, sys: 0 };
                audit[skuId].sys += qty;
            });

            renderComparisonResults(audit);

        } catch (err) {
            console.error(err);
            window.Toast.error('Error al realizar comparativa');
        } finally {
            state.isComparing = false;
            ui.btnComp.classList.remove('btn-loading');
        }
    }

    // --- LÓGICA DE GRÁFICO ---

    async function loadHistoryChart() {
        if (state.chartInstance) state.chartInstance.destroy();
        
        try {
            const { data: reports } = await sb
                .from('consumption_reports')
                .select('id, operational_date')
                .order('operational_date', { ascending: false })
                .limit(20);

            if (!reports?.length) return;
            
            const ordered = [...reports].reverse();
            const ids = ordered.map(r => r.id);
            const labels = ordered.map(r => r.operational_date);

            const { data: details } = await sb
                .from('consumption_details')
                .select('report_id, sku_id, quantity, sku:master_sku(nombre)')
                .in('report_id', ids);

            if (!details?.length) return;

            // Encontrar Top 5
            const totals = {};
            details.forEach(d => {
                const id = d.sku_id;
                if (!totals[id]) totals[id] = { name: d.sku?.nombre || '?', total: 0 };
                totals[id].total += d.quantity;
            });

            const top5 = Object.entries(totals)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 5)
                .map(([id, info]) => ({ id, name: info.name }));

            const colors = ['#007aff', '#ff9500', '#34c759', '#ff3b30', '#5856d6'];

            const datasets = top5.map((sku, i) => {
                const dataPoints = ordered.map(r => {
                    const d = details.find(det => det.report_id === r.id && det.sku_id === sku.id);
                    return d ? d.quantity : 0;
                });

                return {
                    label: sku.name,
                    data: dataPoints,
                    borderColor: colors[i],
                    backgroundColor: `${colors[i]}33`,
                    tension: 0.3,
                    fill: false
                };
            });

            state.chartInstance = new Chart(ui.historyCanvas, {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#e0e0e0', usePointStyle: true } }
                    },
                    scales: {
                        x: { ticks: { color: '#888' }, grid: { color: '#333' } },
                        y: { ticks: { color: '#888' }, grid: { color: '#333' } }
                    }
                }
            });

        } catch (err) {
            console.error('Chart Error:', err);
        }
    }

    // --- HELPERS DE RENDERIZADO ---

    function setMessage(container, msg, isError) {
        if (!container) return;
        container.innerHTML = `
            <div class="state-block">
                <p class="state-desc ${isError ? 'text-error' : 'muted'} italic">${window.Utils.escapeHtml(msg)}</p>
            </div>
        `;
    }

    function normalize(str) {
        return String(str || '').trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
    }

    function parseQty(v) {
        if (!v) return 0;
        const n = parseFloat(String(v).replace(',', '.').replace(/[^0-9.-]/g, ''));
        return Number.isFinite(n) ? n : 0;
    }

    function renderNoMatches(foundHeader) {
        ui.importPreview.innerHTML = `
            <div class="state-block">
                <h4 class="text-error mb-2">Sin Coincidencias</h4>
                <p class="state-desc muted mb-4">
                    ${foundHeader ? 'No se encontraron nombres de productos que coincidan con el sistema.' : 'No se detectó cabecera. Se asumió Columna 1=Producto, Columna 2=Cantidad.'}
                </p>
                <div class="analysis-summary mt-2" style="max-width: 300px; margin-inline: auto;">
                    <div class="analysis-stat is-danger">
                        <p class="analysis-stat-label">Coincidencias</p>
                        <p class="analysis-stat-value">0</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderImportPreview(foundHeader) {
        const total = state.importData.length;
        const matched = state.importData.filter(d => d.skuId).length;
        const unmatched = total - matched;

        ui.importPreview.innerHTML = `
            <div class="section-pad">
                <div class="analysis-summary mb-4">
                    <div class="analysis-stat">
                        <p class="analysis-stat-label">Total Archivo</p>
                        <p class="analysis-stat-value">${total}</p>
                    </div>
                    <div class="analysis-stat is-success">
                        <p class="analysis-stat-label">Vinculados</p>
                        <p class="analysis-stat-value">${matched}</p>
                    </div>
                    <div class="analysis-stat ${unmatched > 0 ? 'is-danger' : 'is-muted'}">
                        <p class="analysis-stat-label">Sin Match</p>
                        <p class="analysis-stat-value">${unmatched}</p>
                    </div>
                </div>

                ${!foundHeader ? '<p class="text-warning text-sm mb-4">⚠️ No se detectó cabecera. Se forzó columna 1 y 2.</p>' : ''}
                
                <div class="table-shell table-viewport" style="max-height: 400px;">
                    <table class="table table-sticky table-compact">
                        <thead>
                            <tr class="table-head">
                                <th class="table-cell is-header cell-pad">Excel</th>
                                <th class="table-cell is-header cell-pad">Sistema</th>
                                <th class="table-cell is-header cell-pad text-right">Cant</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.importData.map(d => `
                                <tr class="table-row ${!d.skuId ? 'row-warning' : ''}">
                                    <td class="table-cell cell-pad text-xs">${window.Utils.escapeHtml(d.excelName)}</td>
                                    <td class="table-cell cell-pad text-sm font-bold">${window.Utils.escapeHtml(d.skuName)}</td>
                                    <td class="table-cell cell-pad text-right font-mono">${d.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="flex-center mt-6">
                    <button id="btn-confirm-import" class="btn btn-primary w-200" ${matched === 0 ? 'disabled' : ''}>CONFIRMAR IMPORTACIÓN</button>
                </div>
            </div>
        `;

        document.getElementById('btn-confirm-import')?.addEventListener('click', confirmImport);
    }

    function renderAnalysisResults(map, days) {
        const items = Object.values(map);

        ui.analyzeResults.innerHTML = `
            <div class="section-pad">
                <div class="analysis-summary mb-4">
                    <div class="analysis-stat">
                        <p class="analysis-stat-label">Muestra (Días)</p>
                        <p class="analysis-stat-value">${days}</p>
                    </div>
                    <div class="analysis-stat">
                        <p class="analysis-stat-label">SKUs Detectados</p>
                        <p class="analysis-stat-value">${items.length}</p>
                    </div>
                </div>
                <div class="table-shell table-viewport">
                    <table class="table table-sticky table-compact">
                        <thead>
                            <tr class="table-head">
                                <th class="table-cell is-header cell-pad">Producto</th>
                                <th class="table-cell is-header cell-pad text-right">Prom. Diario</th>
                                <th class="table-cell is-header cell-pad text-right">Ideal 500</th>
                                <th class="table-cell is-header cell-pad text-right">Ideal 900</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(d => {
                                const avg = d.total / days;
                                return `
                                    <tr class="table-row">
                                        <td class="table-cell cell-pad text-sm font-bold">${window.Utils.escapeHtml(d.name)}</td>
                                        <td class="table-cell cell-pad text-right font-mono">${avg.toFixed(2)}</td>
                                        <td class="table-cell cell-pad text-right font-mono text-accent font-bold">${Math.ceil(avg)}</td>
                                        <td class="table-cell cell-pad text-right font-mono text-accent font-bold">${Math.ceil(avg * 1.8)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderComparisonResults(audit) {
        const items = Object.values(audit);

        if (items.length === 0) {
            setMessage(ui.compResults, 'No hay datos para comparar en este periodo.', false);
            return;
        }

        ui.compResults.innerHTML = `
            <div class="section-pad">
                <div class="table-shell table-viewport">
                    <table class="table table-sticky table-compact">
                        <thead>
                            <tr class="table-head">
                                <th class="table-cell is-header cell-pad">Producto</th>
                                <th class="table-cell is-header cell-pad text-right">Real (Import)</th>
                                <th class="table-cell is-header cell-pad text-right">Sistema (Mov)</th>
                                <th class="table-cell is-header cell-pad text-right w-100">Diferencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(d => {
                                const dif = d.real - d.sys;
                                const isHigh = Math.abs(dif) > (d.real * 0.1) && Math.abs(dif) > 1; 
                                return `
                                    <tr class="table-row ${isHigh ? 'row-warning' : ''}">
                                        <td class="table-cell cell-pad text-sm font-bold">${window.Utils.escapeHtml(d.name)}</td>
                                        <td class="table-cell cell-pad text-right font-mono">${d.real.toFixed(1)}</td>
                                        <td class="table-cell cell-pad text-right font-mono">${d.sys.toFixed(1)}</td>
                                        <td class="table-cell cell-pad text-right font-mono font-bold ${dif > 0 ? 'text-success' : dif < 0 ? 'text-error' : ''}">
                                            ${dif > 0 ? '+' : ''}${dif.toFixed(1)}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    init();

})();
