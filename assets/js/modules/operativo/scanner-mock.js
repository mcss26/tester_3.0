/**
 * Scanner Mock — Cuenta Ganado v2
 * Camera real + validación Supabase + sin auth + sin workday
 * Optimizado para uso nocturno en puerta
 * 
 * FEATURES:
 * - Preload de códigos al inicio (validación instantánea sin red)
 * - Persistencia en localStorage (sobrevive refresh)
 * - Wake Lock (pantalla siempre encendida)
 * - Torch/flash toggle para ambientes oscuros
 * - Full-frame scanning (sin qrbox restrictivo)
 * - Audio warm-up para mobile
 * - Indicador de conexión
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
    let html5QrCode = null;
    let torchOn = false;

    // Preloaded codes map: code -> { id, status, batch_name, financial_type }
    const codesMap = new Map();

    // Restore persisted state
    const STORAGE_KEY = 'scanner_mock_state';
    let scannedSet = new Set();
    let stats = { valid: 0, duplicate: 0, invalid: 0 };
    restoreState();

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
    const connStatus   = document.getElementById('connStatus');
    const btnTorch     = document.getElementById('btnTorch');
    const preloadStatus = document.getElementById('preloadStatus');

    // Render persisted stats immediately
    updateUI(false);
    restoreHistory();

    // ══════════════════════════════════════════
    // 3. PRELOAD ALL CODES (offline-first)
    // ══════════════════════════════════════════
    await preloadCodes();

    async function preloadCodes() {
      if (preloadStatus) preloadStatus.textContent = 'Cargando códigos...';
      if (connStatus) connStatus.className = 'conn load';

      try {
        // Load all qr_codes with batch info
        let allCodes = [];
        let from = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await sb
            .from('qr_codes')
            .select('id, code, status, batch_id, qr_batches(name, financial_type)')
            .range(from, from + pageSize - 1);

          if (error) throw error;
          if (!data || data.length === 0) { hasMore = false; break; }

          allCodes = allCodes.concat(data);
          from += pageSize;
          if (data.length < pageSize) hasMore = false;
        }

        // Index by code
        allCodes.forEach(qr => {
          codesMap.set(qr.code, {
            id: qr.id,
            status: qr.status,
            batch_id: qr.batch_id,
            batch_name: qr.qr_batches?.name || 'Lote',
            financial_type: qr.qr_batches?.financial_type || ''
          });

          // Also index by UUID portion if code contains a URL
          try {
            const url = new URL(qr.code);
            const parts = url.pathname.split('/').filter(Boolean);
            if (parts.length > 0) {
              const uuid = parts[parts.length - 1];
              if (uuid !== qr.code) codesMap.set(uuid, codesMap.get(qr.code));
            }
          } catch { /* not a URL */ }
        });

        if (preloadStatus) preloadStatus.textContent = `${codesMap.size} códigos cargados`;
        if (connStatus) connStatus.className = 'conn on';
        console.log(`✅ Preloaded ${allCodes.length} QR codes into memory`);

      } catch (err) {
        console.error('Preload failed:', err);
        if (preloadStatus) preloadStatus.textContent = 'Sin conexión — modo manual';
        if (connStatus) connStatus.className = 'conn off';
      }
    }

    // ══════════════════════════════════════════
    // 4. WAKE LOCK
    // ══════════════════════════════════════════
    let wakeLock = null;

    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          wakeLock.addEventListener('release', () => console.log('🔓 Wake lock released'));
        }
      } catch (err) { console.warn('Wake lock failed:', err); }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    });
    await requestWakeLock();

    // ══════════════════════════════════════════
    // 5. AUDIO PRE-WARM
    // ══════════════════════════════════════════
    const soundOk = document.getElementById('soundOk');
    const soundNo = document.getElementById('soundNo');
    let audioReady = false;

    function warmUpAudio() {
      if (audioReady) return;
      [soundOk, soundNo].forEach(a => {
        if (a) { a.volume = 0.01; a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {}); a.volume = 1; }
      });
      audioReady = true;
    }
    document.addEventListener('touchstart', warmUpAudio, { once: true });
    document.addEventListener('click', warmUpAudio, { once: true });

    // ══════════════════════════════════════════
    // 6. MANUAL INPUT
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
    // 7. HISTORY TOGGLE
    // ══════════════════════════════════════════
    const historyToggle = document.getElementById('historyToggle');
    if (historyToggle) {
      historyToggle.addEventListener('click', () => {
        historyToggle.classList.toggle('open');
        historyList.classList.toggle('open');
      });
    }

    // ══════════════════════════════════════════
    // 8. TORCH TOGGLE
    // ══════════════════════════════════════════
    if (btnTorch) {
      btnTorch.addEventListener('click', async () => {
        if (!html5QrCode) return;
        try {
          const track = html5QrCode.getRunningTrackSettings?.() ||
            (html5QrCode.getState?.() === 2 ? null : null); // running state
          // Access the video track directly
          const videoElement = document.querySelector('#reader video');
          if (videoElement && videoElement.srcObject) {
            const tracks = videoElement.srcObject.getVideoTracks();
            if (tracks.length > 0) {
              const capabilities = tracks[0].getCapabilities?.();
              if (capabilities && capabilities.torch) {
                torchOn = !torchOn;
                await tracks[0].applyConstraints({ advanced: [{ torch: torchOn }] });
                btnTorch.textContent = torchOn ? '🔦 ON' : '🔦';
                btnTorch.classList.toggle('active', torchOn);
              } else {
                btnTorch.textContent = '🚫';
                setTimeout(() => { btnTorch.textContent = '🔦'; }, 1500);
              }
            }
          }
        } catch (err) {
          console.warn('Torch error:', err);
        }
      });
    }

    // ══════════════════════════════════════════
    // 9. CAMERA
    // ══════════════════════════════════════════
    startCamera();

    function startCamera() {
      if (typeof Html5Qrcode === 'undefined') {
        lastScan.textContent = '⚠️ Librería QR no cargó. Usá input manual.';
        lastScan.className = 'last fail';
        return;
      }

      html5QrCode = new Html5Qrcode('reader');

      const config = {
        fps: 15,
        // Generous qrbox: 80% of viewport, large enough to be forgiving
        qrbox: function(viewfinderWidth, viewfinderHeight) {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minDim * 0.85); // 85% of the smallest dimension
          return { width: size, height: size };
        },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true
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
        lastScan.textContent = '⚠️ Sin cámara. Usá input manual.';
        lastScan.className = 'last fail';
        if (btnTorch) btnTorch.style.display = 'none';
      });
    }

    // ══════════════════════════════════════════
    // 10. PROCESS SCANNED CODE (INSTANT via preloaded map)
    // ══════════════════════════════════════════
    function processCode(rawCode) {
      isProcessing = true;

      // Normalize: trim whitespace
      let code = rawCode.trim();

      // Extract UUID from URL if needed
      try {
        const url = new URL(code);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length > 0) code = parts[parts.length - 1];
      } catch { /* not a URL */ }

      // ── Duplicate check ──
      if (scannedSet.has(code)) {
        stats.duplicate++;
        updateUI();
        showResult('dup', 'REPETIDO', `Ya escaneado (...${code.slice(-6)})`, code);
        setTimeout(() => { isProcessing = false; }, 800);
        return;
      }

      // ── Validate against preloaded map (INSTANT, no network) ──
      const qr = codesMap.get(code) || codesMap.get(rawCode);

      if (!qr) {
        stats.invalid++;
        updateUI();
        showResult('fail', 'NO EXISTE', 'No es del sistema', code);
        setTimeout(() => { isProcessing = false; }, 1000);
        return;
      }

      // ── Valid! ──
      scannedSet.add(code);
      if (rawCode !== code) scannedSet.add(rawCode);
      stats.valid++;
      updateUI();
      persistState();

      const statusLabel = qr.status !== 'PENDIENTE' ? ` [${qr.status}]` : '';
      const label = `${qr.batch_name}${qr.financial_type ? ' · ' + qr.financial_type : ''}${statusLabel}`;

      showResult('ok', '✓ VÁLIDO', label, code);
      setTimeout(() => { isProcessing = false; }, 600); // Short cooldown for speed
    }

    // ══════════════════════════════════════════
    // 11. UI UPDATES
    // ══════════════════════════════════════════
    function updateUI(animate = true) {
      bigCount.textContent = stats.valid;
      statValid.textContent = stats.valid;
      statDup.textContent = stats.duplicate;
      statInvalid.textContent = stats.invalid;

      if (animate) {
        bigCount.classList.add('bump');
        setTimeout(() => bigCount.classList.remove('bump'), 200);
      }
    }

    function showResult(type, title, msg, code) {
      // ── Last scan line ──
      const icons = { ok: '✅', fail: '❌', dup: '🔁' };
      lastScan.textContent = `${icons[type] || ''} ${title} — ${msg}`;
      lastScan.className = `last ${type}`;

      // ── Haptic ──
      if ('vibrate' in navigator) {
        if (type === 'ok') navigator.vibrate([60, 30, 60]);
        else if (type === 'dup') navigator.vibrate([120]);
        else navigator.vibrate([200, 80, 200]);
      }

      // ── Sound ──
      const audio = type === 'ok' ? soundOk : soundNo;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }

      // ── Fullscreen overlay ──
      scanOverlay.classList.remove('hidden', 'success', 'error', 'warning');
      scanOverlay.classList.add(type === 'ok' ? 'success' : type === 'dup' ? 'warning' : 'error');
      overlayIcon.textContent = type === 'ok' ? '✓' : type === 'dup' ? '⟳' : '✗';
      overlayTitle.textContent = title;
      overlayMsg.textContent = msg;
      setTimeout(() => scanOverlay.classList.add('hidden'), type === 'ok' ? 700 : 1000);

      // ── History entry ──
      addHistoryEntry(type, title, code);
    }

    function addHistoryEntry(type, title, code, time) {
      const div = document.createElement('div');
      div.className = 'hist-item';
      const now = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      div.innerHTML = `
        <span class="code">...${(code || '').slice(-8)}</span>
        <span class="result ${type === 'fail' ? 'fail' : type}">${title}</span>
        <span class="time">${now}</span>
      `;
      historyList.prepend(div);
      while (historyList.children.length > 50) historyList.lastChild.remove();
    }

    // ══════════════════════════════════════════
    // 12. PERSISTENCE (survive refresh)
    // ══════════════════════════════════════════
    function persistState() {
      try {
        const state = {
          stats,
          scanned: Array.from(scannedSet),
          history: getHistoryData(),
          timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* ignore */ }
    }

    function restoreState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);

        // Only restore if from today (< 12 hours old)
        if (Date.now() - state.timestamp > 12 * 60 * 60 * 1000) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        stats = state.stats || { valid: 0, duplicate: 0, invalid: 0 };
        scannedSet = new Set(state.scanned || []);
      } catch { /* ignore */ }
    }

    function restoreHistory() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const state = JSON.parse(raw);
        if (!state.history) return;

        // Render saved history items (most recent first is already in order)
        state.history.slice(0, 20).reverse().forEach(h => {
          addHistoryEntry(h.type, h.title, h.code, h.time);
        });
      } catch { /* ignore */ }
    }

    function getHistoryData() {
      const items = [];
      historyList.querySelectorAll('.hist-item').forEach(el => {
        items.push({
          code: el.querySelector('.code')?.textContent || '',
          title: el.querySelector('.result')?.textContent || '',
          type: el.querySelector('.result')?.classList.contains('ok') ? 'ok' :
                el.querySelector('.result')?.classList.contains('dup') ? 'dup' : 'fail',
          time: el.querySelector('.time')?.textContent || ''
        });
      });
      return items.slice(0, 50);
    }

    // Persist on every valid scan (already called in processCode)
    // Also persist on unload
    window.addEventListener('beforeunload', persistState);

    // ══════════════════════════════════════════
    // 13. RESET BUTTON
    // ══════════════════════════════════════════
    const btnReset = document.getElementById('btnReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('¿Reiniciar contador y historial?')) {
          stats = { valid: 0, duplicate: 0, invalid: 0 };
          scannedSet.clear();
          historyList.innerHTML = '';
          localStorage.removeItem(STORAGE_KEY);
          updateUI(false);
          lastScan.textContent = '📷 Escaneá un QR';
          lastScan.className = 'last';
        }
      });
    }

  });
})();
