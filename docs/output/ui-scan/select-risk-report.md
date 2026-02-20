# Select-to-DB Risk Analysis Report

Generated: 2026-02-19 06:00

## Executive Summary

| Metric | Value |
|--------|-------|
| Total \<select>\ elements | **45** |
| DB-bound selects | **27** |
| CRITICAL risk | **5** |
| HIGH risk | **22** |
| MEDIUM risk | **0** |
| LOW risk | **18** |

## Approach Comparison

### Option A: Wrap (enhance native select visually)

| Factor | Assessment |
|--------|-----------|
| JS changes required | **ZERO** â€” native `<select>` stays in DOM |
| DB contract risk | **ZERO** â€” `.value`, `.selectedIndex` still work |
| Accessibility | **NATIVE** â€” screen readers, keyboard nav for free |
| Visual control | **LIMITED** â€” `<option>` styling is restricted cross-browser |
| Best practice? | **YES** â€” progressive enhancement pattern |

### Option B: Replace (div-based + hidden input)

| Factor | Assessment |
|--------|-----------|
| JS changes required | **27 select(s)** need JS updates |
| DB contract risk | **HIGH** for CRITICAL/HIGH selects |
| Accessibility | **MANUAL** â€” must implement ARIA roles, keyboard nav |
| Visual control | **FULL** â€” complete styling freedom |
| Best practice? | **ONLY if** hidden input preserves same `id` and fires `change` event |

### Recommendation

> [!CAUTION]
> With **5 CRITICAL** and **22 HIGH** risk selects bound to DB operations,
> the **Wrap approach (Option A)** is strongly recommended for Tier0 pages.
> Option B is viable ONLY for LOW-risk selects not connected to JS/DB.

## Detailed Findings

| Page | Select ID | Risk | APIs Used | DB-Bound | Detail |
|------|-----------|------|-----------|----------|--------|
| encargado-barra-personal.html | `selectWorkday` | **CRITICAL** | .value (x), .selectedIndex (x), .options (x), .innerHTML (x), .appendChild (x) | YES | DB-bound + 5 native APIs used. Replace approach requires JS refactor. |
| admin-workdays.html | `select-event` | **CRITICAL** | .value (x), .selectedIndex (x), .options (x), .innerHTML (x) | YES | DB-bound + 4 native APIs used. Replace approach requires JS refactor. |
| admin-central-stock.html | `select-recipe` | **CRITICAL** | .value (x), .innerHTML (x), .appendChild (x) | YES | DB-bound + 3 native APIs used. Replace approach requires JS refactor. |
| admin-semanal.html | `weekSelect` | **CRITICAL** | .value (x), .selectedIndex (x), .innerHTML (x) | YES | DB-bound + 3 native APIs used. Replace approach requires JS refactor. |
| encargado-caja-personal.html | `select-workday` | **CRITICAL** | .value (x), .selectedIndex (x), .innerHTML (x), .appendChild (x) | YES | DB-bound + 4 native APIs used. Replace approach requires JS refactor. |
| admin-workdays.html | `select-template` | **HIGH** | .innerHTML (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| admin-workdays.html | `sa-filter-clasif` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| admin-pagos.html | `payVoucher` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| admin-pagos.html | `payMethod` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| logistica-stock.html | `adjust-reason` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| encargado-caja-noche.html | `open-select-terminal` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| encargado-caja-noche.html | `open-select-staff` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| encargado-caja-noche.html | `select-terminal` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| logistica-seguimiento.html | `new-status` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| logistica-recepcion.html | `free-sku-select` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| logistica-recepcion.html | `free-supplier` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| admin-central-stock.html | `select-sku-modal` | **HIGH** | .innerHTML (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| admin-master-nomina.html | `staff-role` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| admin-master-pos.html | `pos-provider` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| admin-central-stock.html | `category-filter` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| admin-central-stock.html | `sku-categoria` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| admin-central-stock.html | `sku-proveedor` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| operativo-master-sku.html | `req-type` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| operativo-master-sku.html | `req-proveedor` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| operativo-master-sku.html | `req-sku` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| admin-master-tarifario.html | `input-area` | **HIGH** | .value (x) | YES | DB-bound via 1 API(s). Wrap approach safest. |
| admin-master-proveedores.html | `prov-category` | **HIGH** | .value (x), .innerHTML (x) | YES | DB-bound via 2 API(s). Wrap approach safest. |
| index.html | `evento-select` | **LOW** | â€” | no | No JS file found. Likely static or server-rendered. |
| index.html | `chartMode` | **LOW** | â€” | no | No JS file found. Likely static or server-rendered. |
| index.html | `weekSelector` | **LOW** | â€” | no | No JS file found. Likely static or server-rendered. |
| operativo-solicitudes.html | `adjust-reason-select` | **LOW** | â€” | no | No JS usage detected. Safe to replace. |
| balance-semanal.html | `filter-month` | **LOW** | â€” | no | No JS usage detected. Safe to replace. |
| balance-semanal.html | `filter-year` | **LOW** | â€” | no | No JS usage detected. Safe to replace. |
| admin-pagos.html | `ruleType` | **LOW** | â€” | no | Select ID 'ruleType' not referenced in JS |
| admin-pagos.html | `ruleWeekday` | **LOW** | â€” | no | Select ID 'ruleWeekday' not referenced in JS |
| admin-pagos.html | `ruleOnHoliday` | **LOW** | â€” | no | Select ID 'ruleOnHoliday' not referenced in JS |
| admin-central-stock.html | `chart-mode` | **LOW** | â€” | no | No JS usage detected. Safe to replace. |
| admin-central-stock.html | `filter-profitability-flag` | **LOW** | â€” | no | No JS usage detected. Safe to replace. |
| admin-config.html | `filter-sku-type` | **LOW** | â€” | no | No JS usage detected. Safe to replace. |
| generator.html | `marketSource` | **LOW** | â€” | no | No JS file found. Likely static or server-rendered. |
| generator.html | `paper` | **LOW** | â€” | no | No JS file found. Likely static or server-rendered. |
| generator.html | `qrSize` | **LOW** | â€” | no | No JS file found. Likely static or server-rendered. |
| admin-pagos.html | `ruleAmountMode` | **LOW** | â€” | no | Select ID 'ruleAmountMode' not referenced in JS |
| admin-workdays.html | `rpt-chart-mode` | **LOW** | â€” | no | No JS usage detected. Safe to replace. |
| generator.html | `financialType` | **LOW** | â€” | no | No JS file found. Likely static or server-rendered. |

## CRITICAL/HIGH Detail â€” JS Usage Lines

### `admin-central-stock.html` â†’ `#category-filter`

- **JS File**: `admin-central-stock.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L697: ui.categoryFilter.value`
  - `L701: ui.categoryFilter.value`
  - `L698: ui.categoryFilter.innerHTML`

### `admin-central-stock.html` â†’ `#sku-categoria`

- **JS File**: `admin-central-stock.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L1056: ui.selCategoria.value`
  - `L1080: ui.selCategoria.value`
  - `L678: ui.selCategoria.innerHTML`

### `admin-central-stock.html` â†’ `#sku-proveedor`

- **JS File**: `admin-central-stock.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L1057: ui.selProveedor.value`
  - `L1081: ui.selProveedor.value`
  - `L682: ui.selProveedor.innerHTML`

### `admin-central-stock.html` â†’ `#select-sku-modal`

- **JS File**: `admin-central-stock.js`
- **APIs**: .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L3255: ui.selSkuAdjustment.innerHTML`

### `admin-central-stock.html` â†’ `#select-recipe`

- **JS File**: `admin-central-stock.js`
- **APIs**: .value (x), .innerHTML (x), .appendChild (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L3177: ui.selectRecipe.value`
  - `L3203: ui.selectRecipe.value`
  - `L3124: ui.selectRecipe.innerHTML`
  - `L3129: ui.selectRecipe.appendChild`

### `admin-master-nomina.html` â†’ `#staff-role`

- **JS File**: `admin-master-nomina.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L136: inpRole.value`
  - `L338: inpRole.value`
  - `L514: inpRole.value`
  - `L135: inpRole.innerHTML`

### `admin-master-pos.html` â†’ `#pos-provider`

- **JS File**: `admin-master-pos.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L48: ui.inpProvider.value`
  - `L61: ui.inpProvider.value`

### `admin-master-proveedores.html` â†’ `#prov-category`

- **JS File**: `admin-master-proveedores.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L105: inpCategory.value`
  - `L104: inpCategory.innerHTML`

### `admin-master-tarifario.html` â†’ `#input-area`

- **JS File**: `admin-master-tarifario.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L54: ui.inputArea.value`
  - `L64: ui.inputArea.value`
  - `L169: ui.inputArea.value`

### `admin-pagos.html` â†’ `#payVoucher`

- **JS File**: `admin-pagos.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .update( (x), .rpc( (x), .from( (x)
- **JS References**:
  - `L1032: ui.payVoucher.value`

### `admin-pagos.html` â†’ `#payMethod`

- **JS File**: `admin-pagos.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .update( (x), .rpc( (x), .from( (x)
- **JS References**:
  - `L1033: ui.payMethod.value`

### `admin-semanal.html` â†’ `#weekSelect`

- **JS File**: `admin-semanal.js`
- **APIs**: .value (x), .selectedIndex (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .from( (x)
- **JS References**:
  - `L44: weekSelect.value`
  - `L95: weekSelect.value`
  - `L45: weekSelect.selectedIndex`
  - `L36: weekSelect.innerHTML`

### `admin-workdays.html` â†’ `#select-event`

- **JS File**: `admin-workdays.js`
- **APIs**: .value (x), .selectedIndex (x), .options (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .upsert( (x), .rpc( (x), .from( (x)
- **JS References**:
  - `L627: ui.selectEvent.value`
  - `L702: ui.selectEvent.value`
  - `L1039: ui.selectEvent.value`
  - `L1292: ui.selectEvent.value`
  - `L895: ui.selectEvent.selectedIndex`
  - `L1042: ui.selectEvent.selectedIndex`
  - `L1132: ui.selectEvent.selectedIndex`
  - `L895: ui.selectEvent.options`
  - `L1042: ui.selectEvent.options`
  - `L1132: ui.selectEvent.options`
  - `L719: ui.selectEvent.innerHTML`

### `admin-workdays.html` â†’ `#select-template`

- **JS File**: `admin-workdays.js`
- **APIs**: .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .upsert( (x), .rpc( (x), .from( (x)
- **JS References**:
  - `L2597: ui.selectTemplate.innerHTML`

### `admin-workdays.html` â†’ `#sa-filter-clasif`

- **JS File**: `admin-workdays.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .update( (x), .upsert( (x), .rpc( (x), .from( (x)
- **JS References**:
  - `L421: ui.saFilterClasif.value`

### `encargado-barra-personal.html` â†’ `#selectWorkday`

- **JS File**: `encargado-barra-personal.js`
- **APIs**: .value (x), .selectedIndex (x), .options (x), .innerHTML (x), .appendChild (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L585: ui.selectWorkday.value`
  - `L584: ui.selectWorkday.selectedIndex`
  - `L583: ui.selectWorkday.options`
  - `L129: ui.selectWorkday.innerHTML`
  - `L134: ui.selectWorkday.appendChild`

### `encargado-caja-noche.html` â†’ `#open-select-terminal`

- **JS File**: `encargado-caja-noche.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L533: ui.openSelectTerminal.value`

### `encargado-caja-noche.html` â†’ `#open-select-staff`

- **JS File**: `encargado-caja-noche.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L534: ui.openSelectStaff.value`
  - `L471: ui.openSelectStaff.innerHTML`

### `encargado-caja-noche.html` â†’ `#select-terminal`

- **JS File**: `encargado-caja-noche.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L482: ui.selectTerminal.value`
  - `L489: ui.selectTerminal.value`
  - `L533: SelectTerminal.value`

### `encargado-caja-personal.html` â†’ `#select-workday`

- **JS File**: `encargado-caja-personal.js`
- **APIs**: .value (x), .selectedIndex (x), .innerHTML (x), .appendChild (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L535: ui.selectWorkDay.value`
  - `L534: ui.selectWorkDay.selectedIndex`
  - `L118: ui.selectWorkDay.innerHTML`
  - `L123: ui.selectWorkDay.appendChild`

### `logistica-recepcion.html` â†’ `#free-supplier`

- **JS File**: `logistica-recepcion.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .upsert( (x), .from( (x)
- **JS References**:
  - `L491: freeSupplier.value`
  - `L142: freeSupplier.innerHTML`

### `logistica-recepcion.html` â†’ `#free-sku-select`

- **JS File**: `logistica-recepcion.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .update( (x), .upsert( (x), .from( (x)
- **JS References**:
  - `L493: freeSkuSelect.value`
  - `L529: freeSkuSelect.value`
  - `L148: freeSkuSelect.innerHTML`

### `logistica-seguimiento.html` â†’ `#new-status`

- **JS File**: `logistica-seguimiento.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L40: ui.newStatus.value`
  - `L205: ui.newStatus.value`
  - `L253: ui.newStatus.value`

### `logistica-stock.html` â†’ `#adjust-reason`

- **JS File**: `logistica-stock.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .update( (x), .from( (x)
- **JS References**:
  - `L247: adjustReason.value`
  - `L271: adjustReason.value`

### `operativo-master-sku.html` â†’ `#req-type`

- **JS File**: `operativo-master-sku.js`
- **APIs**: .value (x)
- **DB Ops in file**: .insert( (x), .from( (x)
- **JS References**:
  - `L97: selType.value`
  - `L217: selType.value`

### `operativo-master-sku.html` â†’ `#req-sku`

- **JS File**: `operativo-master-sku.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .from( (x)
- **JS References**:
  - `L98: selSku.value`
  - `L221: selSku.value`
  - `L133: selSku.innerHTML`

### `operativo-master-sku.html` â†’ `#req-proveedor`

- **JS File**: `operativo-master-sku.js`
- **APIs**: .value (x), .innerHTML (x)
- **DB Ops in file**: .insert( (x), .from( (x)
- **JS References**:
  - `L104: inpProveedor.value`
  - `L139: inpProveedor.innerHTML`


---

## Action Items

1. **Tier0 pages with CRITICAL/HIGH selects**: Use Wrap approach (no JS changes)
2. **Pages with LOW selects**: Either approach is safe
3. **Design the CustomDropdown component to support BOTH modes**:
   - `mode="wrap"`: enhances existing `<select>` visually
   - `mode="replace"`: creates div-based dropdown with hidden `<input>`
4. **Frontend chat**: implement the component following this analysis
