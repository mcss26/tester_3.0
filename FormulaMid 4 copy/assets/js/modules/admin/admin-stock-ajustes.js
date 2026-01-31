/**
 * Admin Stock Ajustes
 * Logic for Manual Adjustments (Consumption, Loss, Corrections)
 */

(async function () {
  "use strict";

  // 1. Auth Guard (Standard IIFE Pattern)
  const session = await window.Auth.guardOrRedirect([
    "admin",
    "contable",
    "logistica",
  ]);
  if (!session) return;

  // 2. State
  const state = {
    skus: [],
    selectedSku: null,
  };

  // 3. DOM References
  const ui = {
    form: document.getElementById("adjustment-form"),
    selectSku: document.getElementById("select-sku"),
    displayStock: document.getElementById("current-stock-display"),
    inputType: document.getElementById("input-type"),
    inputQty: document.getElementById("input-qty"),
    inputReason: document.getElementById("input-reason"),
    typeBtns: document.querySelectorAll(".type-btn"),
    qtyHint: document.getElementById("qty-hint"),
    submitBtn: document.querySelector('button[type="submit"]'),

    // Global States
    moduleContent: document.getElementById("module-content"),
    loadingState: document.getElementById("page-card-loading"),
    emptyState: document.getElementById("page-card-empty"),
  };

  if (!window.Utils?.assertSbOrShowBlockingError?.(ui.form)) return;

  // 4. Helpers (Standardize via Utils)
  function onSkuChange(skuId) {
    if (!skuId) {
      state.selectedSku = null;
      ui.displayStock.textContent = "-";
      ui.displayStock.classList.remove("danger");
      return;
    }
    state.selectedSku = state.skus.find((s) => s.id === skuId);
    if (state.selectedSku) {
      ui.displayStock.textContent = `${state.selectedSku.stock} ${state.selectedSku.unit}`;
      ui.displayStock.classList.toggle("danger", state.selectedSku.stock <= 0);
    }
  }

  function updateHint() {
    const qty = parseInt(ui.inputQty?.value) || 0;
    if (ui.qtyHint) ui.qtyHint.textContent = `(-${qty} UN)`;
  }

  function renderSelect() {
    if (!ui.selectSku) return;
    ui.selectSku.innerHTML = `<option value="">${window.Constants?.MESSAGES?.LOADING || "Cargando..."}</option>`;

    const fragment = document.createDocumentFragment();
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "Seleccione un producto...";
    fragment.appendChild(defaultOpt);

    state.skus.forEach((sku) => {
      const opt = document.createElement("option");
      opt.value = sku.id;
      opt.textContent = `${window.Utils.escapeHtml(sku.name)} (Stock: ${sku.stock} ${sku.unit})`;
      fragment.appendChild(opt);
    });
    ui.selectSku.innerHTML = "";
    ui.selectSku.appendChild(fragment);
  }

  // 5. Data Loading
  async function loadSkus() {
    window.Utils.setPageState(ui, { loading: true });
    try {
      const { data, error } = await window.sb
        .from("inventory_stock")
        .select("quantity, sku:sku_id(id, name, unit_of_measure)");

      if (error) throw error;

      state.skus = (data || [])
        .map((item) => ({
          id: item.sku.id,
          name: item.sku.name,
          unit: item.sku.unit_of_measure,
          stock: item.quantity,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (state.skus.length === 0) {
        window.Utils.setPageState(ui, { empty: true });
      } else {
        renderSelect();
        window.Utils.setPageState(ui, { loading: false });
      }
    } catch (err) {
      console.error("Error loading SKUs:", err);
      window.Toast.error(
        window.Constants?.MESSAGES?.ERROR_LOAD || "Error cargando productos",
      );
      window.Utils.setPageState(ui, { loading: false });
    }
  }

  // 6. Submit Logic (Standardized confirmAction)
  async function submitAdjustment() {
    if (!state.selectedSku) {
      window.Toast.warning("Seleccione un producto");
      return;
    }

    const qty = parseInt(ui.inputQty?.value);
    if (!qty || qty <= 0) {
      window.Toast.warning("La cantidad debe ser mayor a 0");
      return;
    }

    const reason = ui.inputReason?.value || "";
    const type = ui.inputType?.value || "consumo";

    const confirmed = await window.Utils.confirmAction(
      `¿Confirmar SALIDA de ${qty} ${state.selectedSku.unit} de ${state.selectedSku.name}?`,
      { isDanger: true },
    );

    if (confirmed) {
      await executeAdjustment(qty, type, reason);
    }
  }

  async function executeAdjustment(qty, type, reason) {
    if (ui.submitBtn) ui.submitBtn.classList.add("btn-loading");

    try {
      // 1. Insert Movement (Log)
      const { error: movError } = await window.sb
        .from("inventory_movements")
        .insert({
          sku_id: state.selectedSku.id,
          quantity_change: -qty,
          movement_type: type,
          reason: reason || "Manual Admin Adjustment",
          created_by: session.user.id,
        });

      if (movError)
        throw new Error("Error registrando movimiento: " + movError.message);

      // 2. Update Stock
      const newStock = state.selectedSku.stock - qty;

      const { error: stockError } = await window.sb
        .from("inventory_stock")
        .update({ quantity: newStock, updated_at: new Date() })
        .eq("sku_id", state.selectedSku.id);

      if (stockError)
        throw new Error("Error actualizando stock: " + stockError.message);

      window.Toast.success("Ajuste realizado correctamente.");
      ui.form?.reset();
      state.selectedSku = null;
      if (ui.displayStock) {
        ui.displayStock.textContent = "-";
        ui.displayStock.classList.remove("danger");
      }
      // Reload to refresh stock levels
      await loadSkus();
    } catch (err) {
      console.error(err);
      window.Toast.error(err.message);
    } finally {
      if (ui.submitBtn) ui.submitBtn.classList.remove("btn-loading");
    }
  }

  // 7. Bind Events
  function bindEvents() {
    ui.selectSku?.addEventListener("change", (e) =>
      onSkuChange(e.target.value),
    );

    ui.typeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        ui.typeBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        if (ui.inputType) ui.inputType.value = btn.dataset.type;
        updateHint();
      });
    });

    ui.inputQty?.addEventListener("input", updateHint);

    ui.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      submitAdjustment();
    });
  }

  // 8. Init
  bindEvents();
  await loadSkus();
})();
