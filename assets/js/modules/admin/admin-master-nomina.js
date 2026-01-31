// Module: admin-master-nomina.js
// Logic for Staff Master Page (Nomina)
// initSlidePanel is global from panel.js

(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'contable']);
    if (!session) return; 

    // 2. DOM Elements
    const listContainer = document.getElementById('list-container');
    const inpName = document.getElementById('staff-name');
    const inpRole = document.getElementById('staff-role');
    const inpEmail = document.getElementById('staff-email');
    const inpPhone = document.getElementById('staff-phone');
    const inpCbu = document.getElementById('staff-cbu'); // Alias/CBU if supported in DB, otherwise we might use notes or metadata
    const inpAlias = document.getElementById('staff-alias'); // Split/Alternative?
    const chkActive = document.getElementById('staff-active');
    
    // Panel & Controls
    const panelTitle = document.getElementById('panel-title');
    const btnSave = document.getElementById('btn-save');
    const btnNew = document.getElementById('btn-new');
    const searchInput = document.getElementById('staff-search');
    
    // Counters
    const countTotal = document.getElementById('staff-total');
    const countActive = document.getElementById('staff-active');
    const countInactive = document.getElementById('staff-inactive');
    
    // States
    const pageCardLoading = document.getElementById('page-card-loading');
    const pageCardEmpty = document.getElementById('page-card-empty');
    const btnClearSearch = document.getElementById('btn-clear-search');

    // Tabs & View Containers
    const tabNomina = document.getElementById('tab-nomina');
    const tabPerfiles = document.getElementById('tab-perfiles');
    const viewNomina = document.getElementById('view-nomina');
    const viewPerfiles = document.getElementById('view-perfiles');
    const profilesGrid = document.getElementById('profiles-grid-container');
    const profilesSearch = document.getElementById('profiles-search');

    if (!window.Utils?.assertSbOrShowBlockingError?.(listContainer)) return;

    // Helper shorthand for escaping
    const esc = (s) => window.Utils?.escapeHtml?.(s) ?? s;

    const errorState = (msg) => `
        <div class="state-block">
            <p class="state-title danger">Error al cargar</p>
            <p class="state-desc">${esc(msg)}</p>
        </div>
    `;
    const emptyState = `
        <div class="state-block">
            <p class="state-title">Sin personal</p>
            <p class="state-desc">No hay personal registrado en la nómina.</p>
            <button class="btn-ghost btn-sm mt-2" data-action="create-staff">Registrar personal</button>
        </div>
    `;

    let staffList = [];
    let roles = [];
    let editingId = null;
    let expandedId = null;
    let currentStatus = 'all';
    let firstLoad = true;
    let overlayTimer = null;
    let searchTimer = null;

    const setFormCreate = () => {
        editingId = null;
        if (panelTitle) panelTitle.textContent = 'Nuevo Personal';
        if (btnSave) btnSave.textContent = 'Guardar';
        if (inpEmail) inpEmail.disabled = false; // Allow editing email on create
    };

    const setFormEdit = () => {
        if (panelTitle) panelTitle.textContent = 'Editar Personal';
        if (btnSave) btnSave.textContent = 'Actualizar';
        if (inpEmail) inpEmail.disabled = true; // Prevent changing email as it might be their ID
    };

    function updateSummary() {
        if (!countTotal || !countActive || !countInactive) return;
        const total = staffList.length;
        const active = staffList.filter(p => p.active !== false).length; // active defaults to true usually
        const inactive = total - active;
        countTotal.textContent = total;
        countActive.textContent = active;
        countInactive.textContent = inactive;
    }

    // Role loading and rendering
    async function loadRoles() {
        try {
            // First try to load from master_staff_roles
            const { data, error } = await window.sb
                .from('master_staff_roles')
                .select('id, name')
                .order('name');

            if (!error && data) {
                roles = data.map(r => r.name); // Just use names for now to match profile.role string nature often seen
            } else {
                // Fallback roles if table fails or is empty
                roles = ['admin', 'encargado_barra', 'staff_barra', 'cajero', 'staff_caja', 'rrpp', 'seguridad', 'limpieza'];
            }
            renderRoleOptions();
        } catch (err) {
            console.warn('Error loading roles, using defaults:', err);
            roles = ['admin', 'encargado_barra', 'staff_barra', 'cajero', 'staff_caja', 'rrpp', 'seguridad', 'limpieza'];
            renderRoleOptions();
        }
    }

    function renderRoleOptions(selectedValue = '') {
        if (!inpRole) return;
        const options = ['<option value="">Seleccionar rol</option>'];
        roles.forEach(role => {
            options.push(`<option value="${role}">${role.replace('_', ' ').toUpperCase()}</option>`);
        });
        
        // Add current value if not in list
        if (selectedValue && !roles.includes(selectedValue)) {
             options.push(`<option value="${selectedValue}">${selectedValue.toUpperCase()}</option>`);
        }

        inpRole.innerHTML = options.join('');
        if (selectedValue) inpRole.value = selectedValue;
    }

    // 3. Render Function
    function renderList(data) {
        if (!data || data.length === 0) {
            listContainer.innerHTML = emptyState;
            pageCardEmpty?.classList.remove('is-visible');
            return;
        }

        const searchTerm = (searchInput?.value || '').toLowerCase().trim();
        const baseFiltered = data.filter(item => {
            const isActive = item.active !== false;
            if (currentStatus === 'active') return isActive;
            if (currentStatus === 'inactive') return !isActive;
            return true;
        });

        const filtered = !searchTerm ? baseFiltered : baseFiltered.filter(item => {
            const values = [
                item.full_name,
                item.email,
                item.phone,
                item.role
            ].filter(Boolean).join(' ').toLowerCase();
            return values.includes(searchTerm);
        });

        if (filtered.length === 0) {
            listContainer.innerHTML = '';
            pageCardEmpty?.classList.add('is-visible');
            return;
        }
        pageCardEmpty?.classList.remove('is-visible');

        const rows = [];
        rows.push(`
            <div class="table-viewport table-shell table-viewport-limited">
                <div class="table-scroll">
                    <table class="table table-sticky">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">Nombre Completo</th>
                            <th class="table-cell is-header cell-pad">Rol</th>
                            <th class="table-cell is-header cell-pad">Teléfono</th>
                            <th class="table-cell is-header cell-pad">Email</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad">Editar</th>
                        </tr>
                    </thead>
                    <tbody>
        `);

        filtered.forEach(item => {
            const isActive = item.active !== false;
            const inactiveClass = isActive ? '' : 'is-inactive';
            // XSS Protection: escape all user-provided values
            const safeName = esc(item.full_name || 'Sin Nombre');
            const safePhone = esc(item.phone || '-');
            const safeEmail = esc(item.email || '-');
            const safeRole = esc(item.role ? item.role.replace('_', ' ').toUpperCase() : '-');
            const isExpanded = expandedId === item.id;
            
            // Status badge
            const statusBadge = isActive 
                ? `<span class="status-pill status-success">Activo</span>` 
                : `<span class="status-pill status-error">Inactivo</span>`;

            rows.push(`
                <tr class="table-row row-clickable staff-row ${isExpanded ? 'is-open' : ''} ${inactiveClass}" data-id="${item.id}">
                    <td class="table-cell cell-pad cell-strong">
                        <div class="row-flex text-left">
                            <span class="row-caret">▸</span>
                            <div class="avatar-initial small">${esc((item.full_name || 'U').charAt(0))}</div>
                            <span>${safeName}</span>
                        </div>
                    </td>
                    <td class="table-cell cell-pad muted">${safeRole}</td>
                    <td class="table-cell cell-pad muted">${safePhone}</td>
                    <td class="table-cell cell-pad muted text-sm">${safeEmail}</td>
                    <td class="table-cell cell-pad">${statusBadge}</td>
                    <td class="table-cell cell-pad">
                        <button class="btn-ghost btn-sm btn-edit-staff" data-id="${item.id}" title="Editar">Editar</button>
                    </td>
                </tr>
                <tr class="staff-details row-details row-subtle ${isExpanded ? 'is-open' : ''} ${inactiveClass}" data-id="${item.id}">
                    <td colspan="6" class="table-cell cell-pad-sm text-sm muted">
                        <div class="row-flex">
                            <div><strong>ID:</strong> <span class="muted">${esc(item.id)}</span></div>
                            <!-- Future: Add CBU/Alias here if we add it to DB -->
                             <div><strong>Usuario Sistema:</strong> <span class="muted">${item.email && !item.email.includes('@midnight.tmp') ? 'Sí' : 'No (Simulado)'}</span></div>
                        </div>
                    </td>
                </tr>
            `);
        });

        rows.push(`</tbody></table></div></div>`);
        listContainer.innerHTML = rows.join('');
    }

    // 3.1 Render Profiles Grid (New Section)
    function renderProfilesGrid(data) {
        if (!profilesGrid) return;
        
        const searchTerm = (profilesSearch?.value || '').toLowerCase().trim();
        const filtered = !searchTerm ? data : data.filter(item => {
            const values = [
                item.full_name,
                item.email,
                item.role
            ].filter(Boolean).join(' ').toLowerCase();
            return values.includes(searchTerm);
        });

        if (filtered.length === 0) {
            profilesGrid.innerHTML = `
                <div class="state-block">
                    <p class="state-title">Sin perfiles</p>
                    <p class="state-desc">No se encontraron perfiles que coincidan.</p>
                </div>
            `;
            return;
        }

        const cards = filtered.map(item => {
            const isActive = item.active !== false;
            // XSS Protection: escape all user-provided values
            const safeRole = esc((item.role || 'SIN ROL').replace('_', ' ').toUpperCase());
            const safeInitial = esc((item.full_name || 'U').charAt(0).toUpperCase());
            const safeName = esc(item.full_name || 'Sin Nombre');
            const safeEmail = esc(item.email || '-');
            const safePhone = esc(item.phone || '-');
            
            return `
                <div class="profile-card animate-scale-in">
                    <div class="profile-status">
                         <span class="status-pill ${isActive ? 'status-success' : 'status-error'}"></span>
                    </div>
                    <div class="profile-avatar">${safeInitial}</div>
                    <div class="profile-name">${safeName}</div>
                    <div class="profile-role">${safeRole}</div>
                    
                    <div class="profile-info">
                        <div class="profile-item">
                            <span class="profile-label">Email:</span>
                            <span class="profile-value">${safeEmail}</span>
                        </div>
                        <div class="profile-item">
                            <span class="profile-label">Tel:</span>
                            <span class="profile-value">${safePhone}</span>
                        </div>
                        <div class="profile-item">
                            <span class="profile-label">Status:</span>
                            <span class="profile-value">${isActive ? 'Activo' : 'Inactivo'}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        profilesGrid.innerHTML = cards.join('');
    }

    // 4. Fetch Data
    async function loadList() {
        listContainer.innerHTML = '';
        pageCardEmpty?.classList.remove('is-visible');
        if (firstLoad) {
            pageCardLoading?.classList.add('is-visible');
            firstLoad = false;
        }
        try {
            const { data, error } = await window.sb
                .from('profiles')
                .select('*')
                .order('full_name');

            if (error) throw error;
            staffList = data || [];
            updateSummary();
            renderList(staffList);
            renderProfilesGrid(staffList);

        } catch (err) {
            console.error('Error loading staff:', err);
            listContainer.innerHTML = errorState(err.message);
        } finally {
            if (overlayTimer) {
                clearTimeout(overlayTimer);
                overlayTimer = null;
            }
            pageCardLoading?.classList.remove('is-visible');
        }
    }

    // Init
    await loadRoles();
    loadList();

    // 5. Panel Logic
    const panelCtrl = window.initSlidePanel({
        onOpen: () => {
            if (!editingId) {
                // Reset fields
                if (inpName) inpName.value = '';
                if (inpRole) inpRole.value = '';
                if (inpEmail) inpEmail.value = '';
                if (inpPhone) inpPhone.value = '';
                if (chkActive) chkActive.checked = true;
                setFormCreate();
            }
            if (inpName) inpName.focus();
        },
        onClose: () => {
            setFormCreate();
        },
        onSave: async () => {
             const name = (inpName?.value || '').trim();
             const role = (inpRole?.value || '').trim();
             const phone = (inpPhone?.value || '').trim();
             let email = (inpEmail?.value || '').trim();
             const active = !!(chkActive?.checked);

             if (!name) {
                 window.Toast.error('El nombre es obligatorio.');
                 return;
             }
             if (!role) {
                 window.Toast.error('El rol es obligatorio.');
                 return;
             }

             // If no email provided for new user, generate one
             if (!email && !editingId) {
                 email = `staff_${Date.now()}@midnight.tmp`;
             }

             // UI Loading
             const originalBtnText = btnSave.textContent;
             btnSave.textContent = 'Guardando...';
             btnSave.disabled = true;

             try {
                 const payload = {
                     full_name: name,
                     role: role,
                     phone: phone || null,
                     email: email,
                     active: active
                 };
                 // Note: we can't easily update email if it's the PK or unique, usually handled via Auth. 
                 // For profiles table, we assume we can update fields.

                 if (editingId) {
                     // Don't update email on edit unless specific logic exists
                     delete payload.email; 
                     
                     const { error } = await window.sb
                         .from('profiles')
                         .update(payload)
                         .eq('id', editingId);
                     if (error) throw error;
                 } else {
                     const { error } = await window.sb
                         .from('profiles')
                         .insert([payload]);
                     if (error) throw error;
                 }
                 
                 // Success
                 window.Toast.success(editingId ? 'Personal actualizado' : 'Personal registrado');
                 await loadList();
                 setFormCreate();
                 editingId = null;
                 if (panelCtrl?.close) panelCtrl.close();
             } catch (err) {
                 console.error('Error saving staff:', err);
                 window.Toast.error(err.message || 'Error al guardar personal');
             } finally {
                 // Restore UI
                 if (btnSave) {
                    btnSave.textContent = originalBtnText;
                    btnSave.disabled = false;
                 }
             }
        }
    });

    // Reset to create mode when clicking Nuevo
    if (btnNew) {
        btnNew.addEventListener('click', () => {
            setFormCreate();
            editingId = null;
            panelCtrl?.open?.();
        });
    }

    function toggleDetails(id) {
        const openDetails = listContainer.querySelector('.staff-details.is-open');
        if (openDetails && openDetails.dataset.id !== id) {
            openDetails.classList.remove('is-open');
            const prevRow = listContainer.querySelector(`.staff-row[data-id="${openDetails.dataset.id}"]`);
            if (prevRow) prevRow.classList.remove('is-open');
        }

        const detailsRow = listContainer.querySelector(`.staff-details[data-id="${id}"]`);
        const mainRow = listContainer.querySelector(`.staff-row[data-id="${id}"]`);
        if (!detailsRow) return;

        const willOpen = !detailsRow.classList.contains('is-open');
        detailsRow.classList.toggle('is-open', willOpen);
        if (mainRow) mainRow.classList.toggle('is-open', willOpen);
        expandedId = willOpen ? id : null;
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchTimer) clearTimeout(searchTimer);
            searchTimer = setTimeout(() => renderList(staffList), 180);
        });
    }

    // Status pills
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatus = btn.dataset.status || 'all';
            if (currentStatus === 'all' && searchInput) {
                searchInput.value = '';
            }
            renderList(staffList);
        });
    });

    // View Switching Logic
    const switchView = (view) => {
        if (view === 'nomina') {
            tabNomina?.classList.add('active');
            tabPerfiles?.classList.remove('active');
            viewNomina?.classList.remove('hidden');
            viewPerfiles?.classList.add('hidden');
            renderList(staffList);
        } else {
            tabPerfiles?.classList.add('active');
            tabNomina?.classList.remove('active');
            viewPerfiles?.classList.remove('hidden');
            viewNomina?.classList.add('hidden');
            renderProfilesGrid(staffList);
        }
    };

    tabNomina?.addEventListener('click', () => switchView('nomina'));
    tabPerfiles?.addEventListener('click', () => switchView('perfiles'));

    if (profilesSearch) {
        profilesSearch.addEventListener('input', () => {
            if (searchTimer) clearTimeout(searchTimer);
            searchTimer = setTimeout(() => renderProfilesGrid(staffList), 180);
        });
    }

    // Edit button handler (event delegation)
    if (listContainer) {
        listContainer.addEventListener('click', (e) => {
            const target = e.target;
            const createBtn = target.closest('[data-action="create-staff"]');
            if (createBtn) {
                btnNew?.click();
                return;
            }
            const editBtn = target.closest('.btn-edit-staff');
            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                const staff = staffList.find(p => p.id === id);
                if (!staff) return;
                editingId = id;
                setFormEdit();

                if (inpName) inpName.value = staff.full_name || '';
                if (inpRole) inpRole.value = staff.role || ''; // If dropdown has it
                renderRoleOptions(staff.role); // Ensure value is selectable
                
                if (inpPhone) inpPhone.value = staff.phone || '';
                if (inpEmail) inpEmail.value = staff.email || '';
                if (chkActive) chkActive.checked = staff.active !== false;

                if (panelCtrl?.open) panelCtrl.open();
                return;
            }

            const row = target.closest('.staff-row');
            if (row) {
                const id = row.getAttribute('data-id');
                toggleDetails(id);
                const expanded = row.classList.contains('is-open');
                row.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            }
        });
    }

    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            currentStatus = 'all';
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            document.querySelector('.filter-pill[data-status=\"all\"]')?.classList.add('active');
            renderList(staffList);
        });
    }

    document.getElementById('btn-logout')?.addEventListener('click', () => window.Auth.signOutAndGoLogin());
})();
