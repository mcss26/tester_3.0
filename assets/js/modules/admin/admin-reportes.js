/**
 * Admin Reports Module
 * Visualizes data from SQL Views: vw_daily_sales, vw_staff_performance
 */

(async function () {
  "use strict";

  // 1. Auth Guard
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  // 2. Supabase Check
  if (!window.Utils.assertSbOrShowBlockingError()) return;

  // ── State ──────────────────────────────────────────────────────────────
  const state = {
    activeTab: "ventas",
    salesData: [],
    staffData: [],
    pnlData: [],
    taxData: [],
    barData: [],
  };

  // ── DOM Cache ──────────────────────────────────────────────────────────
  const tabs = document.querySelectorAll(".tab-chip");
  const views = {
    ventas: document.getElementById("view-ventas"),
    staff: document.getElementById("view-staff"),
    finanzas: document.getElementById("view-finanzas"),
    barras: document.getElementById("view-barras"),
  };
  const lists = {
    ventas: document.getElementById("sales-list"),
    staff: document.getElementById("staff-list"),
    pnl: document.getElementById("pnl-list"),
    tax: document.getElementById("tax-list"),
    bar: document.getElementById("bar-list"),
  };
  const inputs = {
    start: document.getElementById("report-start"),
    end: document.getElementById("report-end"),
    refresh: document.getElementById("btn-refresh-report"),
  };
  const ui = {
    loadingState: document.getElementById("page-card-loading"),
    emptyState: document.getElementById("page-card-empty"),
    moduleContent: document.getElementById("module-content"),
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  function formatMoney(amount) {
    return window.Utils.formatARS(amount);
  }



  // ── Init ───────────────────────────────────────────────────────────────
  function initDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    if (inputs.start)
      inputs.start.value = firstDay.toISOString().split("T")[0];
    if (inputs.end)
      inputs.end.value = today.toISOString().split("T")[0];
  }

  function bindEvents() {
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => switchTab(e.target));
    });

    if (inputs.refresh) {
      inputs.refresh.addEventListener("click", () => loadData());
    }
  }

  function switchTab(targetTab) {
    state.activeTab = targetTab.dataset.view;
    tabs.forEach((t) => t.classList.remove("active"));
    targetTab.classList.add("active");

    Object.values(views).forEach((v) => {
      if (v) v.classList.add("hidden");
    });
    const activeView = views[state.activeTab];
    if (activeView) activeView.classList.remove("hidden");
  }

  // ── Data Loading ───────────────────────────────────────────────────────
  async function loadData() {
    if (window.Toast) window.Toast.info("Actualizando reportes...", 1000);
    Utils.setPageState(ui, { loading: true });

    const start = inputs.start?.value;
    const end = inputs.end?.value;

    // Load Sales (Using V2)
    try {
      let query = window.sb
        .from("vw_daily_sales_v2")
        .select("*")
        .order("work_date", { ascending: false });

      if (start) query = query.gte("work_date", start);
      if (end) query = query.lte("work_date", end);

      const resSales = await query;
      if (resSales.error) throw resSales.error;
      state.salesData = resSales.data || [];
      renderSales();
    } catch (e) {
      console.error(e);
      if (window.Toast)
        window.Toast.error("Error cargando ventas: " + e.message);
      lists.ventas.innerHTML =
        '<tr><td colspan="4" class="text-center py-4 text-red-400">Error cargando datos.</td></tr>';
    }

    // Load Staff
    try {
      const resStaff = await window.sb.from("vw_staff_performance").select("*");

      if (resStaff.error) throw resStaff.error;
      state.staffData = resStaff.data || [];
      renderStaff();
    } catch (e) {
      console.error(e);
      lists.staff.innerHTML =
        '<tr><td colspan="4" class="text-center py-4 text-red-400">Error cargando staff.</td></tr>';
    }

    // Load Finanzas (P&L V2 + Tax)
    try {
      const [resPnL, resTax] = await Promise.all([
        window.sb
          .from("vw_pnl_monthly_v2")
          .select("*")
          .order("month", { ascending: false }),
        window.sb
          .from("vw_tax_monthly")
          .select("*")
          .order("month", { ascending: false }),
      ]);

      if (resPnL.error) throw resPnL.error;
      if (resTax.error) throw resTax.error;

      state.pnlData = resPnL.data || [];
      state.taxData = resTax.data || [];
      renderFinanzas();
    } catch (e) {
      console.error(e);
      if (window.Toast)
        window.Toast.error("Error cargando finanzas: " + e.message);
    }

    // Load Bar Efficiency
    try {
      let queryBar = window.sb
        .from("vw_bar_efficiency")
        .select("*")
        .order("work_date", { ascending: false });

      if (start) queryBar = queryBar.gte("work_date", start);
      if (end) queryBar = queryBar.lte("work_date", end);

      const resBar = await queryBar;
      if (resBar.error) throw resBar.error;

      state.barData = resBar.data || [];
      renderBar();
    } catch (e) {
      console.error(e);
      if (lists.bar)
        lists.bar.innerHTML =
          '<tr><td colspan="6" class="text-center py-4 text-red-400">Error cargando datos de barra.</td></tr>';
    }

    Utils.setPageState(ui, { loading: false });
    if (window.Toast && state.salesData.length > 0)
      window.Toast.success("Reportes actualizados.");
  }

  // ── Render Functions ───────────────────────────────────────────────────
  function renderSales() {
    const list = lists.ventas;
    list.innerHTML = "";

    if (state.salesData.length === 0) {
      list.innerHTML =
        '<tr><td colspan="4" class="text-center py-8 text-white/30">Sin datos de ventas.</td></tr>';
      return;
    }

    state.salesData.forEach((row) => {
      const tr = document.createElement("tr");
      tr.className =
        "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0";

      const diffClass =
        row.total_difference < 0
          ? "text-red-400"
          : row.total_difference > 0
            ? "text-green-400"
            : "text-white/30";

      tr.innerHTML = `
                <td class="py-3 pl-2">
                    <div class="font-mono text-white/90">${row.work_date}</div>
                    <div class="text-[10px] uppercase text-white/40">${row.status}</div>
                </td>
                <td class="py-3 text-right font-mono text-white/70">${formatMoney(row.total_income)}</td>
                <td class="py-3 text-right font-mono text-white">${formatMoney(row.total_declared)}</td>
                <td class="py-3 text-right pr-2 font-mono font-bold ${diffClass}">${formatMoney(row.total_difference)}</td>
            `;
      list.appendChild(tr);
    });
  }

  function renderStaff() {
    const list = lists.staff;
    list.innerHTML = "";

    if (state.staffData.length === 0) {
      list.innerHTML =
        '<tr><td colspan="4" class="text-center py-8 text-white/30">Sin datos de personal.</td></tr>';
      return;
    }

    state.staffData.forEach((row) => {
      const tr = document.createElement("tr");
      tr.className =
        "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0";

      const attendancePct =
        row.shifts_total > 0
          ? Math.round((row.shifts_confirmed / row.shifts_total) * 100)
          : 0;
      let attClass = "text-white/50";
      if (row.shifts_total > 0) {
        if (attendancePct > 90) attClass = "text-green-400";
        else if (attendancePct < 70) attClass = "text-red-400";
        else attClass = "text-orange-400";
      }

      const diff = row.net_cash_difference;
      const diffClass =
        diff < 0
          ? "text-red-400"
          : diff > 0
            ? "text-green-400"
            : "text-white/30";

      tr.innerHTML = `
                <td class="py-3 pl-2">
                    <div class="font-medium text-white/90">${row.full_name || "Desconocido"}</div>
                    <div class="text-[10px] uppercase text-white/40">${row.role || "-"}</div>
                </td>
                <td class="py-3 text-center">
                    <div class="text-xs font-bold ${attClass}">${attendancePct}%</div>
                    <div class="text-[10px] text-white/30">${row.shifts_confirmed}/${row.shifts_total}</div>
                </td>
                <td class="py-3 text-right font-mono text-white/70">${row.closures_count}</td>
                <td class="py-3 text-right pr-2 font-mono font-bold ${diffClass}">${formatMoney(diff)}</td>
            `;
      list.appendChild(tr);
    });
  }

  function renderFinanzas() {
    // P&L
    const pnlList = lists.pnl;
    pnlList.innerHTML = "";
    if (state.pnlData.length === 0) {
      pnlList.innerHTML =
        '<tr><td colspan="3" class="text-center py-8 text-white/30">Sin datos P&L.</td></tr>';
    } else {
      state.pnlData.forEach((row) => {
        const tr = document.createElement("tr");
        tr.className =
          "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0";

        let amountClass = "text-white/70";
        if (row.type === "INCOME") amountClass = "text-green-400 font-bold";
        if (row.type === "EXPENSE") amountClass = "text-red-400";

        tr.innerHTML = `
                    <td class="py-3 pl-2"><div class="font-mono text-white/90">${row.month}</div></td>
                    <td class="py-3"><div class="text-sm text-white/80">${row.category}</div></td>
                    <td class="py-3 text-right pr-2 font-mono ${amountClass}">${formatMoney(row.amount)}</td>
                `;
        pnlList.appendChild(tr);
      });
    }

    // Tax
    const taxList = lists.tax;
    taxList.innerHTML = "";
    if (state.taxData.length === 0) {
      taxList.innerHTML =
        '<tr><td colspan="3" class="text-center py-8 text-white/30">Sin datos Fiscales.</td></tr>';
    } else {
      state.taxData.forEach((row) => {
        const tr = document.createElement("tr");
        tr.className =
          "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0";
        tr.innerHTML = `
                    <td class="py-3 pl-2"><div class="font-mono text-white/90">${row.month}</div></td>
                    <td class="py-3 text-right font-mono text-white/70">${formatMoney(row.total_factura_a)}</td>
                    <td class="py-3 text-right pr-2 font-mono font-bold text-blue-400">${formatMoney(row.estimated_vat_credit)}</td>
                `;
        taxList.appendChild(tr);
      });
    }
  }

  function renderBar() {
    const list = lists.bar;
    if (!list) return;
    list.innerHTML = "";

    if (state.barData.length === 0) {
      list.innerHTML =
        '<tr><td colspan="6" class="text-center py-8 text-white/30">Sin datos de barras.</td></tr>';
      return;
    }

    state.barData.forEach((row) => {
      const tr = document.createElement("tr");
      tr.className =
        "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0";

      // Negative diff = Loss (Theo - Phys < 0 means Physical Cost > Theoretical)
      const diffClass =
        row.cost_difference < 0 ? "text-red-400" : "text-green-400";

      tr.innerHTML = `
                <td class="py-3 pl-2">
                    <div class="font-mono text-white/90">${row.work_date || "?"}</div>
                    <div class="text-[10px] uppercase text-white/40">${row.location}</div>
                </td>
                <td class="py-3 text-right font-mono text-white/70">${formatMoney(row.items_revenue)}</td>
                <td class="py-3 text-right font-mono text-white/70">${formatMoney(row.cost_physical)}</td>
                <td class="py-3 text-right font-mono text-white/70">${formatMoney(row.cost_theoretical)}</td>
                <td class="py-3 text-right font-mono font-bold ${diffClass}">${formatMoney(row.cost_difference)}</td>
                <td class="py-3 text-right pr-2 font-mono text-white/50">${Math.round(row.cost_percentage)}%</td>
            `;
      list.appendChild(tr);
    });
  }

  // ── Boot ────────────────────────────────────────────────────────────────
  initDates();
  bindEvents();
  await loadData();

})();
