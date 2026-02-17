(async function() {
  'use strict';
    // 1. Auth — DISABLED FOR TESTING
    // const session = await window.Auth.guardOrRedirect(['admin', 'contable']);
    // if (!session) return;
    if (!window.Utils.assertSbOrShowBlockingError()) return;
    const sb = window.sb;
    const user = { id: 'mock-user' }; // Mock user for testing

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
    inputs.financialType.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'VENTA') {
            inputs.priceField.style.display = 'flex';
            inputs.marketSourceField.style.display = 'flex';
        } else {
            inputs.priceField.style.display = 'none';
            // Para RRPP podria servir marketSource, para INVITACION quizas no tanto
            // Dejamos flexible:
            if (val === 'CORTESIA') {
                 inputs.marketSourceField.style.display = 'flex'; // RRPP
            } else {
                 inputs.marketSourceField.style.display = 'none';
            }
        }
    });
    buttons.clear.addEventListener('click', clearAll);
    
    buttons.preview.addEventListener('click', () => {
        const payloads = generatePayloads();
        renderPreview(payloads);
    });

    buttons.print.addEventListener('click', async () => {
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
        const base = (inputs.baseText.value || "").trim();
        // Always UUID for security in this system
        
        const out = [];
        for (let i = 0; i < qty; i++) {
            const uid = window.Utils.generateUUID();
            // Prefix + UUID
            // If base ends in /, no separator needed depending on user input. But safer to just append if not empty.
            // If base looks like url, append /uuid? No, standard is usually just the value string.
            // Let's assume the QR contains just the token (UUID) or a URL+Token.
            // Requirement says "base + sep + uuid" or just uuid.
            // Let's use Base + '/' + UUID if Base is URL, or just UUID if Base is empty.
            // User requested: "URL o Texto Base... En modo secuencial o UUID se añadirá al final."
            // Original code: `out.push(base ? base + sep + uid : uid);` where sep was from input.
            // Simplification: Append with '/' if base exists and doesn't end in /, else just append.
            
            let val = uid;
            if (base) {
                // simple concat logic
                 val = base + (base.endsWith('/') ? '' : '/') + uid;
            }
            out.push(val);
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
        const { data: batch, error } = await sb
            .from('qr_batches')
            .insert({
                name: inputs.batchName.value,
                financial_type: inputs.financialType.value,
                market_source: inputs.marketSource.value || null,
                unit_price: inputs.financialType.value === 'VENTA' ? parseFloat(inputs.unitPrice.value || 0) : 0,
                created_by: user.id
            })
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
})();
