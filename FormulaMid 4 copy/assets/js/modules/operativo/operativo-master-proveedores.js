// Module: operativo-master-proveedores.js
// Logic for Operativo Suppliers Master Page
// initSlidePanel is global from panel.js

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['operativo', 'staff_barra', 'staff_operativo', 'admin', 'contable']);
    if (!session) return;

    // 2. DOM Elements
    const listContainer = document.getElementById('list-container');
    const moduleContent = document.getElementById('module-content');
    const pageCardLoading = document.getElementById('page-card-loading');
    const pageCardEmpty = document.getElementById('page-card-empty');
    const inpNombre = document.getElementById('prov-nombre');
    const inpRazonSocial = document.getElementById('prov-razon-social');
    const inpCuit = document.getElementById('prov-cuit');
    const inpTelefono = document.getElementById('prov-telefono');
    const inpEmail = document.getElementById('prov-email');
    const inpContactoNombre = document.getElementById('prov-contacto-nombre');
    const inpBanco = document.getElementById('prov-banco');
    const inpCbu = document.getElementById('prov-cbu');
    const inpNotas = document.getElementById('prov-notas');
    const chkActive = document.getElementById('prov-active');
    const panelTitle = document.getElementById('panel-title');
    const btnSave = document.getElementById('btn-save');
    const btnNew = document.getElementById('btn-new');

    if (!window.Utils?.assertSbOrShowBlockingError?.(listContainer)) return;

    const errorState = (msg) => `<div class="empty-state accent">Error: ${msg}</div>`;

    let providers = [];
    let editingId = null;
    let expandedId = null;

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

    const setFormCreate = () => {
        editingId = null;
        if (panelTitle) panelTitle.textContent = 'Nuevo Proveedor';
        if (btnSave) btnSave.textContent = 'Guardar';
    };

    const setFormEdit = () => {
        if (panelTitle) panelTitle.textContent = 'Editar Proveedor';
        if (btnSave) btnSave.textContent = 'Actualizar';
    };

    // 3. Render Function
    function renderList(data) {
        if (!data || data.length === 0) {
            listContainer.innerHTML = '';
            toggleEmptyState(true);
            return;
        }
        toggleEmptyState(false);

        let html = `
            <div class="table-scroll">
                <table class="table">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell is-header cell-pad">Proveedor</th>
                            <th class="table-cell is-header cell-pad">Contacto</th>
                            <th class="table-cell is-header cell-pad">Teléfono</th>
                            <th class="table-cell is-header cell-pad">Email</th>
                            <th class="table-cell is-header cell-pad">Estado</th>
                            <th class="table-cell is-header cell-pad">Editar</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach(item => {
            const statusClass = item.active ? 'staff-status-accepted' : 'staff-status-rejected';
            const statusText = item.active ? 'Activo' : 'Inactivo';
            const contactoNombre = item.contacto_nombre || '-';
            const telefono = item.contacto_telefono || '-';
            const email = item.email || '-';
            const razon = item.razon_social || '-';
            const cuit = item.cuit || '-';
            const banco = item.banco || '-';
            const cbu = item.cbu_alias || '-';
            const notas = item.notas || '';
            const isExpanded = expandedId === item.id;

            html += `
                <tr class="table-row row-clickable prov-row" data-id="${item.id}">
                    <td class="table-cell cell-pad cell-strong">${item.nombre_fantasia}</td>
                    <td class="table-cell cell-pad muted">${contactoNombre}</td>
                    <td class="table-cell cell-pad muted">${telefono}</td>
                    <td class="table-cell cell-pad muted">${email}</td>
                    <td class="table-cell cell-pad"><span class="staff-status badge ${statusClass}">${statusText}</span></td>
                    <td class="table-cell cell-pad">
                        <button class="footer-link btn-edit-prov" data-id="${item.id}" title="Editar">Editar</button>
                        ${notas ? `<span class="note">${notas.slice(0,50)}${notas.length>50?'…':''}</span>` : ''}
                    </td>
                </tr>
                <tr class="prov-details row-details row-subtle ${isExpanded ? 'is-open' : ''}" data-id="${item.id}">
                    <td colspan="6" class="table-cell cell-pad-sm text-sm muted">
                        <div class="row-flex">
                            <div><strong>Razón social:</strong> <span class="muted">${razon}</span></div>
                            <div><strong>CUIT:</strong> <span class="muted">${cuit}</span></div>
                            <div><strong>Banco:</strong> <span class="muted">${banco}</span></div>
                            <div><strong>CBU:</strong> <span class="muted">${cbu}</span></div>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
        listContainer.innerHTML = html;
    }

    // 4. Fetch Data
    async function loadList() {
        setLoading(true);
        try {
            const { data, error } = await window.sb
                .from('master_proveedores')
                .select('id, nombre_fantasia, razon_social, cuit, banco, cbu_alias, email, contacto_nombre, contacto_telefono, notas, active')
                .order('nombre_fantasia');

            if (error) throw error;
            providers = data || [];
            renderList(providers);

        } catch (err) {
            console.error('Error loading suppliers:', err);
            listContainer.innerHTML = errorState(err.message);
            toggleEmptyState(false);
        } finally {
            setLoading(false);
        }
    }

    // Init
    loadList();

    // 5. Panel Logic
    const panelCtrl = window.initSlidePanel({
        onOpen: () => {
            if (!editingId) {
                if (inpNombre) inpNombre.value = '';
                if (inpRazonSocial) inpRazonSocial.value = '';
                if (inpCuit) inpCuit.value = '';
                if (inpTelefono) inpTelefono.value = '';
                if (inpEmail) inpEmail.value = '';
                if (inpBanco) inpBanco.value = '';
                if (inpCbu) inpCbu.value = '';
                if (inpContactoNombre) inpContactoNombre.value = '';
                if (inpNotas) inpNotas.value = '';
                if (chkActive) chkActive.checked = true;
                setFormCreate();
            }
            if (inpNombre) inpNombre.focus();
        },
        onClose: () => {
            setFormCreate();
        },
        onSave: async () => {
             const nombre = (inpNombre?.value || '').trim();
             const razonSocial = (inpRazonSocial?.value || '').trim();
             const cuitRaw = (inpCuit?.value || '').trim();
             const telefono = (inpTelefono?.value || '').trim();
             const email = (inpEmail?.value || '').trim();
             const banco = (inpBanco?.value || '').trim();
             const cbu = (inpCbu?.value || '').trim();
             const contactoNombre = (inpContactoNombre?.value || '').trim();
             const notas = (inpNotas?.value || '').trim();
             const active = !!(chkActive?.checked);

             if (!nombre) throw new Error('El nombre de fantasía es obligatorio.');

             const cuit = cuitRaw ? cuitRaw.replace(/[^\d]/g, '') : null;

             const payload = {
                 nombre_fantasia: nombre,
                 razon_social: razonSocial || nombre,
                 cuit: cuit || null,
                 banco: banco || null,
                 cbu_alias: cbu || null,
                 contacto_telefono: telefono || null,
                 email: email || null,
                 contacto_nombre: contactoNombre || null,
                 notas: notas || null,
                 active
             };

             if (editingId) {
                 const { error } = await window.sb
                     .from('master_proveedores')
                     .update(payload)
                     .eq('id', editingId);
                 if (error) throw error;
             } else {
                 const { error } = await window.sb
                     .from('master_proveedores')
                     .insert([payload]);
                 if (error) throw error;
             }
             
             await loadList();
             setFormCreate();
             editingId = null;
             if (panelCtrl?.close) panelCtrl.close();
        }
    });

    if (btnNew) {
        btnNew.addEventListener('click', () => {
            setFormCreate();
            editingId = null;
        });
    }

    if (listContainer) {
        listContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.classList.contains('btn-edit-prov')) {
                const id = target.getAttribute('data-id');
                const prov = providers.find(p => p.id === id);
                if (!prov) return;
                editingId = id;
                setFormEdit();

                if (inpNombre) inpNombre.value = prov.nombre_fantasia || '';
                if (inpRazonSocial) inpRazonSocial.value = prov.razon_social || '';
                if (inpCuit) inpCuit.value = prov.cuit || '';
                if (inpTelefono) inpTelefono.value = prov.contacto_telefono || '';
                if (inpEmail) inpEmail.value = prov.email || '';
                if (inpBanco) inpBanco.value = prov.banco || '';
                if (inpCbu) inpCbu.value = prov.cbu_alias || '';
                if (inpContactoNombre) inpContactoNombre.value = prov.contacto_nombre || '';
                if (inpNotas) inpNotas.value = prov.notas || '';
                if (chkActive) chkActive.checked = !!prov.active;

                if (panelCtrl?.open) panelCtrl.open();
                return;
            }

            const row = target.closest('.prov-row');
            if (row) {
                const id = row.getAttribute('data-id');
                expandedId = expandedId === id ? null : id;
                renderList(providers);
            }
        });
    }
});
