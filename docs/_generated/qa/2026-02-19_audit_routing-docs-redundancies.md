# QA Audit Report

**Date**: 2026-02-19 · **Scope**: Routing · Docs · Redundancies · Recomendaciones

---

## 1. Routing ✅

### 1.1 Tier 0 — All pages exist

| Page                         | Exists |
| :--------------------------- | :----: |
| `admin-workdays.html`        |   ✅   |
| `admin-central-stock.html`   |   ✅   |
| `admin-pagos.html`           |   ✅   |
| `admin-solicitudes.html`     |   ✅   |
| `staff-caja-index.html`      |   ✅   |
| `staff-barra-index.html`     |   ✅   |
| `encargado-caja-noche.html`  |   ✅   |
| `encargado-barra-noche.html` |   ✅   |

### 1.2 Tier 1 — All pages exist

| Page                          | Exists |
| :---------------------------- | :----: |
| `operativo-solicitudes.html`  |   ✅   |
| `logistica-distribucion.html` |   ✅   |
| `encargado-recepcion.html`    |   ✅   |
| `qr/monitor.html`             |   ✅   |
| `balance-semanal.html`        |   ✅   |

### 1.3 Role Landings — All pages exist

All 11 roles (`admin`, `contable`, `manager`, `operativo`, `logistico`, `encargado_caja`, `encargado_barra`, `staff_caja`, `staff_barra`, `gerencia`, `member`) point to valid HTML files. ✅

### 1.4 Pages without routing coverage

These 26 pages are NOT covered by any REGISTRY routing rule:

| Page                                | Risk |
| :---------------------------------- | :--: |
| `admin-config.html`                 |  🟡  |
| `admin-master-categorias.html`      |  🟡  |
| `admin-master-nomina.html`          |  🟡  |
| `admin-master-pos.html`             |  🟡  |
| `admin-master-proveedores.html`     |  🟡  |
| `admin-master-tarifario.html`       |  🟡  |
| `admin-reportes.html`               |  🟡  |
| `admin-semanal.html`                |  🟡  |
| `qr/generator.html`                 |  🟡  |
| `qr/index.html`                     |  🟡  |
| `encargado-barra-personal.html`     |  🟢  |
| `encargado-caja-personal.html`      |  🟢  |
| `encargado-barra-index.html`        |  🟢  |
| `encargado-caja-index.html`         |  🟢  |
| `logistica-index.html`              |  🟢  |
| `logistica-recepcion.html`          |  🟢  |
| `logistica-seguimiento.html`        |  🟢  |
| `logistica-stock.html`              |  🟢  |
| `operativo-index.html`              |  🟢  |
| `operativo-analisis.html`           |  🟢  |
| `operativo-stock.html`              |  🟢  |
| `operativo-workday.html`            |  🟢  |
| `operativo-master-proveedores.html` |  🟢  |
| `operativo-master-sku.html`         |  🟢  |
| `cms-members.html`                  |  🟢  |
| `test-devenciones.html`             |  🟡  |

> [!NOTE]
> Landing pages (index) and secondary pages naturally don't need routing rules. The 🟡 pages (admin masters, reportes, QR tools, test pages) might benefit from a `master_data` or `qr_tools` routing rule.

---

## 2. Coherencia HTML ↔ JS

### 2.1 JS sin HTML (orphans)

| JS Module          | HTML Match                   |  Status   |
| :----------------- | :--------------------------- | :-------: |
| `admin-portal.js`  | No `admin-portal.html`       | ❌ Orphan |
| `operativo-erp.js` | No `operativo-erp.html`      | ❌ Orphan |
| `login.js`         | `login.html` (at root level) |   ✅ OK   |

### 2.2 HTML sin JS

| HTML Page                 | JS Match                  |             Status             |
| :------------------------ | :------------------------ | :----------------------------: |
| `staff-barra-index.html`  | No `staff-barra-index.js` |           ❌ Missing           |
| `components_catalog.html` | No JS module              |  🟢 Expected (static catalog)  |
| `layout_patterns.html`    | No JS module              | 🟢 Expected (static reference) |
| `module-audit.html`       | No JS module              |   🟢 Expected (static tool)    |

---

## 3. Redundancies

### 3.1 Naming convention violations ✅

- `*_old`, `*_backup`, `*_copy`, `*_v2`, `*.bak` → **0 files found**

### 3.2 Temp files

| File                       |  Action   |
| :------------------------- | :-------: |
| `git_diff_temp.txt` (root) | 🔴 Delete |

### 3.3 QA reports not following naming convention

| File                                                | Issue                                     |
| :-------------------------------------------------- | :---------------------------------------- |
| `docs/_generated/qa/reporte_comparativo_ui_scan.md` | Missing date prefix, Spanish mixed naming |
| `docs/_generated/qa/workdays-progressive.md`        | Missing date prefix, no type marker       |

---

## 4. Documentation

### 4.1 Source-of-truth files ✅

All 5 architecture files exist in `docs/architecture/`:

- `scheme.md` (66 KB) ✅
- `estado-presente.md` (21 KB) ✅
- `screen-map.md` (22 KB) ✅
- `backend-architecture-map.md` (19 KB) ✅
- `ui-golden-standard.md` (43 KB) ✅

### 4.2 Duplicate content in docs/audits/

| File in `docs/audits/`          | Duplicate in `docs/_generated/qa/`               |
| :------------------------------ | :----------------------------------------------- |
| `flow-trace.md`                 | `2026-02-16_audit_flow-trace.md`                 |
| `workdays-deep-verification.md` | `2026-02-16_audit_workdays-deep-verification.md` |

> [!WARNING]
> `docs/audits/` contains files that appear to also exist in `docs/_generated/qa/`. One location should be canonical. Per AGENT.md, `docs/_generated/qa/` is the correct output path.

### 4.3 `docs/_generated/` structure

Structure correctly mirrors agent names: `data/`, `frontend/`, `logic/`, `orchestrator/`, `product/`, `qa/`, `security-ops/`, `ui-scan/` ✅

---

## 5. Recommendations (prioritized)

|  #  | Sev | Finding                                                       | Recommended Fix                                                      |    Agent     |
| :-: | :-: | :------------------------------------------------------------ | :------------------------------------------------------------------- | :----------: |
|  1  | 🔴  | `git_diff_temp.txt` at root                                   | Delete                                                               |      —       |
|  2  | 🔴  | `docs/audits/` has duplicate content vs `docs/_generated/qa/` | Move canonical to `_generated/qa/`, delete `docs/audits/` or archive |      qa      |
|  3  | 🟡  | `admin-portal.js` orphan (no HTML)                            | Verify if dead code → delete, or create page                         |    logic     |
|  4  | 🟡  | `operativo-erp.js` orphan (no HTML)                           | Verify if dead code → delete, or create page                         |    logic     |
|  5  | 🟡  | `staff-barra-index.html` has no JS module                     | Verify if it needs one (even if minimal)                             |   frontend   |
|  6  | 🟡  | 2 QA reports don't follow naming convention                   | Rename to `YYYY-MM-DD_{tipo}_{tema}.md`                              |      qa      |
|  7  | 🟢  | 10 admin/QR pages lack routing rules                          | Consider adding `master_data` and `qr_tools` routing rules           | orchestrator |
|  8  | 🟢  | `test-devenciones.html` in pages/                             | Move to `prototypes/` or delete if unused                            |      qa      |
