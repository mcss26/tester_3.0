/**
 * Admin Reports Module
 * Visualizes data from SQL Views: vw_daily_sales, vw_staff_performance
 */

window.AdminReportesApp = {
  state: {
    activeTab: "ventas",
    salesData: [],
    staffData: [],
    pnlData: [],
    taxData: [],
    barData: [],
  },

  init: async function () {
    console.log("Admin Reportes Init");
    this.cacheDOM();
    this.initDates();
    this.bindEvents();

    await this.loadData();
  },

  cacheDOM: function () {
    this.tabs = document.querySelectorAll(".tab-chip");
    this.views = {
      ventas: document.getElementById("view-ventas"),
      staff: document.getElementById("view-staff"),
      finanzas: document.getElementById("view-finanzas"),
      barras: document.getElementById("view-barras"),
    };
    this.lists = {
      ventas: document.getElementById("sales-list"),
      staff: document.getElementById("staff-list"),
      pnl: document.getElementById("pnl-list"),
      tax: document.getElementById("tax-list"),
      bar: document.getElementById("bar-list"),
    };
    this.inputs = {
      start: document.getElementById("report-start"),
      end: document.getElementById("report-end"),
      refresh: document.getElementById("btn-refresh-report"),
    };

    // Global States
    this.ui = {
      loadingState: document.getElementById("page-card-loading"),
      emptyState: document.getElementById("page-card-empty"),
      moduleContent: document.getElementById("module-content"),
    };
  },

  initDates: function () {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    if (this.inputs.start)
      this.inputs.start.value = firstDay.toISOString().split("T")[0];
    if (this.inputs.end)
      this.inputs.end.value = today.toISOString().split("T")[0];
  },

  bindEvents: function () {
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => this.switchTab(e.target));
    });

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn)
      logoutBtn.addEventListener("click", () => window.Auth.logout());

    if (this.inputs.refresh) {
      this.inputs.refresh.addEventListener("click", () => this.loadData());
    }
  },

  switchTab: function (targetTab) {
    this.state.activeTab = targetTab.dataset.view;
    this.tabs.forEach((t) => t.classList.remove("active"));
    targetTab.classList.add("active");

    Object.values(this.views).forEach((v) => {
      if (v) v.classList.add("hidden");
    });
    const activeView = this.views[this.state.activeTab];
    if (activeView) activeView.classList.remove("hidden");
  },

  loadData: async function () {
    if (window.Toast) window.Toast.info("Actualizando reportes...", 1000);

    // Show Global Loader only if not just refreshing?
    // For standardization, let's use global loader.
    this.setLoading(true);

    const start = this.inputs.start?.value;
    const end = this.inputs.end?.value;

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
      this.state.salesData = resSales.data || [];
      this.renderSales();
    } catch (e) {
      console.error(e);
      if (window.Toast)
        window.Toast.error("Error cargando ventas: " + e.message);
      this.lists.ventas.innerHTML =
        '<tr><td colspan="4" class="text-center py-4 text-red-400">Error cargando datos.</td></tr>';
    }

    // Load Staff
    try {
      const resStaff = await window.sb.from("vw_staff_performance").select("*");

      if (resStaff.error) throw resStaff.error;
      this.state.staffData = resStaff.data || [];
      this.renderStaff();
    } catch (e) {
      console.error(e);
      this.lists.staff.innerHTML =
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

      this.state.pnlData = resPnL.data || [];
      this.state.taxData = resTax.data || [];
      this.renderFinanzas();
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

      this.state.barData = resBar.data || [];
      this.renderBar();
    } catch (e) {
      console.error(e);
      if (this.lists.bar)
        this.lists.bar.innerHTML =
          '<tr><td colspan="6" class="text-center py-4 text-red-400">Error cargando datos de barra.</td></tr>';
    }

    this.setLoading(false);
    if (window.Toast && this.state.salesData.length > 0)
      window.Toast.success("Reportes actualizados.");
  },

  setLoading: function (isLoading) {
    window.Utils.setPageState(this.ui, { loading: isLoading });
  },

  toggleEmptyState: function (isEmpty) {
    window.Utils.setPageState(this.ui, { empty: isEmpty });
  },

  renderSales: function () {
    const list = this.lists.ventas;
    list.innerHTML = "";

    if (this.state.salesData.length === 0) {
      list.innerHTML =
        '<tr><td colspan="4" class="text-center py-8 text-white/30">Sin datos de ventas.</td></tr>';
      return;
    }

    this.state.salesData.forEach((row) => {
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
                <td class="py-3 text-right font-mono text-white/70">${this.formatMoney(row.total_income)}</td> <!-- Changed from total_income to generic, but view has total_income. Note: View V2 uses total_income. -->
                <td class="py-3 text-right font-mono text-white">${this.formatMoney(row.total_declared)}</td>
                <td class="py-3 text-right pr-2 font-mono font-bold ${diffClass}">${this.formatMoney(row.total_difference)}</td>
            `;
      list.appendChild(tr);
    });
  },

  renderStaff: function () {
    const list = this.lists.staff;
    list.innerHTML = "";

    if (this.state.staffData.length === 0) {
      list.innerHTML =
        '<tr><td colspan="4" class="text-center py-8 text-white/30">Sin datos de personal.</td></tr>';
      return;
    }

    this.state.staffData.forEach((row) => {
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
                <td class="py-3 text-right pr-2 font-mono font-bold ${diffClass}">${this.formatMoney(diff)}</td>
            `;
      list.appendChild(tr);
    });
  },

  formatMoney: function (amount) {
    return window.Utils.formatARS(amount);
  },

  renderFinanzas: function () {
    // P&L
    const pnlList = this.lists.pnl;
    pnlList.innerHTML = "";
    if (this.state.pnlData.length === 0) {
      pnlList.innerHTML =
        '<tr><td colspan="3" class="text-center py-8 text-white/30">Sin datos P&L.</td></tr>';
    } else {
      this.state.pnlData.forEach((row) => {
        const tr = document.createElement("tr");
        tr.className =
          "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0";

        let amountClass = "text-white/70";
        if (row.type === "INCOME") amountClass = "text-green-400 font-bold";
        if (row.type === "EXPENSE") amountClass = "text-red-400";

        tr.innerHTML = `
                    <td class="py-3 pl-2"><div class="font-mono text-white/90">${row.month}</div></td>
                    <td class="py-3"><div class="text-sm text-white/80">${row.category}</div></td>
                    <td class="py-3 text-right pr-2 font-mono ${amountClass}">${this.formatMoney(row.amount)}</td>
                `;
        pnlList.appendChild(tr);
      });
    }

    // Tax
    const taxList = this.lists.tax;
    taxList.innerHTML = "";
    if (this.state.taxData.length === 0) {
      taxList.innerHTML =
        '<tr><td colspan="3" class="text-center py-8 text-white/30">Sin datos Fiscales.</td></tr>';
    } else {
      this.state.taxData.forEach((row) => {
        const tr = document.createElement("tr");
        tr.className =
          "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0";
        tr.innerHTML = `
                    <td class="py-3 pl-2"><div class="font-mono text-white/90">${row.month}</div></td>
                    <td class="py-3 text-right font-mono text-white/70">${this.formatMoney(row.total_factura_a)}</td>
                    <td class="py-3 text-right pr-2 font-mono font-bold text-blue-400">${this.formatMoney(row.estimated_vat_credit)}</td>
                `;
        taxList.appendChild(tr);
      });
    }
  },

  renderBar: function () {
    const list = this.lists.bar;
    if (!list) return;
    list.innerHTML = "";

    if (this.state.barData.length === 0) {
      list.innerHTML =
        '<tr><td colspan="6" class="text-center py-8 text-white/30">Sin datos de barras.</td></tr>';
      return;
    }

    this.state.barData.forEach((row) => {
      const tr = document.createElement("tr");
      tr.className =
        "hover:bg-white/5 transition-colors border-b border-white/5 last:border-0";

      const diffClass =
        row.cost_difference < 0 ? "text-red-400" : "text-green-400"; // Negative diff means (Theo - Phys) < 0 => Phys > Theo => Loss? Wait. Theo - Phys. If Theo=1000, Phys=1200. Diff = -200. Bad.
      // If Theo is cost of sold items (Ideal Cost). Phys is Cost of Consumed items (Real Cost).
      // Usually we want Measured Cost to be equal to Ideal Cost.
      // If Measured Cost > Ideal Cost => Cost of Goods Sold is HIGHER than it should be => Loss/Waste.
      // My View: cost_difference = theo - phys.
      // If Phys=1200, Theo=1000. Diff = 1000 - 1200 = -200.
      // So Negative is BAD (Loss). Highlight Red. Correct.

      tr.innerHTML = `
                <td class="py-3 pl-2">
                    <div class="font-mono text-white/90">${row.work_date || "?"}</div>
                    <div class="text-[10px] uppercase text-white/40">${row.location}</div>
                </td>
                <td class="py-3 text-right font-mono text-white/70">${this.formatMoney(row.items_revenue)}</td>
                <td class="py-3 text-right font-mono text-white/70">${this.formatMoney(row.cost_physical)}</td>
                <td class="py-3 text-right font-mono text-white/70">${this.formatMoney(row.cost_theoretical)}</td>
                <td class="py-3 text-right font-mono font-bold ${diffClass}">${this.formatMoney(row.cost_difference)}</td>
                <td class="py-3 text-right pr-2 font-mono text-white/50">${Math.round(row.cost_percentage)}%</td>
            `;
      list.appendChild(tr);
    });
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  const session = await window.Auth.guardOrRedirect(["admin", "contable"]);
  if (!session) return;

  // Check Supabase connection
  if (!window.Utils.assertSbOrShowBlockingError()) return;

  window.AdminReportesApp.init();
});
