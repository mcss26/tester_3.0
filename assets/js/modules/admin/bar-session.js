/**
 * Module: bar-session.js
 * Standard: logic-engineer (2026)
 * Description: Bar Session Management (Count, Inventory, Report)
 */

(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'manager', 'encargado_barra', 'contable']);
    if (!session) return;
    const user = session.user;

    // 2. Params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('id');
    const mode = urlParams.get('mode'); // 'opening' (force opening view)

    if (!sessionId) {
        window.Toast.error("ID de sesión requerido");
        window.location.href = 'index.html';
        return;
    }

    // 3. UI References
    const ui = {
        location: document.getElementById('session-location'),
        status: document.getElementById('session-status'),
        opener: document.getElementById('opener-name'),
        openTime: document.getElementById('open-time'),
        closerInfo: document.getElementById('closer-info'),
        closerName: document.getElementById('closer-name'),
        headerActions: document.getElementById('header-actions'),

        stockSection: document.getElementById('stock-section'),
        stockTitle: document.getElementById('stock-title'),
        skuList: document.getElementById('sku-list'),
        btnSaveStock: document.getElementById('btn-save-stock'),
        searchSku: document.getElementById('search-sku'),

        reportSection: document.getElementById('report-section'),
        reportList: document.getElementById('report-list'),

        modalImport: document.getElementById('modal-import'),
        inputImportJson: document.getElementById('input-import-json'),
        btnConfirmImport: document.getElementById('btn-save-import'),
    };

    if (!window.Utils?.assertSbOrShowBlockingError?.(ui.location)) return;

    // 4. State
    const state = {
        sessionData: null,
        products: [],
        currentPhase: 'view', // 'opening', 'closing', 'view'
        isLoading: false
    };

    // 5. Logic
    async function init() {
        await loadSession();
        bindEvents();
    }

    async function loadSession() {
        try {
            const { data, error } = await window.sb
                .from('bar_sessions')
                .select(`
                    *,
                    opened_by_user:opened_by(full_name, email),
                    closed_by_user:closed_by(full_name, email)
                `)
                .eq('id', sessionId)
                .single();

            if (error || !data) {
                window.Toast.error("Sesión no encontrada");
                window.location.href = 'index.html';
                return;
            }

            state.sessionData = data;
            renderHeader();

            // Determine State
            if (data.status === 'open') {
                // Check if opening snapshot exists
                const { count } = await window.sb.from('bar_stock_snapshots')
                    .select('*', { count: 'exact', head: true })
                    .eq('session_id', sessionId)
                    .eq('type', 'opening');

                if (count === 0 || mode === 'opening') {
                    await enterPhase('opening');
                } else {
                    await enterPhase('running');
                }
            } else {
                await enterPhase('closed');
            }
        } catch (err) {
            console.error('Error loading session:', err);
            window.Toast.error('Error al cargar datos de sesión');
        }
    }

    function renderHeader() {
        ui.location.textContent = state.sessionData.location;
        ui.status.textContent = state.sessionData.status === 'open' ? 'EN CURSO' : 'CERRADA';
        ui.status.className = `status-pill ${state.sessionData.status === 'open' ? 'status-success' : 'status-neutral'}`;

        ui.opener.textContent = state.sessionData.opened_by_user?.full_name || state.sessionData.opened_by_user?.email || 'N/A';
        ui.openTime.textContent = new Date(state.sessionData.opened_at).toLocaleTimeString();

        if (state.sessionData.status === 'closed') {
            ui.closerInfo.classList.remove('hidden');
            ui.closerName.textContent = state.sessionData.closed_by_user?.full_name || state.sessionData.closed_by_user?.email || 'Admin';
        }
    }

    async function enterPhase(phase) {
        state.currentPhase = phase;

        // Hide all major sections first
        ui.stockSection.classList.add('hidden');
        ui.reportSection.classList.add('hidden');
        ui.headerActions.innerHTML = '';

        if (phase === 'opening') {
            ui.stockSection.classList.remove('hidden');
            ui.stockTitle.textContent = "Carga de Stock Inicial (Apertura)";
            ui.btnSaveStock.textContent = "Confirmar Apertura";
            await loadProducts();
            renderStockInput();

        } else if (phase === 'running') {
            ui.headerActions.innerHTML = `
                <button id="btn-start-close" class="btn btn-danger btn-sm">
                    CERRAR BARRA
                </button>
            `;
            document.getElementById('btn-start-close').addEventListener('click', () => enterPhase('closing'));

        } else if (phase === 'closing') {
            if (state.sessionData.status === 'open') {
                ui.stockSection.classList.remove('hidden');
                ui.stockTitle.textContent = "Conteo Final (Cierre)";
                ui.btnSaveStock.textContent = "Finalizar Turno";
                await loadProducts();
                renderStockInput();
            } else {
                viewReport();
            }
        } else if (phase === 'closed') {
            viewReport();
        }
    }

    async function loadProducts() {
        try {
            // USING 'active' INSTEAD OF 'is_active' (Standardized column)
            const { data, error } = await window.sb
                .from('master_sku')
                .select('*')
                .eq('active', true)
                .order('nombre'); // Standardized column is 'nombre' in other modules

            if (error) throw error;
            state.products = data || [];
        } catch (err) {
            console.error('Error loadProducts:', err);
            // Fallback attempt with 'name' if 'nombre' fails? 
            // Actually, let's use the property from the data if 'nombre' is missing.
        }
    }

    function renderStockInput() {
        ui.skuList.innerHTML = state.products.map(p => {
            const name = p.nombre || p.name || 'Sin nombre';
            return `
                <tr class="table-row">
                    <td class="table-cell cell-pad">
                        <div class="font-bold">${window.Utils.escapeHtml(name)}</div>
                        <div class="muted text-xs">${window.Utils.escapeHtml(p.measure_unit || 'u')}</div>
                    </td>
                    <td class="table-cell cell-pad text-right">
                        <input type="number" step="0.1" min="0" data-id="${p.id}" class="input input-sm w-24 text-right js-stock-input" placeholder="0">
                    </td>
                </tr>
            `;
        }).join('');
    }

    async function saveStockSnapshot() {
        const inputs = document.querySelectorAll('.js-stock-input');
        const snapshotType = state.currentPhase === 'opening' ? 'opening' : 'closing';
        const items = [];

        inputs.forEach(inp => {
            const val = parseFloat(inp.value);
            if (!isNaN(val) && val > 0) {
                items.push({
                    session_id: sessionId,
                    sku_id: inp.dataset.id,
                    quantity: val,
                    type: snapshotType,
                    created_by: user.id
                });
            }
        });

        const confirmMessage = items.length === 0
            ? '¿Guardar inventario VACÍO (0 productos cargados)?'
            : `¿Confirmas el inventario cargado con ${items.length} ítems?`;

        const confirmed = await window.Utils.confirmModal(confirmMessage);
        if (!confirmed) return;

        ui.btnSaveStock.disabled = true;
        ui.btnSaveStock.classList.add('btn-loading');

        try {
            // 1. Insert Snapshots
            if (items.length > 0) {
                const { error } = await window.sb.from('bar_stock_snapshots').insert(items);
                if (error) throw error;
            }

            // 2. If Closing, update session status
            if (snapshotType === 'closing') {
                const { error: closeErr } = await window.sb.from('bar_sessions').update({
                    status: 'closed',
                    closed_at: new Date().toISOString(),
                    closed_by: user.id
                }).eq('id', sessionId);

                if (closeErr) throw closeErr;

                window.Toast.success("Barra cerrada correctamente.");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                window.Toast.success("Apertura guardada correctamente.");
                setTimeout(() => window.location.href = 'index.html', 1000);
            }

        } catch (err) {
            console.error('[BarSession]', err);
            window.Toast.error("Error al guardar: " + err.message);
            ui.btnSaveStock.disabled = false;
            ui.btnSaveStock.classList.remove('btn-loading');
        }
    }

    async function viewReport() {
        ui.reportSection.classList.remove('hidden');
        ui.reportList.innerHTML = `<tr><td colspan="6" class="p-8 text-center muted">Procesando reporte...</td></tr>`;

        try {
            const [snapRes, salesRes, recipesRes] = await Promise.all([
                window.sb.from('bar_stock_snapshots').select('*, master_sku(nombre, name)').eq('session_id', sessionId),
                window.sb.from('bar_session_sales').select('*').eq('session_id', sessionId),
                window.sb.from('master_recipes').select('*')
            ]);

            const snapshots = snapRes.data || [];
            const sales = salesRes.data || [];
            const recipes = recipesRes.data || [];

            const report = {};
            const skus = {};

            // Physical Consumption
            snapshots.forEach(s => {
                if (!report[s.sku_id]) report[s.sku_id] = { phys: 0, theo: 0 };
                skus[s.sku_id] = s.master_sku?.nombre || s.master_sku?.name || 'SKU Desconocido';

                if (s.type === 'opening') report[s.sku_id].phys += parseFloat(s.quantity);
                if (s.type === 'closing') report[s.sku_id].phys -= parseFloat(s.quantity);
            });

            // Theoretical Consumption
            sales.forEach(sale => {
                let recipe = recipes.find(r => r.external_id && String(r.external_id) === String(sale.external_id));
                if (!recipe && sale.product_name) {
                    recipe = recipes.find(r => r.name.toLowerCase() === sale.product_name.toLowerCase());
                }

                if (recipe && recipe.ingredients) {
                    recipe.ingredients.forEach(ing => {
                        if (!report[ing.sku_id]) report[ing.sku_id] = { phys: 0, theo: 0 };
                        report[ing.sku_id].theo += (parseFloat(sale.quantity) * parseFloat(ing.amount));
                    });
                }
            });

            ui.reportList.innerHTML = '';
            let totalPhys = 0, totalTheo = 0;

            Object.keys(report).forEach(skuId => {
                const item = report[skuId];
                const name = skus[skuId] || 'SKU sin Stock Inicial';
                const diff = item.theo - item.phys;

                let diffClass = 'muted';
                if (diff < -0.05) diffClass = 'text-error font-bold';
                if (diff > 0.05) diffClass = 'text-success font-bold';

                totalPhys += item.phys;
                totalTheo += item.theo;

                ui.reportList.innerHTML += `
                    <tr class="table-row">
                        <td class="table-cell cell-pad cell-strong">${window.Utils.escapeHtml(name)}</td>
                        <td class="table-cell cell-pad text-center muted text-xs">—</td>
                        <td class="table-cell cell-pad text-center muted text-xs">—</td>
                        <td class="table-cell cell-pad text-center cell-strong">${item.phys.toFixed(2)}</td>
                        <td class="table-cell cell-pad text-center font-medium">${item.theo.toFixed(2)}</td>
                        <td class="table-cell cell-pad text-right ${diffClass}">${diff.toFixed(2)}</td>
                    </tr>
                `;
            });

            document.getElementById('rep-phys-total').textContent = totalPhys.toFixed(1);
            document.getElementById('rep-theo-total').textContent = totalTheo.toFixed(1);

            if (Object.keys(report).length === 0) {
                ui.reportList.innerHTML = `<tr><td colspan="6" class="p-8 text-center muted italic">Sin datos para generar el reporte.</td></tr>`;
            }

        } catch (err) {
            console.error('Error viewReport:', err);
            window.Toast.error('Error al generar reporte');
        }
    }

    async function handleImport() {
        try {
            const raw = ui.inputImportJson.value.trim();
            if (!raw) return;

            const json = JSON.parse(raw);
            if (!Array.isArray(json)) throw new Error("Debe ser un array de ventas.");

            ui.btnConfirmImport.disabled = true;
            ui.btnConfirmImport.textContent = "Importando...";

            const sales = json.map(s => ({
                session_id: sessionId,
                external_id: s.external_id || s.id || null,
                product_name: s.name || s.nombre || 'Unknown',
                quantity: parseFloat(s.quantity) || parseFloat(s.cantidad) || 0,
                total_amount: parseFloat(s.amount) || parseFloat(s.total) || 0
            }));

            await window.sb.from('bar_session_sales').delete().eq('session_id', sessionId);
            const { error } = await window.sb.from('bar_session_sales').insert(sales);
            if (error) throw error;

            window.Toast.success("Ventas importadas correctamente");
            ui.modalImport.classList.remove('is-visible');
            viewReport();

        } catch (err) {
            console.error('Import error:', err);
            window.Toast.error("Error: " + err.message);
        } finally {
            ui.btnConfirmImport.disabled = false;
            ui.btnConfirmImport.textContent = "Importar";
        }
    }

    function bindEvents() {
        ui.searchSku.addEventListener('input', window.Utils.debounce((e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.table-row').forEach(row => {
                const txt = row.innerText.toLowerCase();
                row.style.display = txt.includes(q) ? '' : 'none';
            });
        }, 300));

        ui.btnSaveStock.addEventListener('click', saveStockSnapshot);

        document.getElementById('btn-import-sales')?.addEventListener('click', () => ui.modalImport.classList.add('is-visible'));
        document.getElementById('btn-cancel-import')?.addEventListener('click', () => ui.modalImport.classList.remove('is-visible'));
        ui.btnConfirmImport.addEventListener('click', handleImport);
    }

    // Start
    init();

})();
