document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard (Admin, Operativo, StaffGuardia)
    // Note: If you havn't added 'staff_guardia' to your policies, admin/operativo are safer defaults.
    // Assuming 'operativo' is sufficient or user has 'admin' for testing.
    const session = await window.Auth.guardOrRedirect(['admin', 'operativo', 'staff_guardia']);
    if (!session) return;
    
    const sb = window.sb;
    const user = session.user;

    // Load Profile Info
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
        document.getElementById('userName').textContent = profile.full_name;
        document.getElementById('userRole').textContent = profile.role;
        document.getElementById('userAvatar').textContent = (profile.full_name||'U')[0];
    }

    document.getElementById('btnLogout').addEventListener('click', () => window.Auth.logout());

    // 2. Elements
    const statusCard = document.getElementById('statusCard');
    const statusTitle = document.getElementById('statusTitle');
    const statusMsg = document.getElementById('statusMsg');
    const statusIcon = document.querySelector('.status-icon');
    const historyList = document.getElementById('historyList');
    const countEl = document.getElementById('checkinCount');
    
    // Manual Input
    document.getElementById('btnManualInput').addEventListener('click', () => {
        document.getElementById('manualInputBox').classList.toggle('hidden');
    });
    document.getElementById('btnCheckManual').addEventListener('click', () => {
        const val = document.getElementById('manualCode').value.trim();
        if (val) validateCode(val);
    });

    // 3. State
    let isProcessing = false;
    let currentWorkDay = null; // We need an Open Work Day to associate the accreditation

    // 4. Init WorkDay
    await initWorkDay();

    async function initWorkDay() {
        // Use WorkDayHelper helper if available global, else raw query
        // Assuming WorkDayHelper is loaded
        const { data: wd, error } = await sb
            .from('work_days')
            .select('id, status')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(); // Use maybeSingle to avoid 406 on empty

        if (!wd) {
            window.Toast.warning('⚠️ NO hay una Jornada (Work Day) abierta.');
            // We can disable scanning or just warn.
            // Let's warn but allow checking (maybe just validation, fails on update).
            showStatus('warning', 'Jornada Cerrada', 'No se pueden acreditar códigos.');
        } else {
            currentWorkDay = wd;
            console.log('Jornada Actual:', wd.id);
        }
        
        startScanner();
    }

    // 5. Scanner
    let html5QrCode = new Html5Qrcode("reader");

    function startScanner() {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        // Prefer back camera
        html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            (decodedText) => {
                if (!isProcessing) validateCode(decodedText);
            },
            (errorMessage) => { 
                // ignore
            }
        ).catch(err => {
            console.error("Scanner failed", err);
            showStatus('error', 'Error Cámara', 'Permiso denegado.');
        });
    }

    // 6. Validation Logic
    async function validateCode(code) {
        if (!currentWorkDay) {
            window.Toast.error('No hay jornada abierta. No se puede acreditar.');
            return;
        }

        isProcessing = true;
        showStatus('idle', 'Validando...', 'Consultando base de datos');

        try {
            // Check code
            const { data: qrcode, error } = await sb
                .from('qr_codes')
                .select('*, qr_batches(name, financial_type, market_source)')
                .eq('code', code)
                .single();

            if (error || !qrcode) {
                handleResult(false, 'Código Inválido', 'No existe en el sistema.', code);
                return;
            }

            if (qrcode.status === 'ANULADO') {
                handleResult(false, 'ANULADO', 'El código fue dado de baja.', code, qrcode);
                return;
            }

            if (qrcode.status === 'ACREDITADO') {
                const date = new Date(qrcode.accredited_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                handleResult(false, 'YA USADO', `Ingresó a las ${date}`, code, qrcode);
                return;
            }

            // Valid -> Acreditar
            // Optimistic UI could happen here, but let's wait for DB
            const { error: updateError } = await sb
                .from('qr_codes')
                .update({
                    status: 'ACREDITADO',
                    accredited_at: new Date().toISOString(),
                    accredited_by: user.id,
                    work_day_id: currentWorkDay.id
                })
                .eq('id', qrcode.id);

            if (updateError) throw updateError;

            // Success
            let msg = qrcode.qr_batches?.name || 'Lote General';
            if (qrcode.qr_batches?.market_source) msg += ` (${qrcode.qr_batches.market_source})`;
            
            handleResult(true, 'ACCESO OK', msg, code, qrcode);

        } catch (err) {
            console.error(err);
            handleResult(false, 'Error Sistema', 'Reintenta nuevamente.', code);
        } finally {
            setTimeout(() => { isProcessing = false; }, 2500); // Cooldown
        }
    }

    async function handleResult(success, title, msg, code, qrcodeObj = null) {
        // UI
        showStatus(success ? 'success' : 'error', title, msg);
        
        // Sound
        const s = document.getElementById(success ? 'soundSuccess' : 'soundError');
        if (s) { s.currentTime = 0; s.play().catch(()=>{}); }

        // Log Checkin (Fire & Forget)
        if (qrcodeObj) {
            sb.from('qr_checkins').insert({
                code_id: qrcodeObj.id,
                operator_id: user.id,
                success: success,
                message: `${title}: ${msg}`
            }).then();
        }

        // History
        addToHistory(success, title, code);
    }

    function showStatus(type, title, msg) {
        statusCard.className = `status-card ${type}`;
        statusTitle.textContent = title;
        statusMsg.textContent = msg;
        
        let icon = '📷';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '⛔️';
        if (type === 'warning') icon = '⚠️';
        statusIcon.textContent = icon;

        if (type !== 'idle' && type !== 'warning') {
            setTimeout(() => {
                if(!isProcessing) {
                    statusCard.className = 'status-card idle';
                    statusTitle.textContent = 'Listo';
                    statusMsg.textContent = 'Escaneá un código QR';
                    statusIcon.textContent = '📷';
                }
            }, 3000);
        }
    }

    function addToHistory(success, title, code) {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="h-info">
                <span class="h-code">${code.slice(0, 12)}...</span>
                <span class="h-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <span class="h-status ${success ? 'ok' : 'no'}">${title}</span>
        `;
        historyList.prepend(div);
        
        let count = parseInt(countEl.textContent || '0');
        if (success) countEl.textContent = count + 1;
    }

});
