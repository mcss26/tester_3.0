// Module: operativo-master-sku.js
// Operativo SKU change requests (pending admin approval)

(async function() {
  'use strict';
    const session = await window.Auth.guardOrRedirect(['operativo', 'staff_barra', 'staff_operativo', 'admin', 'contable']);
    if (!session) return;

    const listContainer = document.getElementById('requests-list-container');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnRefreshMaster = document.getElementById('btn-refresh-master');
    const viewTabs = document.getElementById('sku-view-tabs');
    const viewRequests = document.getElementById('view-requests');
    const viewMaster = document.getElementById('view-master');
    const masterListContainer = document.getElementById('master-list-container');
    const moduleContent = document.getElementById('module-content');
    const pageCardLoading = document.getElementById('page-card-loading');
    const pageCardEmpty = document.getElementById('page-card-empty');

    const selType = document.getElementById('req-type');
    const selSku = document.getElementById('req-sku');
    const inpNombre = document.getElementById('req-nombre');
    const inpMl = document.getElementById('req-ml');
    const inpPack = document.getElementById('req-pack');
    const inpCosto = document.getElementById('req-costo');
    const inpCostoPack = document.getElementById('req-costo-pack');
    const inpProveedor = document.getElementById('req-proveedor');
    const inpExternalId = document.getElementById('req-external-id');
    const inpJustification = document.getElementById('req-justification');

    const sectionSku = document.querySelector('[data-section="sku"]');
    const sectionCore = document.querySelector('[data-section="core"]');
    const sectionPack = document.querySelector('[data-section="pack"]');
    const sectionPrice = document.querySelector('[data-section="price"]');
    const sectionSupplier = document.querySelector('[data-section="supplier"]');

    if (!window.Utils?.assertSbOrShowBlockingError?.(listContainer)) return;

    const numberOrNull = (window.Utils && window.Utils.numberOrNull) || ((v) => {
        if (v === null || v === undefined) return null;
        const n = parseFloat(String(v).replace(',', '.'));
        return Number.isFinite(n) ? n : null;
    });

    const loadingState = '<div class="empty-state">Cargando solicitudes...</div>';
    const emptyState = '<div class="empty-state">No hay solicitudes registradas.</div>';
    const errorState = (msg) => `<div class="empty-state accent">Error: ${msg}</div>`;

    let requests = [];
    let providers = [];
    let skuOptions = [];
    let skuRows = [];
    let activeView = 'requests';

    function setLoading(isLoading) {
        if (!pageCardLoading || !moduleContent) return;
        if (isLoading) {
            pageCardLoading.classList.add('is-visible');
            moduleContent.classList.add('hidden');
            if (pageCardEmpty) pageCardEmpty.classList.remove('is-visible');
        } else {
            pageCardLoading.classList.remove('is-visible');
            moduleContent.classList.remove('hidden');
        }
    }

    const typeLabels = {
        create: 'Agregar SKU',
        update: 'Editar SKU',
        deactivate: 'Quitar SKU',
        price_update: 'Modificar precio',
        pack_update: 'Modificar pack',
        supplier_update: 'Cambiar proveedor favorito'
    };

    function setSectionVisibility(el, visible) {
        if (!el) return;
        el.classList.toggle('hidden', !visible);
    }

    function renderViewTabs() {
        if (!viewTabs) return;
        viewTabs.querySelectorAll('[data-view]').forEach((btn) => {
            const view = btn.getAttribute('data-view');
            btn.classList.toggle('active', view === activeView);
        });
    }

    function setActiveView(view) {
        activeView = view;
        renderViewTabs();
        if (viewRequests) viewRequests.classList.toggle('hidden', view !== 'requests');
        if (viewMaster) viewMaster.classList.toggle('hidden', view !== 'master');
    }

    function resetForm() {
        if (selType) selType.value = '';
        if (selSku) selSku.value = '';
        if (inpNombre) inpNombre.value = '';
        if (inpMl) inpMl.value = '';
        if (inpPack) inpPack.value = '';
        if (inpCosto) inpCosto.value = '';
        if (inpCostoPack) inpCostoPack.value = '';
        if (inpProveedor) inpProveedor.value = '';
        if (inpExternalId) inpExternalId.value = '';
        if (inpJustification) inpJustification.value = '';
    }

    function updateFormVisibility() {
        const type = selType?.value || '';
        const showSku = type && type !== 'create';
        const showCore = type === 'create' || type === 'update';
        const showPack = type === 'create' || type === 'update' || type === 'pack_update';
        const showPrice = type === 'create' || type === 'update' || type === 'price_update';
        const showSupplier = type === 'create' || type === 'update' || type === 'supplier_update';

        setSectionVisibility(sectionSku, showSku);
        setSectionVisibility(sectionCore, showCore);
        setSectionVisibility(sectionPack, showPack);
        setSectionVisibility(sectionPrice, showPrice);
        setSectionVisibility(sectionSupplier, showSupplier);

        if (selSku) selSku.required = showSku;
    }

    function renderSkuOptions() {
        if (!selSku) return;
        const options = skuOptions.map((sku) => {
            const hasId = sku.id !== null && sku.id !== undefined && sku.id !== '';
            const value = hasId ? String(sku.id) : sku.name;
            return `<option value="${value}" data-name="${sku.name}" data-has-id="${hasId ? '1' : '0'}">${sku.name}</option>`;
        });
        selSku.innerHTML = ['<option value="">Seleccionar SKU</option>', ...options].join('');
    }

    function renderProviderOptions() {
        if (!inpProveedor) return;
        const options = providers.map((prov) => `<option value="${prov.id}">${window.Utils.escapeHtml(prov.nombre_fantasia)}</option>`);
        inpProveedor.innerHTML = ['<option value="">Seleccionar proveedor</option>', ...options].join('');
    }

    function renderMasterList(data) {
        if (!masterListContainer) return;
        if (!data || data.length === 0) {
            masterListContainer.innerHTML = '<div class="empty-state">No hay SKUs activos.</div>';
            return;
        }

        const formatCurrency = window.Utils?.formatARS || ((v) => `$${(v || 0).toLocaleString('es-AR')}`);

        let html = `
            <div class="table-scroll">
                <table class="table">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header">Nombre</th>
                            <th class="table-cell is-header text-center">ML</th>
                            <th class="table-cell is-header text-right">Costo</th>
                            <th class="table-cell is-header text-center">Pack</th>
                            <th class="table-cell is-header text-right">Costo Pack</th>
                            <th class="table-cell is-header">Proveedor</th>
                            <th class="table-cell is-header">Categoría</th>
                            <th class="table-cell is-header text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach((row) => {
            const ml = row.ml_por_unidad ?? '-';
            const costo = row.costo != null ? formatCurrency(row.costo) : '-';
            const packQty = row.pack_qty ?? '-';
            const costoPack = row.costo_pack != null ? formatCurrency(row.costo_pack) : '-';
            const proveedor = row.proveedor_nombre || '-';
            const categoria = row.categoria_nombre || '-';

            html += `
                <tr class="table-row" data-sku-id="${row.sku_id}" data-sku-name="${row.sku_nombre || ''}">
                    <td class="table-cell cell-strong">${row.sku_nombre || '-'}</td>
                    <td class="table-cell text-center muted">${ml}</td>
                    <td class="table-cell text-right">${costo}</td>
                    <td class="table-cell text-center">${packQty}</td>
                    <td class="table-cell text-right muted">${costoPack}</td>
                    <td class="table-cell muted">${proveedor}</td>
                    <td class="table-cell muted">${categoria}</td>
                    <td class="table-cell text-center">
                        <button class="btn-ghost btn-sm btn-request-change" 
                                data-sku-id="${row.sku_id}" 
                                data-sku-name="${row.sku_nombre || ''}">
                            Solicitar Cambio
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        masterListContainer.innerHTML = html;

        // Agregar listeners para los botones de solicitar cambio
        masterListContainer.querySelectorAll('.btn-request-change').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skuId = e.target.dataset.skuId;
                const skuName = e.target.dataset.skuName;
                openRequestPanelForSku(skuId, skuName);
            });
        });
    }

    // Función helper para abrir panel con SKU preseleccionado
    function openRequestPanelForSku(skuId, skuName) {
        if (panelCtrl?.open) panelCtrl.open();
        
        // Preseleccionar tipo "update" y el SKU
        setTimeout(() => {
            if (selType) {
                selType.value = 'update';
                updateFormVisibility();
            }
            if (selSku && skuId) {
                selSku.value = skuId;
            }
        }, 100);
    }

    function formatChanges(payload) {
        if (!payload) return '-';
        const safePayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const parts = [];

        if (safePayload.nombre) parts.push(`Nombre: ${safePayload.nombre}`);
        if (safePayload.ml_por_unidad != null) parts.push(`ML: ${safePayload.ml_por_unidad}`);
        if (safePayload.pack_qty != null) parts.push(`Pack: ${safePayload.pack_qty}`);
        if (safePayload.costo != null) parts.push(`Costo: $${safePayload.costo}`);
        if (safePayload.costo_pack != null) parts.push(`Costo pack: $${safePayload.costo_pack}`);
        if (safePayload.external_id) parts.push(`ID ext: ${safePayload.external_id}`);
        if (safePayload.proveedor_default_id) {
            const prov = providers.find((p) => String(p.id) === String(safePayload.proveedor_default_id));
            parts.push(`Proveedor: ${prov ? prov.nombre_fantasia : safePayload.proveedor_default_id}`);
        }

        return parts.length ? parts.join(' · ') : '-';
    }

    function renderRequests(data) {
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
                            <th class="table-cell is-header cell-pad">Fecha</th>
                            <th class="table-cell is-header cell-pad">Tipo</th>
                            <th class="table-cell is-header cell-pad">SKU</th>
                            <th class="table-cell is-header cell-pad">Cambios</th>
                            <th class="table-cell is-header cell-pad">Motivo</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach((req) => {
            const createdAt = req.created_at ? new Date(req.created_at).toLocaleString() : '-';
            const skuName = req.sku_nombre || req.payload?.nombre || '-';
            const typeLabel = typeLabels[req.request_type] || req.request_type || '-';
            const statusClass = req.status === 'approved'
                ? 'status-pill status-success'
                : req.status === 'rejected'
                    ? 'status-pill status-error'
                    : 'status-pill status-warning';

            html += `
                <tr class="table-row">
                    <td class="table-cell cell-pad">${createdAt}</td>
                    <td class="table-cell cell-pad">${typeLabel}</td>
                    <td class="table-cell cell-pad cell-strong">${skuName}</td>
                    <td class="table-cell cell-pad muted">${formatChanges(req.payload)}</td>
                    <td class="table-cell cell-pad muted">${req.justification || '-'}</td>
                    <td class="table-cell cell-pad"><span class="${statusClass}">${req.status || 'pending'}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        listContainer.innerHTML = html;
    }

    async function loadRequests() {
        if (listContainer) listContainer.innerHTML = loadingState;
        try {
            const { data, error } = await window.sb
                .from('sku_change_requests')
                .select('id, created_at, status, request_type, sku_id, sku_nombre, justification, payload')
                .eq('requested_by', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            requests = data || [];
            renderRequests(requests);
        } catch (err) {
            console.error('Error loading requests:', err);
            if (listContainer) listContainer.innerHTML = errorState(err.message);
        }
    }

    async function loadProviders() {
        try {
            const { data, error } = await window.sb
                .from('master_proveedores')
                .select('id, nombre_fantasia')
                .eq('active', true)
                .order('nombre_fantasia');
            if (error) throw error;
            providers = data || [];
            renderProviderOptions();
        } catch (err) {
            console.error('Error loading providers:', err);
            providers = [];
            renderProviderOptions();
        }
    }

    async function loadSkus() {
        try {
            // Carga desde master_sku con joins a categorías y proveedores
            const { data, error } = await window.sb
                .from('master_sku')
                .select(`
                    id,
                    name,
                    ml_por_unidad,
                    cost_price,
                    pack_qty,
                    pack_cost,
                    is_active,
                    external_id,
                    master_categories!categoria_id(id, name),
                    master_proveedores!proveedor_default_id(id, nombre_fantasia)
                `)
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            
            skuRows = (data || []).map(row => ({
                sku_id: row.id,
                sku_nombre: row.name,
                ml_por_unidad: row.ml_por_unidad,
                costo: row.cost_price,
                pack_qty: row.pack_qty,
                costo_pack: row.pack_cost,
                activo: row.is_active,
                external_id: row.external_id,
                categoria_id: row.master_categories?.id,
                categoria_nombre: row.master_categories?.name,
                proveedor_id: row.master_proveedores?.id,
                proveedor_nombre: row.master_proveedores?.nombre_fantasia
            }));

            skuOptions = skuRows.map((row) => ({
                id: row.sku_id || null,
                name: row.sku_nombre || 'SKU'
            }));

            renderSkuOptions();
            renderMasterList(skuRows);
        } catch (err) {
            console.error('Error loading SKUs:', err);
            skuOptions = [];
            skuRows = [];
            renderSkuOptions();
            renderMasterList([]);
        }
    }

    const panelCtrl = initSlidePanel({
        onOpen: () => {
            resetForm();
            updateFormVisibility();
        },
        onClose: () => resetForm(),
        onSave: async () => {
            const requestType = selType?.value || '';
            const justification = (inpJustification?.value || '').trim();
            const selectedSku = selSku?.selectedOptions?.[0];
            const skuValue = selectedSku?.value || '';
            const hasId = selectedSku?.dataset?.hasId === '1';
            const skuId = hasId ? skuValue : null;
            const skuName = selectedSku?.dataset?.name || selectedSku?.textContent || null;

            if (!requestType) throw new Error('Seleccioná el tipo de solicitud.');
            if (requestType !== 'create' && !skuValue) throw new Error('Seleccioná un SKU existente.');
            if (!justification) throw new Error('La justificación es obligatoria.');

            const payload = {};
            const nombre = (inpNombre?.value || '').trim();
            const ml = numberOrNull(inpMl?.value);
            const pack = numberOrNull(inpPack?.value);
            const costo = numberOrNull(inpCosto?.value);
            const costoPack = numberOrNull(inpCostoPack?.value);
            const proveedor = (inpProveedor?.value || '').trim();
            const externalId = (inpExternalId?.value || '').trim();

            if (nombre) payload.nombre = nombre;
            if (ml != null) payload.ml_por_unidad = ml;
            if (pack != null) payload.pack_qty = pack;
            if (costo != null) payload.costo = costo;
            if (costoPack != null) payload.costo_pack = costoPack;
            if (proveedor) payload.proveedor_default_id = proveedor;
            if (externalId) payload.external_id = externalId;

            if (requestType === 'create' && !payload.nombre) {
                throw new Error('El nombre del SKU es obligatorio para crear.');
            }

            if (requestType !== 'deactivate' && Object.keys(payload).length === 0) {
                throw new Error('Indicá al menos un cambio para solicitar.');
            }

            const { error } = await window.sb
                .from('sku_change_requests')
                .insert([{
                    request_type: requestType,
                    sku_id: skuId || null,
                    sku_nombre: skuName || payload.nombre || null,
                    payload,
                    justification,
                    status: 'pending',
                    requested_by: session.user.id
                }]);

            if (error) throw error;

            await loadRequests();
            if (panelCtrl?.close) panelCtrl.close();
        }
    });

    if (selType) {
        selType.addEventListener('change', updateFormVisibility);
    }

    if (viewTabs) {
        viewTabs.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.classList.contains('tab-chip')) {
                const view = target.getAttribute('data-view');
                if (!view || view === activeView) return;
                setActiveView(view);
            }
        });
    }

    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            loadRequests();
        });
    }

    if (btnRefreshMaster) {
        btnRefreshMaster.addEventListener('click', () => {
            loadSkus();
        });
    }

    setLoading(true);
    try {
        await Promise.all([loadProviders(), loadSkus()]);
        await loadRequests();
    } finally {
        setLoading(false);
    }
    renderViewTabs();
    setActiveView(activeView);
})();
