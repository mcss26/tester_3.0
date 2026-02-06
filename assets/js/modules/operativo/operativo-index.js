/**
 * Operativo Index/Landing Module
 * Handles dashboard data fetching (user profile, system status)
 */
(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect([
    "operativo",
    "staff_barra",
    "staff_operativo",
  ]);
  if (!session) return;

  // 2. DOM References
  const ui = {
    userName: document.getElementById("user-name"),
    systemStatus: document.getElementById("system-status"),
    // New references for widget
    statusWidget: document.getElementById("system-status-widget"),
    statusValue: document.getElementById("system-status-value"),
    moduleContent: document.querySelector(".module-grid") || document.body, // Fallback
    pageCardLoading: document.getElementById("page-card-loading")
  };

  if (!window.Utils.assertSbOrShowBlockingError()) return;

  // 3. Fetch User Profile
  async function loadProfile() {
    if (!ui.userName) return;
    // Requested: "nombre de perfil operativo"
    ui.userName.textContent = "Operativo";
  }

  // 4. Fetch System Status
  async function loadSystemStatus() {
    // Legacy support or new widget
    const widget = ui.statusWidget || ui.systemStatus;
    const valueLabel = ui.statusValue;

    if (!widget) return;

    try {
      const { data: wd } = await window.sb
        .from("work_days")
        .select("work_date, status")
        .eq("status", "open")
        .maybeSingle();

      if (wd) {
        if (valueLabel) {
          valueLabel.textContent = wd.work_date;
          widget.classList.remove("hidden");
          widget.classList.add("live");
        } else {
          // Fallback for old HTML if ever used
          widget.textContent = `DÍA ${wd.work_date}`;
          widget.className = "status-pill status-success";
          widget.classList.remove("hidden");
        }
      } else {
        if (valueLabel) {
          valueLabel.textContent = "CERRADO";
          widget.classList.remove("hidden");
        } else {
          widget.textContent = "CERRADO";
          widget.className = "status-pill status-error";
          widget.classList.remove("hidden");
        }
      }
    } catch (err) {
      console.warn("Error loading status", err);
    }
  }

  /**
   * Initializes MCO Member QR Counter widget.
   */
  function initMcoQrWidget() {
    const widget = document.getElementById('mco-qr-widget');
    const elGenerated = document.getElementById('mco-qr-generated');
    const elValidated = document.getElementById('mco-qr-validated');
    
    if (!widget) return;

    const MCO_BATCH_ID = '141e44d9-42bc-4c2b-a3bb-4d9721e03802';

    const fetchMcoStats = async () => {
      try {
        const { count: generated } = await window.sb
          .from('qr_codes')
          .select('*', { count: 'exact', head: true })
          .eq('batch_id', MCO_BATCH_ID);

        const { count: validated } = await window.sb
          .from('qr_codes')
          .select('*', { count: 'exact', head: true })
          .eq('batch_id', MCO_BATCH_ID)
          .eq('status', 'ACREDITADO');

        if (elGenerated) elGenerated.textContent = generated || 0;
        if (elValidated) elValidated.textContent = validated || 0;
        
        widget.classList.remove('hidden');
      } catch (err) {
        console.warn('Error fetching MCO QR stats:', err);
      }
    };

    fetchMcoStats();
    setInterval(fetchMcoStats, 60000);
  }

  // Init
  window.Utils.setPageState(ui, { loading: true });
  try {
    await Promise.all([loadProfile(), loadSystemStatus()]);
    initMcoQrWidget();
  } catch(e) { console.error(e); }
  window.Utils.setPageState(ui, { loading: false });
})();
