/**
 * admin-central-stock.js
 * Unified Stock Analysis Tool - Single Table View
 * Version: 2.0 (Refactored from tabbed to unified)
 */
(async function() {
    'use strict';

    // 1. Guard de Autenticación
    const authResult = await window.Auth.guardOrRedirect(['admin', 'contable', 'logistico']);
    if (!authResult) return;

    // 2. Verificar Supabase
    if (!window.Utils.assertSbOrShowBlockingError()) return;
    const sb = window.sb;

    // 3. Referencias DOM
    const ui = {
        loadingState: document.getElementById('page-card-loading'),
        emptyState: document.getElementById('page-card-empty'),
        moduleContent: document.getElementById('module-content'),
        
        // Toolbar
        filterStart: document.getElementById('filter-date-start'),
        filterEnd: document.getElementById('filter-date-end'),
        btnApplyFilter: document.getElementById('btn-apply-filter'),
        // btnImport removed — import now uses sidebar dropboxes
        btnExport: document.getElementById('btn-export'),
        btnTop5Chart: document.getElementById('btn-top5-chart'),
        btnNewSku: document.getElementById('btn-new-sku'),
        
        // SKU Filters
        categoryPills: document.getElementById('category-pills'),
        
        // Stats
        statSkuCount: document.getElementById('stat-sku-count'),
        statTotalConsumption: document.getElementById('stat-total-consumption'),
        statReportCount: document.getElementById('stat-report-count'),
        statValorizadoActivo: document.getElementById('stat-valorizado-activo'),
        statValorizadoInactivo: document.getElementById('stat-valorizado-inactivo'),
        statValorizadoTotal: document.getElementById('stat-valorizado-total'),
        
        // Table
        tableBody: document.getElementById('main-table-body'),
        
        // Chart
        chartContainer: document.getElementById('chart-container'),
        top5ChartCanvas: document.getElementById('top5-chart'),  // Inline chart above table
        chartMode: document.getElementById('chart-mode'),
        historyChartCanvas: document.getElementById('history-chart'),  // Modal chart
        chartModal: document.getElementById('chartModal'),
        
        // Import History Modal
        btnViewImports: document.getElementById('btn-view-imports'),
        importsModal: document.getElementById('importsModal'),
        importTabConsumption: document.getElementById('import-tab-consumption'),
        importTabRevenue: document.getElementById('import-tab-revenue'),
        importContentConsumption: document.getElementById('import-content-consumption'),
        importContentRevenue: document.getElementById('import-content-revenue'),
        consumptionReportsTbody: document.getElementById('consumption-reports-tbody'),
        revenueReportsTbody: document.getElementById('revenue-reports-tbody'),
        
        // Import Modal — removed (replaced by sidebar dropboxes)
        btnCloseChart: document.getElementById('btn-close-chart'),
        btnRetry: document.getElementById('btn-retry'),
        
        // Tabs
        tabsContainer: document.getElementById('herramientas-tabs'),
        tabStock: document.getElementById('tab-stock'),
        tabRentabilidad: document.getElementById('tab-rentabilidad'),
        
        // Profitability Tab
        filterRecipeSearch: document.getElementById('filter-recipe-search'),
        filterProfitabilityFlag: document.getElementById('filter-profitability-flag'),
        btnExportProfitability: document.getElementById('btn-export-profitability'),
        btnRefreshProfitability: document.getElementById('btn-refresh-profitability'),
        statRecipesPriced: document.getElementById('stat-recipes-priced'),
        statAvgRoi: document.getElementById('stat-avg-roi'),
        statBestMargin: document.getElementById('stat-best-margin'),
        profitabilityTableBody: document.getElementById('profitability-table-body'),
        
        // Slide Panel SKU
        panelTitle: document.getElementById('panel-title'),
        inpNombre: document.getElementById('sku-nombre'),
        selCategoria: document.getElementById('sku-categoria'),
        selProveedor: document.getElementById('sku-proveedor'),
        inpPack: document.getElementById('sku-pack'),
        inpMl: document.getElementById('sku-ml'),
        inpCosto: document.getElementById('sku-costo'),
        inpCostoPack: document.getElementById('sku-costo-pack'),
        inpExternalId: document.getElementById('sku-external-id'),
        chkActive: document.getElementById('sku-active'),
        btnSaveSku: document.getElementById('btn-save-sku'),
        btnCancelSku: document.getElementById('btn-cancel-sku'),
        
        // Recetas Tab
        tabRecetas: document.getElementById('tab-recetas'),
        searchRecipe: document.getElementById('search-recipe'),
        btnNewRecipe: document.getElementById('btn-new-recipe'),
        statRecipeCount: document.getElementById('stat-recipe-count'),
        statRecipePriced: document.getElementById('stat-recipe-priced'),
        recipeTableBody: document.getElementById('recipe-table-body'),
        
        // Recipe Modal
        recipeModal: document.getElementById('modal-recipe'),
        recipeModalTitle: document.getElementById('recipe-modal-title'),
        recipeInpName: document.getElementById('recipe-name'),
        recipeInpExtId: document.getElementById('recipe-external-id'),
        ingredientsContainer: document.getElementById('ingredients-container'),
        tplIngredient: document.getElementById('tpl-ingredient-row'),
        btnAddIngredient: document.getElementById('btn-add-ingredient'),
        btnSaveRecipe: document.getElementById('btn-save-recipe'),
        btnCancelRecipe: document.getElementById('btn-cancel-recipe'),
        btnCloseRecipeModal: document.getElementById('btn-close-recipe-modal'),
        
        // Code Mappings Modal
        codeMappingsModal: document.getElementById('modal-code-mappings'),
        btnManageCodes: document.getElementById('btn-manage-codes'),
        btnCloseCodeMappings: document.getElementById('btn-close-code-mappings'),
        inputPosCode: document.getElementById('input-pos-code'),
        selectRecipe: document.getElementById('select-recipe'),
        btnAddMapping: document.getElementById('btn-add-mapping'),
        codeMappingsTableBody: document.getElementById('code-mappings-table-body'),
        
        // People Count
        peopleCountInput: document.getElementById('people-count'),
        
        // SKU Filters (select + search + status button)
        categoryFilter: document.getElementById('category-filter'),
        searchSku: document.getElementById('search-sku'),
        filterStatusBtn: document.getElementById('filter-status-btn'),
        statusIndicator: document.getElementById('status-indicator'),
        filterCount: document.getElementById('filter-count'),
        
        // Requests Widget
        requestsBadge: document.getElementById('requests-badge'),
        requestsCompactList: document.getElementById('requests-compact-list'),
        btnViewAllRequests: document.getElementById('btn-view-all-requests'),
        requestsToggle: document.getElementById('requests-toggle'),
        requestsWidgetBody: document.getElementById('requests-widget-body'),
        
        // Manual Adjustment Modal
        btnManualAdjustment: document.getElementById('btn-manual-adjustment'),
        adjustmentModal: document.getElementById('modal-adjustment'),
        btnCloseAdjustment: document.getElementById('btn-close-adjustment'),
        btnCancelAdjustment: document.getElementById('btn-cancel-adjustment'),
        adjustmentForm: document.getElementById('adjustment-form-modal'),
        selSkuAdjustment: document.getElementById('select-sku-modal'),
        displayStockAdjustment: document.getElementById('current-stock-display-modal'),
        inputTypeAdjustment: document.getElementById('input-type-modal'),
        inputQtyAdjustment: document.getElementById('input-qty-modal'),
        inputReasonAdjustment: document.getElementById('input-reason-modal'),
        qtyHintAdjustment: document.getElementById('qty-hint-modal'),
        typeBtnsAdjustment: document.querySelectorAll('#modal-adjustment .type-btn'),
    };

    // 4. Estado Local
    const state = {
        skuData: [],
        categories: [],
        providers: [],
        dateRange: { start: null, end: null },
        importData: [],
        importFileName: '',
        importType: 'consumo', // 'consumo' or 'recaudacion'
        revenueData: {}, // { skuId: expectedConsumption }
        recipes: [], // Cached master_recipes
        codeMappings: [], // Manual POS code → recipe mappings
        chartInstance: null,
        reportCount: 0,
        // Profitability
        activeTab: 'stock',
        profitabilityData: [],
        profitabilityFilter: { search: '', flag: 'all' },
        // SKU Editing
        editingSkuId: null,
        // Recipe Editing
        recipesList: [],
        editingRecipeId: null,
        // People Count for Stock Ideal
        peopleCount: 500,
        avgPeopleInRange: 0,
        // SKU Filters
        skuFilter: { category: 'all', search: '', status: 'active' },
        // SKU Change Requests
        pendingRequests: []
    };
    
    // Panel Controller
    let panelCtrl = null;

    // --- INICIALIZACIÓN ---

    async function init() {
        setPageState('loading');
        try {
            setupDefaultDates();
            panelCtrl = window.initSlidePanel ? window.initSlidePanel() : null;
            bindEvents();
            bindRecipeEvents();
            // Initialize charts
            await renderChart();

            // Initialize Dropboxes
            setupDropbox('dropbox-consumption', 'file-consumption', async (file) => {
                console.log('Consumption file:', file.name);
                // TODO: Implement consumption import logic
                window.Toast?.info(`Archivo "${file.name}" listo para procesar (Consumo)`);
            });

            setupDropbox('dropbox-revenue', 'file-revenue', async (file) => {
                console.log('Revenue file:', file.name);
                // TODO: Implement revenue import logic
                window.Toast?.info(`Archivo "${file.name}" listo para procesar (Recaudación)`);
            });

            // Bind requests widget events
            bindRequestsWidgetEvents();

            // Load categories and providers for filters/pills
            await loadOptions();
            
            // Load initial data
            await loadUnifiedData();
            
            // Load pending SKU change requests for sidebar widget
            await loadPendingRequests();
            
            setPageState('ready');
        } catch (e) {
            console.error('Init error:', e);
            window.Toast?.error('Error inicializando análisis');
            setPageState('empty');
        }
    }

    function setPageState(s) {
        if (!window.Utils?.setPageState) return;
        window.Utils.setPageState(ui, {
            loading: s === 'loading',
            empty: s === 'empty'
        });
    }

    function setupDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (ui.filterStart) ui.filterStart.value = thirtyDaysAgo;
        if (ui.filterEnd) ui.filterEnd.value = today;
        // importDate removed — import date now determined by dropbox flow
        
        state.dateRange.start = thirtyDaysAgo;
        state.dateRange.end = today;
    }

    function bindEvents() {
    ui.btnApplyFilter?.addEventListener('click', handleApplyFilter);
    
    // Auto-submit on date change (no "Apply" button needed)
    ui.filterStart?.addEventListener('change', handleApplyFilter);
    ui.filterEnd?.addEventListener('change', handleApplyFilter);
    
    // Stats accordion toggle
    const statsToggle = document.getElementById('stats-toggle');
    const statsBody = document.getElementById('stats-body');
    statsToggle?.addEventListener('click', () => {
        statsToggle.classList.toggle('collapsed');
        statsBody.classList.toggle('collapsed');
    });
    
        ui.btnExport?.addEventListener('click', handleExport);
        ui.btnTop5Chart?.addEventListener('click', openChartModal);
        
        // Chart mode switching
        ui.chartMode?.addEventListener('change', renderChart);
        
        // Import history modal
        ui.btnViewImports?.addEventListener('click', openImportsModal);
        ui.importTabConsumption?.addEventListener('click', () => switchImportTab('consumption'));
        ui.importTabRevenue?.addEventListener('click', () => switchImportTab('revenue'));
        
        ui.btnRetry?.addEventListener('click', () => location.reload());
        
        // Tab switching
        ui.tabsContainer?.addEventListener('click', handleTabClick);
        
        // Profitability filters
        ui.btnRefreshProfitability?.addEventListener('click', loadProfitabilityData);
        ui.btnExportProfitability?.addEventListener('click', handleExportProfitability);
        ui.filterRecipeSearch?.addEventListener('input', debounce(renderProfitabilityTable, 300));
        ui.filterProfitabilityFlag?.addEventListener('change', renderProfitabilityTable);
        
        // SKU Panel
        ui.btnNewSku?.addEventListener('click', openNewSkuPanel);
        ui.btnSaveSku?.addEventListener('click', saveSku);
        ui.btnCancelSku?.addEventListener('click', () => panelCtrl?.close());
        
        // People Count
        ui.peopleCountInput?.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            if (value >= 50 && value <= 2000) {
                state.peopleCount = value;
                recalculateIdealStock();
            } else {
                window.Toast?.warning('Ingrese un valor entre 50 y 2000');
                e.target.value = state.peopleCount; // Reset to previous value
            }
        });
        
        // SKU Filters: Category Select Change
        ui.categoryFilter?.addEventListener('change', (e) => {
            state.skuFilter.category = e.target.value;
            renderTable();
        });
        
        // SKU Filters: Search input
        ui.searchSku?.addEventListener('input', debounce((e) => {
            state.skuFilter.search = e.target.value.trim();
            renderTable();
        }, 300));
        
        // SKU Filters: Status toggle button (cycles: active -> inactive -> all)
        ui.filterStatusBtn?.addEventListener('click', () => {
            const states = ['active', 'inactive', 'all'];
            const labels = { active: 'Activos', inactive: 'Inactivos', all: 'Todos' };
            const colors = { active: '#05df72', inactive: '#ff453a', all: '#888' };
            
            const currentIndex = states.indexOf(state.skuFilter.status);
            const nextIndex = (currentIndex + 1) % states.length;
            const nextStatus = states[nextIndex];
            
            state.skuFilter.status = nextStatus;
            
            // Update button UI
            ui.filterStatusBtn.querySelector('span:first-child').textContent = labels[nextStatus];
            if (ui.statusIndicator) {
                ui.statusIndicator.style.backgroundColor = colors[nextStatus];
            }
            
            renderTable();
        });

        // Custom Dropdown for Chart Mode
        const dropdown = document.getElementById('chart-mode-dropdown');
        const trigger = document.getElementById('dropdown-trigger');
        const menu = document.getElementById('dropdown-menu');
        const options = menu?.querySelectorAll('.custom-dropdown-option');

        if (trigger && menu && options) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('is-open');
            });

            options.forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    const text = option.textContent;
                    
                    const triggerText = trigger.querySelector('.custom-dropdown-text');
                    if (triggerText) triggerText.textContent = text;
                    
                    dropdown.classList.remove('is-open');
                    
                    // Sync with hidden select and trigger change event
                    const hiddenSelect = document.getElementById('chart-mode');
                    if (hiddenSelect) {
                        hiddenSelect.value = value;
                        hiddenSelect.dispatchEvent(new Event('change'));
                    }
                });
            });

            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('is-open');
                }
            });
        }
        
        // Manual Adjustment Modal Bindings
        ui.btnManualAdjustment?.addEventListener('click', openAdjustmentModal);
        ui.btnCloseAdjustment?.addEventListener('click', () => ui.adjustmentModal?.classList.add('hidden'));
        ui.btnCancelAdjustment?.addEventListener('click', () => ui.adjustmentModal?.classList.add('hidden'));
        
        // Close on outside click
        ui.adjustmentModal?.addEventListener('click', (e) => {
            if (e.target === ui.adjustmentModal) ui.adjustmentModal.classList.add('hidden');
        });
        
        // SKU Change in Modal
        ui.selSkuAdjustment?.addEventListener('change', (e) => {
            const skuId = e.target.value;
            const sku = state.skuData.find(s => String(s.id) === String(skuId));
            if (ui.displayStockAdjustment) {
                ui.displayStockAdjustment.textContent = sku ? `${sku.stock} UN` : '-';
                ui.displayStockAdjustment.classList.toggle('text-red-500', sku && typeof sku.stock === 'number' && sku.stock <= 0);
            }
        });
        
        // Type Buttons
        ui.typeBtnsAdjustment.forEach(btn => {
            btn.addEventListener('click', () => {
                ui.typeBtnsAdjustment.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (ui.inputTypeAdjustment) ui.inputTypeAdjustment.value = btn.dataset.type;
                updateAdjustmentHint();
            });
        });
        
        ui.inputQtyAdjustment?.addEventListener('input', updateAdjustmentHint);
        
        
        // Category Dropdown Trigger
        const catTrigger = document.getElementById('category-trigger');
        const catDropdown = document.getElementById('category-dropdown');
        if (catTrigger && catDropdown) {
             catTrigger.addEventListener('click', (e) => {
                 e.stopPropagation();
                 catDropdown.classList.toggle('is-open');
                 // Close other dropdowns
                 document.getElementById('chart-mode-dropdown')?.classList.remove('is-open');
             });
             document.addEventListener('click', (e) => {
                 if (!catDropdown.contains(e.target)) catDropdown.classList.remove('is-open');
             });
        }

        ui.adjustmentForm?.addEventListener('submit', handleAdjustmentSubmit);
    }
    
    function updateAdjustmentHint() {
        const qty = parseInt(ui.inputQtyAdjustment?.value) || 0;
        if (ui.qtyHintAdjustment) {
            ui.qtyHintAdjustment.textContent = `(-${qty} UN)`;
        }
    }
    
    // Simple debounce helper
    function debounce(fn, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }
    
    // Tab switching
    function handleTabClick(e) {
        const btn = e.target.closest('.tab-chip');
        if (!btn) return;
        
        const tab = btn.dataset.tab;
        if (!tab || tab === state.activeTab) return;
        
        state.activeTab = tab;
        
        // Update tab buttons
        ui.tabsContainer.querySelectorAll('.tab-chip').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        
        // Hide all tabs
        ui.tabStock?.classList.add('hidden');
        ui.tabRecetas?.classList.add('hidden');
        ui.tabRentabilidad?.classList.add('hidden');
        
        // Show selected tab
        if (tab === 'stock') {
            ui.tabStock?.classList.remove('hidden');
        } else if (tab === 'recetas') {
            ui.tabRecetas?.classList.remove('hidden');
            // Load recipes if not loaded
            if (state.recipesList.length === 0) {
                loadRecipes();
            }
        } else if (tab === 'rentabilidad') {
            ui.tabRentabilidad?.classList.remove('hidden');
            // Load data if not loaded
            if (state.profitabilityData.length === 0) {
                loadProfitabilityData();
            }
        }
    }

    // --- REQUESTS WIDGET (Sidebar) ---
    
    const requestTypeLabels = {
        create: 'Nuevo SKU',
        update: 'Editar SKU',
        deactivate: 'Desactivar',
        price_update: 'Cambio Precio',
        pack_update: 'Cambio Pack',
        supplier_update: 'Cambio Proveedor'
    };
    
    async function loadPendingRequests() {
        try {
            const { data, error } = await sb
                .from('sku_change_requests')
                .select('id, created_at, status, request_type, sku_id, sku_nombre, justification, payload, requested_by')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            state.pendingRequests = data || [];
            renderRequestsWidget();
        } catch (err) {
            console.error('Error loading pending requests:', err);
            if (ui.requestsCompactList) {
                ui.requestsCompactList.innerHTML = '<p class="requests-empty">Error cargando solicitudes</p>';
            }
        }
    }
    
    function renderRequestsWidget() {
        const requests = state.pendingRequests;
        
        // Update badge
        if (ui.requestsBadge) {
            ui.requestsBadge.textContent = requests.length > 0 ? requests.length : '';
        }
        
        // Render list (max 3 items)
        if (!ui.requestsCompactList) return;
        
        if (requests.length === 0) {
            ui.requestsCompactList.innerHTML = '<p class="requests-empty">Sin solicitudes pendientes</p>';
            return;
        }
        
        const displayRequests = requests.slice(0, 3);
        
        ui.requestsCompactList.innerHTML = displayRequests.map(req => {
            const typeLabel = requestTypeLabels[req.request_type] || req.request_type || '-';
            const skuName = req.sku_nombre || '-';
            
            return `
                <div class="request-item-compact" data-request-id="${req.id}">
                    <div class="request-type">${window.Utils?.escapeHtml?.(typeLabel) || typeLabel}</div>
                    <div class="request-title">${window.Utils?.escapeHtml?.(skuName) || skuName}</div>
                    <div class="request-actions">
                        <button class="btn-approve" data-action="approve" data-id="${req.id}">Aprobar</button>
                        <button class="btn-reject" data-action="reject" data-id="${req.id}">Rechazar</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Bind action buttons
        ui.requestsCompactList.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const action = e.target.dataset.action;
                
                if (action === 'approve') {
                    await approveRequest(id);
                } else if (action === 'reject') {
                    await rejectRequest(id);
                }
            });
        });
    }
    
    async function approveRequest(id) {
        const req = state.pendingRequests.find(r => String(r.id) === String(id));
        if (!req) return;
        
        try {
            // Apply the change based on request type
            const payload = typeof req.payload === 'string' ? JSON.parse(req.payload) : req.payload;
            
            if (req.request_type === 'create') {
                // Insert new SKU
                const { error } = await sb.from('master_sku').insert([{
                    nombre: payload.nombre,
                    categoria_id: payload.categoria_id || null,
                    proveedor_default_id: payload.proveedor_default_id || null,
                    pack_qty: payload.pack_qty || null,
                    ml_por_unidad: payload.ml_por_unidad || null,
                    costo: payload.costo || null,
                    costo_pack: payload.costo_pack || null,
                    external_id: payload.external_id || null,
                    active: true
                }]);
                if (error) throw error;
            } else if (req.request_type === 'deactivate') {
                // Deactivate existing SKU
                const { error } = await sb.from('master_sku')
                    .update({ active: false })
                    .eq('id', req.sku_id);
                if (error) throw error;
            } else {
                // Update existing SKU (update, price_update, pack_update, supplier_update)
                if (!req.sku_id) throw new Error('SKU ID no encontrado');
                const { error } = await sb.from('master_sku')
                    .update(payload)
                    .eq('id', req.sku_id);
                if (error) throw error;
            }
            
            // Mark request as approved
            const { error: updateError } = await sb.from('sku_change_requests')
                .update({ status: 'approved' })
                .eq('id', id);
            
            if (updateError) throw updateError;
            
            window.Toast?.success('Solicitud aprobada');
            
            // Refresh widget and main data
            await loadPendingRequests();
            await loadUnifiedData();
            
        } catch (err) {
            console.error('Error approving request:', err);
            window.Toast?.error('Error al aprobar: ' + err.message);
        }
    }
    
    async function rejectRequest(id) {
        const reason = prompt('Motivo del rechazo (opcional):');
        
        try {
            const { error } = await sb.from('sku_change_requests')
                .update({ 
                    status: 'rejected',
                    notes: reason || null 
                })
                .eq('id', id);
            
            if (error) throw error;
            
            window.Toast?.success('Solicitud rechazada');
            await loadPendingRequests();
            
        } catch (err) {
            console.error('Error rejecting request:', err);
            window.Toast?.error('Error al rechazar: ' + err.message);
        }
    }
    
    function bindRequestsWidgetEvents() {
        // Toggle accordion
        ui.requestsToggle?.addEventListener('click', () => {
            ui.requestsToggle.classList.toggle('collapsed');
            ui.requestsWidgetBody?.classList.toggle('collapsed');
        });
        
        // View all button - refresh for now (could open modal in future)
        ui.btnViewAllRequests?.addEventListener('click', async () => {
            await loadPendingRequests();
            window.Toast?.info(`${state.pendingRequests.length} solicitudes pendientes`);
        });
    }

    // --- DATA LOADING ---

    async function loadOptions() {
        try {
            const [{ data: catData }, { data: provData }] = await Promise.all([
                sb.from('master_categories').select('id, nombre').eq('active', true).order('nombre'),
                sb.from('master_proveedores').select('id, nombre_fantasia').eq('active', true).order('nombre_fantasia')
            ]);
            
            state.categories = catData || [];
            state.providers = provData || [];
            
            // Populate select options
            if (ui.selCategoria) {
                ui.selCategoria.innerHTML = '<option value="">Seleccionar categoría</option>' +
                    state.categories.map(c => `<option value="${c.id}">${window.Utils.escapeHtml(c.nombre)}</option>`).join('');
            }
            if (ui.selProveedor) {
                ui.selProveedor.innerHTML = '<option value="">Seleccionar proveedor</option>' +
                    state.providers.map(p => `<option value="${p.id}">${window.Utils.escapeHtml(p.nombre_fantasia)}</option>`).join('');
            }
            
            // Render category options
            renderCategoryOptions();
            
        } catch (err) {
            console.error('Error loading options:', err);
        }
    }
    
    function renderCategoryOptions() {
        // 1. Populate Hidden Select
        if (ui.categoryFilter) {
            const currentVal = ui.categoryFilter.value;
            ui.categoryFilter.innerHTML = '<option value="all">Todas las Categorías</option>' +
                state.categories.map(c => `<option value="${c.id}">${window.Utils.escapeHtml(c.nombre)}</option>`).join('');
             if (currentVal && (currentVal === 'all' || state.categories.some(c => String(c.id) === String(currentVal)))) {
                ui.categoryFilter.value = currentVal;
            }
        }
        
        // 2. Populate Custom Menu
        const menu = document.getElementById('category-menu');
        if (menu) {
            menu.innerHTML = '<div class="custom-dropdown-option selected" data-value="all">Todas las Categorías</div>' +
                state.categories.map(c => `<div class="custom-dropdown-option" data-value="${c.id}">${window.Utils.escapeHtml(c.nombre)}</div>`).join('');
            
            // Re-bind click events for new options
            bindCategoryDropdownOptions();
        }
    }

    function bindCategoryDropdownOptions() {
        const menu = document.getElementById('category-menu');
        const trigger = document.getElementById('category-trigger');
        const dropdown = document.getElementById('category-dropdown');
        const hiddenSelect = document.getElementById('category-filter');
        
        if (!menu || !trigger || !hiddenSelect) return;
        
        menu.querySelectorAll('.custom-dropdown-option').forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const text = option.textContent;
                
                // Update Trigger Text
                const triggerText = trigger.querySelector('.custom-dropdown-text');
                if (triggerText) triggerText.textContent = text;
                
                // Update Selection UI
                menu.querySelectorAll('.custom-dropdown-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                
                // Close Dropdown
                dropdown.classList.remove('is-open');
                
                // Update Hidden Select & Trigger Change
                hiddenSelect.value = value;
                hiddenSelect.dispatchEvent(new Event('change'));
            });
        });
    }

    async function getAveragePeopleInRange(start, end) {
        const { data, error } = await sb
            .from('work_days')
            .select('attendance')
            .gte('work_date', start)
            .lte('work_date', end)
            .eq('status', 'closed');
        
        if (error || !data || data.length === 0) return 500; // Default fallback
        
        const validCounts = data.filter(d => d.attendance && d.attendance > 0);
        if (validCounts.length === 0) return 500;
        
        const sum = validCounts.reduce((acc, d) => acc + d.attendance, 0);
        return Math.round(sum / validCounts.length);
    }

    async function loadUnifiedData() {
        const { start, end } = state.dateRange;

        // 1. Fetch all SKUs with provider info
        const { data: skus, error: skuErr } = await sb
            .from('master_sku')
            .select(`
                id, nombre, external_id, active, costo, costo_pack, pack_qty, ml_por_unidad,
                categoria_id, proveedor_default_id,
                master_proveedores (id, nombre_fantasia)
            `)
            .order('nombre');
        
        if (skuErr) throw skuErr;

        // 2. Fetch stock levels from vw_stock_global
        const { data: stockData, error: stockErr } = await sb
            .from('vw_stock_global')
            .select('sku_id, stock_actual, requerido, estado');
        
        if (stockErr) console.warn('Stock view error:', stockErr);
        
        const stockMap = {};
        (stockData || []).forEach(s => {
            stockMap[s.sku_id] = s;
        });

        // 3. Fetch reports in range for consumption
        const { data: reports, error: repErr } = await sb
            .from('consumption_reports')
            .select('id')
            .gte('operational_date', start)
            .lte('operational_date', end);
        
        if (repErr) console.warn('Reports error:', repErr);
        state.reportCount = reports?.length || 0;

        const reportIds = (reports || []).map(r => r.id);

        // 4. Fetch consumption details
        let realConsumption = [];
        if (reportIds.length > 0) {
            const { data, error } = await sb
                .from('consumption_details')
                .select('sku_id, quantity')
                .in('report_id', reportIds);
            if (!error) realConsumption = data || [];
        }

        // 5. Aggregate consumption per SKU
        const consumptionMap = {};
        realConsumption.forEach(d => {
            consumptionMap[d.sku_id] = (consumptionMap[d.sku_id] || 0) + (d.quantity || 0);
        });

        // 5.5 Get average people in range for ideal calculation
        state.avgPeopleInRange = await getAveragePeopleInRange(start, end);

        // 6. Build unified data with dynamic ideal stock
        state.skuData = skus.map(sku => {
            const stockInfo = stockMap[sku.id] || {};
            const consumption = consumptionMap[sku.id] || 0;
            const provName = sku.master_proveedores?.nombre_fantasia || '-';
            
            // Dynamic ideal calculation based on people count
            let idealCalc = 0;
            if (state.avgPeopleInRange > 0 && consumption > 0) {
                idealCalc = Math.ceil(
                    (consumption / state.avgPeopleInRange) * state.peopleCount
                );
            } else {
                idealCalc = stockInfo.requerido ?? 0; // Fallback to static value
            }
            
            return {
                id: sku.id,
                externalId: sku.external_id || '-',
                name: sku.nombre,
                active: sku.active,
                stock: stockInfo.stock_actual ?? '-',
                ideal: idealCalc,
                idealStatic: stockInfo.requerido ?? 0, // Keep original for reference
                estado: stockInfo.estado || (sku.active ? 'OK' : 'Inactivo'),
                consumption: consumption,
                costo: sku.costo || 0,
                costoPack: sku.costo_pack || 0,
                packQty: sku.pack_qty || 0,
                mlPorUnidad: sku.ml_por_unidad || 0,
                categoriaId: sku.categoria_id,
                proveedorId: sku.proveedor_default_id,
                proveedorNombre: provName
            };
        });

        renderTable();
        renderStats();
        renderChart();
    }

    function renderStats() {
        const activeSkus = state.skuData.filter(d => d.active);
        const inactiveSkus = state.skuData.filter(d => !d.active);
        
        if (ui.statSkuCount) ui.statSkuCount.textContent = activeSkus.length;
        if (ui.statTotalConsumption) {
            const total = state.skuData.reduce((sum, d) => sum + d.consumption, 0);
            ui.statTotalConsumption.textContent = total.toFixed(0);
        }
        if (ui.statReportCount) ui.statReportCount.textContent = state.reportCount;
        
        // Calculate valorized totals
        const calcValorizado = (sku) => {
            const stockNum = (typeof sku.stock === 'number') ? sku.stock : (sku.stock !== '-' ? parseFloat(sku.stock) || 0 : 0);
            return stockNum > 0 && sku.costo > 0 ? stockNum * sku.costo : 0;
        };
        
        const valorizadoActivo = activeSkus.reduce((sum, sku) => sum + calcValorizado(sku), 0);
        const valorizadoInactivo = inactiveSkus.reduce((sum, sku) => sum + calcValorizado(sku), 0);
        const valorizadoTotal = valorizadoActivo + valorizadoInactivo;
        
        if (ui.statValorizadoActivo) {
            ui.statValorizadoActivo.textContent = window.Utils.formatARS(valorizadoActivo);
        }
        if (ui.statValorizadoInactivo) {
            ui.statValorizadoInactivo.textContent = window.Utils.formatARS(valorizadoInactivo);
        }
        if (ui.statValorizadoTotal) {
            ui.statValorizadoTotal.textContent = window.Utils.formatARS(valorizadoTotal);
        }
    }

    function renderTable() {
        if (!ui.tableBody) return;

        // Apply filters: status, category, search
        let filteredData = state.skuData;
        
        // Filter by status (active/inactive/all)
        if (state.skuFilter.status === 'active') {
            filteredData = filteredData.filter(d => d.active);
        } else if (state.skuFilter.status === 'inactive') {
            filteredData = filteredData.filter(d => !d.active);
        }
        // 'all' shows everything
        
        // Filter by category
        if (state.skuFilter.category !== 'all') {
            filteredData = filteredData.filter(d => d.categoriaId === state.skuFilter.category);
        }
        
        // Filter by search term
        if (state.skuFilter.search) {
            const term = state.skuFilter.search.toLowerCase();
            filteredData = filteredData.filter(d => 
                d.name.toLowerCase().includes(term) ||
                (d.proveedorNombre && d.proveedorNombre.toLowerCase().includes(term))
            );
        }

        // Update filter counter
        if (ui.filterCount) {
            ui.filterCount.textContent = filteredData.length;
        }

        if (filteredData.length === 0) {
            const hasFilters = state.skuFilter.search || state.skuFilter.category !== 'all';
            const statusLabel = state.skuFilter.status === 'active' ? 'activos' : 
                               state.skuFilter.status === 'inactive' ? 'inactivos' : '';
            const message = hasFilters 
                ? 'No hay SKUs que coincidan con los filtros.' 
                : `No hay SKUs ${statusLabel} en el sistema.`;
            
            ui.tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="table-cell cell-pad text-center muted">
                        ${message}
                    </td>
                </tr>
            `;
            return;
        }

        // Default sort: by stock gap (furthest from ideal first)
        filteredData.sort((a, b) => {
            const stockA = (typeof a.stock === 'number') ? a.stock : (a.stock !== '-' ? parseFloat(a.stock) : 0);
            const stockB = (typeof b.stock === 'number') ? b.stock : (b.stock !== '-' ? parseFloat(b.stock) : 0);
            const gapA = stockA - a.ideal; // negative = understocked
            const gapB = stockB - b.ideal;
            return gapA - gapB; // most understocked first
        });

        ui.tableBody.innerHTML = filteredData.map(d => {
            const stockDisplay = d.stock !== '-' ? d.stock : '-';
            const costoDisplay = d.costo > 0 ? window.Utils.formatARS(d.costo) : '-';
            
            // Valorizado calculation (stock × costo)
            const stockNum = (typeof d.stock === 'number') ? d.stock : (d.stock !== '-' ? parseFloat(d.stock) : 0);
            const valorizado = stockNum > 0 && d.costo > 0 ? stockNum * d.costo : 0;
            const valorizadoDisplay = valorizado > 0 ? window.Utils.formatARS(valorizado) : '-';

            return `
                <tr class="table-row" 
                    data-sku-id="${d.id}"
                    data-nombre="${window.Utils.escapeHtml(d.name.toLowerCase())}"
                    data-stock="${stockNum}"
                    data-ideal="${d.ideal}"
                    data-costo="${d.costo}"
                    data-valorizado="${valorizado}"
                    data-proveedor="${window.Utils.escapeHtml(d.proveedorNombre.toLowerCase())}"
                    data-activo="${d.active}">
                    <td class="table-cell cell-pad font-bold">
                        ${stockNum < d.ideal ? '<span class="urgent-indicator"></span>' : ''}${window.Utils.escapeHtml(d.name)}
                    </td>
                    <td class="table-cell cell-pad text-right font-mono">${stockDisplay}</td>
                    <td class="table-cell cell-pad text-right font-mono muted">${d.ideal}</td>
                    <td class="table-cell cell-pad text-right font-mono">${costoDisplay}</td>
                    <td class="table-cell cell-pad text-right font-mono text-success">${valorizadoDisplay}</td>
                    <td class="table-cell cell-pad text-sm muted">${window.Utils.escapeHtml(d.proveedorNombre)}</td>
                    <td class="table-cell cell-pad text-center">
                        <label class="toggle-switch" style="margin: 0;">
                            <input type="checkbox" class="toggle-input sku-active-toggle" data-id="${d.id}" ${d.active ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </td>
                    <td class="table-cell cell-pad text-center">
                        <button class="btn-ghost btn-sm btn-edit-sku" data-id="${d.id}">Editar</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Bind edit buttons
        ui.tableBody.querySelectorAll('.btn-edit-sku').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                openEditSkuPanel(id);
            });
        });
        
        // Bind active toggles
        ui.tableBody.querySelectorAll('.sku-active-toggle').forEach(toggle => {
            toggle.addEventListener('change', async (e) => {
                const skuId = e.target.dataset.id;
                const newActive = e.target.checked;
                
                try {
                    const { error } = await sb
                        .from('master_sku')
                        .update({ active: newActive })
                        .eq('id', skuId);
                    
                    if (error) throw error;
                    
                    // Update local state
                    const sku = state.skuData.find(s => s.id === skuId);
                    if (sku) {
                        sku.active = newActive;
                        renderStats(); // Update summary metrics
                    }
                    
                    window.Toast?.success(`SKU ${newActive ? 'activado' : 'desactivado'}`);
                } catch (err) {
                    console.error('Error updating SKU:', err);
                    window.Toast?.error('Error al actualizar SKU');
                    e.target.checked = !newActive; // Revert toggle
                }
            });
        });
    }

    function recalculateIdealStock() {
        state.skuData.forEach(sku => {
            if (state.avgPeopleInRange > 0 && sku.consumption > 0) {
                sku.ideal = Math.ceil(
                    (sku.consumption / state.avgPeopleInRange) * state.peopleCount
                );
            } else {
                sku.ideal = sku.idealStatic || 0;
            }
        });
        renderTable();
        renderStats();
    }

    // --- SKU PANEL ---

    function openNewSkuPanel() {
        state.editingSkuId = null;
        if (ui.panelTitle) ui.panelTitle.textContent = 'Nuevo SKU';
        
        // Reset form
        if (ui.inpNombre) ui.inpNombre.value = '';
        if (ui.selCategoria) ui.selCategoria.value = '';
        if (ui.selProveedor) ui.selProveedor.value = '';
        if (ui.inpPack) ui.inpPack.value = '';
        if (ui.inpMl) ui.inpMl.value = '';
        if (ui.inpCosto) ui.inpCosto.value = '';
        if (ui.inpCostoPack) ui.inpCostoPack.value = '';
        if (ui.inpExternalId) ui.inpExternalId.value = '';
        if (ui.chkActive) ui.chkActive.checked = true;
        
        panelCtrl?.open();
    }

    function openEditSkuPanel(id) {
        const item = state.skuData.find(d => String(d.id) === String(id));
        if (!item) {
            window.Toast?.error('SKU no encontrado');
            return;
        }
        
        state.editingSkuId = id;
        if (ui.panelTitle) ui.panelTitle.textContent = 'Editar SKU';
        
        // Populate form
        if (ui.inpNombre) ui.inpNombre.value = item.name || '';
        if (ui.selCategoria) ui.selCategoria.value = item.categoriaId || '';
        if (ui.selProveedor) ui.selProveedor.value = item.proveedorId || '';
        if (ui.inpPack) ui.inpPack.value = item.packQty || '';
        if (ui.inpMl) ui.inpMl.value = item.mlPorUnidad || '';
        if (ui.inpCosto) ui.inpCosto.value = item.costo || '';
        if (ui.inpCostoPack) ui.inpCostoPack.value = item.costoPack || '';
        if (ui.inpExternalId) ui.inpExternalId.value = item.externalId !== '-' ? item.externalId : '';
        if (ui.chkActive) ui.chkActive.checked = item.active;
        
        panelCtrl?.open();
    }

    function numberOrNull(v) {
        if (v === null || v === undefined || v === '') return null;
        const n = parseFloat(String(v).replace(',', '.'));
        return Number.isFinite(n) ? n : null;
    }

    async function saveSku() {
        const nombre = ui.inpNombre?.value?.trim();
        const categoriaId = ui.selCategoria?.value;
        
        if (!nombre) {
            window.Toast?.error('El nombre es obligatorio.');
            return;
        }
        if (!categoriaId) {
            window.Toast?.error('La categoría es obligatoria.');
            return;
        }
        
        const payload = {
            nombre: nombre,
            categoria_id: categoriaId || null,
            proveedor_default_id: ui.selProveedor?.value || null,
            pack_qty: numberOrNull(ui.inpPack?.value),
            ml_por_unidad: numberOrNull(ui.inpMl?.value),
            costo: numberOrNull(ui.inpCosto?.value),
            costo_pack: numberOrNull(ui.inpCostoPack?.value),
            external_id: ui.inpExternalId?.value?.trim() || null,
            active: ui.chkActive?.checked ?? true
        };
        
        if (ui.btnSaveSku) ui.btnSaveSku.disabled = true;
        
        try {
            if (state.editingSkuId) {
                const { error } = await sb
                    .from('master_sku')
                    .update(payload)
                    .eq('id', state.editingSkuId);
                if (error) throw error;
                window.Toast?.success('SKU actualizado');
            } else {
                const { error } = await sb
                    .from('master_sku')
                    .insert([payload]);
                if (error) throw error;
                window.Toast?.success('SKU creado');
            }
            
            panelCtrl?.close();
            await loadUnifiedData();
            
        } catch (err) {
            console.error('Error saving SKU:', err);
            window.Toast?.error('Error al guardar: ' + err.message);
        } finally {
            if (ui.btnSaveSku) ui.btnSaveSku.disabled = false;
        }
    }

    // --- FILTER ---

    async function handleApplyFilter() {
        const start = ui.filterStart?.value;
        const end = ui.filterEnd?.value;

        if (!start || !end) {
            window.Toast?.warning('Seleccione un rango de fechas válido.');
            return;
        }

        state.dateRange.start = start;
        state.dateRange.end = end;

        setPageState('loading');
        try {
            await loadUnifiedData();
            setPageState('ready');
            window.Toast?.success('Datos actualizados.');
        } catch (e) {
            console.error(e);
            window.Toast?.error('Error al cargar datos.');
            setPageState('ready');
        }
    }

    // --- IMPORT (LEGACY — modal removed, pending migration to dropbox flow) ---
    // TODO: Wire parseCSV/parseExcel/processImportData/confirmImport into
    //       setupDropbox callbacks. Remove dead ui.importPreview/btnConfirmImport/importModal refs.

    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Capture import type before processing
        state.importType = ui.importType?.value || 'consumo';
        state.importFileName = file.name;
        if (ui.importFileName) ui.importFileName.textContent = file.name;

        const reader = new FileReader();

        if (file.name.toLowerCase().endsWith('.csv')) {
            reader.onload = (e) => parseCSV(e.target.result);
            reader.readAsText(file, 'ISO-8859-1');
        } else {
            reader.onload = (e) => parseExcel(new Uint8Array(e.target.result));
            reader.readAsArrayBuffer(file);
        }
    }

    function parseCSV(text) {
        const rows = text.split(/\r?\n/);
        const firstValidRow = rows.find(r => r.trim().length > 0) || '';
        const isSemi = (firstValidRow.match(/;/g) || []).length > (firstValidRow.match(/,/g) || []).length;
        const delim = isSemi ? ';' : ',';

        const parsed = rows.map(r => r.trim() ? r.split(delim) : null).filter(Boolean);

        let headerIdx = 0;
        let found = false;
        for (let i = 0; i < Math.min(20, parsed.length); i++) {
            const rowStr = parsed[i].join(' ').toLowerCase();
            if (rowStr.match(/articulo|producto|nombre|item|descrip|detalle/)) {
                headerIdx = i;
                found = true;
                break;
            }
        }

        const json = [];
        if (found) {
            const headers = parsed[headerIdx].map(h => (h || '').trim());
            for (let i = headerIdx + 1; i < parsed.length; i++) {
                const row = parsed[i];
                if (row && row.length >= 2) {
                    const obj = {};
                    headers.forEach((h, idx) => { obj[h] = row[idx]; });
                    json.push(obj);
                }
            }
        } else {
            for (let i = 0; i < parsed.length; i++) {
                const row = parsed[i];
                if (row.length >= 2) {
                    json.push({ 'producto': row[0], 'cantidad': row.length > 2 ? row[2] : row[1] });
                }
            }
        }

        processImportData(json, found);
    }

    function parseExcel(arrayBuffer) {
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });

        console.log('[parseExcel] Total rows in sheet:', aoa.length);
        console.log('[parseExcel] First 10 rows:');
        aoa.slice(0, 10).forEach((row, i) => console.log(`  Row ${i}:`, row.slice(0, 4)));

        let headerIdx = 0;
        let found = false;
        for (let i = 0; i < Math.min(20, aoa.length); i++) {
            const row = aoa[i] || [];
            // Check if individual cells contain header keywords (not within longer text)
            const cells = row.map(c => String(c).toLowerCase().trim());
            
            // Revenue format: has 'codigo' AND 'articulo' as separate cells
            const hasCodigo = cells.some(c => c === 'codigo' || c === 'código');
            const hasArticulo = cells.some(c => c === 'articulo' || c === 'artículo' || c === 'producto' || c === 'nombre');
            
            // Consumption format: has 'articulo' AND ('cantidad' OR 'detalle')
            const hasCantidad = cells.some(c => c === 'cantidad' || c === 'cant' || c === 'consumo');
            const hasDetalle = cells.some(c => c === 'detalle' || c === 'descripcion' || c === 'descripción');
            
            // Match if: (codigo + articulo) OR (articulo + cantidad/detalle)
            if ((hasCodigo && hasArticulo) || (hasArticulo && (hasCantidad || hasDetalle))) {
                headerIdx = i;
                found = true;
                console.log('[parseExcel] Header found at row:', i, '- Content:', aoa[i]);
                break;
            }
        }

        if (!found) {
            console.warn('[parseExcel] No header row found, using row 0 as header');
        }

        let json = XLSX.utils.sheet_to_json(firstSheet, { 
            range: headerIdx, 
            header: found ? undefined : ['producto', 'cantidad'], 
            defval: '' 
        });

        console.log('[parseExcel] Parsed JSON rows:', json.length);
        if (json.length > 0) {
            console.log('[parseExcel] First row keys:', Object.keys(json[0]));
            console.log('[parseExcel] First row values:', Object.values(json[0]).slice(0, 5));
        }

        // Filter out metadata rows (those containing dates or "Noche:", "Fecha:", etc.)
        json = json.filter(row => {
            const values = Object.values(row).map(v => String(v).toLowerCase());
            const hasMetadata = values.some(v => 
                v.includes('noche:') || v.includes('fecha:') || 
                v.includes('turno:') || v.includes('midnight') ||
                v.includes('recaudación total')
            );
            return !hasMetadata;
        });

        console.log('[parseExcel] After filtering metadata:', json.length, 'rows');

        processImportData(json, found);
    }

    async function processImportData(json, foundHeader) {
        ui.importPreview.innerHTML = '<p class="state-desc muted text-center">Procesando...</p>';

        try {
            if (state.importType === 'recaudacion') {
                await processRevenueData(json, foundHeader);
            } else {
                await processConsumptionData(json, foundHeader);
            }
        } catch (err) {
            console.error(err);
            window.Toast?.error('Error al procesar archivo');
        }
    }

    // --- CONSUMPTION DATA PROCESSING (existing logic) ---
    async function processConsumptionData(json, foundHeader) {
        const { data: skus, error } = await sb.from('master_sku').select('id, nombre, external_id');
        if (error) throw error;

        if (!json || json.length === 0) {
            ui.importPreview.innerHTML = '<p class="state-desc text-error text-center">No se encontraron filas.</p>';
            return;
        }

        state.importData = [];
        let matched = 0;

        json.forEach(row => {
            const keys = Object.keys(row);
            
            // Look for external_id column (Articulo, Codigo, ID, etc.)
            const idKey = keys.find(k => k.toLowerCase().match(/^articulo$|^codigo$|^id$|^sku$/));
            // Look for name column (Detalle, Producto, Nombre, etc.)
            const nameKey = keys.find(k => k.toLowerCase().match(/detalle|producto|nombre|item|descrip/));
            // Look for quantity column
            const qKey = keys.find(k => k.toLowerCase().match(/^cantidad$|^cant$|consumo|final/));

            const extId = idKey ? String(row[idKey]).trim() : null;
            const pName = nameKey ? String(row[nameKey]).trim() : extId;
            const qty = qKey ? row[qKey] : 0;

            if (pName || extId) {
                // Try to match by external_id first (more reliable), then by name
                let match = null;
                if (extId) {
                    match = skus.find(s => String(s.external_id) === extId);
                }
                if (!match && pName) {
                    const clean = normalize(pName);
                    match = skus.find(s => normalize(s.nombre) === clean);
                }

                state.importData.push({
                    excelName: pName || extId,
                    skuId: match ? match.id : null,
                    skuName: match ? match.nombre : 'NO ENCONTRADO',
                    quantity: parseQty(qty)
                });
                if (match) matched++;
            }
        });

        renderImportPreview(matched, foundHeader);
    }


    // ---REVENUE DATA PROCESSING (new) ---
    async function processRevenueData(json, foundHeader) {
        // 1. Load recipes if not cached
        if (state.recipes.length === 0) {
            const { data: recipes, error } = await sb
                .from('master_recipes')
                .select('id, name, external_id, ingredients');
            if (error) throw error;
            state.recipes = recipes || [];
            console.log('[Revenue Import] Loaded recipes:', state.recipes.length);
            // Show first 10 recipes for debugging
            console.log('[Revenue Import] Primeras 10 recetas del sistema:');
            state.recipes.slice(0, 10).forEach(r => {
                console.log(`  - "${r.name}" (external_id: ${r.external_id || 'null'})`);
            });
        }
        
        // 2. Load code mappings
        const { data: mappings, error: mapErr } = await sb
            .from('recipe_code_mappings')
            .select('pos_code, recipe_id, recipe:master_recipes(id, name)');
        if (mapErr) console.error('Error loading code mappings:', mapErr);
        state.codeMappings = mappings || [];
        console.log('[Revenue Import] Loaded code mappings:', state.codeMappings.length);

        if (!json || json.length === 0) {
            ui.importPreview.innerHTML = '<p class="state-desc text-error text-center">No se encontraron filas.</p>';
            return;
        }

        state.importData = [];
        state.revenueData = {}; // Reset decomposed SKU consumption
        let matched = 0;
        let totalSales = 0;

        // Debug: Log first row keys
        if (json.length > 0) {
            console.log('[Revenue Import] Columnas detectadas:', Object.keys(json[0]));
        }

        json.forEach((row, idx) => {
            const keys = Object.keys(row);
            // Revenue file columns: Codigo, Articulo, Q Paga, Q Sin Cargo, Q Tarj.VIP, Total Caja
            const codeKey = keys.find(k => k.toLowerCase().match(/^codigo$/));
            const nameKey = keys.find(k => k.toLowerCase().match(/articulo|producto|nombre/));
            const qPagaKey = keys.find(k => k.toLowerCase().match(/q paga|qpaga|paga/));
            const qSinCargoKey = keys.find(k => k.toLowerCase().match(/sin cargo|sincargo|gratis/));
            const qVipKey = keys.find(k => k.toLowerCase().match(/tarj|vip/));
            const totalCajaKey = keys.find(k => k.toLowerCase().match(/total|caja|importe/));

            const code = codeKey ? String(row[codeKey]).trim() : null;
            const name = nameKey ? String(row[nameKey]).trim() : null;
            const qPaga = parseQty(qPagaKey ? row[qPagaKey] : 0);
            const qSinCargo = parseQty(qSinCargoKey ? row[qSinCargoKey] : 0);
            const qVip = parseQty(qVipKey ? row[qVipKey] : 0);
            const totalQty = qPaga + qSinCargo + qVip;
            const totalCaja = parseFloat(totalCajaKey ? row[totalCajaKey] : 0) || 0;

            if (!code && !name) return; // Skip empty rows

            // THREE-TIER MATCHING (priority order):
            let recipe = null;
            let matchType = null;

            // 1. Manual code mapping (highest priority) - use String comparison
            if (code) {
                const mapping = state.codeMappings.find(m => String(m.pos_code).trim() === code);
                if (mapping) {
                    recipe = state.recipes.find(r => String(r.id) === String(mapping.recipe_id));
                    if (recipe) {
                        matchType = 'manual';
                        if (idx < 3) console.log(`[Match] "${name}" -> Manual mapping to "${recipe.name}"`);
                    }
                }
            }

            // 2. External ID match (if no manual mapping) - use String comparison
            if (!recipe && code) {
                recipe = state.recipes.find(r => 
                    r.external_id && String(r.external_id).trim() === code
                );
                if (recipe) {
                    matchType = 'ext_id';
                    if (idx < 3) console.log(`[Match] "${name}" -> External ID match to "${recipe.name}"`);
                }
            }

            // 3. Name match (normalized, last resort)
            if (!recipe && name) {
                const normalizedName = normalize(name);
                recipe = state.recipes.find(r => normalize(r.name) === normalizedName);
                if (recipe) {
                    matchType = 'nombre';
                    if (idx < 3) console.log(`[Match] "${name}" -> Name match to "${recipe.name}"`);
                }
            }

            // 4. Fuzzy name match (partial match as fallback)
            if (!recipe && name) {
                const normalizedName = normalize(name);
                // Try finding a recipe whose name contains the search or vice versa
                recipe = state.recipes.find(r => {
                    const recipeNorm = normalize(r.name);
                    return recipeNorm.includes(normalizedName) || normalizedName.includes(recipeNorm);
                });
                if (recipe) {
                    matchType = 'fuzzy';
                    if (idx < 5) console.log(`[Match] "${name}" -> Fuzzy match to "${recipe.name}"`);
                }
            }

            // Debug log for unmatched items
            if (!recipe && idx < 10) {
                console.log(`[No Match] Code: "${code}", Name: "${name}"`);
            }

            // Store revenue detail (for new table)
            state.importData.push({
                excelName: name || code,
                recipeId: recipe?.id || null,
                recipeName: recipe?.name || 'NO ENCONTRADO',
                external_code: code,
                q_paga: qPaga,
                q_sin_cargo: qSinCargo,
                q_vip: qVip,
                quantity: totalQty,
                total_amount: totalCaja,
                ingredientCount: recipe?.ingredients?.length || 0,
                matchType
            });

            if (recipe) {
                matched++;
                totalSales += totalCaja; // Sum money instead of units
            }
        });

        console.log(`[Revenue Import] Matched: ${matched}/${state.importData.length}`);
        renderRevenuePreview(matched, totalSales, foundHeader);
    }

    function renderRevenuePreview(matched, totalSales, foundHeader) {
        const total = state.importData.length;
        const unmatched = total - matched;
        const skuCount = Object.keys(state.revenueData).length;

        ui.importPreview.innerHTML = `
            <div class="mb-2" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                <div class="stat-card is-success" style="padding: 12px;">
                    <p class="stat-label">Recetas Match</p>
                    <p class="stat-value">${matched}</p>
                </div>
                <div class="stat-card ${unmatched > 0 ? 'is-danger' : ''}" style="padding: 12px;">
                    <p class="stat-label">Sin Match</p>
                    <p class="stat-value">${unmatched}</p>
                </div>
                <div class="stat-card" style="padding: 12px;">
                    <p class="stat-label">SKUs Afectados</p>
                    <p class="stat-value">${skuCount}</p>
                </div>
            </div>
            ${!foundHeader ? '<p class="text-warning text-xs mb-2">No se detectó cabecera.</p>' : ''}
            <table class="table table-compact">
                <thead>
                    <tr class="table-head">
                        <th class="table-cell is-header cell-pad">Código</th>
                        <th class="table-cell is-header cell-pad">Artículo</th>
                        <th class="table-cell is-header cell-pad">Receta Matcheada</th>
                        <th class="table-cell is-header cell-pad text-center">Match</th>
                        <th class="table-cell is-header cell-pad text-right">Q Paga</th>
                        <th class="table-cell is-header cell-pad text-right">Q Sin Cargo</th>
                        <th class="table-cell is-header cell-pad text-right">Q Tarj.VIP</th>
                        <th class="table-cell is-header cell-pad text-right">Total Caja</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.importData.slice(0, 15).map(d => {
                        const matchBadge = d.matchType === 'manual' ? '<span class="badge badge-success">Manual</span>'
                            : d.matchType === 'ext_id' ? '<span class="badge badge-info">ID</span>'
                            : d.matchType === 'nombre' ? '<span class="badge badge-warning">Nombre</span>'
                            : d.matchType === 'fuzzy' ? '<span class="badge badge-accent">Fuzzy</span>'
                            : '<span class="badge badge-error">—</span>';
                        return `
                        <tr class="table-row ${!d.recipeId ? 'row-warning' : ''}">
                            <td class="table-cell cell-pad text-xs font-mono">${window.Utils.escapeHtml(d.external_code || '-')}</td>
                            <td class="table-cell cell-pad text-xs">${window.Utils.escapeHtml(d.excelName)}</td>
                            <td class="table-cell cell-pad text-sm ${!d.recipeId ? 'text-error font-bold' : 'font-bold'}">${window.Utils.escapeHtml(d.recipeName)}</td>
                            <td class="table-cell cell-pad text-center">${matchBadge}</td>
                            <td class="table-cell cell-pad text-right font-mono">${d.q_paga || 0}</td>
                            <td class="table-cell cell-pad text-right font-mono">${d.q_sin_cargo || 0}</td>
                            <td class="table-cell cell-pad text-right font-mono">${d.q_vip || 0}</td>
                            <td class="table-cell cell-pad text-right font-mono font-bold" style="color: var(--success);">
                                $${(d.total_amount || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                        </tr>
                    `;}).join('')}
                    ${state.importData.length > 15 ? '<tr><td colspan="8" class="table-cell cell-pad muted text-center">... y más</td></tr>' : ''}
                </tbody>
            </table>
            <p class="text-xs muted mt-2">Al confirmar, los datos se guardarán en la tabla de recaudación con las cantidades y montos correspondientes.</p>
        `;

        ui.btnConfirmImport.disabled = matched === 0;
    }

    function renderImportPreview(matched, foundHeader, showOnlyUnmatched = false) {
        const total = state.importData.length;
        const unmatched = total - matched;
        const unmatchedItems = state.importData.filter(d => !d.skuId);
        const displayData = showOnlyUnmatched ? unmatchedItems : state.importData;

        // Store filter state for button handlers
        window._importFilterState = { matched, foundHeader };

        ui.importPreview.innerHTML = `
            <div class="mb-2" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; position: relative; z-index: 10;">
                <button type="button" class="stat-card is-success ${!showOnlyUnmatched ? 'is-active' : ''}" id="btn-filter-matched" style="cursor: pointer; padding: 12px;">
                    <p class="stat-label">Vinculados</p>
                    <p class="stat-value">${matched}</p>
                </button>
                <button type="button" class="stat-card ${unmatched > 0 ? 'is-danger' : ''} ${showOnlyUnmatched ? 'is-active' : ''}" id="btn-filter-unmatched" style="cursor: pointer; padding: 12px; border: ${unmatched > 0 ? '2px dashed var(--color-warning)' : '1px solid var(--border-subtle)'};" ${unmatched === 0 ? 'disabled' : ''}>
                    <p class="stat-label">Sin Match</p>
                    <p class="stat-value">${unmatched}</p>
                    ${unmatched > 0 ? '<p class="text-xs mt-1">👆 Click para ver</p>' : ''}
                </button>
            </div>

            ${showOnlyUnmatched ? '<p class="text-warning text-xs mb-2">⚠️ Mostrando solo items sin vincular. Click en "Vinculados" para ver todos.</p>' : ''}
            ${!foundHeader ? '<p class="text-warning text-xs mb-2">⚠️ No se detectó cabecera.</p>' : ''}
            <table class="table table-compact">
                <thead>
                    <tr class="table-head">
                        <th class="table-cell is-header cell-pad">Excel</th>
                        <th class="table-cell is-header cell-pad">Sistema</th>
                        <th class="table-cell is-header cell-pad text-right">Cant</th>
                    </tr>
                </thead>
                <tbody>
                    ${displayData.slice(0, 20).map(d => `
                        <tr class="table-row ${!d.skuId ? 'row-warning' : ''}">
                            <td class="table-cell cell-pad text-xs">${window.Utils.escapeHtml(d.excelName)}</td>
                            <td class="table-cell cell-pad text-sm font-bold">${window.Utils.escapeHtml(d.skuName)}</td>
                            <td class="table-cell cell-pad text-right font-mono">${d.quantity}</td>
                        </tr>
                    `).join('')}
                    ${displayData.length > 20 ? '<tr><td colspan="3" class="table-cell cell-pad muted text-center">... y más</td></tr>' : ''}
                </tbody>
            </table>
        `;

        // Direct button click handlers
        const btnMatched = document.getElementById('btn-filter-matched');
        const btnUnmatched = document.getElementById('btn-filter-unmatched');
        
        if (btnMatched) {
            btnMatched.onclick = () => {
                const s = window._importFilterState;
                renderImportPreview(s.matched, s.foundHeader, false);
            };
        }
        if (btnUnmatched && unmatched > 0) {
            btnUnmatched.onclick = () => {
                const s = window._importFilterState;
                renderImportPreview(s.matched, s.foundHeader, true);
            };
        }

        ui.btnConfirmImport.disabled = matched === 0;
    }



    async function confirmImport() {
        const date = ui.importDate?.value;
        if (!date) {
            window.Toast?.warning('Seleccione una fecha operativa.');
            return;
        }

        if (state.importData.length === 0) return;

        // Determine report type for DB
        const reportType = state.importType === 'recaudacion' ? 'revenue' : 'consumption';

        // Handle revenue import - save to revenue_reports and revenue_details
        if (state.importType === 'recaudacion') {
            const confirmed = await window.Utils.confirmAction?.('¿Guardar reporte de recaudación para esta fecha?', { isDanger: false });
            if (!confirmed) return;

            try {
                // Calculate total revenue
                const totalRevenue = state.importData.reduce((sum, item) => sum + (item.total_amount || 0), 0);
                
                // Create revenue report (header)
                const { data: report, error: repErr } = await sb
                    .from('revenue_reports')
                    .insert({ 
                        operational_date: date, 
                        file_name: state.importFileName || `Recaudación ${date}`,
                        total_revenue: totalRevenue
                    })
                    .select().single();

                if (repErr) {
                    if (repErr.code === '23505') throw new Error('Ya existe un reporte de recaudación para esta fecha.');
                    throw repErr;
                }

                // Save revenue details (only matched recipes)
                const details = state.importData
                    .filter(item => item.recipeId) // Only matched recipes
                    .map(item => ({
                        report_id: report.id,
                        recipe_id: item.recipeId,
                        recipe_name: item.recipeName,
                        external_code: item.external_code,
                        q_paga: item.q_paga || 0,
                        q_sin_cargo: item.q_sin_cargo || 0,
                        q_vip: item.q_vip || 0,
                        total_quantity: item.quantity || 0,
                        total_amount: item.total_amount || 0
                    }));

                if (details.length > 0) {
                    const { error: detErr } = await sb.from('revenue_details').insert(details);
                    if (detErr) throw detErr;
                }

                window.Toast?.success(`Recaudación guardada: $${totalRevenue.toFixed(2)} (${details.length} recetas)`);
                ui.importModal?.close();
                renderTable();
                renderChart();

            } catch (err) {
                console.error(err);
                window.Toast?.error(err.message || 'Error al guardar recaudación');
            }
            return;
        }

        // Original consumption import flow
        const confirmed = await window.Utils.confirmAction?.('¿Confirmar importación de consumos?', { isDanger: false });
        if (!confirmed) return;

        try {
            const { data: report, error: repErr } = await sb
                .from('consumption_reports')
                .insert({ 
                    operational_date: date, 
                    file_name: state.importFileName || `Import ${date}`,
                    report_type: 'consumption'
                })
                .select().single();

            if (repErr) {
                if (repErr.code === '23505') throw new Error('Ya existe un reporte de consumo para esta fecha.');
                throw repErr;
            }

            const details = state.importData
                .filter(d => d.skuId)
                .map(d => ({ report_id: report.id, sku_id: d.skuId, quantity: d.quantity }));

            if (details.length === 0) throw new Error('No hay datos válidos para guardar.');

            const { error: detErr } = await sb.from('consumption_details').insert(details);
            if (detErr) throw detErr;

            window.Toast?.success('Consumos importados con éxito');
            ui.importModal?.close();

            // Refresh data
            await loadUnifiedData();

        } catch (err) {
            console.error(err);
            window.Toast?.error(err.message || 'Error al guardar importación');
        }
    }


    // --- EXPORT ---

    function handleExport() {
        if (state.skuData.length === 0) {
            window.Toast?.warning('No hay datos para exportar.');
            return;
        }

        const exportData = state.skuData.map(d => {
            const stockNum = (typeof d.stock === 'number') ? d.stock : (d.stock !== '-' ? parseFloat(d.stock) || 0 : 0);
            const valorizado = stockNum > 0 && d.costo > 0 ? (stockNum * d.costo) : 0;

            return {
                'ID': d.externalId,
                'Nombre': d.name,
                'Stock Actual': d.stock !== '-' ? d.stock : 0,
                'Stock Ideal': d.ideal,
                'Consumo Período': d.consumption,
                'Costo Unitario': d.costo,
                'Valorizado': valorizado.toFixed(2),
                'Proveedor': d.proveedorNombre,
                'Activo': d.active ? 'Sí' : 'No'
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Stock');
        XLSX.writeFile(wb, `stock_${state.dateRange.start}_${state.dateRange.end}.xlsx`);

        window.Toast?.success('Archivo exportado.');
    }

    // --- CHART ---

    function getThemeColor(varName, fallback) {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
    }

    async function openChartModal() {
        ui.chartModal?.showModal();
        if (state.chartInstance) state.chartInstance.destroy();

        try {
            const { data: reports } = await sb
                .from('consumption_reports')
                .select('id, operational_date')
                .order('operational_date', { ascending: false })
                .limit(20);

            if (!reports?.length) {
                window.Toast?.info('No hay reportes para graficar.');
                return;
            }

            const ordered = [...reports].reverse();
            const ids = ordered.map(r => r.id);
            const labels = ordered.map(r => r.operational_date);

            const { data: details } = await sb
                .from('consumption_details')
                .select('report_id, sku_id, quantity, sku:master_sku(nombre)')
                .in('report_id', ids);

            if (!details?.length) return;

            const totals = {};
            details.forEach(d => {
                if (!totals[d.sku_id]) totals[d.sku_id] = { name: d.sku?.nombre || '?', total: 0 };
                totals[d.sku_id].total += d.quantity;
            });

            const top5 = Object.entries(totals)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 5)
                .map(([id, info]) => ({ id, name: info.name }));

            const themeColors = [
                getThemeColor('--color-danger', '#ff3b30'),
                getThemeColor('--color-warning', '#ff9500'),
                getThemeColor('--color-success', '#34c759'),
                getThemeColor('--color-info', '#007aff'),
                getThemeColor('--color-primary', '#5856d6')
            ];

            const datasets = top5.map((sku, i) => {
                const dataPoints = ordered.map(r => {
                    const d = details.find(det => det.report_id === r.id && det.sku_id === sku.id);
                    return d ? d.quantity : 0;
                });
                const color = themeColors[i % themeColors.length];
                return { label: sku.name, data: dataPoints, borderColor: color, backgroundColor: color, tension: 0.3, fill: false };
            });

            const textColor = getThemeColor('--color-text-muted', '#888');
            const gridColor = getThemeColor('--color-border', '#333');
            const titleColor = getThemeColor('--color-text-main', '#e0e0e0');

            if (!ui.historyChartCanvas) {
                window.Toast?.error('Canvas no disponible');
                return;
            }

            state.chartInstance = new Chart(ui.historyChartCanvas, {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: titleColor, usePointStyle: true } } },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { color: gridColor } },
                        y: { ticks: { color: textColor }, grid: { color: gridColor } }
                    }
                }
            });

        } catch (err) {
            console.error('Chart Error:', err);
            window.Toast?.error('Error al cargar gráfico.');
        }
    }

    // --- HELPERS ---

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
    
    // --- PROFITABILITY ---
    
    async function loadProfitabilityData() {
        if (ui.profitabilityTableBody) {
            ui.profitabilityTableBody.innerHTML = '<tr><td colspan="6" class="table-cell cell-pad text-center muted">Cargando datos...</td></tr>';
        }
        
        try {
            const { data, error } = await sb
                .from('vw_recipe_profitability')
                .select('*')
                .order('roi_pct', { ascending: false });
            
            if (error) throw error;
            
            state.profitabilityData = data || [];
            renderProfitabilityStats();
            renderProfitabilityTable();
            
        } catch (err) {
            console.error('Profitability load error:', err);
            window.Toast?.error('Error al cargar rentabilidad');
            if (ui.profitabilityTableBody) {
                ui.profitabilityTableBody.innerHTML = '<tr><td colspan="6" class="table-cell cell-pad text-center text-error">Error al cargar datos</td></tr>';
            }
        }
    }
    
    function renderProfitabilityStats() {
        const data = state.profitabilityData;
        const priced = data.filter(d => parseFloat(d.precio_venta) > 0);
        
        if (ui.statRecipesPriced) {
            ui.statRecipesPriced.textContent = `${priced.length} / ${data.length}`;
        }
        
        if (ui.statAvgRoi && priced.length > 0) {
            const avgRoi = priced.reduce((sum, d) => sum + parseFloat(d.roi_pct || 0), 0) / priced.length;
            ui.statAvgRoi.textContent = `${avgRoi.toFixed(0)}%`;
        }
        
        if (ui.statBestMargin && priced.length > 0) {
            const best = priced.reduce((max, d) => parseFloat(d.margen_bruto) > parseFloat(max.margen_bruto) ? d : max, priced[0]);
            ui.statBestMargin.textContent = `$${Number(best.margen_bruto).toLocaleString('es-AR')}`;
        }
    }
    
    function renderProfitabilityTable() {
        if (!ui.profitabilityTableBody) return;
        
        const search = (ui.filterRecipeSearch?.value || '').toLowerCase();
        const flagFilter = ui.filterProfitabilityFlag?.value || 'all';
        
        let filtered = state.profitabilityData;
        
        if (search) {
            filtered = filtered.filter(d => d.name.toLowerCase().includes(search));
        }
        
        if (flagFilter !== 'all') {
            filtered = filtered.filter(d => d.flag_rentabilidad === flagFilter);
        }
        
        if (filtered.length === 0) {
            ui.profitabilityTableBody.innerHTML = '<tr><td colspan="6" class="table-cell cell-pad text-center muted">No hay recetas que coincidan.</td></tr>';
            return;
        }
        
        ui.profitabilityTableBody.innerHTML = filtered.map(d => {
            const precioVenta = parseFloat(d.precio_venta) || 0;
            const costoProducto = parseFloat(d.costo_producto) || 0;
            const margenBruto = parseFloat(d.margen_bruto) || 0;
            const roiPct = parseFloat(d.roi_pct) || 0;
            const flag = d.flag_rentabilidad || 'sin_precio';
            
            const flagEmoji = {
                'rentable': '🟢',
                'regular': '🟡',
                'no_conviene': '🔴',
                'sin_precio': '⚫'
            }[flag] || '⚫';
            
            const roiClass = roiPct > 100 ? 'text-success font-bold' : roiPct > 0 ? 'text-warning' : 'text-error';
            
            return `
                <tr class="table-row">
                    <td class="table-cell cell-pad font-bold">${window.Utils.escapeHtml(d.name)}</td>
                    <td class="table-cell cell-pad text-right font-mono">${precioVenta > 0 ? '$' + precioVenta.toLocaleString('es-AR') : '-'}</td>
                    <td class="table-cell cell-pad text-right font-mono muted">${costoProducto > 0 ? '$' + costoProducto.toLocaleString('es-AR') : '-'}</td>
                    <td class="table-cell cell-pad text-right font-mono text-accent">${margenBruto > 0 ? '$' + margenBruto.toLocaleString('es-AR') : '-'}</td>
                    <td class="table-cell cell-pad text-right font-mono ${roiClass}">${precioVenta > 0 ? roiPct.toFixed(0) + '%' : '-'}</td>
                    <td class="table-cell cell-pad text-center">${flagEmoji}</td>
                </tr>
            `;
        }).join('');
    }
    
    function handleExportProfitability() {
        if (state.profitabilityData.length === 0) {
            window.Toast?.warning('No hay datos para exportar.');
            return;
        }
        
        const exportData = state.profitabilityData.map(d => ({
            'Receta': d.name,
            'Precio Venta': parseFloat(d.precio_venta) || 0,
            'Costo Producto': parseFloat(d.costo_producto) || 0,
            'Margen Bruto': parseFloat(d.margen_bruto) || 0,
            'ROI %': parseFloat(d.roi_pct) || 0,
            'Flag': d.flag_rentabilidad
        }));
        
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rentabilidad');
        XLSX.writeFile(wb, `rentabilidad_recetas_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        window.Toast?.success('Archivo exportado.');
    }

    // --- RECIPES TAB ---
    
    async function loadRecipes(filter = '') {
        // Show loading state
        if (ui.recipeTableBody) {
            ui.recipeTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 24px;">
                        Cargando recetas...
                    </td>
                </tr>
            `;
        }

        try {
            let query = sb.from('master_recipes').select('*').order('name');
            if (filter) query = query.ilike('name', `%${filter}%`);

            const { data, error } = await query;
            if (error) throw error;

            state.recipesList = data || [];
            renderRecipesTable();
            renderRecipeStats();
        } catch (err) {
            console.error('Error loading recipes:', err);
            window.Toast?.error('Error al cargar recetas');
            if (ui.recipeTableBody) {
                ui.recipeTableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; color: var(--error); padding: 24px;">
                            Error al cargar recetas
                        </td>
                    </tr>
                `;
            }
        }
    }
    
    function renderRecipeStats() {
        if (ui.statRecipeCount) {
            ui.statRecipeCount.textContent = state.recipesList.length;
        }
        // Count recipes with external_id (priced via POS integration)
        if (ui.statRecipePriced) {
            const priced = state.recipesList.filter(r => r.external_id).length;
            ui.statRecipePriced.textContent = priced;
        }
    }
    
    function renderRecipesTable() {
        if (!ui.recipeTableBody) return;
        
        if (state.recipesList.length === 0) {
            ui.recipeTableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 24px;">
                        No hay recetas cargadas.
                    </td>
                </tr>
            `;
            return;
        }
        
        ui.recipeTableBody.innerHTML = state.recipesList.map(r => {
            const ingDesc = r.ingredients && r.ingredients.length > 0
                ? r.ingredients.map(i => {
                    const sku = state.skuData.find(s => String(s.id) === String(i.sku_id));
                    const qty = i.amount ?? i.quantity ?? 0;
                    return sku ? `${sku.name} (${qty})` : `SKU? (${qty})`;
                }).join(', ')
                : 'Sin ingredientes';
            
            return `
                <tr data-id="${r.id}">
                    <td style="font-weight: 600;">${window.Utils.escapeHtml(r.name)}</td>
                    <td style="font-family: monospace; font-size: 12px; color: var(--text-tertiary);">${r.external_id || '—'}</td>
                    <td style="font-size: 12px; color: var(--text-tertiary); max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${window.Utils.escapeHtml(ingDesc)}">
                        ${window.Utils.escapeHtml(ingDesc)}
                    </td>
                    <td style="text-align: center;">
                        <button class="btn btn-ghost btn-sm btn-edit-recipe" data-id="${r.id}">Editar</button>
                        <button class="btn-icon-flat text-error btn-delete-recipe" style="margin-left: 8px;" data-id="${r.id}">×</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Bind edit/delete buttons
        ui.recipeTableBody.querySelectorAll('.btn-edit-recipe').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const recipe = state.recipesList.find(r => String(r.id) === id);
                if (recipe) openRecipeModal(recipe);
            });
        });
        
        ui.recipeTableBody.querySelectorAll('.btn-delete-recipe').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const recipe = state.recipesList.find(r => String(r.id) === id);
                if (recipe) deleteRecipe(recipe);
            });
        });
    }
    
    function openRecipeModal(recipe = null) {
        state.editingRecipeId = recipe ? recipe.id : null;
        
        if (ui.recipeModalTitle) {
            ui.recipeModalTitle.textContent = recipe ? 'Editar Receta' : 'Nueva Receta';
        }
        if (ui.recipeInpName) {
            ui.recipeInpName.value = recipe ? recipe.name : '';
        }
        if (ui.recipeInpExtId) {
            ui.recipeInpExtId.value = recipe?.external_id || '';
        }
        
        // Clear and populate ingredients
        if (ui.ingredientsContainer) {
            ui.ingredientsContainer.innerHTML = '';
            
            if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
                recipe.ingredients.forEach(ing => {
                    addIngredientRow(ing.sku_id, ing.amount ?? ing.quantity);
                });
            } else {
                addIngredientRow();
            }
        }
        
        ui.recipeModal?.classList.remove('hidden');
        ui.recipeModal?.classList.add('is-visible');
    }
    
    function closeRecipeModal() {
        ui.recipeModal?.classList.add('hidden');
        ui.recipeModal?.classList.remove('is-visible');
        state.editingRecipeId = null;
    }
    
    function addIngredientRow(skuId = null, amount = null) {
        if (!ui.tplIngredient || !ui.ingredientsContainer) return;
        
        const clone = ui.tplIngredient.content.cloneNode(true);
        const row = clone.querySelector('.ingredient-row');
        const sel = row.querySelector('.input-sku');
        const inpAmt = row.querySelector('.input-amount');
        const btnRem = row.querySelector('.btn-remove-ing');
        
        // Populate SKU select
        state.skuData.filter(s => s.active).forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            if (skuId && String(s.id) === String(skuId)) opt.selected = true;
            sel.appendChild(opt);
        });
        
        if (amount) inpAmt.value = amount;
        
        btnRem.onclick = () => row.remove();
        ui.ingredientsContainer.appendChild(row);
    }
    
    async function saveRecipe() {
        const name = ui.recipeInpName?.value?.trim();
        const extId = ui.recipeInpExtId?.value?.trim();
        
        if (!name) {
            window.Toast?.warning('Nombre de receta requerido');
            return;
        }
        
        // Collect ingredients
        const rows = ui.ingredientsContainer?.querySelectorAll('.ingredient-row') || [];
        const ingredients = [];
        
        rows.forEach(row => {
            const skuId = row.querySelector('.input-sku')?.value;
            const amount = parseFloat(row.querySelector('.input-amount')?.value);
            if (skuId && amount > 0) {
                ingredients.push({ sku_id: skuId, amount });
            }
        });
        
        if (ingredients.length === 0) {
            window.Toast?.warning('La receta debe tener al menos un ingrediente');
            return;
        }
        
        const payload = {
            name,
            external_id: extId || null,
            ingredients
        };
        
        ui.btnSaveRecipe?.classList.add('btn-loading');
        ui.btnSaveRecipe && (ui.btnSaveRecipe.disabled = true);
        
        try {
            if (state.editingRecipeId) {
                const { error } = await sb.from('master_recipes').update(payload).eq('id', state.editingRecipeId);
                if (error) throw error;
                window.Toast?.success('Receta actualizada');
            } else {
                const { error } = await sb.from('master_recipes').insert(payload);
                if (error) throw error;
                window.Toast?.success('Receta creada');
            }
            
            closeRecipeModal();
            loadRecipes(ui.searchRecipe?.value || '');
        } catch (err) {
            console.error('Error saving recipe:', err);
            window.Toast?.error('Error al guardar: ' + err.message);
        } finally {
            ui.btnSaveRecipe?.classList.remove('btn-loading');
            ui.btnSaveRecipe && (ui.btnSaveRecipe.disabled = false);
        }
    }
    
    async function deleteRecipe(recipe) {
        const confirmed = await window.Utils?.confirmAction?.(`¿Eliminar la receta "${recipe.name}"?`, { isDanger: true });
        if (!confirmed) return;
        
        try {
            const { error } = await sb.from('master_recipes').delete().eq('id', recipe.id);
            if (error) throw error;
            window.Toast?.success('Receta eliminada');
            loadRecipes(ui.searchRecipe?.value || '');
        } catch (err) {
            console.error('Error deleting recipe:', err);
            window.Toast?.error('Error al eliminar');
        }
    }
    
    // Bind recipe events
    function bindRecipeEvents() {
        ui.btnNewRecipe?.addEventListener('click', () => openRecipeModal());
        ui.btnCancelRecipe?.addEventListener('click', closeRecipeModal);
        ui.btnCloseRecipeModal?.addEventListener('click', closeRecipeModal);
        ui.btnAddIngredient?.addEventListener('click', () => addIngredientRow());
        ui.btnSaveRecipe?.addEventListener('click', saveRecipe);
        
        ui.searchRecipe?.addEventListener('input', debounce((e) => {
            loadRecipes(e.target.value);
        }, 300));
        
        // Close modal on escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ui.recipeModal?.classList.contains('is-visible')) {
                closeRecipeModal();
            }
        });
        
        // Click outside modal
        ui.recipeModal?.addEventListener('click', (e) => {
            if (e.target === ui.recipeModal) closeRecipeModal();
        });
    }

    async function renderChart() {
        if (!ui.top5ChartCanvas) return;

        try {
            // Destroy previous instance
            if (state.chartInstance) {
                state.chartInstance.destroy();
                state.chartInstance = null;
            }

            // Get mode
            const mode = ui.chartMode?.value || 'consumption-vs-revenue';

            if (mode === 'consumption-vs-revenue') {
                // CONSUMPTION VS REVENUE MODE: Show area chart comparing both
                await renderConsumptionVsRevenueChart();
                await updateChartKPIs();
                return;

            } else if (mode === 'top5-revenue') {
                // REVENUE MODE: Query revenue_reports table
                const { data: revenueReports } = await sb
                    .from('revenue_reports')
                    .select('id, operational_date')
                    .order('operational_date', { ascending: false })
                    .limit(20);

                if (!revenueReports || revenueReports.length === 0) {
                // Show empty state in chart
                const ctx = ui.top5ChartCanvas.getContext('2d');
                ctx.clearRect(0, 0, ui.top5ChartCanvas.width, ui.top5ChartCanvas.height);
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#a1a1aa';
                ctx.font = '14px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('No hay reportes de recaudación', ui.top5ChartCanvas.width / 2, ui.top5ChartCanvas.height / 2);
                return;
            }

                const revReports = [...revenueReports].reverse();
                await renderTop5Chart(revReports, 'revenue');

            } else {
                // CONSUMPTION MODE: Query consumption_reports table  
                const { data: consumptionReports } = await sb
                    .from('consumption_reports')
                    .select('id, operational_date')
                    .order('operational_date', { ascending: false })
                    .limit(20);

                if (!consumptionReports || consumptionReports.length === 0) {
                // Show empty state in chart
                const ctx = ui.top5ChartCanvas.getContext('2d');
                ctx.clearRect(0, 0, ui.top5ChartCanvas.width, ui.top5ChartCanvas.height);
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#a1a1aa';
                ctx.font = '14px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('No hay reportes de consumo', ui.top5ChartCanvas.width / 2, ui.top5ChartCanvas.height / 2);
                return;
            }

                const consReports = [...consumptionReports].reverse();
                await renderTop5Chart(consReports, 'consumption');
            }

            // Calculate and display KPIs for the date range shown in chart
            await updateChartKPIs();

        } catch (err) {
            console.error('Error loading chart:', err);
        }
    }

    // Render Consumption vs Revenue Area Chart
    async function renderConsumptionVsRevenueChart() {
        try {
            // Get date range from filters
            let startDate = ui.dateStart?.value;
            let endDate = ui.dateEnd?.value;
            
            if (!startDate) {
                const d = new Date();
                d.setDate(d.getDate() - 30);
                startDate = d.toISOString().split('T')[0];
            }
            if (!endDate) {
                endDate = new Date().toISOString().split('T')[0];
            }

            // Get all dates in range with consumption data
            const { data: consumptionReports } = await sb
                .from('consumption_reports')
                .select('id, operational_date')
                .gte('operational_date', startDate)
                .lte('operational_date', endDate)
                .order('operational_date', { ascending: true });

            // Get all dates with revenue data  
            const { data: revenueReports } = await sb
                .from('revenue_reports')
                .select('id, operational_date, total_revenue')
                .gte('operational_date', startDate)
                .lte('operational_date', endDate)
                .order('operational_date', { ascending: true });

            if ((!consumptionReports || consumptionReports.length === 0) && 
            (!revenueReports || revenueReports.length === 0)) {
            const ctx = ui.top5ChartCanvas.getContext('2d');
            ctx.clearRect(0, 0, ui.top5ChartCanvas.width, ui.top5ChartCanvas.height);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim() || '#a1a1aa';
            ctx.font = '14px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos en el rango seleccionado', ui.top5ChartCanvas.width / 2, ui.top5ChartCanvas.height / 2);
            return;
        }

            // Build a map of all unique dates
            const dateSet = new Set();
            consumptionReports?.forEach(r => dateSet.add(r.operational_date));
            revenueReports?.forEach(r => dateSet.add(r.operational_date));
            const dates = Array.from(dateSet).sort();

            // Calculate consumption cost per date
            const consumptionCostByDate = {};
            if (consumptionReports && consumptionReports.length > 0) {
                const reportIds = consumptionReports.map(r => r.id);
                const { data: consumptionDetails } = await sb
                    .from('consumption_details')
                    .select('report_id, quantity, sku:master_sku(costo)')
                    .in('report_id', reportIds);

                if (consumptionDetails) {
                    // Create a map: report_id -> operational_date
                    const reportDateMap = {};
                    consumptionReports.forEach(r => reportDateMap[r.id] = r.operational_date);

                    consumptionDetails.forEach(d => {
                        const date = reportDateMap[d.report_id];
                        const cost = (parseFloat(d.quantity) || 0) * (parseFloat(d.sku?.costo) || 0);
                        consumptionCostByDate[date] = (consumptionCostByDate[date] || 0) + cost;
                    });
                }
            }

            // Build revenue by date map
            const revenueByDate = {};
            revenueReports?.forEach(r => {
                revenueByDate[r.operational_date] = (revenueByDate[r.operational_date] || 0) + (parseFloat(r.total_revenue) || 0);
            });

            // Build data arrays aligned to dates
            const consumptionData = dates.map(d => consumptionCostByDate[d] || 0);
            const revenueData = dates.map(d => revenueByDate[d] || 0);

            // Create area chart
        const ctx = ui.top5ChartCanvas.getContext('2d');
        const style = getComputedStyle(document.documentElement);
        const colorSuccess = style.getPropertyValue('--success').trim() || '#4ade80';
        const colorWarning = style.getPropertyValue('--warning').trim() || '#fbbf24';
        
        state.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Recaudación',
                        data: revenueData,
                        borderColor: colorSuccess,
                        backgroundColor: colorSuccess + '33', // 20% opacity approx (hex 33)
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        order: 1
                    },
                    {
                        label: 'Costo Consumo',
                        data: consumptionData,
                        borderColor: colorWarning,
                        backgroundColor: colorWarning + '33', // 20% opacity approx
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        order: 2
                    }
                ]
            },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 16,
                                font: { size: 11 },
                                color: '#a1a1aa'
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + window.Utils.formatARS(context.parsed.y);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: false,
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: {
                                color: '#a1a1aa',
                                maxTicksLimit: 5,
                                callback: function(value) {
                                    if (value >= 1000000) {
                                        return '$' + (value / 1000000).toFixed(1) + 'M';
                                    } else if (value >= 1000) {
                                        return '$' + (value / 1000).toFixed(0) + 'k';
                                    }
                                    return '$' + value;
                                }
                            }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#a1a1aa' }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });

        } catch (err) {
            console.error('Error rendering consumption vs revenue chart:', err);
        }
    }

    // Dropbox Setup Logic
    function setupDropbox(zoneId, inputId, onFileSelected) {
        const zone = document.getElementById(zoneId);
        const input = document.getElementById(inputId);
        if (!zone || !input) return;

        // Click to open file dialog
        zone.addEventListener('click', () => input.click());

        // File input change
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        // Drag & Drop Events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, () => zone.classList.add('is-dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, () => zone.classList.remove('is-dragover'), false);
        });

        zone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        function handleFile(file) {
            // Update UI
            zone.classList.add('dropbox-file-selected');
            const title = zone.querySelector('.dropbox-title');
            const subtitle = zone.querySelector('.dropbox-subtitle');
            
            if (title) title.textContent = file.name;
            if (subtitle) subtitle.textContent = (file.size / 1024).toFixed(1) + ' KB';

            if (onFileSelected) onFileSelected(file);
        }
    }

    // Helper Toast (if not exists)
    function showToast(msg) {
        // Simple alert for now if no toast system
        alert(msg);
    }

    // Calculate KPIs for consumption cost vs revenue WITH COMPARISON
    async function updateChartKPIs() {
        const kpiConsumption = document.getElementById('kpi-consumption-cost');
        const kpiRevenue = document.getElementById('kpi-revenue-total');
        const kpiMargin = document.getElementById('kpi-margin');
        const kpiConsumptionPct = document.getElementById('kpi-consumption-pct');
        const kpiRevenuePct = document.getElementById('kpi-revenue-pct');
        const kpiMarginPct = document.getElementById('kpi-margin-pct');
        
        if (!kpiConsumption || !kpiRevenue || !kpiMargin) return;

        try {
            // Get current period dates from filters
            let startDate = ui.filterStart?.value;
            let endDate = ui.filterEnd?.value;
            
            if (!startDate) {
                const d = new Date();
                d.setDate(d.getDate() - 30);
                startDate = d.toISOString().split('T')[0];
            }
            if (!endDate) {
                endDate = new Date().toISOString().split('T')[0];
            }

            // Calculate previous period dates (same duration)
            const start = new Date(startDate);
            const end = new Date(endDate);
            const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            
            const prevEnd = new Date(start);
            prevEnd.setDate(prevEnd.getDate() - 1);
            const prevStart = new Date(prevEnd);
            prevStart.setDate(prevStart.getDate() - daysDiff);
            
            const prevStartStr = prevStart.toISOString().split('T')[0];
            const prevEndStr = prevEnd.toISOString().split('T')[0];

            // Helper function to get period data
            async function getPeriodData(periodStart, periodEnd) {
                // Get consumption cost
                const { data: consumptionReports } = await sb
                    .from('consumption_reports')
                    .select('id')
                    .gte('operational_date', periodStart)
                    .lte('operational_date', periodEnd);

                let consumptionCost = 0;
                if (consumptionReports && consumptionReports.length > 0) {
                    const reportIds = consumptionReports.map(r => r.id);
                    
                    const { data: consumptionData } = await sb
                        .from('consumption_details')
                        .select(`
                            quantity,
                            sku:master_sku(costo)
                        `)
                        .in('report_id', reportIds);

                    if (consumptionData) {
                        consumptionData.forEach(d => {
                            const qty = parseFloat(d.quantity) || 0;
                            const cost = parseFloat(d.sku?.costo) || 0;
                            consumptionCost += qty * cost;
                        });
                    }
                }

                // Get revenue total
                const { data: revenueData } = await sb
                    .from('revenue_reports')
                    .select('total_revenue')
                    .gte('operational_date', periodStart)
                    .lte('operational_date', periodEnd);

                let revenue = 0;
                if (revenueData) {
                    revenueData.forEach(r => {
                        revenue += parseFloat(r.total_revenue) || 0;
                    });
                }

                const margin = revenue - consumptionCost;
                
                return { consumptionCost, revenue, margin };
            }

            // Get current and previous period data in parallel
            const [currentData, previousData] = await Promise.all([
                getPeriodData(startDate, endDate),
                getPeriodData(prevStartStr, prevEndStr)
            ]);

            // Calculate percentage changes
            function calculateChange(current, previous) {
                // Si ambos son 0, no hay cambio
                if (previous === 0 && current === 0) return 0;
                // Si anterior es 0 pero ahora hay valor, es 100% de incremento
                if (previous === 0 && current > 0) return 100;
                // Si anterior es 0 pero ahora es negativo, es -100%
                if (previous === 0 && current < 0) return -100;
                // Cálculo normal: (actual - anterior) / |anterior| * 100
                return ((current - previous) / Math.abs(previous)) * 100;
            }

            const consumptionChange = calculateChange(currentData.consumptionCost, previousData.consumptionCost);
            const revenueChange = calculateChange(currentData.revenue, previousData.revenue);
            const marginChange = calculateChange(currentData.margin, previousData.margin);

            // Update KPI values
            kpiConsumption.textContent = window.Utils.formatARS(currentData.consumptionCost);
            kpiRevenue.textContent = window.Utils.formatARS(currentData.revenue);
            kpiMargin.textContent = window.Utils.formatARS(currentData.margin);
            
            // Color margin based on positive/negative
            kpiMargin.style.color = currentData.margin >= 0 ? 'var(--success)' : 'var(--error)';

            // Update trend indicators
            function updateTrendIndicator(element, change, inverse = false) {
                if (!element) return;
                
                const absChange = Math.abs(change);
                
                // Determine if this change is good (up) or bad (down) for business
                // inverse=true means higher values are bad (like costs)
                let isGoodChange;
                if (change > 0) {
                    isGoodChange = !inverse; // For normal metrics, up is good. For inverse (costs), up is bad.
                } else if (change < 0) {
                    isGoodChange = inverse; // For normal metrics, down is bad. For inverse (costs), down is good.
                } else {
                    isGoodChange = null; // Neutral
                }
                
                const direction = isGoodChange === true ? 'up' : 
                                 isGoodChange === false ? 'down' : 
                                 'neutral';
                
                const icon = change > 0 ? '↑' : change < 0 ? '↓' : '=';
                const sign = change > 0 ? '+' : '';
                
                element.textContent = `${icon} ${sign}${absChange.toFixed(1)}%`;
                element.className = `chart-kpi-trend trend-${direction}`;
                element.title = `vs periodo anterior (${prevStartStr} a ${prevEndStr})`;
            }

            // Consumption: higher is worse (inverse=true)
            updateTrendIndicator(kpiConsumptionPct, consumptionChange, true);
            // Revenue: higher is better
            updateTrendIndicator(kpiRevenuePct, revenueChange, false);
            // Margin: higher is better
            updateTrendIndicator(kpiMarginPct, marginChange, false);

        } catch (err) {
            console.error('Error updating KPIs:', err);
            kpiConsumption.textContent = '-';
            kpiRevenue.textContent = '-';
            kpiMargin.textContent = '-';
            if (kpiConsumptionPct) kpiConsumptionPct.textContent = '';
            if (kpiRevenuePct) kpiRevenuePct.textContent = '';
            if (kpiMarginPct) kpiMarginPct.textContent = '';
        }
    }

    async function renderTop5Chart(reports, reportType) {
        if (reports.length === 0) return;
        
        const reportIds = reports.map(r => r.id);
        const dates = reports.map(r => r.operational_date);
        
        // Theme colors
        const themeColors = [
            getComputedStyle(document.documentElement).getPropertyValue('--danger') || '#ff3b30',
            getComputedStyle(document.documentElement).getPropertyValue('--warning') || '#ff9500',
            getComputedStyle(document.documentElement).getPropertyValue('--success') || '#34c759',
            getComputedStyle(document.documentElement).getPropertyValue('--info') || '#007aff',
            getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#5856d6'
        ];
        
        let recipeTotals = {};
        
        if (reportType === 'revenue') {
            // Query revenue_details table for revenue mode
            const { data: details } = await sb
                .from('revenue_details')
                .select('report_id, recipe_id, recipe_name, total_amount')
                .in('report_id', reportIds);
            
            if (!details || details.length === 0) return;
            
            // Calculate totals per recipe (sum amounts in $)
            // Use recipe_name as key to handle null recipe_ids
            details.forEach(d => {
                const key = d.recipe_name || 'Sin Nombre';
                if (!recipeTotals[key]) {
                    recipeTotals[key] = { name: d.recipe_name || 'Sin Nombre', total: 0 };
                }
                recipeTotals[key].total += (d.total_amount || 0);
            });
            
            // Get TOP 5 recipes by revenue
            const top5 = Object.entries(recipeTotals)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 5)
                .map(([recipeName, info]) => ({ name: recipeName, total: info.total }));
            
            // Build datasets with $ data
            const datasets = top5.map((item, idx) => {
                const dataPoints = reports.map(report => {
                    // Sum all details for this recipe name on this report
                    const recipeDetails = details.filter(d => 
                        d.report_id === report.id && 
                        (d.recipe_name || 'Sin Nombre') === item.name
                    );
                    return recipeDetails.reduce((sum, d) => sum + (d.total_amount || 0), 0);
                });
                
                const color = themeColors[idx % themeColors.length];
                return {
                    label: item.name,
                    data: dataPoints,
                    borderColor: color,
                    backgroundColor: color,
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                };
            });
            
            // Create chart with $ formatting
            createChartInstance(dates, datasets, '$', true);
            
        } else {
            // Query consumption_details for consumption mode
            const { data: details } = await sb
                .from('consumption_details')
                .select('report_id, sku_id, quantity, sku:master_sku(nombre)')
                .in('report_id', reportIds);
            
            if (!details || details.length === 0) return;
            
            // Calculate totals per SKU
            const skuTotals = {};
            details.forEach(d => {
                if (!skuTotals[d.sku_id]) {
                    skuTotals[d.sku_id] = { name: d.sku?.nombre || '?', total: 0 };
                }
                skuTotals[d.sku_id].total += d.quantity;
            });
            
            // Get TOP 5
            const top5 = Object.entries(skuTotals)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 5)
                .map(([id, info]) => ({ id, name: info.name, type: 'sku' }));
            
            // Build datasets
            const datasets = top5.map((item, idx) => {
                const dataPoints = reports.map(report => {
                    const detail = details.find(d => d.report_id === report.id && d.sku_id === item.id);
                    return detail ? detail.quantity : 0;
                });
                
                const color = themeColors[idx % themeColors.length];
                return {
                    label: item.name,
                    data: dataPoints,
                    borderColor: color,
                    backgroundColor: color,
                    tension: 0.4,
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5
                };
            });
            
            // Create chart with units formatting
            createChartInstance(dates, datasets, 'unid.', false);
        }
    }
    
    
    function createChartInstance(dates, datasets, unit, isCurrency) {
        const ctx = ui.top5ChartCanvas.getContext('2d');

        state.chartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: dates, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 12,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const value = isCurrency 
                                    ? '$' + context.parsed.y.toFixed(2) 
                                    : context.parsed.y.toFixed(1) + ' ' + unit;
                                return context.dataset.label + ': ' + value;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: isCurrency ? 'Recaudación ($)' : 'Cantidad (' + unit + ')'
                        },
                        ticks: {
                            callback: function(value) {
                                return isCurrency ? '$' + value.toFixed(0) : value;
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Fecha'
                        }
                    }
                }
            }
        });
    }

    // ========== IMPORT HISTORY MODAL ==========
    
    async function openImportsModal() {
        ui.importsModal?.showModal();
        switchImportTab('consumption');
        await loadImportHistory();
    }
    
    function switchImportTab(tab) {
        if (tab === 'consumption') {
            ui.importTabConsumption?.classList.add('active');
            ui.importTabConsumption.style.borderBottom = '2px solid var(--primary)';
            ui.importTabRevenue?.classList.remove('active');
            ui.importTabRevenue.style.borderBottom = 'none';
            
            ui.importContentConsumption?.classList.remove('hidden');
            ui.importContentRevenue?.classList.add('hidden');
        } else {
            ui.importTabRevenue?.classList.add('active');
            ui.importTabRevenue.style.borderBottom = '2px solid var(--primary)';
            ui.importTabConsumption?.classList.remove('active');
            ui.importTabConsumption.style.borderBottom = 'none';
            
            ui.importContentRevenue?.classList.remove('hidden');
            ui.importContentConsumption?.classList.add('hidden');
        }
    }
    
    async function loadImportHistory() {
        try {
            // Load consumption reports
            const { data: consReports, error: consErr } = await sb
                .from('consumption_reports')
                .select('id, operational_date, file_name, created_at')
                .order('operational_date', { ascending: false });
            
            if (consErr) throw consErr;
            
            // Load details count and total for each consumption report
            const consReportsWithDetails = await Promise.all((consReports || []).map(async (report) => {
                const { data: details } = await sb
                    .from('consumption_details')
                    .select('sku_id, quantity')
                    .eq('report_id', report.id);
                
                const skuCount = new Set((details || []).map(d => d.sku_id)).size;
                const totalQty = (details || []).reduce((sum, d) => sum + d.quantity, 0);
                
                return { ...report, skuCount, totalQty };
            }));
            
            renderConsumptionReports(consReportsWithDetails);
            
            // Load revenue reports
            const { data: revReports, error: revErr } = await sb
                .from('revenue_reports')
                .select('id, operational_date, file_name, total_revenue, created_at')
                .order('operational_date', { ascending: false });
            
            if (revErr) throw revErr;
            
            // Load details count for each revenue report
            const revReportsWithDetails = await Promise.all((revReports || []).map(async (report) => {
                const { data: details } = await sb
                    .from('revenue_details')
                    .select('recipe_id')
                    .eq('report_id', report.id);
                
                const recipeCount = (details || []).length;
                
                return { ...report, recipeCount };
            }));
            
            renderRevenueReports(revReportsWithDetails);
            
        } catch (err) {
            console.error('Error loading import history:', err);
            window.Toast?.error('Error al cargar historial de importaciones');
        }
    }
    
    function renderConsumptionReports(reports) {
        if (!ui.consumptionReportsTbody) return;
        
        if (reports.length === 0) {
            ui.consumptionReportsTbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-tertiary);">
                        No hay reportes de consumo
                    </td>
                </tr>
            `;
            return;
        }
        
        ui.consumptionReportsTbody.innerHTML = reports.map(report => `
            <tr>
                <td>${report.operational_date}</td>
                <td>${report.file_name || 'Sin nombre'}</td>
                <td style="text-align: center;">${report.skuCount || 0}</td>
                <td style="text-align: right;">${(report.totalQty || 0).toFixed(1)} unid.</td>
                <td style="font-size: 11px; color: var(--text-tertiary);">
                    ${new Date(report.created_at).toLocaleString('es-AR')}
                </td>
            </tr>
        `).join('');
    }
    
    function renderRevenueReports(reports) {
        if (!ui.revenueReportsTbody) return;
        
        if (reports.length === 0) {
            ui.revenueReportsTbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-tertiary);">
                        No hay reportes de recaudación
                    </td>
                </tr>
            `;
            return;
        }
        
        ui.revenueReportsTbody.innerHTML = reports.map(report => `
            <tr>
                <td>${report.operational_date}</td>
                <td>${report.file_name || 'Sin nombre'}</td>
                <td style="text-align: center;">${report.recipeCount || 0}</td>
                <td style="text-align: right; font-weight: 600; color: var(--success);">
                    $${(report.total_revenue || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style="font-size: 11px; color: var(--text-tertiary);">
                    ${new Date(report.created_at).toLocaleString('es-AR')}
                </td>
            </tr>
        `).join('');
    }

    // =========================================================================
    // CODE MAPPINGS MANAGEMENT
    // =========================================================================

    async function openCodeMappingsModal() {
        ui.codeMappingsModal.showModal();
        await loadRecipesForMapping();
        await loadCodeMappings();
    }

    async function loadRecipesForMapping() {
        // Load all recipes for the dropdown
        const { data: recipes, error } = await sb
            .from('master_recipes')
            .select('id, name, external_id')
            .order('name');
        
        if (error) {
            console.error('Error loading recipes:', error);
            return;
        }

        // Populate select
        ui.selectRecipe.innerHTML = '<option value="">Seleccionar receta...</option>';
        recipes.forEach(recipe => {
            const option = document.createElement('option');
            option.value = recipe.id;
            option.textContent = `${recipe.name}${recipe.external_id ? ` (${recipe.external_id})` : ''}`;
            ui.selectRecipe.appendChild(option);
        });
    }

    async function loadCodeMappings() {
        ui.codeMappingsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-tertiary);">Cargando mapeos...</td></tr>';

        const { data: mappings, error } = await sb
            .from('recipe_code_mappings')
            .select('id, pos_code, recipe_id, notes, recipe:master_recipes(name)')
            .order('pos_code');

        if (error) {
            console.error('Error loading code mappings:', error);
            ui.codeMappingsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--error);">Error al cargar mapeos</td></tr>';
            return;
        }

        if (!mappings || mappings.length === 0) {
            ui.codeMappingsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-tertiary);">No hay mapeos configurados</td></tr>';
            return;
        }

        ui.codeMappingsTableBody.innerHTML = mappings.map(m => `
            <tr>
                <td><code style="background: var(--bg-elevated); padding: 2px 6px; border-radius: 4px;">${window.Utils.escapeHtml(m.pos_code)}</code></td>
                <td>${window.Utils.escapeHtml(m.recipe?.name || 'Receta no encontrada')}</td>
                <td class="text-tertiary text-xs">${m.notes || '-'}</td>
                <td style="text-align: center;">
                    <button class="btn-icon btn-icon-ghost btn-delete-mapping" data-mapping-id="${m.id}" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Attach delete listeners
        ui.codeMappingsTableBody.querySelectorAll('.btn-delete-mapping').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const mappingId = e.currentTarget.dataset.mappingId;
                if (confirm('¿Eliminar este mapeo?')) {
                    await deleteCodeMapping(mappingId);
                }
            });
        });
    }

    async function saveCodeMapping() {
        const posCode = ui.inputPosCode.value.trim();
        const recipeId = ui.selectRecipe.value;

        if (!posCode || !recipeId) {
            window.Toast?.error('Completa código y receta');
            return;
        }

        const { error } = await sb
            .from('recipe_code_mappings')
            .insert({
                pos_code: posCode,
                recipe_id: recipeId
            });

        if (error) {
            console.error('Error saving mapping:', error);
            if (error.code === '23505') {
                window.Toast?.error('Ese código ya existe');
            } else {
                window.Toast?.error('Error al guardar');
            }
            return;
        }

        window.Toast?.success('Mapeo guardado');
        ui.inputPosCode.value = '';
        ui.selectRecipe.value = '';
        await loadCodeMappings();
    }

    async function deleteCodeMapping(mappingId) {
        const { error } = await sb
            .from('recipe_code_mappings')
            .delete()
            .eq('id', mappingId);

        if (error) {
            console.error('Error deleting mapping:', error);
            window.Toast?.error('Error al eliminar');
            return;
        }

        window.Toast?.success('Mapeo eliminado');
        await loadCodeMappings();
    }

    // Event Listeners for Code Mappings
    if (ui.btnManageCodes) {
        ui.btnManageCodes.addEventListener('click', openCodeMappingsModal);
    }
    if (ui.btnCloseCodeMappings) {
        ui.btnCloseCodeMappings.addEventListener('click', () => ui.codeMappingsModal.close());
    }
    if (ui.btnAddMapping) {
        ui.btnAddMapping.addEventListener('click', saveCodeMapping);
    }

    init();

    // --- MANUAL ADJUSTMENT LOGIC ---
    
    function openAdjustmentModal() {
        if (!ui.adjustmentModal) return;
        ui.adjustmentModal.classList.remove('hidden');
        ui.adjustmentForm?.reset();
        
        // Reset state
        if (ui.displayStockAdjustment) ui.displayStockAdjustment.textContent = '-';
        if (ui.inputTypeAdjustment) ui.inputTypeAdjustment.value = 'consumption';
        ui.typeBtnsAdjustment.forEach(b => b.classList.toggle('active', b.dataset.type === 'consumption'));
        updateAdjustmentHint();
        
        // Populate Select
        if (ui.selSkuAdjustment) {
            const activeSkus = state.skuData
                .filter(s => s.active)
                .sort((a, b) => a.name.localeCompare(b.name));
                
            ui.selSkuAdjustment.innerHTML = '<option value="">Seleccione Producto...</option>' + 
                activeSkus.map(s => `<option value="${s.id}">${window.Utils.escapeHtml(s.name)}</option>`).join('');
        }
    }
    
    async function handleAdjustmentSubmit(e) {
        e.preventDefault();
        
        const skuId = ui.selSkuAdjustment?.value;
        const qty = parseInt(ui.inputQtyAdjustment?.value);
        const reason = ui.inputReasonAdjustment?.value || '';
        const type = ui.inputTypeAdjustment?.value || 'consumption';
        
        if (!skuId || !qty || qty <= 0) {
            window.Toast?.warning('Complete los campos obligatorios');
            return;
        }
        
        const sku = state.skuData.find(s => String(s.id) === String(skuId));
        if (!sku) return;
        
        const confirmed = confirm(`¿Confirmar SALIDA de ${qty} UN de ${sku.name}?`);
        if (!confirmed) return;
        
        const btnSubmit = ui.adjustmentForm.querySelector('button[type="submit"]');
        if (btnSubmit) btnSubmit.disabled = true;
        
        try {
            const session = await window.Auth.getSession();
             // 1. Insert Movement
            const { error: movError } = await sb
                .from('inventory_movements')
                .insert({
                    sku_id: skuId,
                    quantity_change: -qty,
                    movement_type: type,
                    reason: reason || "Manual Admin Adjustment (Central)",
                    created_by: session.data.session?.user?.id
                });

            if (movError) throw new Error("Error registrando movimiento: " + movError.message);

            // 2. Update Stock
            const currentStock = (typeof sku.stock === 'number') ? sku.stock : 0;
            const newStock = currentStock - qty;

            const { error: stockError } = await sb
                .from('inventory_stock')
                .update({ quantity: newStock, updated_at: new Date() })
                .eq('sku_id', skuId);

            if (stockError) throw new Error("Error actualizando stock: " + stockError.message);
            
            window.Toast?.success('Ajuste realizado correctamente');
            ui.adjustmentModal.classList.add('hidden');
            
            // Refresh Data
            await loadUnifiedData();
            
        } catch (err) {
            console.error('Adjustment error:', err);
            window.Toast?.error(err.message);
        } finally {
            if (btnSubmit) btnSubmit.disabled = false;
        }
    }

})();
