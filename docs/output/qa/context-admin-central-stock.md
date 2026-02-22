# Contexto: admin-central-stock
Generado: 2026-02-22 17:07 | Topic: `admin-central-stock`

> Este archivo contiene todo el contexto relevante sobre **admin-central-stock**.
> Pegalo al inicio de una conversacion para que el agente arranque informado.

## 1. Knowledge Items (2 encontrados)

### Infrastructure and Developer Tooling
Patterns and configurations for the development ecosystem, including third-party integrations (Figma, Supabase MCP), environment setups, local serving protocols, and production migration workflows for the Antigravity project.

#### Artefacto: development\local_serving_protocol.md
```
Once the server is running (usually on `http://127.0.0.1:8080`), modules can be accessed at:
- **Admin**: `http://127.0.0.1:8080/pages/admin/admin-index.html`
- **Solicitudes**: `http://127.0.0.1:8080/pages/admin/admin-solicitudes.html`
- **Stock**: `http://127.0.0.1:8080/pages/admin/admin-central-stock.html`

## Verification Workflow
When an agent is asked to "open local server" or "verify visually":
```

### UI/UX Golden Standard and Remediation Phases
Verified UI/UX Golden Standard framework covering typography, hierarchy, interactions, responsiveness, accessibility (Phase 5), and unification strategy. Includes 10-phase CSS architecture, technical implementation patterns (HTML/JS/Dialogs/Topbar), and successful remediation reports for admin-herramientas and admin-solicitudes.

#### Artefacto: overview.md
```
- **Radius**: SM (4px) to XL (12px).

## 2. Core Component Patterns
These patterns are modeled after the `admin-central-stock.html` reference implementation.
1. **Dashboard Header**: Title, subtitle, and an actions-bar containing tabs (`.tab-chip`) and icon buttons.
2. **Summary Metrics**: High-level KPIs in a 3-column grid (`.summary-metrics-grid`).
## 6. Unification Strategy (Admin Centralization)
The goal is to consolidate fragmented legacy modules into a single, high-performance hub:
- **Main Hub**: `admin-central-stock.html` (Unified Stock, ROI, Recipes, and SKU management).
- **Automation**: Procurement logic centralized in `admin-solicitudes.html`.
- **Simplification**: Legacy `admin-stock` and `admin-master-sku` have been archived.
- **Future Integration**: Manual adjustments (`admin-stock-ajustes`) to be ported as sidebar widgets.
- **Last Sync**: 2026-02-05 (Consolidated `standard-module-guide.md` and `ui-components.md` into `ui-golden-standard.md`).
- **Realigned Skills**: `frontend-developer`, `ui-polisher`, and `ui-ux-auditor` now point exclusively to the Golden Standard as their technical authority.
## 8. Reference Implementation: admin-central-stock.html
The primary reference for all Golden Standard work.
- **Location**: `pages/admin/admin-central-stock.html`
- **Associated CSS**: `assets/css/admin-central-stock.css` (FASE 1-10)
- **Associated JS**: `assets/js/modules/admin/admin-central-stock.js` (Alert/Confirm free)
### Secondary Reference: admin-herramientas.html
Used as the pilot for Phase 5 Accessibility verification.
```

#### Artefacto: implementation\dashboard_header_pattern.md
```
The Dashboard Header's relationship with the primary content container (`.page-card`) is a critical layout decision:

- **Inside the Card**: Use primarily for sub-modules or panels where the header is part of a self-contained widget.
- **Outside the Card (Preferred)**: For main module entry points (e.g., `admin-solicitudes`, `admin-central-stock`). The header should reside directly within the `.page-shell`, separating the module identity from the specific data views. This creates a cleaner "Soft Hierarchy" and better responsiveness.
## 5. Best Practices
- **Spacing**: Maintain a `24px` padding and clear separation from the Topbar (usually handled by `.page-shell` margins).
- **Titles**: Keep titles descriptive but concise. Avoid repeating "GestiÃ³n de..." if not necessary, though it is standard in the current admin suite.
- **Pills**: Use the "Quiet" pill style for general statuses to avoid visual competition with primary action buttons.
- **Actions**: The `.actions-bar` (or `.row-flex`) often contains a refresh button or a primary create button.
- **Minimal Setup**: For a cleaner "Soft Hierarchy" (as seen in `admin-central-stock` and `admin-solicitudes`), contextual action groups can be omitted if the functionality is already handled by a lower-level `.sku-filter-bar`.
```

#### Artefacto: implementation\module_remediation_workflow.md
```

Until global styles are centralized in `components.css`:
- **Localization**: Create a dedicated CSS file for the module (e.g., `assets/css/admin-solicitudes.css`).
-  **Pattern Adoption**: Copy the FASE 1-10 styles from `admin-central-stock.css` to ensure exact visual parity for Topbar, Glassmorphism dropdowns, and header typography.
## 4. JS Behavior Cleanup
```

#### Artefacto: implementation\topbar_dropdown_pattern.md
```
## 4. Visual Integrity & CSS Globalization
During the remediation of `admin-solicitudes.html`, a significant "Visual Regression" was observed when copying the Topbar HTML without the corresponding styles.

- **The Problem**: Standardized HTML architecture relies on page-specific FASE 1-10 CSS (originally in `admin-central-stock.css`). Removing this association breaks the layout (spacing, alignment, glassmorphism effects).
- **The Solution**: Until global styles are centralized, remediation required localizing the Topbar CSS into module-specific files (e.g., `admin-solicitudes.css`).
- **Globalization Goal**: The visual architecture should be migrated to `components.css` or a dedicated `topbar.css` to enable "Copy-Paste" architecture across the repo.
```

#### Artefacto: verification\admin_solicitudes_report.md
```
- **Architecture**: FASE 1-10 Enforced

## Completed Remediation
1. **Topbar Standardization**: Full adoption of the `admin-central-stock` anatomy. Corrected layout regressions by creating a dedicated `admin-solicitudes.css` containing standardized Topbar and dropdown styles.
2. **Dashboard Header**: Implemented the standardized `.dashboard-header` following the "Soft Hierarchy" (Title + Subtitle). Per user request, the header was moved **outside** the `.page-card` container (directly into the `.page-shell`), ensuring exact alignment with the `admin-central-stock` visual style.
3. **Tab Navigation**: Adopted `.sku-filter-bar` pattern. Updated JS to use `.is-active` class and standard `switchTab` logic.
4. **Table Lifecycle**: Tables now wrapped in `table-viewport` > `table-shell` > `table-scroll`. Headers are sticky and content is compact.
5. **Dialog System**: Legacy modal structure replaced with native `<dialog class="modal">`. Interaction logic migrated to `.showModal()`/`.close()`.
```

## 2. Codigo fuente (3 archivos)

- `pages\admin\admin-central-stock.html` (53.677 bytes, mod: 2026-02-22 16:50)
- `assets\js\modules\admin\admin-central-stock.js` (143.457 bytes, mod: 2026-02-22 11:08)
- `assets\css\admin-central-stock.css` (44.389 bytes, mod: 2026-02-22 06:29)

### admin-central-stock.js - Analisis
**Funciones:** `init``, ``setupDefaultDates``, ``bindEvents``, ``nextIndex``, ``updateAdjustmentHint``, ``debounce``, ``handleTabClick``, ``loadPendingRequests``, ``renderRequestsWidget``, ``approveRequest``, ``rejectRequest``, ``bindRequestsWidgetEvents``, ``loadOptions``, ``renderCategoryOptions``, ``bindCategoryDropdownOptions``, ``getAveragePeopleInRange``, ``loadUnifiedData``, ``reportIds``, ``renderStats``, ``calcValorizado``, ``stockNum``, ``renderTable``, ``stockA``, ``stockB``, ``recalculateIdealStock``, ``openNewSkuPanel``, ``openEditSkuPanel``, ``numberOrNull``, ``saveSku``, ``handleApplyFilter``, ``processFileForImport``, ``handleFileSelect``, ``parseCSV``, ``isSemi``, ``parseExcel``, ``processImportData``, ``processConsumptionData``, ``processRevenueData``, ``renderRevenuePreview``, ``renderImportPreview``, ``confirmImport``, ``handleExport``, ``openChartModal``, ``normalize``, ``parseQty``, ``loadProfitabilityData``, ``renderProfitabilityStats``, ``renderProfitabilityTable``, ``search``, ``handleExportProfitability``, ``loadRecipes``, ``renderRecipeStats``, ``renderRecipesTable``, ``openRecipeModal``, ``closeRecipeModal``, ``addIngredientRow``, ``saveRecipe``, ``deleteRecipe``, ``bindRecipeEvents``, ``renderChart``, ``renderConsumptionVsRevenueChart``, ``cost``, ``setupDropbox``, ``preventDefaults``, ``handleFile``, ``showToast``, ``updateChartKPIs``, ``to``, ``getPeriodData``, ``calculateChange``, ``updateTrendIndicator``, ``renderTop5Chart``, ``createChartInstance``, ``openImportsModal``, ``switchImportTab``, ``loadImportHistory``, ``totalQty``, ``recipeCount``, ``renderConsumptionReports``, ``renderRevenueReports``, ``openCodeMappingsModal``, ``loadRecipesForMapping``, ``loadCodeMappings``, ``saveCodeMapping``, ``deleteCodeMapping``, ``openAdjustmentModal``, ``handleAdjustmentSubmit``, ``currentStock`
**Tablas Supabase:** `consumption_details``, ``consumption_reports``, ``inventory_movements``, ``inventory_stock``, ``master_categories``, ``master_proveedores``, ``master_recipes``, ``master_sku``, ``recipe_code_mappings``, ``revenue_details``, ``revenue_reports``, ``sku_change_requests``, ``vw_recipe_profitability``, ``vw_stock_global``, ``work_days`

## 3. Documentacion (27 archivos)

- `docs\tickets-backlog.md`
- `docs\00-source-of-truth\db-schema.md`
- `docs\00-source-of-truth\project-status.md`
- `docs\01-design-system\audit-and-prompts\reports\REPORT-html-css-audit.md`
- `docs\01-design-system\audit-and-prompts\reports\REPORT-js-db-audit.md`
- `docs\01-design-system\pages\admin-central-stock.md`
- `docs\02-ui-ux\ui-golden-standard.md`
- `docs\02-ui-ux\lighthouse\console-errors.md`
- `docs\02-ui-ux\lighthouse\lighthouse-matrix.md`
- `docs\02-ui-ux\lighthouse\README.md`
- `docs\02-ui-ux\lighthouse\admin-central-stock\context.md`
- `docs\02-ui-ux\lighthouse\admin-central-stock\README.md`
- `docs\02-ui-ux\lighthouse\admin-central-stock\summary.md`
- `docs\02-ui-ux\lighthouse\admin-index\context.md`
- `docs\02-ui-ux\lighthouse\admin-solicitudes\context.md`
- `docs\04-operations\testing\tickets\TK-002-modal-showmodal-compat.md`
- `docs\80-ephemeral\agent-logs\css-drift-report.md`
- `docs\80-ephemeral\agent-logs\jsdoc-coverage.md`
- `docs\80-ephemeral\agent-logs\refactor-plan.md`
- `docs\80-ephemeral\agent-logs\wiremap.md`
- `docs\80-ephemeral\agent-logs\prompts\csp-blackscreen-fix.md`
- `docs\80-ephemeral\agent-logs\prompts\fix-form-labels-aria.md`
- `docs\80-ephemeral\agent-logs\qa\context-system.md`
- `docs\80-ephemeral\agent-logs\qa\context-ui.md`
- `docs\output\qa\context-central-stock.md`
- `docs\output\qa\context-index.md`
- `docs\output\qa\context-solicitudes.md`

## 4. Schema
scheme.md no encontrado.

## 5. Git History

### Commits que mencionan 'admin-central-stock'
- 8b0d51c fix(security): Sprint 1 - RLS + MCO_BATCH_ID + console.log cleanup

### Commits que tocan archivos *admin-central-stock*
- 4c7c197 aria
- 2c1949d lighthouse
- 0f66978 docs
- f2f59c1 css
- 658e294 feat(security): RLS P0+P1 hardening ÔÇö 10 migrations, 19 tables refined
- e8b69c8 test
- 98ca53c css
- ea06bae refactor
- 8b0d51c fix(security): Sprint 1 - RLS + MCO_BATCH_ID + console.log cleanup
- 32949aa l

## 6. Reportes previos (3 encontrados)

- `docs\output\qa\context-central-stock.md`
- `docs\output\qa\context-index.md`
- `docs\output\qa\context-solicitudes.md`

## 7. Conversaciones previas (0 encontradas)

No se encontraron conversaciones recientes sobre 'admin-central-stock'.
