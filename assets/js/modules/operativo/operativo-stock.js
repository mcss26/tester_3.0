(async function() {
  'use strict';
    const listContainer = document.getElementById('list-container');
    const searchInput = document.getElementById('stock-search');
    const btnRefresh = document.getElementById('btn-refresh');
    const categoryTabs = document.getElementById('stock-tabs');
    const moduleContent = document.getElementById('module-content');
    const pageCardLoading = document.getElementById('page-card-loading');
    const pageCardEmpty = document.getElementById('page-card-empty');
    const alertBanner = document.getElementById('stock-alert-banner');

    const ui = { loadingState: pageCardLoading, moduleContent, emptyState: pageCardEmpty };
    const session = await window.Auth.guardOrRedirect(['operativo', 'logistico', 'admin']);
    if (!session) return;

    if (!window.Utils?.assertSbOrShowBlockingError?.(listContainer)) return;

    const debounce = (window.Utils && window.Utils.debounce) || ((fn) => fn);

    let rows = [];
    let categories = [];
    let searchTerm = '';
    let activeCategory = null;

    const emptyState = '<div class="empty-state">No hay stock disponible.</div>';
    const errorState = (msg) => `<div class="empty-state accent">Error: ${msg}</div>`;


    function buildCategories() {
        const catMap = new Map();
        rows.forEach((r) => {
            const id = r.categoria_id;
            const name = r.categoria_nombre || 'Sin categoría';
            // Only add if we have an ID (or handle 'null' as a specific key if needed, 
            // but usually we want valid categories).
            if (id) {
                catMap.set(id, name);
            }
        });
        
        categories = Array.from(catMap.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    function renderCategoryTabs() {
        if (!categoryTabs) return;
        const allBtn = `<button class="tab-chip stock-cat-tab ${!activeCategory ? 'active' : ''}" data-id="">Todos</button>`;
        const catBtns = (categories || []).map((cat) => `
            <button class="tab-chip stock-cat-tab ${activeCategory === cat.id ? 'active' : ''}" data-id="${cat.id}">
                ${cat.name}
            </button>
        `);
        categoryTabs.innerHTML = [allBtn, ...catBtns].join('');
    }

    function filteredRows() {
        const term = searchTerm.trim().toLowerCase();
        return rows.filter((r) => {
            const catId = r.categoria_id;
            const matchCat = !activeCategory || catId === activeCategory;
            const matchSearch = !term || (r.sku_nombre || '').toLowerCase().includes(term);
            return matchCat && matchSearch;
        });
    }

    function renderAlertBanner(data) {
        if (!alertBanner) return;
        const lowItems = (data || []).filter(r => (parseFloat(r.stock_actual) || 0) < (parseFloat(r.requerido) || 0));
        if (lowItems.length === 0) {
            alertBanner.classList.add('hidden');
            return;
        }
        const valRiesgo = lowItems.reduce((sum, r) => {
            const s = parseFloat(r.stock_actual) || 0;
            const c = parseFloat(r.costo) || 0;
            return sum + (s > 0 && c > 0 ? s * c : 0);
        }, 0);
        alertBanner.classList.remove('hidden');
        alertBanner.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.25);border-radius:8px;margin-bottom:12px;font-size:0.85rem;color:var(--clr-text-soft,#ccc)">
                <span class="urgent-indicator"></span>
                <span><strong style="color:#f97316">${lowItems.length} SKU${lowItems.length > 1 ? 's' : ''}</strong> debajo del ideal</span>
                ${valRiesgo > 0 ? `<span style="margin-left:auto;opacity:0.7">Valorizado en riesgo: <strong>${formatARS(valRiesgo)}</strong></span>` : ''}
            </div>
        `;
    }

    function renderList(data) {
        if (!listContainer) return;
        if (!data || data.length === 0) {
            listContainer.innerHTML = emptyState;
            renderAlertBanner([]);
            return;
        }

        // Sort: most understocked first
        const sorted = [...data].sort((a, b) => {
            const gapA = (a.stock_actual ?? 0) - (a.requerido ?? 0);
            const gapB = (b.stock_actual ?? 0) - (b.requerido ?? 0);
            return gapA - gapB;
        });

        let html = `
            <div class="table-scroll">
                <table class="table">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">SKU</th>
                            <th class="table-cell is-header cell-pad text-right">Stock</th>
                            <th class="table-cell is-header cell-pad text-right">Ideal</th>
                            <th class="table-cell is-header cell-pad text-right">Costo</th>
                            <th class="table-cell is-header cell-pad text-right">Valorizado</th>
                            <th class="table-cell is-header cell-pad">Proveedor</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        sorted.forEach((r) => {
            const stockActual = parseFloat(r.stock_actual) || 0;
            const ideal = parseFloat(r.requerido) || 0;
            const isLow = stockActual < ideal;
            const statusClass = isLow ? 'status-pill status-error' : 'status-pill status-success';
            const rowClass = isLow ? 'table-row row-subtle' : 'table-row';

            const costo = parseFloat(r.costo) || 0;
            const valorizado = stockActual > 0 && costo > 0 ? stockActual * costo : 0;
            const costoDisplay = costo > 0 ? formatARS(costo) : '-';
            const valorizadoDisplay = valorizado > 0 ? formatARS(valorizado) : '-';
            const proveedorNombre = r.proveedor_nombre || '-';

            // Stock bar: visual progress indicator
            const pct = ideal > 0 ? Math.min(100, Math.round((stockActual / ideal) * 100)) : 100;
            const barColor = isLow ? '#ef4444' : 'var(--clr-success, #22c55e)';
            const stockColor = isLow ? 'color:#ef4444' : '';

            // Pedir link for low-stock items
            const pedirLink = isLow
                ? `<a href="operativo-solicitudes.html?highlight=${r.sku_id}" class="btn-ghost btn-sm" style="font-size:0.7rem;padding:2px 8px;margin-left:6px;text-decoration:none;white-space:nowrap">Pedir ↗</a>`
                : '';

            html += `
                <tr class="${rowClass}">
                    <td class="table-cell cell-pad font-bold">
                        ${isLow ? '<span class="urgent-indicator"></span>' : ''}${r.sku_nombre || '-'}
                    </td>
                    <td class="table-cell cell-pad text-right">
                        <span class="font-mono" style="${stockColor}">${stockActual}</span>
                        <div style="height:3px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:4px;overflow:hidden">
                            <div style="height:100%;width:${pct}%;background:${barColor};border-radius:2px;transition:width .3s"></div>
                        </div>
                    </td>
                    <td class="table-cell cell-pad text-right font-mono muted">${ideal}</td>
                    <td class="table-cell cell-pad text-right font-mono">${costoDisplay}</td>
                    <td class="table-cell cell-pad text-right font-mono text-success">${valorizadoDisplay}</td>
                    <td class="table-cell cell-pad text-sm muted">${window.Utils?.escapeHtml?.(proveedorNombre) || proveedorNombre}</td>
                    <td class="table-cell cell-pad">
                        <span class="${statusClass}">${r.estado || '-'}</span>
                        ${pedirLink}
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        listContainer.innerHTML = html;
        renderAlertBanner(data);
    }

    function formatARS(val) {
        if (window.Utils?.formatARS) return window.Utils.formatARS(val);
        return '$ ' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    async function loadStock() {
        Utils.setPageState(ui, { loading: true });
        try {
            // Query the view + join master_sku for costo and proveedor
            const [{ data: stockData, error: stockErr }, { data: skuExtra, error: skuErr }] = await Promise.all([
                window.sb.from('vw_stock_global').select('*').eq('activo', true).order('sku_nombre'),
                window.sb.from('master_sku').select('id, costo, master_proveedores(nombre_fantasia)').eq('active', true)
            ]);

            if (stockErr) throw stockErr;
            if (skuErr) console.warn('SKU extra query error:', skuErr);

            // Build lookup for costo + proveedor
            const extraMap = {};
            (skuExtra || []).forEach(s => {
                extraMap[s.id] = {
                    costo: s.costo,
                    proveedor_nombre: s.master_proveedores?.nombre_fantasia || '-'
                };
            });

            // Merge data
            rows = (stockData || []).map(r => ({
                ...r,
                costo: extraMap[r.sku_id]?.costo || 0,
                proveedor_nombre: extraMap[r.sku_id]?.proveedor_nombre || '-'
            }));

            buildCategories();
            renderCategoryTabs();
            if (rows.length === 0) {
                if (listContainer) listContainer.innerHTML = '';
                Utils.setPageState(ui, { empty: true });
            } else {
                Utils.setPageState(ui, {});
                renderList(filteredRows());
            }
        } catch (err) {
            console.error(err);
            if (listContainer) listContainer.innerHTML = errorState(err.message);
            Utils.setPageState(ui, {});
        } finally {
            Utils.setPageState(ui, { loading: false });
        }
    }

    if (searchInput) {
        const handleSearch = debounce((e) => {
            searchTerm = e.target.value || '';
            renderList(filteredRows());
        });
        searchInput.addEventListener('input', handleSearch);
    }

    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            loadStock();
        });
    }

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.classList.contains('stock-cat-tab')) {
            const id = target.getAttribute('data-id');
            // Allow deselecting or selecting
            if (activeCategory === (id || null)) return;
            activeCategory = id || null;
            renderCategoryTabs();
            renderList(filteredRows());
        }
    });

    loadStock();
})();
