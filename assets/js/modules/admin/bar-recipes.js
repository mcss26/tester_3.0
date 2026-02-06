/**
 * Module: bar-recipes.js
 * Standard: logic-engineer (2026)
 * Description: Recipe Management for Bar Sales (Theoretical Consumption)
 */

(async function () {
    'use strict';

    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'manager', 'contable']);
    if (!session) return;

    // 2. UI References
    const ui = {
        list: document.getElementById('recipe-list'),
        modal: document.getElementById('modal-recipe'),
        modalTitle: document.getElementById('modal-title'),
        searchInput: document.getElementById('search-recipe'),
        ingContainer: document.getElementById('ingredients-container'),
        tplIng: document.getElementById('tpl-ingredient-row'),
        // Form
        inpName: document.getElementById('input-name'),
        inpExtId: document.getElementById('input-external-id'),
        btnSave: document.getElementById('btn-save-recipe'),
        btnCancel: document.getElementById('btn-cancel-recipe'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        btnAddIng: document.getElementById('btn-add-ingredient'),
        btnNew: document.getElementById('btn-new-recipe'),
        // State Overlays
        pageCardLoading: document.getElementById('page-card-loading'),
        pageCardEmpty: document.getElementById('page-card-empty'),
        moduleContent: document.getElementById('module-content')
    };

    if (!window.Utils?.assertSbOrShowBlockingError?.(ui.list)) return;

    // 3. State
    const state = {
        allSkus: [],
        recipes: [],
        editingId: null,
        isLoading: false
    };

    // 4. Helpers
    function setPageState({ loading = false, empty = false } = {}) {
        if (loading) {
            ui.pageCardLoading?.classList.add('is-visible');
            ui.pageCardEmpty?.classList.remove('is-visible');
            ui.moduleContent?.classList.add('is-loading');
        } else if (empty) {
            ui.pageCardLoading?.classList.remove('is-visible');
            ui.pageCardEmpty?.classList.add('is-visible');
            ui.moduleContent?.classList.add('is-hidden');
        } else {
            ui.pageCardLoading?.classList.remove('is-visible');
            ui.pageCardEmpty?.classList.remove('is-visible');
            ui.moduleContent?.classList.remove('is-loading');
            ui.moduleContent?.classList.remove('is-hidden');
        }
    }

    // 5. Logic
    async function init() {
        setPageState({ loading: true });
        await loadSkus();
        await loadRecipes();
        bindEvents();
    }

    async function loadSkus() {
        try {
            const { data, error } = await window.sb
                .from('master_sku')
                .select('id, nombre, ml_por_unidad')
                .eq('active', true)
                .order('nombre');

            if (error) throw error;
            state.allSkus = data.map(s => ({
                id: s.id,
                name: s.nombre || 'Sin nombre',
                unit: s.ml_por_unidad ? `${s.ml_por_unidad}ml` : 'u'
            }));
        } catch (err) {
            console.error('Error loadSkus:', err);
        }
    }


    async function loadRecipes(filter = '') {
        try {
            let query = window.sb.from('master_recipes').select('*').order('name');
            if (filter) query = query.ilike('name', `%${filter}%`);

            const { data, error } = await query;
            if (error) throw error;

            state.recipes = data || [];
            renderList();
            setPageState({ empty: state.recipes.length === 0 });
        } catch (err) {
            console.error('Error loadRecipes:', err);
            window.Toast.error('Error al cargar recetas');
            setPageState({ empty: true });
        }
    }

    function renderList() {
        ui.list.innerHTML = '';

        state.recipes.forEach(r => {
        const ingDesc = r.ingredients ?
                r.ingredients.map(i => {
                    const sku = state.allSkus.find(s => String(s.id) === String(i.sku_id));
                    if (!sku) console.warn(`[BarRecipes] SKU not found: ${i.sku_id}`, 'Available SKUs:', state.allSkus.length);
                    const qty = i.amount ?? i.quantity ?? 0;
                    return sku ? `${sku.name} (${qty})` : 'SKU ?';
                }).join(', ') : 'Sin ingredientes';


            const row = document.createElement('tr');
            row.className = 'table-row';
            row.innerHTML = `
                <td class="table-cell cell-pad cell-strong">${window.Utils.escapeHtml(r.name)}</td>
                <td class="table-cell cell-pad font-mono text-xs muted">${r.external_id || '—'}</td>
                <td class="table-cell cell-pad text-xs muted truncate max-w-[300px]" title="${window.Utils.escapeHtml(ingDesc)}">
                    ${window.Utils.escapeHtml(ingDesc)}
                </td>
                <td class="table-cell cell-pad text-right">
                    <button class="btn btn-ghost btn-xs btn-edit" data-id="${r.id}">Editar</button>
                    <button class="btn btn-ghost btn-xs text-error btn-delete ml-2" data-id="${r.id}">×</button>
                </td>
            `;

            row.querySelector('.btn-edit').onclick = () => openModal(r);
            row.querySelector('.btn-delete').onclick = () => deleteRecipe(r);

            ui.list.appendChild(row);
        });
    }

    function openModal(recipe = null) {
        state.editingId = recipe ? recipe.id : null;
        ui.modalTitle.textContent = recipe ? 'Editar Receta' : 'Nueva Receta';
        ui.inpName.value = recipe ? recipe.name : '';
        ui.inpExtId.value = recipe ? recipe.external_id || '' : '';

        ui.ingContainer.innerHTML = '';

        if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(i => addIngredientRow(i.sku_id, i.amount ?? i.quantity));
        } else {

            addIngredientRow();
        }

        ui.modal.classList.remove('hidden');
        ui.modal.classList.add('is-visible');
    }

    function closeModal() {
        ui.modal.classList.add('hidden');
        ui.modal.classList.remove('is-visible');
    }

    function addIngredientRow(skuId = null, amount = null) {
        if (!ui.tplIng) return;

        const clone = ui.tplIng.content.cloneNode(true);
        const row = clone.querySelector('.ingredient-row');
        const sel = row.querySelector('.input-sku');
        const inpAmt = row.querySelector('.input-amount');
        const btnRem = row.querySelector('.btn-remove-ing');

        // Populate Select
        state.allSkus.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.name} (${s.unit})`;
            if (skuId && String(s.id) === String(skuId)) opt.selected = true;
            sel.appendChild(opt);
        });

        if (amount) inpAmt.value = amount;

        btnRem.onclick = () => row.remove();
        ui.ingContainer.appendChild(row);
    }

    async function saveRecipe() {
        const name = ui.inpName.value.trim();
        const extId = ui.inpExtId.value.trim();

        if (!name) {
            window.Toast.warning("Nombre de receta requerido");
            return;
        }

        const rows = ui.ingContainer.querySelectorAll('.ingredient-row');
        const ingredients = [];

        rows.forEach(row => {
            const skuId = row.querySelector('.input-sku').value;
            const amount = parseFloat(row.querySelector('.input-amount').value);
            if (skuId && amount > 0) {
                ingredients.push({ sku_id: skuId, amount });
            }
        });

        if (ingredients.length === 0) {
            window.Toast.warning("La receta debe tener al menos un ingrediente válido.");
            return;
        }

        const payload = {
            name,
            external_id: extId || null,
            ingredients
        };

        ui.btnSave.disabled = true;
        ui.btnSave.classList.add('btn-loading');

        try {
            if (state.editingId) {
                const { error } = await window.sb.from('master_recipes').update(payload).eq('id', state.editingId);
                if (error) throw error;
                window.Toast.success('Receta actualizada');
            } else {
                const { error } = await window.sb.from('master_recipes').insert(payload);
                if (error) throw error;
                window.Toast.success('Receta creada');
            }

            closeModal();
            loadRecipes(ui.searchInput.value);

        } catch (err) {
            console.error('[BarRecipes]', err);
            window.Toast.error("Error al guardar: " + err.message);
        } finally {
            ui.btnSave.disabled = false;
            ui.btnSave.classList.remove('btn-loading');
        }
    }

    async function deleteRecipe(recipe) {
        const confirmed = await window.Utils.confirmModal(`¿Confirma eliminar la receta "${recipe.name}"?`);
        if (!confirmed) return;

        try {
            const { error } = await window.sb.from('master_recipes').delete().eq('id', recipe.id);
            if (error) throw error;
            window.Toast.success('Receta eliminada');
            loadRecipes(ui.searchInput.value);
        } catch (err) {
            console.error(err);
            window.Toast.error('Error al eliminar');
        }
    }

    function bindEvents() {
        ui.btnNew.onclick = () => openModal();
        ui.btnCancel.onclick = closeModal;
        ui.btnCloseModal.onclick = closeModal;
        ui.btnAddIng.onclick = addIngredientRow;
        ui.btnSave.onclick = saveRecipe;

        ui.searchInput.addEventListener('input', window.Utils.debounce((e) => {
            loadRecipes(e.target.value);
        }, 300));

        // Close modal on escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ui.modal.classList.contains('is-visible')) {
                closeModal();
            }
        });

        // Click outside modal
        ui.modal.onclick = (e) => {
            if (e.target === ui.modal) closeModal();
        };
    }

    // Run
    init();

})();
