(function() {
  'use strict';

  // ── Wait for all dependencies to load ──
  const REQUIRED = ['sb', 'Utils', 'Toast', 'QRCode', 'Auth'];
  const MAX_WAIT = 10000;

  function ready() {
    return REQUIRED.every(k => window[k]);
  }

  function waitForDeps() {
    return new Promise((resolve, reject) => {
      if (ready()) return resolve();
      const start = Date.now();
      const iv = setInterval(() => {
        if (ready()) { clearInterval(iv); resolve(); }
        else if (Date.now() - start > MAX_WAIT) {
          clearInterval(iv);
          reject(new Error('Dependencias no cargaron: ' + REQUIRED.filter(k => !window[k]).join(', ')));
        }
      }, 80);
    });
  }

  waitForDeps().then(async () => {
    const sb = window.sb;

    // ── Auth: try to get user (soft — don't block page if not logged in) ──
    let user = null;
    try {
      const { data } = await sb.auth.getSession();
      if (data?.session?.user) user = data.session.user;
    } catch (e) { console.warn('[QRGenerator] Auth check failed:', e); }

    // Elements
    const el = (id) => document.getElementById(id);
    const inputs = {
        batchName: el('batchName'),
        financialType: el('financialType'),
        marketSource: el('marketSource'),
        unitPrice: el('unitPrice'),
        marketSourceField: el('marketSourceField'),
        priceField: el('priceField'),
        qty: el('qty'),
        baseText: el('baseText'),
        paper: el('paper'),
        qrSize: el('qrSize'),
        titleText: el('titleText'),
        previewArea: el('previewArea'),
        printArea: el('printArea'),
        previewMeta: el('previewMeta')
    };

    const buttons = {
        preview: el('btnPreview'),
        print: el('btnPrint'),
        clear: el('btnClear')
    };

    // UI Logic
    if (inputs.financialType) {
      inputs.financialType.addEventListener('change', (e) => {
        const val = e.target.value;
        const showPrice = val === 'VENTA';
        const showSource = val === 'VENTA' || val === 'CORTESIA';
        if (inputs.priceField) inputs.priceField.style.display = showPrice ? 'flex' : 'none';
        if (inputs.marketSourceField) inputs.marketSourceField.style.display = showSource ? 'flex' : 'none';
      });
    }
    if (buttons.clear) buttons.clear.addEventListener('click', clearAll);
    
    if (buttons.preview) buttons.preview.addEventListener('click', () => {
        const payloads = generatePayloads();
        renderPreview(payloads);
    });

    if (buttons.print) buttons.print.addEventListener('click', async () => {
        const payloads = generatePayloads();
        if(!validateForm(payloads)) return;
        
        const confirmed = await window.Utils.confirmModal(`¿Confirmas generar ${payloads.length} códigos y guardar el lote?`);
        if (confirmed) {
             try {
                 buttons.print.disabled = true;
                 buttons.print.innerHTML = 'Guardando...';
                 
                 // 1. Save
                 const batch = await saveBatch(payloads);
                 
                 // 2. Render Print Elements
                 buttons.print.innerHTML = 'Generando Tickets...';
                 await renderPrintTickets(payloads);
                 
                 // 3. Print
                 setTimeout(() => {
                     window.print();
                     window.Toast.success('Lote guardado correctamente');
                     setTimeout(() => location.reload(), 1000);
                 }, 800);

             } catch (err) {
                 console.error('[QRGenerator]', err);
                 window.Toast.error('Error: ' + err.message);
                 buttons.print.disabled = false;
                 buttons.print.innerHTML = 'Guardar e Imprimir';
             }
        }
    });

    // --- Logic ---

    function clearAll() {
        inputs.previewArea.innerHTML = `
            <div class="qr-gen-empty" id="previewEmpty">
                <svg class="qr-gen-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
                <span class="qr-gen-empty-text">Configurá y hacé clic en Previsualizar</span>
            </div>`;
        inputs.printArea.innerHTML = '';
        inputs.previewMeta.textContent = 'Listo para generar';
    }

    function generatePayloads() {
        const qty = Math.max(1, Math.min(500, parseInt(inputs.qty.value || 1)));
        const base = (inputs.baseText.value || '').trim();
        const sep = base && !base.endsWith('/') ? '/' : '';

        const out = [];
        for (let i = 0; i < qty; i++) {
            const uid = window.Utils.generateUUID();
            out.push(base ? base + sep + uid : uid);
        }
        return out;
    }

    function validateForm(payloads) {
        if (!inputs.batchName.value.trim()) {
            window.Toast.error('Ingresa un nombre para el lote.');
            return false;
        }
        if (inputs.financialType.value === 'VENTA' && !inputs.marketSource.value) {
            window.Toast.error('Para ventas debes seleccionar el Origen (Passline/Boleteria).');
            return false;
        }
        return true;
    }

    function renderPreview(payloads) {
        const area = inputs.previewArea;
        area.innerHTML = '';  // Clears empty state too
        
        if (payloads.length > 50) {
            inputs.previewMeta.textContent = `Generando ${payloads.length} códigos (Vista previa limitada a 50)`;
        } else {
            inputs.previewMeta.textContent = `Generando ${payloads.length} códigos`;
        }

        payloads.slice(0, 50).forEach(text => {
            const card = document.createElement('div');
            card.className = 'preview-card';
            
            const qrBox = document.createElement('div');
            qrBox.className = 'preview-card-qr';
            
            card.appendChild(qrBox);
            // Caption (truncated)
            const cap = document.createElement('div');
            cap.className = 'preview-card-caption';
            cap.textContent = text.length > 20 ? '...' + text.slice(-8) : text;
            card.appendChild(cap);
            
            area.appendChild(card);

            new QRCode(qrBox, {
                text: text,
                width: 100,
                height: 100,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        });
    }

    async function renderPrintTickets(payloads) {
        const area = inputs.printArea;
        area.innerHTML = '';

        // Apply Vars
        document.documentElement.style.setProperty('--paper-mm', inputs.paper.value + 'mm');
        document.documentElement.style.setProperty('--qr-mm', inputs.qrSize.value + 'mm');

        const title = inputs.titleText.value || '';
        const qrSizeMm = parseInt(inputs.qrSize.value);
        const qrPx = Math.round(qrSizeMm * 3.78 * 2); // Higher res for print

        // Render all
        for (const text of payloads) {
            const t = document.createElement('div');
            t.className = 'ticket';
            t.innerHTML = `
                <div class="ticket-inner">
                    ${title ? `<div class="t-title">${title}</div>` : ''}
                    <div class="t-qr"></div>
                    <div class="t-code">${text.slice(-8)}</div> <!-- Show last 8 chars of UUID for visual check -->
                </div>
            `;
            area.appendChild(t);
            
            // Create QR
            const qrDiv = t.querySelector('.t-qr');
            new QRCode(qrDiv, {
                text: text,
                width: qrPx,
                height: qrPx,
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        
        // Wait for rendering (microtask)
        await new Promise(r => setTimeout(r, 500)); 
    }

    async function saveBatch(payloads) {
        // 1. Insert Batch
        const batchData = {
            name: inputs.batchName.value,
            financial_type: inputs.financialType.value,
            market_source: inputs.marketSource.value || null,
            unit_price: inputs.financialType.value === 'VENTA' ? parseFloat(inputs.unitPrice.value || 0) : 0
        };
        if (user?.id) batchData.created_by = user.id;

        const { data: batch, error } = await sb
            .from('qr_batches')
            .insert(batchData)
            .select()
            .single();

        if (error) throw error;

        // 2. Insert Codes
        // Supabase bulk insert limit? Default 1000+ usually OK, we limit UI to 500.
        const rows = payloads.map(code => ({
            batch_id: batch.id,
            code: code,
            status: 'PENDIENTE'
        }));

        const { error: cError } = await sb
            .from('qr_codes')
            .insert(rows);

        if (cError) throw cError;

        return batch;
    }
  }).catch(err => {
    console.error('[QRGenerator] Init failed:', err);
    document.body.innerHTML = `<div style="color:#ef4444;padding:2rem;text-align:center"><h2>Error de carga</h2><p>${err.message}</p><button onclick="location.reload()" style="margin-top:1rem;padding:8px 16px;cursor:pointer">Reintentar</button></div>`;
  });
})();
