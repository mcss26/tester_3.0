# Contexto: workday
Generado: 2026-02-22 17:55 | Topic: `workday`

> Este archivo contiene todo el contexto relevante sobre **workday**.
> Pegalo al inicio de una conversacion para que el agente arranque informado.

## 1. Knowledge Items (3 encontrados)

### Midnight Club Administrative Tools
Documentation of the administrative and operative tools used for managing Midnight Club, including site configuration, stock, and workday planning. Enforces the 'Edit-Not-Create' policy for site_config to maintain synchronicity with the frontend's Controlled Static Mapping.

#### Artefacto: overview.md
```
The project includes a suite of administrative and operative tools (typically found in the `tester_3.0` repository or `pages/operativo/`) designed for club management.

## Core Responsibilities
1. **Workday Management**: Planning and monitoring of event days, staff payroll, and operational status.
2. **Site Configuration**: Managing the `site_config` table which drives content on the public frontend (Pricing, Access links, Hero images).
3. **Stock & Solicitudes**: Managing inventory and internal requests.
4. **Reporting**: Extraction and visualization of operational data (e.g., QR Ticket volume).
- **No New Keys**: Creating new keys is restricted or discouraged because the public frontend requires proactive code mapping for any new card/slot.
## Key Files
- `pages/operativo/operativo-workday.html`: Main dashboard for operational event management.
- `assets/js/modules/operativo/operativo-workday.js`: Logic for managing links and operational data.
- `pages/informes/temp-qr-report.html`: Quick reporting tool for monitoring QR ticket printing activity.
```

#### Artefacto: implementation\site_config_management.md
```

## The Synchronization Chain
1. **Database**: `site_config` stores keys (e.g., `passline_acceso__0200`).
2. **Backoffice**: `operativo-workday.js` allows editing the `name`, `description`, `url`, and `is_active` status of these keys.
3. **Public Frontend**: `shared-ui.js` (`syncDynamicCards`) binds these keys to specifically formatted HTML IDs (e.g., `card_0000`).
## Restriction Policy: "Edit-Not-Create"
Because the public frontend relies on **Controlled Static Mapping**, adding a new entry in the database without a corresponding code update in `accesos.js` or `members-only.js` results in an "invisible entry" that takes up DB space but never renders.
### Implementation Details
- **UI Restrictions**: The "+ Nuevo Link" button in `operativo-workday.html` has been removed (or hidden) and the creation logic in `operativo-workday.js` is disabled. This is a **deliberate design decision** to prevent non-mapped entries from cluttering the database.
- **Workflow**: Staff should only toggle `is_active` and update `url`/`name`/`description` for the 6 canonical slots.
- **Deletion**: The "Eliminar" (ðŸ—‘ï¸) button has been removed to preserve the fixed slot structure.
- **Naming Convention**: Keys follow the standard double-underscore prefixing (e.g., `passline_acceso__`, `passline_members__`).
```

### Infrastructure and Developer Tooling
Patterns and configurations for the development ecosystem, including third-party integrations (Figma, Supabase MCP), environment setups, local serving protocols, and production migration workflows for the Antigravity project.

#### Artefacto: deployment\migration_workflow.md
```
- **Metadata Update**: Update `docs/estado-presente.md` and `docs/screen-map.md` to reflect the module's official status.

## Reference Implementation
- **Case**: `admin-workdays` (February 2026).
- **Result**: Successfully transitioned from a single-column demo to a complex `Sidebar + Main Content` layout that supports staff assignment and cost monitoring in production.
```

### UI/UX Golden Standard and Remediation Phases
Verified UI/UX Golden Standard framework covering typography, hierarchy, interactions, responsiveness, accessibility (Phase 5), and unification strategy. Includes 10-phase CSS architecture, technical implementation patterns (HTML/JS/Dialogs/Topbar), and successful remediation reports for admin-herramientas and admin-solicitudes.

#### Artefacto: overview.md
```
- **Pattern**: `table-viewport table-shell` + Standard Topbar Dropdowns.
- **Status**: âœ… REMEDIATED (2026-02-06).

### Secondary Reference: admin-workdays.html
Reference implementation for `.grid-sidebar-main` with complex state management.
- **Location**: `pages/admin/admin-workdays.html`
- **Layout**: Sidebar (Definition/Costs) + Main (Staff Assignment).
### 11. Reference Patterns (New)
```

## 2. Codigo fuente (7 archivos)

- `pages\admin\admin-workdays.html` (85.561 bytes, mod: 2026-02-22 16:50)
- `pages\operativo\operativo-workday.html` (10.163 bytes, mod: 2026-02-22 16:36)
- `pages\prototypes\lab-workdays` (1 bytes, mod: 2026-02-13 01:21)
- `pages\prototypes\lab-workdays-night` (1 bytes, mod: 2026-02-13 01:21)
- `assets\js\modules\admin\admin-workdays.js` (120.321 bytes, mod: 2026-02-22 13:44)
- `assets\js\modules\operativo\operativo-workday.js` (19.457 bytes, mod: 2026-02-19 21:52)
- `assets\css\admin-workdays.css` (17.445 bytes, mod: 2026-02-16 11:05)

### admin-workdays.js - Analisis
**Funciones:** `getStatusDisplay``, ``init``, ``bindEvents``, ``changeDateByOffset``, ``switchTab``, ``updateTabVisibility``, ``bindFileHandler``, ``loadInitialData``, ``handleDateChange``, ``loadDayDetails``, ``renderBasicPanels``, ``renderEventsDropdown``, ``renderStaffList``, ``renderStaffSlots``, ``renderCostsList``, ``calculateTotals``, ``handleConfirmOrUpdate``, ``handleCreate``, ``handleConfirmPlan``, ``handleOpen``, ``showPreFlightModal``, ``runPreFlightChecks``, ``handlePreFlightConfirm``, ``updateFooterButtons``, ``handleUpdate``, ``openEventModal``, ``closeEventModal``, ``openCostModal``, ``closeCostModal``, ``handleSaveCost``, ``handleCreateEvent``, ``handleCloseWorkday``, ``applyDiffClass``, ``loadCierreData``, ``renderCierreTable``, ``renderCierreTotals``, ``loadQrStats``, ``src``, ``updateQrDiffs``, ``loadBreakdown``, ``renderBreakdown``, ``el``, ``openCloseNightModal``, ``renderPreflightChecks``, ``renderFinancialSummary``, ``_populatePnlModal``, ``fmtPnl``, ``performCloseNight``, ``handleSaveNotes``, ``startPolling``, ``stopPolling``, ``pollKPIs``, ``checkAnomalies``, ``loadAccruals``, ``renderAccruals``, ``total``, ``generateAccruals``, ``adjustAccrual``, ``handleGbolSync``, ``loadFiscalSummary``, ``loadStockAuditData``, ``getEfficiencyRating``, ``renderSessionsTable``, ``renderVarianceTable``, ``renderConsumoTeorico``, ``renderHistoryTable``, ``fmt``, ``diffCell``, ``loadReportDashboard``, ``accruals``, ``loadReportHeader``, ``loadReportKpis``, ``avg``, ``setDelta``, ``pct``, ``initReportChart``, ``renderReportFiscal``, ``renderReportAnomalies``, ``renderReportOps``, ``loadTemplates``, ``renderTemplateDropdown``, ``handleApplyTemplate``, ``openTemplateModal``, ``handleSaveTemplate``, ``loadBenchmarks``, ``renderBenchmarkPills``, ``updateBreakEvenCard`
**Tablas Supabase:** `cash_closings``, ``closing_terminals``, ``cost_definitions``, ``events``, ``finance_payments``, ``master_staff_roles``, ``pos_terminals``, ``profiles``, ``qr_batches``, ``qr_codes``, ``staff_accruals``, ``staff_convocations``, ``vw_bar_audit_variance``, ``vw_bar_efficiency``, ``vw_consumo_teorico``, ``vw_daily_sales``, ``vw_fiscal_summary``, ``vw_night_snapshot``, ``vw_workday_benchmarks``, ``vw_workday_pnl``, ``work_day_staff_planning``, ``work_day_templates``, ``work_days`

### operativo-workday.js - Analisis
**Funciones:** `allowedRoles``, ``init``, ``bindEvents``, ``getOpenWorkDay``, ``updateWorkdayStatusPill``, ``loadPasslineLinks``, ``renderLinksTable``, ``openLinkModal``, ``closeLinkModal``, ``saveLinkType``, ``deleteLinkType``, ``loadStaffStatus``, ``loadRequests`
**Tablas Supabase:** `replenishment_items``, ``replenishment_requests``, ``site_config``, ``staff_convocations``, ``work_days`

## 3. Documentacion (43 archivos)

- `docs\_router.md`
- `docs\00-source-of-truth\backend-rpcs.md`
- `docs\00-source-of-truth\db-schema.md`
- `docs\00-source-of-truth\project-status.md`
- `docs\01-design-system\master-design-spec.md`
- `docs\01-design-system\audit-and-prompts\reports\REPORT-html-css-audit.md`
- `docs\01-design-system\audit-and-prompts\reports\REPORT-js-db-audit.md`
- `docs\01-design-system\pages\admin-workdays.md`
- `docs\02-ui-ux\ui-golden-standard.md`
- `docs\02-ui-ux\lighthouse\console-errors.md`
- `docs\02-ui-ux\lighthouse\lighthouse-matrix.md`
- `docs\02-ui-ux\lighthouse\README.md`
- `docs\02-ui-ux\lighthouse\admin-config\context.md`
- `docs\02-ui-ux\lighthouse\admin-index\context.md`
- `docs\02-ui-ux\lighthouse\admin-reportes\context.md`
- `docs\02-ui-ux\lighthouse\admin-solicitudes\context.md`
- `docs\02-ui-ux\lighthouse\admin-workdays\context.md`
- `docs\02-ui-ux\lighthouse\admin-workdays\README.md`
- `docs\02-ui-ux\lighthouse\admin-workdays\summary.md`
- `docs\03-business-logic\midnight-workflows.md`
- `docs\04-operations\release-pipeline.md`
- `docs\04-operations\testing\tickets\TK-001-crypto-randomuuid-compat.md`
- `docs\04-operations\testing\tickets\TK-002-modal-showmodal-compat.md`
- `docs\04-operations\testing\tickets\TK-003-staff-cost-not-recalculating.md`
- `docs\04-operations\testing\tickets\TK-004-staff-dropdowns-empty.md`
- `docs\04-operations\testing\tickets\TK-005-base-salary-column-missing.md`
- `docs\80-ephemeral\agent-logs\css-drift-report.md`
- `docs\80-ephemeral\agent-logs\jsdoc-coverage.md`
- `docs\80-ephemeral\agent-logs\refactor-plan.md`
- `docs\80-ephemeral\agent-logs\wiremap.md`
- `docs\80-ephemeral\agent-logs\orchestrator\rls-audit-report.md`
- `docs\80-ephemeral\agent-logs\product\prototypes\feature-spec-drinks-by-web.md`
- `docs\80-ephemeral\agent-logs\prompts\fix-form-labels-aria.md`
- `docs\80-ephemeral\agent-logs\prompts\staff-barra-index-refactor.md`
- `docs\80-ephemeral\agent-logs\prompts\systematic-fix-patterns.md`
- `docs\80-ephemeral\agent-logs\qa\context-system.md`
- `docs\80-ephemeral\agent-logs\qa\context-ui.md`
- `docs\80-ephemeral\agent-logs\visual-audit\visual-audit-report.md`
- `docs\output\qa\context-config.md`
- `docs\output\qa\context-index.md`
- `docs\output\qa\context-reportes.md`
- `docs\output\qa\context-solicitudes.md`
- `docs\output\qa\context-workday.md`

## 4. Schema
scheme.md no encontrado.

## 5. Git History

### Commits que mencionan 'workday'
- 8b0d51c fix(security): Sprint 1 - RLS + MCO_BATCH_ID + console.log cleanup
- e41eb95 checkpoint: F0 complete - doc fixes, R2 naming, metrics corrected
- f3fdf8b chore: major cleanup + security hardening + UX updates
- 9a63d55 workdays
- 81c1bf9 Update admin-workdays.js

### Commits que tocan archivos *workday*
- 4c7c197 aria
- 2c1949d lighthouse
- 0f66978 docs
- f2f59c1 css
- 01acf26 test
- 658e294 feat(security): RLS P0+P1 hardening ÔÇö 10 migrations, 19 tables refined
- e8b69c8 test
- 5451edb docs
- 4dcb56e gs
- 98ca53c css

## 6. Reportes previos (5 encontrados)

- `docs\output\qa\context-config.md`
- `docs\output\qa\context-index.md`
- `docs\output\qa\context-reportes.md`
- `docs\output\qa\context-solicitudes.md`
- `docs\output\qa\context-workday.md`

## 7. Conversaciones previas (0 encontradas)

No se encontraron conversaciones recientes sobre 'workday'.
