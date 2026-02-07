/**
 * Admin Inventario - Unified Inventory Management
 * Consolidates: Stock Monitor, SKU Master, SKU Change Requests, Replenishment Requests
 */

(async function () {
  "use strict";

  // ============================================
  // 1. AUTH GUARD
  // ============================================
  const session = await window.Auth.guardOrRedirect([
    "admin",
    "contable",
    "logistica",
  ]);
  if (!session) return;

  // ============================================
  // 2. DOM ELEMENTS
  // ============================================
  const ui = {
    // Global
    moduleContent: document.getElementById("module-content"),
    loadingState: document.getElementById("page-card-loading"),
    emptyState: document.getElementById("page-card-empty"),
    btnReloadEmpty: document.getElementById("btn-reload-empty"),
    btnRefresh: document.getElementById("btn-refresh"),
    btnNew: document.getElementById("btn-new"),

    // Main Tabs
    mainTabs: document.querySelectorAll("[data-main-tab]"),

    // Análisis View
    viewAnalisis: document.getElementById("view-analisis"),
    analisisTabs: document.querySelectorAll("[data-analisis-tab]"),
    analisisImportar: document.getElementById("analisis-importar"),
    analisisAnalizar: document.getElementById("analisis-analizar"),
    analisisHistorica: document.getElementById("analisis-historica"),
    importDate: document.getElementById("import-date"),
    importFile: document.getElementById("import-file"),
    importFileName: document.getElementById("import-file-name"),
    importPreview: document.getElementById("import-preview"),
    analyzeDateStart: document.getElementById("analyze-date-start"),
    analyzeDateEnd: document.getElementById("analyze-date-end"),
    btnAnalyzeIdeal: document.getElementById("btn-analyze-ideal"),
    analysisResults: document.getElementById("analysis-results"),
    historyChart: document.getElementById("history-chart"),

    // Monitor View
    viewMonitor: document.getElementById("view-monitor"),
    monitorCategoryTabs: document.getElementById("monitor-category-tabs"),
    monitorSearch: document.getElementById("monitor-search"),
    monitorListContainer: document.getElementById("monitor-list-container"),
    monitorCountTotal: document.getElementById("monitor-count-total"),

    // Productos View
    viewProductos: document.getElementById("view-productos"),
    productosCategoryTabs: document.getElementById("productos-category-tabs"),
    productosSearch: document.getElementById("productos-search"),
    productosListContainer: document.getElementById("productos-list-container"),

    // Solicitudes View (SKU change requests)
    viewSolicitudes: document.getElementById("view-solicitudes"),
    solicitudesListContainer: document.getElementById("solicitudes-list-container"),
    btnRefreshRequests: document.getElementById("btn-refresh-requests"),

    // Reposición View
    viewReposicion: document.getElementById("view-reposicion"),
    repoTabs: document.querySelectorAll("[data-repo-tab]"),
    repoCount: document.getElementById("repo-count"),

    // Repo sub-views
    repoPreAprobacion: document.getElementById("repo-pre-aprobacion"),
    repoPendientes: document.getElementById("repo-pendientes"),
    repoSinAsignar: document.getElementById("repo-sin-asignar"),
    repoHistorial: document.getElementById("repo-historial"),

    // Pre-aprobación elements
    preSubtabs: document.querySelectorAll("[data-pre-subtab]"),
    subviewPorItem: document.getElementById("subview-por-item"),
    subviewPorProveedor: document.getElementById("subview-por-proveedor"),
    preapprovalCount: document.getElementById("preapproval-count"),
    preapprovalTotalBudget: document.getElementById("preapproval-total-budget"),
    preapprovalBulkActions: document.getElementById("preapproval-bulk-actions"),
    preapprovalSelectionInfo: document.getElementById("preapproval-selection-info"),
    btnPreapproveSelected: document.getElementById("btn-preapprove-selected"),
    btnPrerejectSelected: document.getElementById("btn-prereject-selected"),

    // Orders container
    repoOrdersContainer: document.getElementById("repo-orders-container"),

    // Unassigned
    unassignedStats: document.getElementById("unassigned-stats"),
    unassignedContainer: document.getElementById("unassigned-container"),
    unassignedTotalBudget: document.getElementById("unassigned-total-budget"),

    // Panel
    panelTitle: document.getElementById("panel-title"),
    panelContent: document.getElementById("panel-content"),
    panelActions: document.getElementById("panel-actions"),
    panelFooter: document.getElementById("panel-footer"),
    btnCancel: document.getElementById("btn-cancel"),

    // Modal Pre-Reject
    modalPrereject: document.getElementById("modal-prereject"),
    formPrereject: document.getElementById("form-prereject"),
    prerejectCount: document.getElementById("prereject-count"),
    prerejectReason: document.getElementById("prereject-reason"),
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(ui.moduleContent)) return;

  // ============================================
  // 3. STATE
  // ============================================
  const PAGE_KEY = "admin-inventario";
  const savedState = window.NavState ? window.NavState.restore(PAGE_KEY) : null;

  const state = {
    activeMainTab: savedState?.activeMainTab || "analisis",
    firstLoad: true,

    // Análisis state
    analisis: {
      activeSubTab: savedState?.analisis?.activeSubTab || "importar",
      importData: [],
      importFileName: "",
      chartInstance: null,
    },

    // Monitor state
    monitor: {
      categories: [],
      rows: [],
      activeCategoryId: savedState?.monitor?.activeCategoryId || "",
      searchTerm: savedState?.monitor?.searchTerm || "",
    },

    // Productos state
    productos: {
      categories: [],
      providers: [],
      skus: [],
      activeCategoryId: savedState?.productos?.activeCategoryId || null,
      searchTerm: savedState?.productos?.searchTerm || "",
      editingId: null,
    },

    // Solicitudes state (SKU change requests)
    solicitudes: {
      requests: [],
    },

    // Reposición state
    reposicion: {
      activeSubTab: savedState?.reposicion?.activeSubTab || "pre-aprobacion",
      activePreSubTab: savedState?.reposicion?.activePreSubTab || "item",
      preapprovalItems: [],
      orders: [],
      selectedItemIds: new Set(),
      pendingRejectIds: [],
    },
  };

  // Restore search inputs
  if (state.monitor.searchTerm && ui.monitorSearch) {
    ui.monitorSearch.value = state.monitor.searchTerm;
  }
  if (state.productos.searchTerm && ui.productosSearch) {
    ui.productosSearch.value = state.productos.searchTerm;
  }

  // Save state on unload
  window.addEventListener("beforeunload", () => {
    if (window.NavState) {
      window.NavState.save(PAGE_KEY, {
        activeMainTab: state.activeMainTab,
        analisis: {
          activeSubTab: state.analisis.activeSubTab,
        },
        monitor: {
          activeCategoryId: state.monitor.activeCategoryId,
          searchTerm: state.monitor.searchTerm,
        },
        productos: {
          activeCategoryId: state.productos.activeCategoryId,
          searchTerm: state.productos.searchTerm,
        },
        reposicion: {
          activeSubTab: state.reposicion.activeSubTab,
          activePreSubTab: state.reposicion.activePreSubTab,
        },
      });
    }
  });

  // ============================================
  // 4. PANEL INTEGRATION
  // ============================================
  const panelCtrl = window.initSlidePanel({
    onOpen: () => {},
    onClose: () => {
      state.productos.editingId = null;
      if (ui.panelContent) ui.panelContent.innerHTML = "";
      if (ui.panelActions) ui.panelActions.innerHTML = "";
    },
  });

  // ============================================
  // 5. UTILITIES
  // ============================================
  function setPageState(pageState) {
    if (!window.Utils?.setPageState) return;
    const uiRefs = {
      loadingState: ui.loadingState,
      moduleContent: ui.moduleContent,
      emptyState: ui.emptyState,
    };
    if (pageState === "loading") {
      window.Utils.setPageState(uiRefs, { loading: true, empty: false });
    } else if (pageState === "empty") {
      window.Utils.setPageState(uiRefs, { loading: false, empty: true });
    } else {
      window.Utils.setPageState(uiRefs, { loading: false, empty: false });
    }
  }

  const numberOrNull = window.Utils?.numberOrNull || ((v) => {
    if (v === null || v === undefined) return null;
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  });

  const requestTypeLabels = {
    create: "Agregar SKU",
    update: "Editar SKU",
    deactivate: "Quitar SKU",
    price_update: "Modificar precio",
    pack_update: "Modificar pack",
    supplier_update: "Cambiar proveedor favorito",
  };

  // ============================================
  // 6. MAIN TAB SWITCHING
  // ============================================
  function switchMainTab(tabId) {
    state.activeMainTab = tabId;

    // Update tab UI
    ui.mainTabs.forEach((t) => {
      t.classList.toggle("active", t.dataset.mainTab === tabId);
    });

    // Hide all views
    [ui.viewAnalisis, ui.viewMonitor, ui.viewProductos, ui.viewSolicitudes, ui.viewReposicion].forEach(
      (v) => v?.classList.add("hidden")
    );

    // Show btn-new only for productos
    ui.btnNew?.classList.toggle("hidden", tabId !== "productos");

    // Show relevant view and load data
    if (tabId === "analisis") {
      ui.viewAnalisis?.classList.remove("hidden");
      switchAnalisisTab(state.analisis.activeSubTab);
    } else if (tabId === "monitor") {
      ui.viewMonitor?.classList.remove("hidden");
      loadMonitorData();
    } else if (tabId === "productos") {
      ui.viewProductos?.classList.remove("hidden");
      loadProductosData();
    } else if (tabId === "solicitudes") {
      ui.viewSolicitudes?.classList.remove("hidden");
      loadSolicitudesData();
    } else if (tabId === "reposicion") {
      ui.viewReposicion?.classList.remove("hidden");
      switchRepoTab(state.reposicion.activeSubTab);
    }


  // ============================================
  // 6.5 ANÁLISIS TAB (from operativo-analisis)
  // ============================================
  function switchAnalisisTab(subtabId) {
    state.analisis.activeSubTab = subtabId;
    ui.analisisTabs.forEach((t) => t.classList.toggle("active", t.dataset.analisisTab === subtabId));

    [ui.analisisImportar, ui.analisisAnalizar, ui.analisisHistorica].forEach((v) => v?.classList.add("hidden"));

    if (subtabId === "importar") {
      ui.analisisImportar?.classList.remove("hidden");
    } else if (subtabId === "analizar") {
      ui.analisisAnalizar?.classList.remove("hidden");
    } else if (subtabId === "historica") {
      ui.analisisHistorica?.classList.remove("hidden");
      loadHistoryChart();
    }
  }

  function getThemeColor(varName, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
  }

  function normalizeString(value) {
    return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
  }

  function parseQuantity(value) {
    if (value === null || value === undefined || value === "") return 0;
    const raw = String(value).trim();
    if (!raw) return 0;
    const hasComma = raw.includes(",");
    const hasDot = raw.includes(".");
    let normalized = raw;
    if (hasComma && hasDot) {
      normalized = raw.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = raw.replace(",", ".");
    }
    const clean = normalized.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(clean);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    state.analisis.importFileName = file.name || "";

    if (ui.importFileName) {
      ui.importFileName.textContent = state.analisis.importFileName ? `Archivo: ${state.analisis.importFileName}` : "";
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      let headerRowIndex = 0;
      let foundHeader = false;

      for (let i = 0; i < Math.min(20, aoa.length); i++) {
        const row = aoa[i];
        const rowStr = row.join(" ").toLowerCase();
        if (rowStr.includes("producto") || rowStr.includes("nombre") || rowStr.includes("item") || rowStr.includes("articulo")) {
          headerRowIndex = i;
          foundHeader = true;
          break;
        }
      }

      let headerOverride = null;
      if (!foundHeader) {
        const firstRow = aoa[headerRowIndex] || [];
        headerOverride = [];
        if (firstRow.length > 0) {
          headerOverride[0] = "producto";
          if (firstRow.length > 1) headerOverride[1] = "cantidad";
          for (let i = 2; i < firstRow.length; i++) {
            headerOverride[i] = `col_${i + 1}`;
          }
        }
      }

      const json = XLSX.utils.sheet_to_json(worksheet, { range: headerRowIndex, header: headerOverride || undefined, defval: "" });
      processImportData(json, foundHeader);
    };
    reader.readAsArrayBuffer(file);
  }

  async function processImportData(json, foundHeader) {
    if (ui.importPreview) ui.importPreview.innerHTML = `<p class="text-muted">Procesando...</p>`;

    const { data: skus, error: skuError } = await window.sb.from("master_sku").select("id, nombre, external_id");
    if (skuError) {
      if (ui.importPreview) ui.importPreview.innerHTML = `<p class="text-danger">Error al cargar SKUs: ${skuError.message}</p>`;
      return;
    }

    if (!json || json.length === 0) {
      if (ui.importPreview) ui.importPreview.innerHTML = `<p class="text-danger">No se encontraron filas en el archivo.</p>`;
      return;
    }

    state.analisis.importData = [];
    let matchedCount = 0;
    let unmatchedCount = 0;

    json.forEach((row) => {
      const keys = Object.keys(row);
      const productKey = keys.find((k) =>
        k.toLowerCase().includes("articulo") || k.toLowerCase().includes("producto") ||
        k.toLowerCase().includes("nombre") || k.toLowerCase().includes("item") || k.toLowerCase().includes("descrip")
      );
      const qtyKey = keys.find((k) =>
        k.toLowerCase() === "cantidad" || k.toLowerCase() === "cant" ||
        k.toLowerCase().includes("consumo") || k.toLowerCase().includes("final") || k.toLowerCase().includes("total")
      );

      const productName = productKey ? row[productKey] : null;
      const qty = qtyKey ? row[qtyKey] : 0;

      if (productName && String(productName).trim().length > 0) {
        const cleanName = normalizeString(productName);
        let match = skus.find((s) => {
          const dbName = normalizeString(s.nombre);
          const dbExtId = normalizeString(s.external_id);
          return dbName === cleanName || (dbExtId && dbExtId === cleanName);
        });

        state.analisis.importData.push({
          excelName: productName,
          skuId: match ? match.id : null,
          skuName: match ? match.nombre : "NO ENCONTRADO",
          quantity: parseQuantity(qty),
        });

        if (match) matchedCount++;
        else unmatchedCount++;
      }
    });

    if (matchedCount === 0) {
      if (ui.importPreview) ui.importPreview.innerHTML = `
        <h4>No se encontraron coincidencias (0 matches)</h4>
        <p class="text-muted">${foundHeader ? "Revisa que las columnas y nombres coincidan con los SKUs." : "No se detectó cabecera clara."}</p>
        <p class="text-sm">Procesados: ${state.analisis.importData.length} items</p>`;
      return;
    }

    renderImportPreview(matchedCount, unmatchedCount, foundHeader);
  }

  function renderImportPreview(matched, unmatched, foundHeader) {
    if (!ui.importPreview) return;

    const rows = state.analisis.importData.map((item) => `
      <tr class="${!item.skuId ? "row-warning" : ""}">
        <td>${window.Utils.escapeHtml(item.excelName)}</td>
        <td>${window.Utils.escapeHtml(item.skuName)}</td>
        <td>${item.quantity}</td>
      </tr>
    `).join("");

    ui.importPreview.innerHTML = `
      <h4>Resultados del mapeo</h4>
      <div class="analysis-summary" style="display: flex; gap: 24px; margin-bottom: 16px;">
        <div><span class="text-xs muted">Total</span><br><strong>${state.analisis.importData.length}</strong></div>
        <div><span class="text-xs muted">Encontrados</span><br><strong class="text-success">${matched}</strong></div>
        <div><span class="text-xs muted">No encontrados</span><br><strong class="text-error">${unmatched}</strong></div>
      </div>
      ${!foundHeader ? `<p class="text-muted text-sm">No se detectó cabecera clara. Se asumió: Col 1 = Producto, Col 2 = Cantidad.</p>` : ""}
      <div class="table-scroll" style="max-height: 300px; overflow-y: auto;">
        <table class="table table-compact">
          <thead><tr><th>Excel</th><th>Sistema</th><th>Cant</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="form-actions mt-4">
        <button class="btn-primary" id="btn-confirm-import" ${matched === 0 ? "disabled" : ""}>Confirmar importación</button>
      </div>`;

    document.getElementById("btn-confirm-import")?.addEventListener("click", confirmImport);
  }

  async function confirmImport() {
    const dateVal = ui.importDate?.value;
    if (!dateVal) {
      window.Toast.warning("Por favor seleccione una fecha operativa.");
      return;
    }
    if (state.analisis.importData.length === 0) return;

    const { data: report, error: repError } = await window.sb
      .from("consumption_reports")
      .insert({ operational_date: dateVal, file_name: state.analisis.importFileName || "Import " + new Date().toLocaleDateString() })
      .select()
      .single();

    if (repError) {
      if (repError.code === "23505") {
        window.Toast.error("Ya existe un reporte para esta fecha.");
      } else {
        window.Toast.error("Error al crear reporte: " + repError.message);
      }
      return;
    }

    const details = state.analisis.importData.filter((d) => d.skuId).map((d) => ({
      report_id: report.id,
      sku_id: d.skuId,
      quantity: d.quantity,
    }));

    if (details.length === 0) {
      window.Toast.info("No hay filas válidas para importar.");
      return;
    }

    const { error: detError } = await window.sb.from("consumption_details").insert(details);
    if (detError) {
      window.Toast.warning("Reporte creado pero hubo error en detalles: " + detError.message);
    } else {
      window.Toast.success("Importación exitosa.");
      state.analisis.importData = [];
      if (ui.importPreview) ui.importPreview.innerHTML = `<div class="empty-state">Seleccione un archivo para comenzar.</div>`;
      if (ui.importFile) ui.importFile.value = "";
      if (ui.importFileName) ui.importFileName.textContent = "";
    }
  }

  async function analyzeIdealStock() {
    const start = ui.analyzeDateStart?.value;
    const end = ui.analyzeDateEnd?.value;

    if (!start || !end) {
      window.Toast.warning("Seleccione rango de fechas.");
      return;
    }

    if (ui.analysisResults) ui.analysisResults.innerHTML = `<p class="text-muted">Calculando...</p>`;

    const { data: reports, error: reportError } = await window.sb
      .from("consumption_reports")
      .select("id")
      .gte("operational_date", start)
      .lte("operational_date", end);

    if (reportError) {
      if (ui.analysisResults) ui.analysisResults.innerHTML = `<p class="text-danger">Error: ${reportError.message}</p>`;
      return;
    }

    if (!reports || reports.length === 0) {
      if (ui.analysisResults) ui.analysisResults.innerHTML = `<p class="text-muted">No hay reportes en este rango.</p>`;
      return;
    }

    const reportIds = reports.map((r) => r.id);

    const { data: details, error: detailError } = await window.sb
      .from("consumption_details")
      .select("sku_id, quantity, sku:master_sku(nombre)")
      .in("report_id", reportIds);

    if (detailError) {
      if (ui.analysisResults) ui.analysisResults.innerHTML = `<p class="text-danger">Error: ${detailError.message}</p>`;
      return;
    }

    if (!details || details.length === 0) {
      if (ui.analysisResults) ui.analysisResults.innerHTML = `<p class="text-muted">No hay detalles en este rango.</p>`;
      return;
    }

    const skuMap = {};
    details.forEach((d) => {
      if (!skuMap[d.sku_id]) {
        skuMap[d.sku_id] = { name: d.sku?.nombre || "Unknown", totalQty: 0 };
      }
      skuMap[d.sku_id].totalQty += d.quantity;
    });

    const daysCount = reportIds.length;

    const rows = Object.entries(skuMap).map(([id, data]) => {
      const avg = data.totalQty / daysCount;
      const ideal500 = Math.ceil(avg);
      const ideal900 = Math.ceil(avg * (900 / 500));
      return `<tr>
        <td>${window.Utils.escapeHtml(data.name)}</td>
        <td class="text-right">${avg.toFixed(2)}</td>
        <td class="text-right cell-strong">${ideal500}</td>
        <td class="text-right cell-strong">${ideal900}</td>
      </tr>`;
    }).join("");

    ui.analysisResults.innerHTML = `
      <h4>Resultados del análisis</h4>
      <div class="analysis-summary" style="display: flex; gap: 24px; margin-bottom: 16px;">
        <div><span class="text-xs muted">Días analizados</span><br><strong>${daysCount}</strong></div>
        <div><span class="text-xs muted">Productos</span><br><strong>${Object.keys(skuMap).length}</strong></div>
      </div>
      <div class="table-scroll">
        <table class="table table-compact">
          <thead><tr><th>Producto</th><th class="text-right">Consumo Prom.</th><th class="text-right">Ideal 500</th><th class="text-right">Ideal 900</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  async function loadHistoryChart() {
    if (!ui.historyChart) return;
    const ctx = ui.historyChart.getContext("2d");

    if (state.analisis.chartInstance) state.analisis.chartInstance.destroy();

    const { data: reports, error: reportError } = await window.sb
      .from("consumption_reports")
      .select("operational_date, id")
      .order("operational_date", { ascending: false })
      .limit(30);

    if (reportError || !reports || reports.length === 0) return;

    const orderedReports = reports.slice().reverse();
    const reportIds = orderedReports.map((r) => r.id);
    const dates = orderedReports.map((r) => r.operational_date);

    const { data: details, error: detailsError } = await window.sb
      .from("consumption_details")
      .select("report_id, sku_id, quantity, sku:master_sku(nombre)")
      .in("report_id", reportIds);

    if (detailsError || !details || details.length === 0) return;

    const skuTotals = {};
    details.forEach((d) => {
      if (!skuTotals[d.sku_id]) {
        skuTotals[d.sku_id] = { name: d.sku?.nombre || "Desconocido", total: 0, id: d.sku_id };
      }
      skuTotals[d.sku_id].total += d.quantity;
    });

    const top5 = Object.values(skuTotals).sort((a, b) => b.total - a.total).slice(0, 5);

    const themeColors = [
      getThemeColor("--color-danger", "#ff3b30"),
      getThemeColor("--color-warning", "#ff9500"),
      getThemeColor("--color-success", "#34c759"),
      getThemeColor("--color-info", "#007aff"),
      getThemeColor("--color-primary", "#5856d6"),
    ];

    const datasets = top5.map((sku, index) => {
      const data = dates.map((date) => {
        const rep = orderedReports.find((r) => r.operational_date === date);
        if (!rep) return 0;
        const det = details.find((d) => d.report_id === rep.id && d.sku_id === sku.id);
        return det ? det.quantity : 0;
      });

      const color = themeColors[index % themeColors.length];
      return { label: sku.name, data, borderColor: color, backgroundColor: color, tension: 0.1, fill: false };
    });

    if (datasets.length === 0) datasets.push({ label: "Sin Datos", data: [] });

    const textColor = getThemeColor("--color-text-muted", "#a0a0a0");
    const gridColor = getThemeColor("--color-border", "rgba(255,255,255,0.06)");

    state.analisis.chartInstance = new Chart(ctx, {
      type: "line",
      data: { labels: dates, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          title: { display: true, text: "Top 5 Productos Más Consumidos (Últimos 30 días)", color: getThemeColor("--color-text-main", "#e0e0e0") },
          legend: { position: "top", labels: { usePointStyle: true, color: textColor } },
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } },
        },
      },
    });
  }
}

  // ============================================
  // 7. MONITOR TAB (from admin-stock)
  // ============================================
  async function loadMonitorData() {
    if (state.firstLoad) {
      setPageState("loading");
    }

    try {
      const [catResult, stockResult, skuResult] = await Promise.all([
        window.sb
          .from("master_categories")
          .select("id, nombre")
          .eq("active", true)
          .order("nombre"),
        window.sb.from("vw_stock_global").select("*").order("sku_nombre"),
        window.sb.from("master_sku").select("id, costo, categoria_id"),
      ]);

      if (stockResult.error) throw stockResult.error;

      state.monitor.categories = catResult.data || [];

      const costMap = new Map();
      const catMap = new Map();
      (skuResult.data || []).forEach((c) => {
        costMap.set(c.id, Number(c.costo) || 0);
        catMap.set(c.id, c.categoria_id);
      });

      state.monitor.rows = (stockResult.data || []).map((r) => {
        const skuId = r.sku_id || r.id;
        const stockActual = Number(r.stock_actual) || 0;
        const cost = costMap.get(skuId) || 0;
        const catId = r.categoria_id || catMap.get(skuId);

        return {
          id: skuId,
          master_sku: { id: skuId, nombre: r.sku_nombre, categoria_id: catId },
          stock_actual: stockActual,
          requerido: Number(r.requerido) || 0,
          valorizado: stockActual * cost,
          estado: r.estado,
          active: r.activo,
        };
      });

      renderMonitorCategoryTabs();
      renderMonitorList();
    } catch (err) {
      console.error("Error loading monitor:", err);
      window.Toast?.error("Error cargando inventario");
    } finally {
      setPageState("ready");
      state.firstLoad = false;
    }
  }

  function renderMonitorCategoryTabs() {
    if (!ui.monitorCategoryTabs) return;

    const total = state.monitor.rows.length;
    const catCounts = {};
    state.monitor.rows.forEach((r) => {
      const catId = r.master_sku?.categoria_id || "null";
      catCounts[catId] = (catCounts[catId] || 0) + 1;
    });

    const allActive = state.monitor.activeCategoryId === "" ? "active" : "";
    let html = `<button class="status-pill status-neutral topbar-pill topbar-pill-quiet filter-pill ${allActive}" data-cat-id="">
      Todos <span class="pill-count">${total}</span>
    </button>`;

    html += state.monitor.categories.map((cat) => {
      const active = state.monitor.activeCategoryId === String(cat.id) ? "active" : "";
      const count = catCounts[cat.id] || 0;
      return `<button class="status-pill status-neutral topbar-pill topbar-pill-quiet filter-pill ${active}" data-cat-id="${cat.id}">
        ${window.Utils.escapeHtml(cat.nombre)} <span class="pill-count">${count}</span>
      </button>`;
    }).join("");

    ui.monitorCategoryTabs.innerHTML = html;
    if (ui.monitorCountTotal) ui.monitorCountTotal.textContent = total;
  }

  function getMonitorFilteredData() {
    const term = state.monitor.searchTerm.toLowerCase().trim();
    return state.monitor.rows.filter((r) => {
      const sku = r.master_sku || {};
      const matchCat = state.monitor.activeCategoryId === "" ||
        String(sku.categoria_id) === state.monitor.activeCategoryId;
      const matchSearch = !term || (sku.nombre || "").toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }

  function renderMonitorList() {
    if (!ui.monitorListContainer) return;

    const filtered = getMonitorFilteredData();

    if (filtered.length === 0) {
      ui.monitorListContainer.innerHTML = `<div class="empty-state">Sin resultados para los filtros actuales.</div>`;
      return;
    }

    const rowsHtml = filtered.map((item) => {
      const sku = item.master_sku || {};
      const valFormatted = window.Utils.formatARS(item.valorizado);
      const estadoNorm = (item.estado || "").toString().toLowerCase();
      let statusClass = "status-success";
      if (estadoNorm.includes("crit")) statusClass = "status-error";
      else if (estadoNorm.includes("bajo")) statusClass = "status-warning";
      const inactiveClass = !item.active ? "is-inactive" : "";

      return `<tr class="table-row ${inactiveClass}">
        <td class="table-cell cell-pad cell-strong font-medium">${window.Utils.escapeHtml(sku.nombre || "SKU sin nombre")}</td>
        <td class="table-cell cell-pad text-right muted">${item.requerido}</td>
        <td class="table-cell cell-pad text-right cell-stronger">${item.stock_actual}</td>
        <td class="table-cell cell-pad text-right muted text-xs">${valFormatted}</td>
        <td class="table-cell cell-pad text-center"><span class="status-pill ${statusClass}">${item.estado}</span></td>
        <td class="table-cell cell-pad text-center">
          <label class="switch switch-sm">
            <input type="checkbox" class="toggle-active-monitor" data-id="${item.id}" ${item.active ? "checked" : ""}>
            <span class="slider round"></span>
          </label>
        </td>
        <td class="table-cell cell-pad text-right">
          <button class="footer-link btn-view-monitor btn-ghost btn-sm" data-id="${item.id}">Ver</button>
        </td>
      </tr>`;
    }).join("");

    ui.monitorListContainer.innerHTML = `
      <div class="table-scroll">
        <table class="table table-sticky">
          <thead>
            <tr class="table-head">
              <th class="table-cell is-header cell-pad">SKU</th>
              <th class="table-cell is-header cell-pad text-right">REQUERIDO</th>
              <th class="table-cell is-header cell-pad text-right">ACTUAL</th>
              <th class="table-cell is-header cell-pad text-right">VALORIZADO</th>
              <th class="table-cell is-header cell-pad text-center">ESTADO</th>
              <th class="table-cell is-header cell-pad text-center">ACTIVO</th>
              <th class="table-cell is-header cell-pad text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
  }

  function openMonitorDetail(item) {
    if (ui.panelTitle) ui.panelTitle.textContent = item.master_sku?.nombre || "Detalle";
    ui.panelContent.innerHTML = `
      <div class="p-4">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Producto</span>
            <span class="detail-value">${window.Utils.escapeHtml(item.master_sku?.nombre)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Stock Actual</span>
            <span class="detail-value cell-stronger">${item.stock_actual}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Ideal Requerido</span>
            <span class="detail-value muted">${item.requerido}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Valorizado</span>
            <span class="detail-value font-mono">${window.Utils.formatARS(item.valorizado)}</span>
          </div>
        </div>
        <div class="state-block mt-4 mb-2">
          <p class="text-xs muted">Historial y ajustes avanzados próximamente.</p>
        </div>
      </div>`;
    ui.panelActions.innerHTML = `<button class="btn-primary" id="btn-save-monitor">Guardar Movimiento</button>`;
    panelCtrl.open();

    document.getElementById("btn-save-monitor")?.addEventListener("click", () => {
      window.Toast.info("Funcionalidad en desarrollo");
      panelCtrl.close();
    });
  }

  async function toggleMonitorActive(id, isActive) {
    try {
      const { error } = await window.sb
        .from("master_sku")
        .update({ active: isActive })
        .eq("id", id);
      if (error) throw error;

      const row = state.monitor.rows.find((r) => String(r.id) === String(id));
      if (row) {
        row.active = isActive;
        renderMonitorList();
      }
      window.Toast.success(`Item ${isActive ? "activado" : "desactivado"}`);
    } catch (err) {
      console.error(err);
      window.Toast.error("Error al actualizar estado");
      loadMonitorData();
    }
  }

  // ============================================
  // 8. PRODUCTOS TAB (from admin-master-sku)
  // ============================================
  async function loadProductosData() {
    if (state.firstLoad) setPageState("loading");

    try {
      // Load options first if not loaded
      if (state.productos.categories.length === 0) {
        const [{ data: catData }, { data: provData }] = await Promise.all([
          window.sb.from("master_categories").select("id, nombre").eq("active", true).order("nombre"),
          window.sb.from("master_proveedores").select("id, nombre_fantasia").eq("active", true).order("nombre_fantasia"),
        ]);
        state.productos.categories = catData || [];
        state.productos.providers = provData || [];
        renderProductosCategoryTabs();
      }

      let query = window.sb
        .from("master_sku")
        .select(`id, nombre, active, pack_qty, ml_por_unidad, costo, costo_pack, categoria_id, proveedor_default_id, external_id, master_categories (id, nombre), master_proveedores (id, nombre_fantasia)`)
        .order("nombre");

      if (state.productos.activeCategoryId) {
        query = query.eq("categoria_id", state.productos.activeCategoryId);
      }
      if (state.productos.searchTerm) {
        query = query.ilike("nombre", `%${state.productos.searchTerm}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      state.productos.skus = data || [];
      renderProductosList();
    } catch (err) {
      console.error("Error loading productos:", err);
      window.Toast?.error("Error cargando productos");
    } finally {
      setPageState("ready");
      state.firstLoad = false;
    }
  }

  function renderProductosCategoryTabs() {
    if (!ui.productosCategoryTabs) return;

    const baseClass = "status-pill status-neutral topbar-pill topbar-pill-quiet filter-pill";
    let html = `<button class="${baseClass} ${!state.productos.activeCategoryId ? "active" : ""}" data-prod-cat-id="">Todo</button>`;

    html += state.productos.categories.map((cat) => {
      const isActive = String(cat.id) === String(state.productos.activeCategoryId);
      return `<button class="${baseClass} ${isActive ? "active" : ""}" data-prod-cat-id="${cat.id}">${window.Utils.escapeHtml(cat.nombre)}</button>`;
    }).join("");

    ui.productosCategoryTabs.innerHTML = html;
  }

  function renderProductosList() {
    if (!ui.productosListContainer) return;

    const data = state.productos.skus;
    if (!data || data.length === 0) {
      ui.productosListContainer.innerHTML = `<div class="empty-state">Sin productos.</div>`;
      return;
    }

    const rows = data.map((item) => {
      const statusClass = item.active ? "staff-status-accepted" : "staff-status-rejected";
      const statusText = item.active ? "Activo" : "Inactivo";
      const provName = item.master_proveedores?.nombre_fantasia || "-";
      const packQty = item.pack_qty != null ? item.pack_qty : "-";
      const costo = item.costo != null ? window.Utils.formatARS(item.costo) : "-";
      const costoPack = item.costo_pack != null ? window.Utils.formatARS(item.costo_pack) : "-";
      const ml = item.ml_por_unidad != null ? `${item.ml_por_unidad} ml` : "-";

      return `<tr class="table-row">
        <td class="table-cell cell-pad cell-strong">${window.Utils.escapeHtml(item.nombre)}</td>
        <td class="table-cell cell-pad muted">${ml}</td>
        <td class="table-cell cell-pad">${costo}</td>
        <td class="table-cell cell-pad">${packQty}</td>
        <td class="table-cell cell-pad">${costoPack}</td>
        <td class="table-cell cell-pad muted">${provName}</td>
        <td class="table-cell cell-pad"><span class="staff-status badge ${statusClass}">${statusText}</span></td>
        <td class="table-cell cell-pad">
          <button class="footer-link btn-edit-sku btn-ghost btn-sm" data-id="${item.id}">Editar</button>
        </td>
      </tr>`;
    }).join("");

    ui.productosListContainer.innerHTML = `
      <div class="table-scroll">
        <table class="table table-sticky">
          <thead>
            <tr class="table-head">
              <th class="table-cell is-header cell-pad">Nombre</th>
              <th class="table-cell is-header cell-pad">ML</th>
              <th class="table-cell is-header cell-pad">Costo</th>
              <th class="table-cell is-header cell-pad">Pack</th>
              <th class="table-cell is-header cell-pad">Costo Pack</th>
              <th class="table-cell is-header cell-pad">Proveedor</th>
              <th class="table-cell is-header cell-pad">Estado</th>
              <th class="table-cell is-header cell-pad">Editar</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function openSkuForm(item = null) {
    state.productos.editingId = item?.id || null;
    const isEdit = !!item;

    if (ui.panelTitle) ui.panelTitle.textContent = isEdit ? "Editar SKU" : "Nuevo SKU";

    const catOptions = state.productos.categories.map((c) =>
      `<option value="${c.id}" ${item?.categoria_id == c.id ? "selected" : ""}>${window.Utils.escapeHtml(c.nombre)}</option>`
    ).join("");

    const provOptions = state.productos.providers.map((p) =>
      `<option value="${p.id}" ${item?.proveedor_default_id == p.id ? "selected" : ""}>${window.Utils.escapeHtml(p.nombre_fantasia)}</option>`
    ).join("");

    ui.panelContent.innerHTML = `
      <div class="form-group">
        <label for="sku-nombre" class="form-label">Nombre *</label>
        <input type="text" id="sku-nombre" class="input" placeholder="Ej: Red Bull Lata 250ml" value="${item?.nombre || ""}" required>
      </div>
      <div class="form-group">
        <label for="sku-categoria" class="form-label">Categoría *</label>
        <select id="sku-categoria" class="input">
          <option value="">Seleccionar categoría</option>
          ${catOptions}
        </select>
      </div>
      <div class="form-group">
        <label for="sku-proveedor" class="form-label">Proveedor</label>
        <select id="sku-proveedor" class="input">
          <option value="">Seleccionar proveedor</option>
          ${provOptions}
        </select>
      </div>
      <div class="form-group">
        <label for="sku-pack" class="form-label">Cantidad por pack</label>
        <input type="number" id="sku-pack" class="input" placeholder="Ej: 24" min="0" step="1" value="${item?.pack_qty || ""}">
      </div>
      <div class="form-group">
        <label for="sku-ml" class="form-label">ML por unidad</label>
        <input type="number" id="sku-ml" class="input" placeholder="Ej: 330" min="0" step="0.01" value="${item?.ml_por_unidad || ""}">
      </div>
      <div class="form-group">
        <label for="sku-costo" class="form-label">Costo unitario</label>
        <input type="number" id="sku-costo" class="input" placeholder="Ej: 1200.50" min="0" step="0.01" value="${item?.costo || ""}">
      </div>
      <div class="form-group">
        <label for="sku-costo-pack" class="form-label">Costo por pack</label>
        <input type="number" id="sku-costo-pack" class="input" placeholder="Ej: 28800" min="0" step="0.01" value="${item?.costo_pack || ""}">
      </div>
      <div class="form-group">
        <label for="sku-external-id" class="form-label">ID externo</label>
        <input type="text" id="sku-external-id" class="input" placeholder="Código de integración / POS" value="${item?.external_id || ""}">
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <label class="checkbox-row">
          <input type="checkbox" id="sku-active" ${item?.active !== false ? "checked" : ""}>
          <span>Activo</span>
        </label>
      </div>`;

    ui.panelActions.innerHTML = `<button class="btn-primary" id="btn-save-sku">${isEdit ? "Actualizar" : "Guardar"}</button>`;
    panelCtrl.open();

    document.getElementById("btn-save-sku")?.addEventListener("click", saveSku);
  }

  async function saveSku() {
    const nombre = document.getElementById("sku-nombre")?.value.trim();
    const categoria_id = document.getElementById("sku-categoria")?.value;

    if (!nombre) {
      window.Toast.error("El nombre es obligatorio.");
      return;
    }
    if (!categoria_id) {
      window.Toast.error("La categoría es obligatoria.");
      return;
    }

    const payload = {
      nombre,
      categoria_id: categoria_id || null,
      proveedor_default_id: document.getElementById("sku-proveedor")?.value || null,
      pack_qty: numberOrNull(document.getElementById("sku-pack")?.value),
      ml_por_unidad: numberOrNull(document.getElementById("sku-ml")?.value),
      costo: numberOrNull(document.getElementById("sku-costo")?.value),
      costo_pack: numberOrNull(document.getElementById("sku-costo-pack")?.value),
      external_id: document.getElementById("sku-external-id")?.value.trim() || null,
      active: document.getElementById("sku-active")?.checked ?? true,
    };

    try {
      if (state.productos.editingId) {
        const { error } = await window.sb.from("master_sku").update(payload).eq("id", state.productos.editingId);
        if (error) throw error;
        window.Toast.success("SKU actualizado");
      } else {
        const { error } = await window.sb.from("master_sku").insert([payload]);
        if (error) throw error;
        window.Toast.success("SKU creado");
      }
      panelCtrl.close();
      loadProductosData();
    } catch (err) {
      console.error(err);
      window.Toast.error("Error al guardar: " + err.message);
    }
  }

  // ============================================
  // 9. SOLICITUDES TAB (SKU change requests)
  // ============================================
  async function loadSolicitudesData() {
    if (!ui.solicitudesListContainer) return;
    ui.solicitudesListContainer.innerHTML = `<div class="empty-state">Cargando solicitudes...</div>`;

    try {
      const { data, error } = await window.sb
        .from("sku_change_requests")
        .select("id, created_at, status, request_type, sku_id, sku_nombre, justification, payload, requested_by")
        .order("created_at", { ascending: false });

      if (error) throw error;
      state.solicitudes.requests = data || [];
      renderSolicitudesList();
    } catch (err) {
      ui.solicitudesListContainer.innerHTML = `<div class="empty-state accent">Error: ${err.message}</div>`;
    }
  }

  function parsePayload(payload) {
    if (!payload) return {};
    if (typeof payload === "string") {
      try { return JSON.parse(payload); } catch { return {}; }
    }
    return payload;
  }

  function formatChangeSummary(payload) {
    const data = parsePayload(payload);
    const parts = [];
    if (data.nombre) parts.push(`Nombre: ${data.nombre}`);
    if (data.ml_por_unidad != null) parts.push(`ML: ${data.ml_por_unidad}`);
    if (data.pack_qty != null) parts.push(`Pack: ${data.pack_qty}`);
    if (data.costo != null) parts.push(`Costo: ${window.Utils.formatARS(data.costo)}`);
    if (data.costo_pack != null) parts.push(`Costo pack: ${window.Utils.formatARS(data.costo_pack)}`);
    return parts.length ? parts.join(" · ") : "-";
  }

  function renderSolicitudesList() {
    const data = state.solicitudes.requests;
    if (!data || data.length === 0) {
      ui.solicitudesListContainer.innerHTML = `<div class="empty-state">No hay solicitudes registradas.</div>`;
      return;
    }

    const rows = data.map((req) => {
      const createdAt = req.created_at ? new Date(req.created_at).toLocaleString() : "-";
      const payload = parsePayload(req.payload);
      const skuName = req.sku_nombre || payload.nombre || "-";
      const typeLabel = requestTypeLabels[req.request_type] || req.request_type || "-";
      const status = req.status || "pending";
      const statusClass = status === "approved" ? "status-pill status-success" :
        status === "rejected" ? "status-pill status-error" : "status-pill status-warning";

      let actionHtml = "-";
      if (status === "pending") {
        actionHtml = `<div class="actions-bar">
          <button class="btn-ghost btn-sm" data-sol-action="approve" data-id="${req.id}">Aprobar</button>
          <button class="btn-ghost btn-sm" data-sol-action="reject" data-id="${req.id}">Rechazar</button>
        </div>`;
      }

      return `<tr class="table-row">
        <td class="table-cell cell-pad">${createdAt}</td>
        <td class="table-cell cell-pad">${typeLabel}</td>
        <td class="table-cell cell-pad cell-strong">${window.Utils.escapeHtml(skuName)}</td>
        <td class="table-cell cell-pad muted">${formatChangeSummary(payload)}</td>
        <td class="table-cell cell-pad muted">${req.justification || "-"}</td>
        <td class="table-cell cell-pad"><span class="${statusClass}">${status}</span></td>
        <td class="table-cell cell-pad">${actionHtml}</td>
      </tr>`;
    }).join("");

    ui.solicitudesListContainer.innerHTML = `
      <div class="table-scroll">
        <table class="table table-sticky">
          <thead>
            <tr class="table-head">
              <th class="table-cell is-header cell-pad">Fecha</th>
              <th class="table-cell is-header cell-pad">Tipo</th>
              <th class="table-cell is-header cell-pad">SKU</th>
              <th class="table-cell is-header cell-pad">Cambios</th>
              <th class="table-cell is-header cell-pad">Motivo</th>
              <th class="table-cell is-header cell-pad">Estado</th>
              <th class="table-cell is-header cell-pad">Acción</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  async function handleSolicitudAction(action, id) {
    const req = state.solicitudes.requests.find((r) => String(r.id) === String(id));
    if (!req) return;

    try {
      if (action === "approve") {
        await applySolicitudRequest(req);
        await window.sb.from("sku_change_requests").update({
          status: "approved",
          approved_by: session.user.id,
          approved_at: new Date().toISOString(),
        }).eq("id", id);
        window.Toast.success("Solicitud aprobada");
      } else {
        await window.sb.from("sku_change_requests").update({
          status: "rejected",
          approved_by: session.user.id,
          approved_at: new Date().toISOString(),
        }).eq("id", id);
        window.Toast.info("Solicitud rechazada");
      }
      loadSolicitudesData();
      loadProductosData();
    } catch (err) {
      console.error(err);
      window.Toast.error("Error: " + err.message);
    }
  }

  async function applySolicitudRequest(req) {
    const type = req.request_type;
    const data = parsePayload(req.payload);
    const result = {};

    ["nombre", "categoria_id", "proveedor_default_id", "external_id", "active"].forEach((k) => {
      if (data[k] !== undefined) result[k] = data[k];
    });
    ["pack_qty", "ml_por_unidad", "costo", "costo_pack"].forEach((k) => {
      const val = numberOrNull(data[k]);
      if (val !== null) result[k] = val;
    });

    if (type === "create") {
      if (!result.nombre) throw new Error("Nombre faltante");
      if (result.active === undefined) result.active = true;
      const { error } = await window.sb.from("master_sku").insert([result]);
      if (error) throw error;
      return;
    }

    let skuId = req.sku_id;
    if (!skuId) {
      const skuName = req.sku_nombre || data.nombre;
      if (skuName) {
        const { data: found } = await window.sb.from("master_sku").select("id").eq("nombre", skuName).maybeSingle();
        skuId = found?.id;
      }
    }
    if (!skuId) throw new Error("SKU no encontrado");

    if (type === "deactivate") {
      const { error } = await window.sb.from("master_sku").update({ active: false }).eq("id", skuId);
      if (error) throw error;
      return;
    }

    const { error } = await window.sb.from("master_sku").update(result).eq("id", skuId);
    if (error) throw error;
  }

  // ============================================
  // 10. REPOSICIÓN TAB (from admin-solicitudes)
  // ============================================
  function switchRepoTab(tabId) {
    state.reposicion.activeSubTab = tabId;

    ui.repoTabs.forEach((t) => t.classList.toggle("active", t.dataset.repoTab === tabId));

    [ui.repoPreAprobacion, ui.repoPendientes, ui.repoSinAsignar, ui.repoHistorial].forEach(
      (v) => v?.classList.add("hidden")
    );
    ui.unassignedStats?.classList.add("hidden");

    if (tabId === "pre-aprobacion") {
      ui.repoPreAprobacion?.classList.remove("hidden");
      loadPreApprovalItems();
    } else if (tabId === "pendientes") {
      ui.repoPendientes?.classList.remove("hidden");
      loadRepoOrders();
    } else if (tabId === "sin-asignar") {
      ui.repoSinAsignar?.classList.remove("hidden");
      ui.unassignedStats?.classList.remove("hidden");
      loadUnassigned();
    } else if (tabId === "historial") {
      ui.repoHistorial?.classList.remove("hidden");
    }
  }

  function switchPreSubtab(subtabId) {
    state.reposicion.activePreSubTab = subtabId;
    ui.preSubtabs.forEach((t) => t.classList.toggle("active", t.dataset.preSubtab === subtabId));

    ui.subviewPorItem?.classList.toggle("hidden", subtabId !== "item");
    ui.subviewPorProveedor?.classList.toggle("hidden", subtabId !== "proveedor");
    ui.preapprovalBulkActions?.classList.toggle("hidden", subtabId !== "item");

    if (subtabId === "item") renderPreApprovalByItem();
    else renderPreApprovalBySupplier();
  }

  async function loadPreApprovalItems() {
    setPageState("loading");

    try {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 30);

      const { data: requests, error: reqError } = await window.sb
        .from("replenishment_requests")
        .select("id")
        .gte("operational_date", past.toISOString().split("T")[0])
        .neq("status", "cancelled");

      if (reqError) throw reqError;
      const requestIds = (requests || []).map((r) => r.id);

      if (requestIds.length === 0) {
        state.reposicion.preapprovalItems = [];
        renderPreApprovalByItem();
        updatePreApprovalStats();
        setPageState("empty");
        return;
      }

      const { data: items, error: itemError } = await window.sb
        .from("replenishment_items")
        .select(`id, request_id, sku_id, requested_packs, status, pre_approval_status, supplier_id,
          master_sku (id, nombre, pack_qty, costo, costo_pack, proveedor_default_id),
          master_proveedores:supplier_id (id, nombre_fantasia)`)
        .in("request_id", requestIds)
        .neq("status", "cancelled")
        .or("pre_approval_status.is.null,pre_approval_status.eq.pending");

      if (itemError) throw itemError;

      const skuIds = (items || []).map((i) => i.sku_id).filter(Boolean);
      let stockMap = {};
      if (skuIds.length > 0) {
        const { data: stocks } = await window.sb.from("vw_stock_global").select("*").in("sku_id", skuIds);
        (stocks || []).forEach((s) => (stockMap[s.sku_id] = s));
      }

      const defaultSupplierIds = (items || []).map((i) => i.master_sku?.proveedor_default_id).filter(Boolean);
      let defaultSuppliersMap = {};
      if (defaultSupplierIds.length > 0) {
        const { data: suppliers } = await window.sb.from("master_proveedores").select("id, nombre_fantasia").in("id", defaultSupplierIds);
        (suppliers || []).forEach((s) => (defaultSuppliersMap[s.id] = s));
      }

      state.reposicion.preapprovalItems = (items || []).map((item) => {
        const sku = item.master_sku || {};
        const packCost = sku.costo_pack !== null ? sku.costo_pack : (sku.costo || 0) * (sku.pack_qty || 1);
        const estimatedCost = (item.requested_packs || 0) * packCost;

        let supplierName = "Sin asignar";
        let supplierId = item.supplier_id;
        if (item.master_proveedores?.nombre_fantasia) {
          supplierName = item.master_proveedores.nombre_fantasia;
        } else if (sku.proveedor_default_id && defaultSuppliersMap[sku.proveedor_default_id]) {
          supplierName = defaultSuppliersMap[sku.proveedor_default_id].nombre_fantasia + " (default)";
          supplierId = sku.proveedor_default_id;
        }

        return {
          id: item.id,
          sku_id: item.sku_id,
          sku_nombre: sku.nombre || "Unknown",
          requested_packs: item.requested_packs || 0,
          pack_qty: sku.pack_qty || 1,
          total_units: (item.requested_packs || 0) * (sku.pack_qty || 1),
          estimated_cost: estimatedCost,
          supplier_id: supplierId,
          supplier_name: supplierName,
        };
      });

      if (state.reposicion.activePreSubTab === "item") renderPreApprovalByItem();
      else renderPreApprovalBySupplier();
      updatePreApprovalStats();
    } catch (err) {
      console.error("Pre-Approval Load Error:", err);
      window.Toast?.error("Error cargando solicitudes: " + err.message);
    } finally {
      setPageState(state.reposicion.preapprovalItems.length === 0 ? "empty" : "ready");
    }
  }

  function renderPreApprovalByItem() {
    if (!ui.subviewPorItem) return;
    const items = state.reposicion.preapprovalItems;

    if (items.length === 0) {
      ui.subviewPorItem.innerHTML = `<div class="empty-state">No hay items pendientes de pre-aprobación.</div>`;
      return;
    }

    const rows = items.map((item) => {
      const isSelected = state.reposicion.selectedItemIds.has(item.id);
      return `<tr class="table-row ${isSelected ? "bg-accent/10" : ""}">
        <td class="table-cell cell-pad text-center">
          <input type="checkbox" class="js-item-checkbox" data-id="${item.id}" ${isSelected ? "checked" : ""}>
        </td>
        <td class="table-cell cell-pad cell-strong font-medium">${window.Utils.escapeHtml(item.sku_nombre)}</td>
        <td class="table-cell cell-pad text-center">${item.requested_packs}</td>
        <td class="table-cell cell-pad text-center">${item.total_units} u.</td>
        <td class="table-cell cell-pad text-right muted font-mono text-sm">${window.Utils.formatARS(item.estimated_cost)}</td>
        <td class="table-cell cell-pad">${window.Utils.escapeHtml(item.supplier_name)}</td>
        <td class="table-cell cell-pad text-right">
          <button class="btn-ghost btn-sm btn-success js-preapprove-single" data-id="${item.id}">✓</button>
          <button class="btn-ghost btn-sm text-error js-prereject-single" data-id="${item.id}">✕</button>
        </td>
      </tr>`;
    }).join("");

    ui.subviewPorItem.innerHTML = `
      <table class="table table-sticky">
        <thead>
          <tr class="table-head">
            <th class="table-cell is-header cell-pad text-center" style="width: 40px;">
              <input type="checkbox" id="select-all-items" title="Seleccionar todos">
            </th>
            <th class="table-cell is-header cell-pad">SKU</th>
            <th class="table-cell is-header cell-pad text-center">Packs</th>
            <th class="table-cell is-header cell-pad text-center">Unidades</th>
            <th class="table-cell is-header cell-pad text-right">Costo Est.</th>
            <th class="table-cell is-header cell-pad">Proveedor</th>
            <th class="table-cell is-header cell-pad text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function renderPreApprovalBySupplier() {
    if (!ui.subviewPorProveedor) return;
    const items = state.reposicion.preapprovalItems;

    if (items.length === 0) {
      ui.subviewPorProveedor.innerHTML = `<div class="empty-state">No hay items pendientes.</div>`;
      return;
    }

    const bySupplier = {};
    items.forEach((item) => {
      const key = item.supplier_id || "sin-asignar";
      if (!bySupplier[key]) {
        bySupplier[key] = { supplier_id: item.supplier_id, supplier_name: item.supplier_name, items: [], total_cost: 0 };
      }
      bySupplier[key].items.push(item);
      bySupplier[key].total_cost += item.estimated_cost;
    });

    const cards = Object.values(bySupplier).map((group) => {
      const itemIds = group.items.map((i) => i.id);
      const itemRows = group.items.map((item) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <span class="text-sm">${window.Utils.escapeHtml(item.sku_nombre)}</span>
          <span class="text-sm muted">${item.requested_packs} packs (${item.total_units} u.)</span>
        </div>
      `).join("");

      return `<div class="card" style="padding: 16px; margin-bottom: 16px; background: var(--surface-2); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 class="font-bold">${window.Utils.escapeHtml(group.supplier_name)}</h3>
            <span class="badge status-neutral">${group.items.length} items</span>
          </div>
          <span class="font-mono font-bold">${window.Utils.formatARS(group.total_cost)}</span>
        </div>
        <div style="margin-bottom: 12px; max-height: 128px; overflow-y: auto;">${itemRows}</div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn-primary btn-sm js-preapprove-supplier" data-item-ids='${JSON.stringify(itemIds)}'>Aprobar Todo</button>
          <button class="btn-ghost btn-sm text-error js-prereject-supplier" data-item-ids='${JSON.stringify(itemIds)}'>Rechazar Todo</button>
        </div>
      </div>`;
    }).join("");

    ui.subviewPorProveedor.innerHTML = cards;
  }

  function updatePreApprovalStats() {
    const items = state.reposicion.preapprovalItems;
    const count = items.length;
    const totalBudget = items.reduce((sum, i) => sum + i.estimated_cost, 0);
    if (ui.preapprovalCount) ui.preapprovalCount.textContent = count;
    if (ui.repoCount) ui.repoCount.textContent = count;
    if (ui.preapprovalTotalBudget) ui.preapprovalTotalBudget.textContent = window.Utils.formatARS(totalBudget);
  }

  function updateSelectionUI() {
    const count = state.reposicion.selectedItemIds.size;
    if (ui.preapprovalSelectionInfo) ui.preapprovalSelectionInfo.textContent = `${count} seleccionados`;
    if (ui.btnPreapproveSelected) ui.btnPreapproveSelected.disabled = count === 0;
    if (ui.btnPrerejectSelected) ui.btnPrerejectSelected.disabled = count === 0;
  }

  async function preApproveItems(itemIds) {
    if (!itemIds || itemIds.length === 0) return;
    if (!(await window.Utils.confirmAction(`¿Aprobar ${itemIds.length} item(s)?`))) return;

    try {
      const { error } = await window.sb
        .from("replenishment_items")
        .update({
          pre_approval_status: "pre_approved",
          pre_approved_by: session.user.id,
          pre_approved_at: new Date().toISOString(),
        })
        .in("id", itemIds);

      if (error) throw error;
      window.Toast.success(`${itemIds.length} item(s) pre-aprobados`);
      state.reposicion.selectedItemIds.clear();
      updateSelectionUI();
      loadPreApprovalItems();
    } catch (err) {
      console.error(err);
      window.Toast.error("Error: " + err.message);
    }
  }

  function openPreRejectModal(itemIds) {
    state.reposicion.pendingRejectIds = itemIds;
    if (ui.prerejectCount) ui.prerejectCount.textContent = itemIds.length;
    if (ui.prerejectReason) ui.prerejectReason.value = "";
    ui.modalPrereject?.classList.remove("hidden");
    ui.modalPrereject?.classList.add("active");
  }

  async function submitPreReject(e) {
    e.preventDefault();
    const reason = ui.prerejectReason?.value.trim();
    if (!reason) {
      window.Toast.warning("Debes indicar un motivo");
      return;
    }

    try {
      const { error } = await window.sb
        .from("replenishment_items")
        .update({
          pre_approval_status: "pre_rejected",
          pre_rejection_reason: reason,
          pre_approved_by: session.user.id,
          pre_approved_at: new Date().toISOString(),
        })
        .in("id", state.reposicion.pendingRejectIds);

      if (error) throw error;
      window.Toast.success("Items rechazados");
      ui.modalPrereject?.classList.remove("active");
      ui.modalPrereject?.classList.add("hidden");
      state.reposicion.pendingRejectIds = [];
      state.reposicion.selectedItemIds.clear();
      updateSelectionUI();
      loadPreApprovalItems();
    } catch (err) {
      console.error(err);
      window.Toast.error("Error: " + err.message);
    }
  }

  // Orders (Aprobación Final)
  async function loadRepoOrders() {
    setPageState("loading");

    try {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 30);

      const { data: requests } = await window.sb
        .from("replenishment_requests")
        .select("id")
        .gte("operational_date", past.toISOString().split("T")[0])
        .neq("status", "cancelled");

      const requestIds = (requests || []).map((r) => r.id);
      if (requestIds.length === 0) {
        renderRepoOrders([]);
        setPageState("empty");
        return;
      }

      const { data: rawOrders, error: ordError } = await window.sb
        .from("replenishment_supplier_orders")
        .select(`*, master_proveedores (nombre_fantasia)`)
        .in("request_id", requestIds)
        .neq("status", "cancelled")
        .order("eta_date", { ascending: true });

      if (ordError) throw ordError;

      const orderIds = rawOrders.map((o) => o.id);
      let itemsMap = {};
      if (orderIds.length > 0) {
        const { data: items } = await window.sb
          .from("replenishment_items")
          .select(`id, supplier_order_id, requested_packs, master_sku (nombre, pack_qty, costo, costo_pack)`)
          .in("supplier_order_id", orderIds);

        (items || []).forEach((item) => {
          if (!itemsMap[item.supplier_order_id]) itemsMap[item.supplier_order_id] = [];
          itemsMap[item.supplier_order_id].push(item);
        });
      }

      state.reposicion.orders = rawOrders.map((o) => {
        const ordItems = itemsMap[o.id] || [];
        const totalBudget = ordItems.reduce((sum, item) => {
          const packs = item.requested_packs || 0;
          const sku = item.master_sku || {};
          const packCost = sku.costo_pack !== null ? sku.costo_pack : (sku.costo || 0) * (sku.pack_qty || 1);
          return sum + packs * packCost;
        }, 0);

        return {
          id: o.id,
          proveedor: o.master_proveedores?.nombre_fantasia || "Desconocido",
          status: o.status,
          eta_date: o.eta_date,
          final_cost: o.final_cost,
          presupuesto: totalBudget,
          items: ordItems,
        };
      });

      renderRepoOrders(state.reposicion.orders);
    } catch (err) {
      console.error(err);
      window.Toast?.error("Error cargando pedidos");
    } finally {
      setPageState(state.reposicion.orders.length === 0 ? "empty" : "ready");
    }
  }

  function renderRepoOrders(data) {
    if (!ui.repoOrdersContainer) return;
    const activeOrders = data.filter((o) => ["draft", "ready_for_approval"].includes(o.status));

    if (activeOrders.length === 0) {
      ui.repoOrdersContainer.innerHTML = `<div class="empty-state">No hay pedidos pendientes de aprobación final.</div>`;
      return;
    }

    const rows = activeOrders.map((o) => {
      const costoFinal = o.final_cost !== null ? window.Utils.formatARS(o.final_cost) : "-";
      const presupuesto = window.Utils.formatARS(o.presupuesto);
      const statusBadge = window.Utils.renderStatusBadge?.(o.status) || `<span class="status-pill">${o.status}</span>`;

      return `<tr class="table-row">
        <td class="table-cell cell-pad cell-strong font-medium">${window.Utils.escapeHtml(o.proveedor)}</td>
        <td class="table-cell cell-pad text-center">${o.items.length}</td>
        <td class="table-cell cell-pad text-right muted font-mono text-sm">${presupuesto}</td>
        <td class="table-cell cell-pad text-right cell-stronger font-mono">${costoFinal}</td>
        <td class="table-cell cell-pad text-center muted">${o.eta_date || "-"}</td>
        <td class="table-cell cell-pad text-center">${statusBadge}</td>
        <td class="table-cell cell-pad text-right">
          <button class="footer-link btn-ghost btn-sm js-view-order" data-id="${o.id}">Ver</button>
        </td>
      </tr>`;
    }).join("");

    ui.repoOrdersContainer.innerHTML = `
      <table class="table table-sticky">
        <thead>
          <tr class="table-head">
            <th class="table-cell is-header cell-pad">Proveedor</th>
            <th class="table-cell is-header cell-pad text-center">Items</th>
            <th class="table-cell is-header cell-pad text-right">Presupuesto Est.</th>
            <th class="table-cell is-header cell-pad text-right">Costo Final</th>
            <th class="table-cell is-header cell-pad text-center">Fecha Entrega</th>
            <th class="table-cell is-header cell-pad text-center">Estado</th>
            <th class="table-cell is-header cell-pad text-right">Acción</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function openOrderPanel(order) {
    if (ui.panelTitle) ui.panelTitle.textContent = `Pedido #${order.id.split("-")[0]}`;

    const costoFinal = order.final_cost !== null ? window.Utils.formatARS(order.final_cost) :
      '<span class="status-pill status-error">Pendiente</span>';
    const fechaEta = order.eta_date || '<span class="status-pill status-error">Pendiente</span>';

    const rows = order.items.map((item) => {
      const sku = item.master_sku || {};
      const itemEst = (item.requested_packs || 0) * (sku.costo_pack || (sku.costo || 0) * (sku.pack_qty || 1));
      const units = (item.requested_packs || 0) * (sku.pack_qty || 1);
      return `<tr class="table-row">
        <td class="table-cell cell-pad text-sm font-medium">${window.Utils.escapeHtml(sku.nombre)}</td>
        <td class="table-cell cell-pad text-sm text-center">${item.requested_packs}</td>
        <td class="table-cell cell-pad text-sm text-center">${units} u.</td>
        <td class="table-cell cell-pad text-sm text-right muted font-mono">${window.Utils.formatARS(itemEst)}</td>
      </tr>`;
    }).join("");

    ui.panelContent.innerHTML = `
      <div class="state-block" style="margin-bottom: 24px; padding: 16px;">
        <div class="detail-grid">
          <div style="display: flex; flex-direction: column;"><span class="muted text-xs" style="text-transform: uppercase;">Proveedor</span><span class="font-bold">${window.Utils.escapeHtml(order.proveedor)}</span></div>
          <div style="display: flex; flex-direction: column;"><span class="muted text-xs" style="text-transform: uppercase;">Fecha Eta</span><span class="font-bold">${fechaEta}</span></div>
          <div style="display: flex; flex-direction: column;"><span class="muted text-xs" style="text-transform: uppercase;">Presupuesto</span><span class="font-bold">${window.Utils.formatARS(order.presupuesto)}</span></div>
          <div style="display: flex; flex-direction: column;"><span class="muted text-xs" style="text-transform: uppercase;">Costo Final</span><span class="font-bold">${costoFinal}</span></div>
        </div>
      </div>
      <div class="table-shell"><table class="table table-compact"><thead><tr class="table-head"><th>SKU</th><th>Packs</th><th>Units</th><th class="text-right">Est.</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div id="reject-reason-container" class="state-block hidden mt-4">
        <label class="form-label">Motivo de Rechazo</label>
        <textarea id="reject-reason" class="input w-full" rows="3" placeholder="Indica la razón del rechazo..."></textarea>
      </div>`;

    const canApprove = order.final_cost !== null && order.final_cost >= 0 && order.eta_date;
    let actionsHtml = "";

    if (order.status === "ready_for_approval" || order.status === "draft") {
      if (canApprove) {
        actionsHtml += `<button id="btn-approve-order" class="btn-primary">Aprobar Pedido</button>`;
      } else {
        actionsHtml += `<span class="muted text-xs" style="font-style: italic; margin-right: 16px;">Esperando confirmación final...</span>`;
      }
      actionsHtml += `<button id="btn-reject-order" class="btn-ghost text-error">Rechazar</button>`;
    }

    ui.panelActions.innerHTML = actionsHtml;
    panelCtrl.open();

    document.getElementById("btn-approve-order")?.addEventListener("click", () => updateOrderStatus(order.id, "approved", null));
    document.getElementById("btn-reject-order")?.addEventListener("click", () => {
      document.getElementById("reject-reason-container")?.classList.remove("hidden");
      ui.panelActions.innerHTML = `
        <button class="btn-secondary" id="btn-cancel-reject">Cancelar</button>
        <button id="btn-confirm-reject" class="btn-primary" style="background: var(--error-color);">Confirmar</button>`;

      document.getElementById("btn-confirm-reject")?.addEventListener("click", async () => {
        const reason = document.getElementById("reject-reason")?.value.trim();
        if (!reason) {
          window.Toast.warning("Motivo requerido");
          return;
        }
        await updateOrderStatus(order.id, "rejected", reason);
      });
      document.getElementById("btn-cancel-reject")?.addEventListener("click", () => openOrderPanel(order));
    });
  }

  async function updateOrderStatus(id, newStatus, reason) {
    if (!(await window.Utils.confirmAction("¿Confirmar acción?"))) return;

    try {
      const payload = {
        status: newStatus,
        approved_by: session.user.id,
        approved_at: new Date().toISOString(),
      };
      if (newStatus === "rejected" && reason) payload.rejection_reason = reason;

      const { error } = await window.sb
        .from("replenishment_supplier_orders")
        .update(payload)
        .eq("id", id);
      if (error) throw error;

      if (newStatus === "approved") {
        const order = state.reposicion.orders.find((o) => o.id === id);
        if (order) {
          const paymentAmount = order.final_cost || order.presupuesto || 0;
          const dueDate = order.eta_date || new Date().toISOString().split("T")[0];

          const { error: paymentError } = await window.sb
            .from("finance_payments")
            .insert({
              title: `Pedido #${order.id.slice(0, 8)} - ${order.proveedor}`,
              supplier_id: order.items[0]?.master_sku?.proveedor_default_id || null,
              supplier_order_id: order.id,
              amount_total: paymentAmount,
              due_date: dueDate,
              status: "PENDING",
              source_type: "PEDIDO",
              created_by: session.user.id,
            });

          if (paymentError) {
            console.error("Error creating payment:", paymentError);
            window.Toast?.warning("Orden aprobada, pero error creando pago");
          } else {
            window.Toast?.info("Pago agregado al calendario");
          }
        }
      }

      panelCtrl.close();
      loadRepoOrders();
      window.Toast.success("Estado actualizado");
    } catch (err) {
      window.Toast.error(err.message);
    }
  }

  // Unassigned
  async function loadUnassigned() {
    if (!ui.unassignedContainer) return;
    setPageState("loading");

    try {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - 30);

      const { data: requests } = await window.sb
        .from("replenishment_requests")
        .select("id")
        .gte("operational_date", past.toISOString().split("T")[0])
        .neq("status", "cancelled");

      const requestIds = (requests || []).map((r) => r.id);
      if (requestIds.length === 0) {
        renderUnassigned([], {});
        setPageState("empty");
        return;
      }

      const { data: items } = await window.sb
        .from("replenishment_items")
        .select(`*, master_sku (id, nombre, pack_qty, costo, costo_pack)`)
        .in("request_id", requestIds)
        .neq("status", "cancelled");

      const skuIds = (items || []).map((i) => i.sku_id);
      let stockMap = {};
      if (skuIds.length > 0) {
        const { data: stocks } = await window.sb.from("vw_stock_global").select("*").in("sku_id", skuIds);
        (stocks || []).forEach((s) => (stockMap[s.sku_id] = s));
      }

      const orderIds = (items || []).map((i) => i.supplier_order_id).filter(Boolean);
      let orderMap = {};
      if (orderIds.length > 0) {
        const { data: os } = await window.sb.from("replenishment_supplier_orders").select("id, eta_date").in("id", orderIds);
        (os || []).forEach((o) => (orderMap[o.id] = o));
      }

      const unassignedItems = (items || []).filter((item) => {
        if (!item.supplier_id) return true;
        if (!item.supplier_order_id) return true;
        const order = orderMap[item.supplier_order_id];
        if (!order || !order.eta_date) return true;
        return false;
      });

      renderUnassigned(unassignedItems, stockMap);
    } catch (err) {
      console.error(err);
      ui.unassignedContainer.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
    } finally {
      setPageState("ready");
    }
  }

  function renderUnassigned(items, stockMap) {
    if (items.length === 0) {
      ui.unassignedContainer.innerHTML = `<div class="empty-state">Todo asignado correctamente.</div>`;
      if (ui.unassignedTotalBudget) ui.unassignedTotalBudget.textContent = "$0,00";
      return;
    }

    let totalBudget = 0;
    const rows = items.map((item) => {
      const stockData = stockMap[item.sku_id];
      const sku = item.master_sku || {};
      const calc = window.Utils.calcReplenishment?.({
        requerido: stockData?.requerido,
        stock_actual: stockData?.stock_actual,
        pack_qty: sku.pack_qty,
      }) || { unidades: 0, pack: 0, total: 0 };

      const packCost = sku.costo_pack !== null ? sku.costo_pack : (sku.costo || 0) * (sku.pack_qty || 1);
      const itemEst = calc.pack * packCost;
      totalBudget += itemEst;

      return `<tr class="table-row">
        <td class="table-cell cell-pad cell-strong font-medium">${window.Utils.escapeHtml(sku.nombre || "Unknown")}</td>
        <td class="table-cell cell-pad text-center">${calc.unidades}</td>
        <td class="table-cell cell-pad text-center">${calc.pack}</td>
        <td class="table-cell cell-pad text-center cell-strong">${calc.total}</td>
        <td class="table-cell cell-pad text-right muted font-mono text-sm">${window.Utils.formatARS(itemEst)}</td>
      </tr>`;
    }).join("");

    ui.unassignedContainer.innerHTML = `
      <table class="table table-sticky">
        <thead>
          <tr class="table-head">
            <th class="table-cell is-header cell-pad">SKU</th>
            <th class="table-cell is-header cell-pad text-center">Unidades</th>
            <th class="table-cell is-header cell-pad text-center">Pack</th>
            <th class="table-cell is-header cell-pad text-center">Total</th>
            <th class="table-cell is-header cell-pad text-right">Presupuesto</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    if (ui.unassignedTotalBudget) ui.unassignedTotalBudget.textContent = window.Utils.formatARS(totalBudget);
  }

  // ============================================
  // 11. EVENT BINDING
  // ============================================
  function bindEvents() {
    // Main tabs
    ui.mainTabs.forEach((t) => t.addEventListener("click", () => switchMainTab(t.dataset.mainTab)));

    // Análisis tabs
    ui.analisisTabs.forEach((t) => t.addEventListener("click", () => switchAnalisisTab(t.dataset.analisisTab)));

    // Análisis events
    ui.importFile?.addEventListener("change", handleFileSelect);
    ui.btnAnalyzeIdeal?.addEventListener("click", analyzeIdealStock);

    // Refresh
    ui.btnRefresh?.addEventListener("click", () => {
      if (state.activeMainTab === "analisis" && state.analisis.activeSubTab === "historica") loadHistoryChart();
      else if (state.activeMainTab === "monitor") loadMonitorData();
      else if (state.activeMainTab === "productos") loadProductosData();
      else if (state.activeMainTab === "solicitudes") loadSolicitudesData();
      else if (state.activeMainTab === "reposicion") {
        if (state.reposicion.activeSubTab === "pre-aprobacion") loadPreApprovalItems();
        else if (state.reposicion.activeSubTab === "pendientes") loadRepoOrders();
        else if (state.reposicion.activeSubTab === "sin-asignar") loadUnassigned();
      }
    });

    ui.btnReloadEmpty?.addEventListener("click", () => location.reload());
    ui.btnRefreshRequests?.addEventListener("click", loadSolicitudesData);

    // New button (productos)
    ui.btnNew?.addEventListener("click", () => openSkuForm());

    // Cancel panel
    ui.btnCancel?.addEventListener("click", () => panelCtrl.close());

    // Monitor events
    ui.monitorCategoryTabs?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat-id]");
      if (btn) {
        state.monitor.activeCategoryId = btn.dataset.catId;
        renderMonitorCategoryTabs();
        renderMonitorList();
      }
    });

    ui.monitorSearch?.addEventListener("input", window.Utils.debounce((e) => {
      state.monitor.searchTerm = e.target.value;
      renderMonitorList();
    }, 300));

    ui.monitorListContainer?.addEventListener("change", async (e) => {
      if (e.target.classList.contains("toggle-active-monitor")) {
        await toggleMonitorActive(e.target.dataset.id, e.target.checked);
      }
    });

    ui.monitorListContainer?.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-view-monitor");
      if (btn) {
        const item = state.monitor.rows.find((r) => String(r.id) === String(btn.dataset.id));
        if (item) openMonitorDetail(item);
      }
    });

    // Productos events
    ui.productosCategoryTabs?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-prod-cat-id]");
      if (btn) {
        state.productos.activeCategoryId = btn.dataset.prodCatId || null;
        renderProductosCategoryTabs();
        loadProductosData();
      }
    });

    ui.productosSearch?.addEventListener("input", window.Utils.debounce((e) => {
      state.productos.searchTerm = e.target.value;
      loadProductosData();
    }, 300));

    ui.productosListContainer?.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-edit-sku");
      if (btn) {
        const item = state.productos.skus.find((s) => String(s.id) === String(btn.dataset.id));
        if (item) openSkuForm(item);
      }
    });

    // Solicitudes events
    ui.solicitudesListContainer?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sol-action]");
      if (btn) handleSolicitudAction(btn.dataset.solAction, btn.dataset.id);
    });

    // Reposición events
    ui.repoTabs.forEach((t) => t.addEventListener("click", () => switchRepoTab(t.dataset.repoTab)));
    ui.preSubtabs.forEach((t) => t.addEventListener("click", () => switchPreSubtab(t.dataset.preSubtab)));

    ui.btnPreapproveSelected?.addEventListener("click", () => preApproveItems(Array.from(state.reposicion.selectedItemIds)));
    ui.btnPrerejectSelected?.addEventListener("click", () => openPreRejectModal(Array.from(state.reposicion.selectedItemIds)));

    ui.formPrereject?.addEventListener("submit", submitPreReject);
    ui.modalPrereject?.querySelectorAll("[data-modal-close]").forEach((b) => {
      b.addEventListener("click", () => {
        ui.modalPrereject.classList.remove("active");
        ui.modalPrereject.classList.add("hidden");
      });
    });

    // Pre-aprobación selection
    ui.repoPreAprobacion?.addEventListener("change", (e) => {
      const t = e.target;
      if (t.id === "select-all-items") {
        const checkboxes = ui.subviewPorItem?.querySelectorAll(".js-item-checkbox") || [];
        checkboxes.forEach((cb) => {
          cb.checked = t.checked;
          t.checked ? state.reposicion.selectedItemIds.add(cb.dataset.id) : state.reposicion.selectedItemIds.delete(cb.dataset.id);
        });
        updateSelectionUI();
        return;
      }
      if (t.classList.contains("js-item-checkbox")) {
        t.checked ? state.reposicion.selectedItemIds.add(t.dataset.id) : state.reposicion.selectedItemIds.delete(t.dataset.id);
        updateSelectionUI();
      }
    });

    ui.repoPreAprobacion?.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest(".js-preapprove-single")) {
        preApproveItems([t.closest(".js-preapprove-single").dataset.id]);
        return;
      }
      if (t.closest(".js-prereject-single")) {
        openPreRejectModal([t.closest(".js-prereject-single").dataset.id]);
        return;
      }
      if (t.closest(".js-preapprove-supplier")) {
        preApproveItems(JSON.parse(t.closest(".js-preapprove-supplier").dataset.itemIds));
        return;
      }
      if (t.closest(".js-prereject-supplier")) {
        openPreRejectModal(JSON.parse(t.closest(".js-prereject-supplier").dataset.itemIds));
      }
    });

    // Orders
    ui.repoOrdersContainer?.addEventListener("click", (e) => {
      const btn = e.target.closest(".js-view-order");
      if (btn) {
        const order = state.reposicion.orders.find((o) => o.id === btn.dataset.id);
        if (order) openOrderPanel(order);
      }
    });
  }

  // ============================================
  // 12. INIT
  // ============================================
  bindEvents();
  switchMainTab(state.activeMainTab);
})();
