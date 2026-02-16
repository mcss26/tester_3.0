(async () => {
    // Config
    const EDGE_FN_URL = `${window.APP_CONFIG.SUPABASE_URL}/functions/v1/generate-member-qr`;
    
    // DOM Elements
    const elLoading = document.getElementById('qr-loading');
    const elContent = document.getElementById('qr-content');
    const elUnavailable = document.getElementById('qr-unavailable');
    const elAction = document.getElementById('qr-action');
    const btnGenerate = document.getElementById('btn-generate');
    
    // 1. Check Session
    const token = localStorage.getItem('member_token');
    if (!token) {
      window.Toast?.error('Debes iniciar sesión');
      // Redirect to login (adjust path as needed)
      // window.location.href = '/pages/members/login.html'; 
      // For now just show error
      showUnavailable('No autenticado', 'Por favor inicia sesión nuevamente');
      return;
    }
  
    // 2. Decode JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const memberName = document.getElementById('member-name');
      if (memberName) memberName.textContent = payload.nombre || 'Member';
      
      // Check Expiry
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('member_token');
        showUnavailable('Sesión expirada', 'Tu token expiró. Reingresá desde el flujo de membresía.');
        return;
      }
    } catch (e) {
      console.error(e);
      showUnavailable('No autenticado', 'Token inválido. Reingresá desde el flujo de membresía.');
      return;
    }
  
    // 3. Init
    await checkExistingOrGenerate();
    
    // Event Listeners
    if (btnGenerate) {
        btnGenerate.addEventListener('click', async () => {
             // Forcing generation if we had a button (currently logic auto-checks but if we add a manual step later)
             // Re-run check
             await checkExistingOrGenerate();
        });
    }
  
    async function checkExistingOrGenerate() {
      try {
        const res = await fetch(EDGE_FN_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
  
        const data = await res.json();
  
        if (res.ok && data.success) {
          // New QR
          showQR(data.qr_code, data.valid_until);
        } else if (res.status === 409 && data.existing_code) {
          // Existing QR
          showQR(data.existing_code, data.valid_until, data.status);
        } else if (res.status === 400 && (data.error || '').includes("No hay evento")) {
          showUnavailable("Sin evento activo", "Volvé cuando haya un evento programado.");
        } else if (res.status === 403) {
          showUnavailable("Membresía inactiva", data.error);
        } else {
          showUnavailable("Error", data.error || "Ocurrió un error inesperado.");
        }
      } catch (err) {
        console.error(err);
        showUnavailable("Error de conexión", "No se pudo conectar con el servidor.");
      }
    }
  
    function showQR(code, validUntil, status = 'ACTIVO') {
      if(elLoading) elLoading.classList.add('hidden');
      if(elUnavailable) elUnavailable.classList.add('hidden');
      if(elContent) elContent.classList.remove('hidden');
      
      const txt = document.getElementById('qr-code-text');
      if(txt) txt.textContent = code;
      
      const validDate = new Date(validUntil);
      const limitEl = document.getElementById('valid-until');
      if(limitEl) limitEl.textContent = validDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  
      // Generate Visual QR
      const canvas = document.getElementById('qr-canvas');
      if (canvas && window.QRCode) {
        window.QRCode.toCanvas(canvas, code, {
          width: 250,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        }, function (error) {
          if (error) console.error(error);
        });
      }
  
      // If used
      const qrBox = document.querySelector('.qr-box');
      const warning = document.querySelector('.qr-warning');
      
      if (status === 'ACREDITADO' || status === 'ANULADO') {
        if(warning) warning.textContent = 'Este QR ya fue utilizado o anulado';
        if(qrBox) qrBox.classList.add('qr-used');
      } else {
         if(qrBox) qrBox.classList.remove('qr-used');
         if(warning) warning.textContent = 'Mostrá este QR en la entrada';
      }
    }
  
    function showUnavailable(title, desc) {
      if(elLoading) elLoading.classList.add('hidden');
      if(elContent) elContent.classList.add('hidden');
      if(elUnavailable) elUnavailable.classList.remove('hidden');
      
      const t = document.getElementById('unavailable-title');
      if(t) t.textContent = title;
      
      const d = document.getElementById('unavailable-desc');
      if(d) d.textContent = desc;
    }
  })();
