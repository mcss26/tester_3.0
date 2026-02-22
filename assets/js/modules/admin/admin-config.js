/**
 * admin-config.js
 * Cost Configuration Management - Taxes, Channels, SKU Types
 */

(async function() {
    'use strict';

    // 1. Guard de Autenticación
    const authResult = await window.Auth.guardOrRedirect(['admin', 'contable']);
    if (!authResult) return;

    // 2. Verificar Supabase
    if (!window.Utils.assertSbOrShowBlockingError()) return;
    const sb = window.sb;

    // 3. Referencias DOM
    const ui = {
        loadingState: document.getElementById('page-card-loading'),
        emptyState: document.getElementById('page-card-empty'),
        moduleContent: document.getElementById('module-content'),
        
        // Tabs
        tabBtns: document.querySelectorAll('.tab-chip'),
        tabContents: document.querySelectorAll('.tab-content'),
        
        // Tables
        taxesTableBody: document.getElementById('taxes-table-body'),
        channelsTableBody: document.getElementById('channels-table-body'),
        skuTypesTableBody: document.getElementById('sku-types-table-body'),
        
        // SKU Controls
        filterSkuType: document.getElementById('filter-sku-type'),
        selectAllSku: document.getElementById('select-all-sku'),
        btnBulkBar: document.getElementById('btn-bulk-bar'),
        btnBulkLimpieza: document.getElementById('btn-bulk-limpieza'),
        
        btnRetry: document.getElementById('btn-retry')
    };

    // 4. Estado Local
    const state = {
        taxes: [],
        channels: {},  // { channelName: { arancel, anticipo, costo_tx, ret_iibb, recargo } }
        skus: [],
        selectedSkus: new Set()
    };

    // --- INICIALIZACIÓN ---
    async function init() {
        Utils.setPageState(ui, { loading: true });
        bindEvents();
        await loadAllData();
    }

    function bindEvents() {
        // Tab switching
        ui.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
        
        // SKU filter
        ui.filterSkuType?.addEventListener('change', renderSkuTable);
        
        // Select all
        ui.selectAllSku?.addEventListener('change', (e) => {
            const checkboxes = ui.skuTypesTableBody.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
                if (e.target.checked) {
                    state.selectedSkus.add(cb.dataset.id);
                } else {
                    state.selectedSkus.clear();
                }
            });
        });
        
        // Bulk actions
        ui.btnBulkBar?.addEventListener('click', () => bulkUpdateSkuType('bar'));
        ui.btnBulkLimpieza?.addEventListener('click', () => bulkUpdateSkuType('limpieza'));
        
        // Retry
        ui.btnRetry?.addEventListener('click', init);
    }

    function switchTab(tabId) {
        ui.tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
        ui.tabContents.forEach(content => content.classList.toggle('active', content.id === `tab-${tabId}`));
    }

    // --- DATA LOADING ---
    async function loadAllData() {
        try {
            const [taxesRes, channelsRes, skusRes] = await Promise.all([
                sb.from('cost_config').select('*').eq('category', 'tax').order('name'),
                sb.from('cost_config').select('*').eq('category', 'channel').order('channel_name, fee_type'),
                sb.from('master_sku').select('id, nombre, tipo, costo, active').order('nombre')
            ]);

            if (taxesRes.error) throw taxesRes.error;
            if (channelsRes.error) throw channelsRes.error;
            if (skusRes.error) throw skusRes.error;

            state.taxes = taxesRes.data || [];
            state.skus = skusRes.data || [];

            // Group channels by channel_name
            state.channels = {};
            (channelsRes.data || []).forEach(row => {
                if (!state.channels[row.channel_name]) {
                    state.channels[row.channel_name] = {};
                }
                state.channels[row.channel_name][row.fee_type] = row;
            });

            renderTaxesTable();
            renderChannelsTable();
            renderSkuTable();
            
            Utils.setPageState(ui, {});
        } catch (err) {
            console.error('Error loading config:', err);
            Utils.setPageState(ui, { empty: true });
        }
    }

    // --- RENDER TAXES ---
    function renderTaxesTable() {
        if (!state.taxes.length) {
            ui.taxesTableBody.innerHTML = '<tr><td colspan="5" class="table-cell cell-pad muted text-center">Sin impuestos configurados</td></tr>';
            return;
        }

        ui.taxesTableBody.innerHTML = state.taxes.map(tax => `
            <tr class="table-row" data-id="${tax.id}">
                <td class="table-cell cell-pad font-bold">${window.Utils.escapeHtml(tax.name)}</td>
                <td class="table-cell cell-pad text-center">
                    <input type="number" step="0.01" class="input input-xs text-center" 
                        value="${(tax.rate * 100).toFixed(2)}" 
                        data-field="rate" data-id="${tax.id}"
                        aria-label="Tasa de ${window.Utils.escapeHtml(tax.name)}"
                        style="width: 80px;">
                </td>
                <td class="table-cell cell-pad">
                    <select class="input input-xs" data-field="applies_to" data-id="${tax.id}" aria-label="Base de aplicación para ${window.Utils.escapeHtml(tax.name)}">
                        <option value="base" ${tax.applies_to === 'base' ? 'selected' : ''}>Base imponible</option>
                        <option value="final" ${tax.applies_to === 'final' ? 'selected' : ''}>Precio final</option>
                        <option value="profit" ${tax.applies_to === 'profit' ? 'selected' : ''}>Utilidad</option>
                    </select>
                </td>
                <td class="table-cell cell-pad text-xs muted">${window.Utils.escapeHtml(tax.notes || '-')}</td>
                <td class="table-cell cell-pad text-center">
                    <input type="checkbox" ${tax.active ? 'checked' : ''} data-field="active" data-id="${tax.id}">
                </td>
            </tr>
        `).join('');

        // Bind change events
        ui.taxesTableBody.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('change', handleTaxChange);
        });
    }

    async function handleTaxChange(e) {
        const id = e.target.dataset.id;
        const field = e.target.dataset.field;
        let value;

        if (field === 'rate') {
            value = parseFloat(e.target.value) / 100; // Convert % to decimal
        } else if (field === 'active') {
            value = e.target.checked;
        } else {
            value = e.target.value;
        }

        try {
            const { error } = await sb.from('cost_config').update({ [field]: value }).eq('id', id);
            if (error) throw error;
            e.target.classList.add('is-success');
            setTimeout(() => e.target.classList.remove('is-success'), 1000);
        } catch (err) {
            console.error('Error updating tax:', err);
            window.Toast?.show('Error al guardar', 'error');
        }
    }

    // --- RENDER CHANNELS ---
    function renderChannelsTable() {
        const channelNames = Object.keys(state.channels);
        if (!channelNames.length) {
            ui.channelsTableBody.innerHTML = '<tr><td colspan="6" class="table-cell cell-pad muted text-center">Sin canales configurados</td></tr>';
            return;
        }

        ui.channelsTableBody.innerHTML = channelNames.map(name => {
            const ch = state.channels[name];
            return `
                <tr class="table-row">
                    <td class="table-cell cell-pad font-bold">${window.Utils.escapeHtml(name)}</td>
                    <td class="table-cell cell-pad text-center">
                        ${renderChannelInput(ch.arancel)}
                    </td>
                    <td class="table-cell cell-pad text-center">
                        ${renderChannelInput(ch.anticipo)}
                    </td>
                    <td class="table-cell cell-pad text-center">
                        ${renderChannelInput(ch.costo_tx)}
                    </td>
                    <td class="table-cell cell-pad text-center">
                        ${renderChannelInput(ch.ret_iibb)}
                    </td>
                    <td class="table-cell cell-pad text-center">
                        ${ch.recargo_cliente ? renderChannelInput(ch.recargo_cliente) : '<span class="muted">-</span>'}
                    </td>
                </tr>
            `;
        }).join('');

        // Bind change events
        ui.channelsTableBody.querySelectorAll('input').forEach(el => {
            el.addEventListener('change', handleChannelChange);
        });
    }

    function renderChannelInput(config) {
        if (!config) return '<span class="muted">-</span>';
        return `<input type="number" step="0.01" class="input input-xs text-center" 
            value="${(config.rate * 100).toFixed(2)}" 
            data-id="${config.id}"
            style="width: 70px;">`;
    }

    async function handleChannelChange(e) {
        const id = e.target.dataset.id;
        const value = parseFloat(e.target.value) / 100;

        try {
            const { error } = await sb.from('cost_config').update({ rate: value }).eq('id', id);
            if (error) throw error;
            e.target.classList.add('is-success');
            setTimeout(() => e.target.classList.remove('is-success'), 1000);
        } catch (err) {
            console.error('Error updating channel:', err);
            window.Toast?.show('Error al guardar', 'error');
        }
    }

    // --- RENDER SKU TYPES ---
    function renderSkuTable() {
        const filterType = ui.filterSkuType?.value || '';
        const filtered = filterType 
            ? state.skus.filter(s => s.tipo === filterType)
            : state.skus;

        if (!filtered.length) {
            ui.skuTypesTableBody.innerHTML = '<tr><td colspan="4" class="table-cell cell-pad muted text-center">Sin SKUs</td></tr>';
            return;
        }

        ui.skuTypesTableBody.innerHTML = filtered.map(sku => `
            <tr class="table-row ${!sku.active ? 'row-muted' : ''}" data-id="${sku.id}">
                <td class="table-cell cell-pad text-center">
                    <input type="checkbox" data-id="${sku.id}" aria-label="Seleccionar ${window.Utils.escapeHtml(sku.nombre)}"
                        ${state.selectedSkus.has(sku.id) ? 'checked' : ''}>
                </td>
                <td class="table-cell cell-pad">${window.Utils.escapeHtml(sku.nombre)}</td>
                <td class="table-cell cell-pad text-center">
                    <select class="input input-xs" data-field="tipo" data-id="${sku.id}" aria-label="Tipo de ${window.Utils.escapeHtml(sku.nombre)}">
                        <option value="bar" ${sku.tipo === 'bar' ? 'selected' : ''}>🍺 Bar</option>
                        <option value="limpieza" ${sku.tipo === 'limpieza' ? 'selected' : ''}>🧹 Limpieza</option>
                        <option value="descartables" ${sku.tipo === 'descartables' ? 'selected' : ''}>📦 Descartables</option>
                        <option value="otros" ${sku.tipo === 'otros' ? 'selected' : ''}>❓ Otros</option>
                    </select>
                </td>
                <td class="table-cell cell-pad text-right font-mono">
                    ${sku.costo ? '$' + sku.costo.toLocaleString('es-AR') : '-'}
                </td>
            </tr>
        `).join('');

        // Bind events
        ui.skuTypesTableBody.querySelectorAll('input[type="checkbox"]').forEach(el => {
            el.addEventListener('change', (e) => {
                if (e.target.checked) {
                    state.selectedSkus.add(e.target.dataset.id);
                } else {
                    state.selectedSkus.delete(e.target.dataset.id);
                }
            });
        });

        ui.skuTypesTableBody.querySelectorAll('select').forEach(el => {
            el.addEventListener('change', handleSkuTypeChange);
        });
    }

    async function handleSkuTypeChange(e) {
        const id = e.target.dataset.id;
        const value = e.target.value;

        try {
            const { error } = await sb.from('master_sku').update({ tipo: value }).eq('id', id);
            if (error) throw error;
            
            // Update local state
            const sku = state.skus.find(s => s.id === id);
            if (sku) sku.tipo = value;
            
            e.target.classList.add('is-success');
            setTimeout(() => e.target.classList.remove('is-success'), 1000);
        } catch (err) {
            console.error('Error updating SKU type:', err);
            window.Toast?.show('Error al guardar', 'error');
        }
    }

    async function bulkUpdateSkuType(tipo) {
        if (!state.selectedSkus.size) {
            window.Toast?.show('Seleccioná al menos un SKU', 'warning');
            return;
        }

        const ids = Array.from(state.selectedSkus);
        
        try {
            const { error } = await sb.from('master_sku').update({ tipo }).in('id', ids);
            if (error) throw error;

            // Update local state
            state.skus.forEach(sku => {
                if (ids.includes(sku.id)) sku.tipo = tipo;
            });

            state.selectedSkus.clear();
            ui.selectAllSku.checked = false;
            renderSkuTable();
            
            window.Toast?.show(`${ids.length} SKUs actualizados a "${tipo}"`, 'success');
        } catch (err) {
            console.error('Error bulk updating:', err);
            window.Toast?.show('Error al actualizar', 'error');
        }
    }

    init();

})();
