/**
 * qr-monitor.js
 * Logic for the live QR access dashboard.
 */

(async function() {
  'use strict';

    // 1. Auth Guard
    const user = await window.Auth.guardOrRedirect(['admin', 'manager', 'contable']);
    if (!user) return;
    if (!window.Utils.assertSbOrShowBlockingError()) return;

    // Global state
    let refreshInterval;
    let isFetching = false;

    const el = (id) => document.getElementById(id);

    async function init() {
        el('btnRefresh').addEventListener('click', () => {
            const btn = el('btnRefresh');
            btn.textContent = 'Cargando...';
            safeLoad().finally(() => btn.textContent = 'Actualizar');
        });

        loadData();
    }

    async function safeLoad() {
        if (isFetching) return;
        isFetching = true;
        try {
            await loadData();
        } finally {
            isFetching = false;
        }
    }

    async function loadData() {
        try {
            const sb = window.sb;

            // Fetch All Batches
            const { data: batches, error: bError } = await sb
                .from('qr_batches')
                .select('*')
                .order('created_at', { ascending: false });

            if (bError) throw bError;

            // Fetch Stats per Batch
            const { data: codes, error: cError } = await sb
                .from('qr_codes')
                .select('batch_id, status');

            if (cError) throw cError;

            renderStats(batches, codes);

        } catch (err) {
            console.error("Error loading monitor stats:", err);
            window.Toast?.error("Error actualizando monitor QR");
        }
    }

    function renderStats(batches, codes) {
        const batchList = el('batchList');
        batchList.innerHTML = "";

        // Calculate Globals
        let totalGlobal = codes.length;
        let scannedCodes = codes.filter(c => c.status === 'ACREDITADO');
        let totalScanned = scannedCodes.length;

        // Render Main Progress
        const percentGlobal = totalGlobal > 0 ? Math.round((totalScanned / totalGlobal) * 100) : 0;
        
        el('mainProgressBar').style.width = `${percentGlobal}%`;
        el('progressPercent').textContent = `${percentGlobal}%`;
        el('progressRatio').textContent = `${totalScanned} / ${totalGlobal}`;
        
        el('totalScanned').textContent = totalScanned;

        // Render Batch Grid
        if (batches.length === 0) {
            batchList.innerHTML = '<div class="col-span-2 text-center py-8 text-white/30">No hay lotes activos.</div>';
            return;
        }

        batches.forEach(batch => {
            const batchCodes = codes.filter(c => c.batch_id === batch.id);
            const bTotal = batchCodes.length;
            const bScanned = batchCodes.filter(c => c.status === 'ACREDITADO').length;
            const bPercent = bTotal > 0 ? Math.round((bScanned / bTotal) * 100) : 0;

            const card = document.createElement('div');
            card.className = "p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-4 hover:bg-white/10 transition-colors";
            
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <h4 class="font-bold text-sm uppercase tracking-wide text-white">${batch.name || 'Sin Nombre'}</h4>
                    <span class="text-xs font-mono text-white/50">${batch.financial_type || 'GRAL'}</span>
                </div>
                
                <div class="flex flex-col gap-1">
                    <div class="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                        <div class="h-full bg-white/80" style="width: ${bPercent}%"></div>
                    </div>
                    <div class="flex justify-between text-xs font-mono mt-1">
                        <span class="text-white font-bold">${bPercent}%</span>
                        <span class="text-white/50">${bScanned} / ${bTotal}</span>
                    </div>
                </div>
            `;
            batchList.appendChild(card);
        });
    }

    // 2. Initialize
    init();

    // 3. Auto Refresh every 30s
    refreshInterval = setInterval(safeLoad, 30000);
    window.addEventListener('beforeunload', () => clearInterval(refreshInterval));

})();
