/**
 * Scanner Mock — Cuenta Ganado
 * Camera real + validación Supabase + sin auth + sin workday
 */
(function () {
  'use strict';

  // Wait for Supabase
  const waitForSb = () => new Promise((resolve) => {
    const check = () => {
      if (window.sb) return resolve(window.sb);
      setTimeout(check, 100);
    };
    check();
  });

  waitForSb().then(async (sb) => {
    // ── State ──
    let isProcessing = false;
    const scannedSet = new Set(); // Track scanned codes (prevent duplicate count)
    let stats = { valid: 0, duplicate: 0, invalid: 0 };

    // ── Elements ──
    const bigCount = document.getElementById('bigCount');
    const statValid = document.getElementById('statValid');
    const statDup = document.getElementById('statDup');
    const statInvalid = document.getElementById('statInvalid');
    const lastScan = document.getElementById('lastScan');
    const historyList = document.getElementById('historyList');
    const scanOverlay = document.getElementById('scanOverlay');
    const overlayIcon = document.getElementById('overlayIcon');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayMsg = document.getElementById('overlayMsg');

    // ── Manual Input ──
    document.getElementById('btnManual').addEventListener('click', () => {
      const val = document.getElementById('manualCode').value.trim();
      if (val) processCode(val);
    });
    document.getElementById('manualCode').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = e.target.value.trim();
        if (val) processCode(val);
      }
    });

    // ── Start Camera ──
    startCamera();

    function startCamera() {
      if (typeof Html5Qrcode === 'undefined') {
        lastScan.textContent = '⚠️ Librería QR no cargó. Usá input manual.';
        lastScan.className = 'last-scan fail';
        return;
      }

      const html5QrCode = new Html5Qrcode('reader');
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (!isProcessing) processCode(decodedText);
        },
        () => { }
      ).catch(err => {
        console.error('Camera error:', err);
        lastScan.textContent = '⚠️ Sin acceso a cámara. Usá input manual.';
        lastScan.className = 'last-scan fail';
      });
    }

    // ── Process Scanned Code ──
    async function processCode(rawCode) {
      isProcessing = true;
      lastScan.textContent = '⏳ Validando...';
      lastScan.className = 'last-scan';

      // Extract UUID from URL if needed (e.g., https://midnightclub.com.ar/checkin/UUID)
      let code = rawCode;
      try {
        const url = new URL(rawCode);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length > 0) code = parts[parts.length - 1]; // last segment = UUID
      } catch {
        // Not a URL, use raw value
      }

      // Check if already scanned locally
      if (scannedSet.has(code)) {
        stats.duplicate++;
        updateUI();
        showResult('dup', 'REPETIDO', `Ya escaneado (${code.slice(-6)})`, code);
        setTimeout(() => { isProcessing = false; }, 1500);
        return;
      }

      try {
        // Query Supabase — check if code exists
        const { data: qrcode, error } = await sb
          .from('qr_codes')
          .select('id, code, status, batch_id, qr_batches(name, financial_type)')
          .or(`code.eq.${rawCode},code.eq.${code}`)
          .limit(1)
          .maybeSingle();

        if (error || !qrcode) {
          stats.invalid++;
          updateUI();
          showResult('fail', 'NO EXISTE', `Código no encontrado`, code);
          setTimeout(() => { isProcessing = false; }, 1500);
          return;
        }

        // Valid QR from our system!
        scannedSet.add(code);
        scannedSet.add(rawCode);
        stats.valid++;
        updateUI();

        const batchName = qrcode.qr_batches?.name || 'Lote';
        const type = qrcode.qr_batches?.financial_type || '';
        const label = `${batchName}${type ? ' · ' + type : ''}`;

        showResult('ok', 'VÁLIDO ✓', label, code);

      } catch (err) {
        console.error('DB Error:', err);
        showResult('fail', 'ERROR', 'Error de conexión', code);
      }

      setTimeout(() => { isProcessing = false; }, 1500);
    }

    // ── UI Updates ──
    function updateUI() {
      bigCount.textContent = stats.valid;
      statValid.textContent = stats.valid;
      statDup.textContent = stats.duplicate;
      statInvalid.textContent = stats.invalid;
    }

    function showResult(type, title, msg, code) {
      // Last scan line
      const icons = { ok: '✅', fail: '❌', dup: '🔁' };
      lastScan.textContent = `${icons[type]} ${title} — ${msg}`;
      lastScan.className = `last-scan ${type}`;

      // Haptic
      if ('vibrate' in navigator) {
        if (type === 'ok') navigator.vibrate([100, 50, 100]);
        else navigator.vibrate([200, 100, 200]);
      }

      // Sound
      const audio = document.getElementById(type === 'ok' ? 'soundOk' : 'soundNo');
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }

      // Fullscreen overlay
      scanOverlay.classList.remove('hidden', 'success', 'error', 'warning');
      scanOverlay.classList.add(type === 'ok' ? 'success' : type === 'dup' ? 'warning' : 'error');
      overlayIcon.textContent = type === 'ok' ? '✓' : type === 'dup' ? '⟳' : '✗';
      overlayTitle.textContent = title;
      overlayMsg.textContent = msg;
      setTimeout(() => scanOverlay.classList.add('hidden'), type === 'ok' ? 1200 : 1500);

      // History
      const div = document.createElement('div');
      div.className = 'mock-history-item';
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      div.innerHTML = `
        <span class="code">...${(code || '').slice(-8)}</span>
        <span class="result ${type}">${title}</span>
        <span class="time">${now}</span>
      `;
      historyList.prepend(div);

      // Keep history manageable
      while (historyList.children.length > 30) historyList.lastChild.remove();
    }

  });
})();
