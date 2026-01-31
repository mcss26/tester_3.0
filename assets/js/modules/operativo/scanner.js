/**
 * Enhanced Scanner Module
 * Features: Haptic feedback, fullscreen overlay, member info, stats, persistent history
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard
    const session = await window.Auth.guardOrRedirect(['admin', 'operativo', 'staff_guardia']);
    if (!session) return;
    
    const sb = window.sb;
    const user = session.user;
    const MCO_BATCH_ID = '141e44d9-42bc-4c2b-a3bb-4d9721e03802';

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
    
    // New elements
    const scanOverlay = document.getElementById('scanOverlay');
    const overlayIcon = document.getElementById('overlayIcon');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayMsg = document.getElementById('overlayMsg');
    const memberInfo = document.getElementById('memberInfo');
    const memberAvatar = document.getElementById('memberAvatar');
    const memberName = document.getElementById('memberName');
    const statTotal = document.getElementById('statTotal');
    const statMco = document.getElementById('statMco');
    const statOther = document.getElementById('statOther');
    
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
    let currentWorkDay = null;
    let stats = { total: 0, mco: 0, other: 0 };

    // 4. Init WorkDay & Stats
    await initWorkDay();
    loadStats();
    loadHistory();

    async function initWorkDay() {
        const { data: wd } = await sb
            .from('work_days')
            .select('id, status')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!wd) {
            window.Toast?.warning('⚠️ NO hay una Jornada abierta.');
            showStatus('warning', 'Jornada Cerrada', 'No se pueden acreditar códigos.');
        } else {
            currentWorkDay = wd;
        }
        
        startScanner();
    }

    // 5. Load Stats from DB (today's work day)
    async function loadStats() {
        if (!currentWorkDay) return;
        
        try {
            // Total acreditados hoy
            const { count: total } = await sb
                .from('qr_codes')
                .select('*', { count: 'exact', head: true })
                .eq('work_day_id', currentWorkDay.id)
                .eq('status', 'ACREDITADO');
            
            // MCO acreditados hoy
            const { count: mco } = await sb
                .from('qr_codes')
                .select('*', { count: 'exact', head: true })
                .eq('work_day_id', currentWorkDay.id)
                .eq('batch_id', MCO_BATCH_ID)
                .eq('status', 'ACREDITADO');
            
            stats = { total: total || 0, mco: mco || 0, other: (total || 0) - (mco || 0) };
            updateStatsUI();
        } catch (err) {
            console.warn('Error loading stats:', err);
        }
    }

    function updateStatsUI() {
        if (statTotal) statTotal.textContent = stats.total;
        if (statMco) statMco.textContent = stats.mco;
        if (statOther) statOther.textContent = stats.other;
    }

    // 6. Persistent History (localStorage)
    const HISTORY_KEY = 'scanner_history';
    
    function loadHistory() {
        try {
            const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            // Filter to today only
            const today = new Date().toDateString();
            const todayHistory = saved.filter(h => new Date(h.time).toDateString() === today);
            
            todayHistory.slice(0, 20).forEach(h => {
                addToHistoryUI(h.success, h.title, h.code, new Date(h.time), false);
            });
            
            const successCount = todayHistory.filter(h => h.success).length;
            countEl.textContent = successCount;
        } catch (e) { /* ignore */ }
    }

    function saveToHistory(success, title, code) {
        try {
            const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            saved.unshift({ success, title, code, time: new Date().toISOString() });
            // Keep last 100
            localStorage.setItem(HISTORY_KEY, JSON.stringify(saved.slice(0, 100)));
        } catch (e) { /* ignore */ }
    }

    // 7. Scanner
    let html5QrCode = new Html5Qrcode("reader");

    function startScanner() {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        html5QrCode.start(
            { facingMode: "environment" }, 
            config, 
            (decodedText) => {
                if (!isProcessing) validateCode(decodedText);
            },
            () => {}
        ).catch(err => {
            console.error("Scanner failed", err);
            showStatus('error', 'Error Cámara', 'Permiso denegado.');
        });
    }

    // 8. Validation Logic
    async function validateCode(code) {
        if (!currentWorkDay) {
            window.Toast?.error('No hay jornada abierta.');
            return;
        }

        isProcessing = true;
        showStatus('idle', 'Validando...', 'Consultando base de datos');
        hideMemberInfo();

        try {
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

            // Expiration Validation
            if (qrcode.valid_until) {
                const now = new Date();
                const validUntil = new Date(qrcode.valid_until);
                if (now > validUntil) {
                    handleResult(false, 'EXPIRADO', 'El QR ha vencido', code, qrcode);
                    return;
                }
            }

            // MCO Member lookup
            let memberData = null;
            if (qrcode.member_id) {
                const { data: member } = await sb
                    .from('members')
                    .select('nombre, member_id')
                    .eq('id', qrcode.member_id)
                    .single();
                memberData = member;
            }

            // Valid -> Acreditar
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

            // Update stats
            stats.total++;
            if (qrcode.batch_id === MCO_BATCH_ID) {
                stats.mco++;
            } else {
                stats.other++;
            }
            updateStatsUI();

            // Success message
            let msg = qrcode.qr_batches?.name || 'Lote General';
            let welcomeName = null;
            
            if (memberData) {
                welcomeName = memberData.nombre?.split(' ')[0] || 'Miembro';
                msg = `BIENVENIDO ${welcomeName.toUpperCase()}`;
                showMemberInfo(memberData.nombre, memberData.member_id);
            } else if (qrcode.qr_batches?.market_source) {
                msg += ` (${qrcode.qr_batches.market_source})`;
            }
            
            handleResult(true, 'ACCESO OK', msg, code, qrcode, !!memberData);

        } catch (err) {
            console.error(err);
            handleResult(false, 'Error Sistema', 'Reintenta nuevamente.', code);
        } finally {
            setTimeout(() => { isProcessing = false; }, 2500);
        }
    }

    // 9. Result Handling with Enhanced UI
    async function handleResult(success, title, msg, code, qrcodeObj = null, isMember = false) {
        // Haptic Feedback
        triggerHaptic(success);
        
        // Fullscreen Overlay
        showOverlay(success, title, msg, isMember);
        
        // Status Card
        showStatus(success ? 'success' : 'error', title, msg);
        
        // Sound
        const s = document.getElementById(success ? 'soundSuccess' : 'soundError');
        if (s) { s.currentTime = 0; s.play().catch(()=>{}); }

        // Log Checkin
        if (qrcodeObj) {
            sb.from('qr_checkins').insert({
                code_id: qrcodeObj.id,
                operator_id: user.id,
                success: success,
                message: `${title}: ${msg}`
            }).then();
        }

        // History
        addToHistoryUI(success, title, code, new Date(), true);
        saveToHistory(success, title, code);
    }

    // 10. Haptic Feedback
    function triggerHaptic(success) {
        if ('vibrate' in navigator) {
            if (success) {
                navigator.vibrate([100, 50, 100]); // Success pattern
            } else {
                navigator.vibrate([200, 100, 200, 100, 200]); // Error pattern
            }
        }
    }

    // 11. Fullscreen Overlay
    function showOverlay(success, title, msg, isMember) {
        scanOverlay.classList.remove('hidden', 'success', 'error', 'warning');
        scanOverlay.classList.add(success ? 'success' : 'error');
        
        overlayIcon.textContent = success ? '✓' : '✗';
        overlayTitle.textContent = title;
        overlayMsg.textContent = msg;
        
        // Auto hide after delay
        setTimeout(() => {
            scanOverlay.classList.add('hidden');
        }, isMember ? 2500 : 1800);
    }

    // 12. Member Info Display
    function showMemberInfo(name, memberId) {
        if (!memberInfo) return;
        memberInfo.classList.remove('hidden');
        memberAvatar.textContent = (name || 'M')[0].toUpperCase();
        memberName.textContent = name || `ID: ${memberId}`;
    }

    function hideMemberInfo() {
        if (memberInfo) memberInfo.classList.add('hidden');
    }

    // 13. Status Card
    function showStatus(type, title, msg) {
        statusCard.className = `status-card ${type}`;
        statusTitle.textContent = title;
        statusMsg.textContent = msg;
        
        let icon = '📷';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '⛔️';
        if (type === 'warning') icon = '⚠️';
        statusIcon.textContent = icon;

        // Shake on error
        if (type === 'error') {
            statusCard.classList.add('shake');
            setTimeout(() => statusCard.classList.remove('shake'), 500);
        }

        if (type !== 'idle' && type !== 'warning') {
            setTimeout(() => {
                if(!isProcessing) {
                    statusCard.className = 'status-card idle';
                    statusTitle.textContent = 'Listo';
                    statusMsg.textContent = 'Escaneá un código QR';
                    statusIcon.textContent = '📷';
                    hideMemberInfo();
                }
            }, 3500);
        }
    }

    // 14. History UI
    function addToHistoryUI(success, title, code, time, updateCount) {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="h-info">
                <span class="h-code">${code.slice(0, 12)}...</span>
                <span class="h-time">${time.toLocaleTimeString()}</span>
            </div>
            <span class="h-status ${success ? 'ok' : 'no'}">${title}</span>
        `;
        historyList.prepend(div);
        
        if (updateCount && success) {
            let count = parseInt(countEl.textContent || '0');
            countEl.textContent = count + 1;
        }
    }

});
