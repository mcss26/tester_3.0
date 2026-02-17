/**
 * Scanner Mock — Cuenta Ganado
 * Camera real + validación Supabase + sin auth + sin workday
 * Optimizado para mobile-first, uso nocturno en puerta
 */
(function () {
  'use strict';

  // ── Wait for Supabase client ──
  const waitForSb = () => new Promise((resolve) => {
    const check = () => {
      if (window.sb) return resolve(window.sb);
      setTimeout(check, 100);
    };
    check();
  });

  waitForSb().then(async (sb) => {

    // ══════════════════════════════════════════
    // 1. STATE
    // ══════════════════════════════════════════
    let isProcessing = false;
    const scannedSet = new Set();
    let stats = { valid: 0, duplicate: 0, invalid: 0 };

    // ══════════════════════════════════════════
    // 2. DOM ELEMENTS
    // ══════════════════════════════════════════
    const bigCount     = document.getElementById('bigCount');
    const statValid    = document.getElementById('statValid');
    const statDup      = document.getElementById('statDup');
    const statInvalid  = document.getElementById('statInvalid');
    const lastScan     = document.getElementById('lastScan');
    const historyList  = document.getElementById('historyList');
    const scanOverlay  = document.getElementById('scanOverlay');
    const overlayIcon  = document.getElementById('overlayIcon');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayMsg   = document.getElementById('overlayMsg');
    const manualInput  = document.getElementById('manualCode');

    // ══════════════════════════════════════════
    // 3. WAKE LOCK (prevent screen sleep)
    // ══════════════════════════════════════════
    let wakeLock = null;

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('🔒 Wake lock acquired');
          wakeLock.addEventListener('release', () => {
            console.log('🔓 Wake lock released');
          });
        }
      } catch (err) {
        console.warn('Wake lock failed:', err);
      }
    }

    // Re-acquire wake lock when page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    });

    await requestWakeLock();

    // ══════════════════════════════════════════
    // 4. AUDIO PRE-WARM (mobile requires user gesture first)
    // ══════════════════════════════════════════
    const soundOk = document.getElementById('soundOk');
    const soundNo = document.getElementById('soundNo');
    let audioReady = false;

    function warmUpAudio() {
      if (audioReady) return;
      [soundOk, soundNo].forEach(a => {
        if (a) { a.volume = 0; a.play().then(() => a.pause()).catch(() => {}); a.volume = 1; }
      });
      audioReady = true;
    }

    // Warm up on first touch
    document.addEventListener('touchstart', warmUpAudio, { once: true });
    document.addEventListener('click', warmUpAudio, { once: true });

    // ══════════════════════════════════════════
    // 5. MANUAL INPUT
    // ══════════════════════════════════════════
    document.getElementById('btnManual').addEventListener('click', () => {
      const val = manualInput.value.trim();
      if (val) { processCode(val); manualInput.value = ''; }
    });

    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = manualInput.value.trim();
        if (val) { processCode(val); manualInput.value = ''; }
      }
    });

    // ══════════════════════════════════════════
    // 6. HISTORY TOGGLE
    // ══════════════════════════════════════════
    const historyToggle = document.getElementById('historyToggle');
    if (historyToggle) {
      historyToggle.addEventListener('click', () => {
        historyToggle.classList.toggle('open');
        historyList.classList.toggle('open');
      });
    }

    // ══════════════════════════════════════════
    // 7. CAMERA
    // ══════════════════════════════════════════
    startCamera();

    function startCamera() {
      if (typeof Html5Qrcode === 'undefined') {
        lastScan.textContent = '⚠️ Librería QR no cargó. Usá input manual.';
        lastScan.className = 'last-scan fail';
        return;
      }

      const html5QrCode = new Html5Qrcode('reader');

      // Config optimizada para máxima lectura:
      // - fps alto = más intentos/segundo
      // - SIN qrbox = escanea TODA la imagen (no solo el centro)
      // - experimentalFeatures = mejora detección en condiciones pobres
      const config = {
        fps: 15,
        // No qrbox = full-frame scanning (much more forgiving)
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true  // Uses native BarcodeDetector API if available (faster + better)
        },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0
      };

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

    // ══════════════════════════════════════════
    // 8. PROCESS SCANNED CODE
    // ══════════════════════════════════════════
    async function processCode(rawCode) {
      isProcessing = true;
      lastScan.textContent = '⏳ Validando...';
      lastScan.className = 'last-scan';

      // Extract UUID from URL if needed
      // e.g., https://midnightclub.com.ar/checkin/UUID
      let code = rawCode.trim();
      try {
        const url = new URL(code);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length > 0) code = parts[parts.length - 1];
      } catch {
        // Not a URL, use raw value
      }

      // ── Duplicate check (local) ──
      if (scannedSet.has(code)) {
        stats.duplicate++;
        updateUI();
        showResult('dup', 'REPETIDO', `Ya escaneado (...${code.slice(-6)})`, code);
        isProcessing = false;
        return;
      }

      // ── Validate against Supabase ──
      try {
        const { data: qrcode, error } = await sb
          .from('qr_codes')
          .select('id, code, status, batch_id, qr_batches(name, financial_type)')
          .or('code.eq.' + rawCode + ',code.eq.' + code)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Supabase error:', error);
          showResult('fail', 'ERROR DB', error.message || 'Error de consulta', code);
          isProcessing = false;
          return;
        }

        if (!qrcode) {
          stats.invalid++;
          updateUI();
          showResult('fail', 'NO EXISTE', 'Código no es del sistema', code);
          isProcessing = false;
          return;
        }

        // ── Valid QR from our system! ──
        scannedSet.add(code);
        if (rawCode !== code) scannedSet.add(rawCode); // Also prevent URL re-scan
        stats.valid++;
        updateUI();

        const batchName = qrcode.qr_batches?.name || 'Lote';
        const type = qrcode.qr_batches?.financial_type || '';
        const statusLabel = qrcode.status !== 'PENDIENTE' ? ` [${qrcode.status}]` : '';
        const label = `${batchName}${type ? ' · ' + type : ''}${statusLabel}`;

        showResult('ok', 'VÁLIDO ✓', label, code);

      } catch (err) {
        console.error('Network error:', err);
        showResult('fail', 'SIN CONEXIÓN', 'Verificá internet', code);
      }

      isProcessing = false;
    }

    // ══════════════════════════════════════════
    // 9. UI UPDATES
    // ══════════════════════════════════════════
    function updateUI() {
      bigCount.textContent = stats.valid;
      statValid.textContent = stats.valid;
      statDup.textContent = stats.duplicate;
      statInvalid.textContent = stats.invalid;

      // Bump animation
      bigCount.classList.add('bump');
      setTimeout(() => bigCount.classList.remove('bump'), 200);
    }

    function showResult(type, title, msg, code) {
      // ── Last scan line ──
      const icons = { ok: '✅', fail: '❌', dup: '🔁' };
      lastScan.textContent = `${icons[type] || ''} ${title} — ${msg}`;
      lastScan.className = `last-scan ${type}`;

      // ── Haptic ──
      if ('vibrate' in navigator) {
        if (type === 'ok') navigator.vibrate([80, 40, 80]);
        else if (type === 'dup') navigator.vibrate([150]);
        else navigator.vibrate([200, 80, 200]);
      }

      // ── Sound ──
      const audio = type === 'ok' ? soundOk : soundNo;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }

      // ── Fullscreen overlay ──
      scanOverlay.classList.remove('hidden', 'success', 'error', 'warning');
      const overlayClass = type === 'ok' ? 'success' : type === 'dup' ? 'warning' : 'error';
      scanOverlay.classList.add(overlayClass);
      overlayIcon.textContent = type === 'ok' ? '✓' : type === 'dup' ? '⟳' : '✗';
      overlayTitle.textContent = title;
      overlayMsg.textContent = msg;

      const hideDelay = type === 'ok' ? 900 : 1200;
      setTimeout(() => scanOverlay.classList.add('hidden'), hideDelay);

      // ── History entry ──
      const div = document.createElement('div');
      div.className = 'mock-history-item';
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      div.innerHTML = `
        <span class="code">...${(code || '').slice(-8)}</span>
        <span class="result ${type === 'fail' ? 'fail' : type}">${title}</span>
        <span class="time">${now}</span>
      `;
      historyList.prepend(div);

      // Cap history at 30
      while (historyList.children.length > 30) historyList.lastChild.remove();
    }

  });
})();
