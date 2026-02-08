(async function() {
  'use strict';
    const listContainer = document.getElementById('list-container');
    const searchInput = document.getElementById('stock-search');
    const btnRefresh = document.getElementById('btn-refresh');
    const categoryTabs = document.getElementById('stock-tabs');
    const moduleContent = document.getElementById('module-content');
    const pageCardLoading = document.getElementById('page-card-loading');
    const pageCardEmpty = document.getElementById('page-card-empty');

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

    function setLoading(isLoading) {
        if (!pageCardLoading || !moduleContent) return;
        if (isLoading) {
            pageCardLoading.classList.add('is-visible');
            moduleContent.classList.add('hidden');
            if (pageCardEmpty) pageCardEmpty.classList.remove('is-visible');
        } else {
            pageCardLoading.classList.remove('is-visible');
            if (!pageCardEmpty?.classList.contains('is-visible')) {
                moduleContent.classList.remove('hidden');
            }
        }
    }

    function toggleEmptyState(show) {
        if (!pageCardEmpty || !moduleContent) return;
        if (show) {
            pageCardEmpty.classList.add('is-visible');
            moduleContent.classList.add('hidden');
        } else {
            pageCardEmpty.classList.remove('is-visible');
            moduleContent.classList.remove('hidden');
        }
    }

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

    function renderList(data) {
        if (!listContainer) return;
        if (!data || data.length === 0) {
            listContainer.innerHTML = emptyState;
            return;
        }

        let html = `
            <div class="table-scroll">
                <table class="table">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">SKU</th>
                            <th class="table-cell is-header cell-pad">Stock actual</th>
                            <th class="table-cell is-header cell-pad">Requerido</th>
                            <th class="table-cell is-header cell-pad">Diferencia</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach((r) => {
            const stockActual = r.stock_actual ?? 0;
            const requerido = r.requerido ?? 0;
            const diferencia = stockActual - requerido;
            const isLow = stockActual < requerido;
            const statusClass = isLow ? 'status-pill status-error' : 'status-pill status-success';
            const rowClass = isLow ? 'table-row row-subtle' : 'table-row';
            const stockClass = isLow ? 'danger' : '';
            
            // Difference styling
            let diffClass = 'muted';
            if (diferencia < 0) diffClass = 'text-error';
            else if (diferencia > 0) diffClass = 'text-success';

            html += `
                <tr class="${rowClass}">
                    <td class="table-cell cell-pad cell-strong">${r.sku_nombre || '-'}</td>
                    <td class="table-cell cell-pad ${stockClass}">${stockActual}</td>
                    <td class="table-cell cell-pad muted">${requerido}</td>
                    <td class="table-cell cell-pad ${diffClass}">${diferencia > 0 ? '+' : ''}${diferencia}</td>
                    <td class="table-cell cell-pad"><span class="${statusClass}">${r.estado || '-'}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        listContainer.innerHTML = html;
    }

    async function loadStock() {
        setLoading(true);
        try {
            const { data, error } = await window.sb
                .from('vw_stock_global')
                .select('*')
                .eq('activo', true)
                .order('sku_nombre');

            if (error) throw error;
            rows = data || [];
            buildCategories();
            renderCategoryTabs();
            if (rows.length === 0) {
                if (listContainer) listContainer.innerHTML = '';
                toggleEmptyState(true);
            } else {
                toggleEmptyState(false);
                renderList(filteredRows());
            }
        } catch (err) {
            console.error(err);
            if (listContainer) listContainer.innerHTML = errorState(err.message);
            toggleEmptyState(false);
        } finally {
            setLoading(false);
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
