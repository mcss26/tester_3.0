(async function() {
  'use strict';
    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'encargado_caja', 'contable']);
    if (!session) return;

    if (!window.Utils.assertSbOrShowBlockingError()) return;
    const sb = window.sb;

    // elements
    const statTotal = document.getElementById('stat-total');
    const statAccredited = document.getElementById('stat-accredited');
    const statPending = document.getElementById('stat-pending');
    const statBatches = document.getElementById('stat-batches');
    const batchesList = document.getElementById('batches-list');
    const activityList = document.getElementById('activity-list');

    // Load Data
    loadDashboard();

    async function loadDashboard() {
        await Promise.all([
            loadStatsAndBatches(),
            loadActivity()
        ]);
    }

    async function loadStatsAndBatches() {
        // 1. Fetch Batches
        const { data: batches, error: bError } = await sb
            .from('qr_batches')
            .select('*')
            .order('created_at', { ascending: false });

        if (bError) {
            console.error(bError);
            return;
        }

        statBatches.textContent = batches.length;

        // 2. Fetch Codes Summary (optimización: traer solo lo necesario)
        // Para MVP traemos todos los códigos (ojo con escala grande). 
        // Idealmente usar views o rpc.
        const { data: codes, error: cError } = await sb
            .from('qr_codes')
            .select('id, batch_id, status');
        
        if (cError) {
            console.error(cError);
            return;
        }

        // Global Stats
        const total = codes.length;
        const accredited = codes.filter(c => c.status === 'ACREDITADO').length;
        const pending = codes.filter(c => c.status === 'PENDIENTE').length;

        statTotal.textContent = total;
        statAccredited.textContent = accredited;
        statPending.textContent = pending;

        // Process Batches
        renderBatchesTable(batches, codes);
    }

    function renderBatchesTable(batches, allCodes) {
        if (!batches.length) {
            batchesList.innerHTML = `<tr><td colspan="8" class="text-center p-8 text-white/40">No hay lotes generados.</td></tr>`;
            return;
        }

        batchesList.innerHTML = batches.map(batch => {
            const batchCodes = allCodes.filter(c => c.batch_id === batch.id);
            const bTotal = batchCodes.length;
            const bAccredited = batchCodes.filter(c => c.status === 'ACREDITADO').length;
            
            // Format Price
            const price = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(batch.unit_price || 0);

            return `
                <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="p-4 font-medium text-white">${batch.name}</td>
                    <td class="p-4 text-xs uppercase text-white/70">${batch.financial_type}</td>
                    <td class="p-4 text-xs uppercase text-accent">${batch.market_source || '-'}</td>
                    <td class="p-4 text-white/80">${price}</td>
                    <td class="p-4 font-mono">${bTotal}</td>
                    <td class="p-4 font-mono text-green-400">${bAccredited}</td>
                    <td class="p-4 text-xs text-white/50">${new Date(batch.created_at).toLocaleDateString()}</td>
                    <td class="p-4">
                        <button class="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white js-view-batch" data-batch-id="${batch.id}">Ver</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async function loadActivity() {
        const { data: checkins, error } = await sb
            .from('qr_checkins')
            .select('*, qr_codes(code, batch_id), operator:operator_id(full_name)')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) return;

        activityList.innerHTML = checkins.map(item => `
            <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                <div>
                     <p class="font-mono text-sm text-accent">${item.qr_codes?.code || 'Desconocido'}</p>
                     <p class="text-xs text-white/50">
                        ${item.operator?.full_name || 'Staff'} • ${new Date(item.created_at).toLocaleTimeString()}
                     </p>
                </div>
                <div class="px-2 py-1 rounded text-xs font-bold ${item.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
                    ${item.success ? 'OK' : 'DENIED'}
                </div>
            </div>
        `).join('');
    }

    // Delegate batch view clicks
    batchesList.addEventListener('click', (e) => {
        const btn = e.target.closest('.js-view-batch');
        if (!btn) return;
        const id = btn.dataset.batchId;
        window.Toast?.info('Funcionalidad de detalle en desarrollo. ID: ' + id);
    });
})();
