# Contexto: workdays
Generado: 2026-02-20 05:54 | Topic: `workdays`

> Este archivo contiene todo el contexto relevante sobre **workdays**.
> Pegalo al inicio de una conversacion para que el agente arranque informado.

## 1. Knowledge Items (2 encontrados)

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

## 2. Codigo fuente (5 archivos)

- `pages\admin\admin-workdays.html` (84.827 bytes, mod: 2026-02-18 23:38)
- `pages\prototypes\lab-workdays` (1 bytes, mod: 2026-02-13 01:21)
- `pages\prototypes\lab-workdays-night` (1 bytes, mod: 2026-02-13 01:21)
- `assets\js\modules\admin\admin-workdays.js` (126.496 bytes, mod: 2026-02-19 21:40)
- `assets\css\admin-workdays.css` (17.445 bytes, mod: 2026-02-16 11:05)

### admin-workdays.js - Analisis
**Funciones:** `getStatusDisplay``, ``init``, ``bindEvents``, ``changeDateByOffset``, ``switchTab``, ``updateTabVisibility``, ``bindFileHandler``, ``loadInitialData``, ``handleDateChange``, ``loadDayDetails``, ``renderBasicPanels``, ``renderEventsDropdown``, ``renderStaffList``, ``renderStaffSlots``, ``r``, ``renderCostsList``, ``calculateTotals``, ``handleConfirmOrUpdate``, ``handleCreate``, ``handleConfirmPlan``, ``handleOpen``, ``showPreFlightModal``, ``runPreFlightChecks``, ``handlePreFlightConfirm``, ``updateFooterButtons``, ``handleUpdate``, ``openEventModal``, ``closeEventModal``, ``openCostModal``, ``closeCostModal``, ``handleSaveCost``, ``handleCreateEvent``, ``handleCloseWorkday``, ``applyDiffClass``, ``loadCierreData``, ``renderCierreTable``, ``diff``, ``renderCierreTotals``, ``loadQrStats``, ``src``, ``updateQrDiffs``, ``loadBreakdown``, ``renderBreakdown``, ``el``, ``openCloseNightModal``, ``renderPreflightChecks``, ``renderFinancialSummary``, ``_populatePnlModal``, ``fmtPnl``, ``performCloseNight``, ``handleSaveNotes``, ``startPolling``, ``stopPolling``, ``pollKPIs``, ``checkAnomalies``, ``loadAccruals``, ``renderAccruals``, ``total``, ``generateAccruals``, ``adjustAccrual``, ``handleGbolSync``, ``loadFiscalSummary``, ``loadStockAuditData``, ``getEfficiencyRating``, ``renderSessionsTable``, ``renderVarianceTable``, ``renderConsumoTeorico``, ``renderHistoryTable``, ``fmt``, ``diffCell``, ``loadReportDashboard``, ``accruals``, ``loadReportHeader``, ``loadReportKpis``, ``avg``, ``setDelta``, ``pct``, ``initReportChart``, ``renderReportFiscal``, ``renderReportAnomalies``, ``renderReportOps``, ``loadTemplates``, ``renderTemplateDropdown``, ``handleApplyTemplate``, ``openTemplateModal``, ``handleSaveTemplate``, ``loadBenchmarks``, ``renderBenchmarkPills``, ``updateBreakEvenCard`
**Tablas Supabase:** `cash_closings``, ``closing_terminals``, ``cost_definitions``, ``events``, ``finance_payments``, ``master_staff_roles``, ``pos_terminals``, ``profiles``, ``qr_batches``, ``qr_codes``, ``staff_accruals``, ``staff_convocations``, ``vw_bar_audit_variance``, ``vw_bar_efficiency``, ``vw_consumo_teorico``, ``vw_daily_sales``, ``vw_fiscal_summary``, ``vw_night_snapshot``, ``vw_workday_benchmarks``, ``vw_workday_pnl``, ``work_day_staff_planning``, ``work_day_templates``, ``work_days`

## 3. Documentacion (48 archivos)

- `docs\logica\night-cash-closing.md`
- `docs\logica\workday-management.md`
- `docs\operaciones\plan-production-ready.md`
- `docs\operaciones\testing\tickets\TK-001-crypto-randomuuid-compat.md`
- `docs\operaciones\testing\tickets\TK-002-modal-showmodal-compat.md`
- `docs\operaciones\testing\tickets\TK-003-staff-cost-not-recalculating.md`
- `docs\operaciones\testing\tickets\TK-004-staff-dropdowns-empty.md`
- `docs\operaciones\testing\tickets\TK-005-base-salary-column-missing.md`
- `docs\output\qa\context-workdays.md`
- `docs\source-of-truth\estado-presente.md`
- `docs\source-of-truth\scheme.md`
- `docs\source-of-truth\screen-map.md`
- `docs\source-of-truth\user-flows-by-role.md`
- `docs\UI-UX\ui-golden-standard.md`
- `docs\_generated\README.md`
- `docs\_generated\frontend\2026-02-16_plan_workdays-unified.md`
- `docs\_generated\frontend\2026-02-16_research_workdays-deep-research.md`
- `docs\_generated\frontend\2026-02-16_spec_workdays-screen-map.md`
- `docs\_generated\migration\README.md`
- `docs\_generated\migration\artifacts\erp-diagnostic-workdays.md`
- `docs\_generated\migration\artifacts\kpi-audit.md`
- `docs\_generated\migration\artifacts\README.md`
- `docs\_generated\migration\artifacts\roadmap_production.md`
- `docs\_generated\migration\artifacts\sprint3-implementation_plan.md`
- `docs\_generated\migration\artifacts\sprint3-walkthrough.md`
- `docs\_generated\migration\artifacts\ux_research_workdays.md`
- `docs\_generated\migration\artifacts\workdays-ui-implementation_plan.md`
- `docs\_generated\migration\artifacts\workdays-ui-walkthrough.md`
- `docs\_generated\orchestrator\truth.md`
- `docs\_generated\orchestrator\archive\2026-02-16_plan_botellas_audit.md`
- `docs\_generated\orchestrator\archive\2026-02-16_report_context-and-work-summary.md`
- `docs\_generated\orchestrator\archive\2026-02-16_report_verifier-remediation.md`
- `docs\_generated\orchestrator\archive\2026-02-16_supabase_discrepancies.md`
- `docs\_generated\orchestrator\archive\2026-02-19_plan_page-build.md`
- `docs\_generated\orchestrator\reports\REPORT-html-css-audit.md`
- `docs\_generated\orchestrator\reports\REPORT-js-db-audit.md`
- `docs\_generated\qa\2026-02-16_audit_flow-trace.md`
- `docs\_generated\qa\2026-02-16_audit_workdays-deep-verification.md`
- `docs\_generated\qa\2026-02-16_audit_workdays-verification.md`
- `docs\_generated\qa\2026-02-16_context_workdays.md`
- `docs\_generated\qa\2026-02-19_audit_routing-docs-redundancies.md`
- `docs\_generated\qa\context-system.md`
- `docs\_generated\qa\context-ui.md`
- `docs\_generated\ui-scan\compliance-matrix.md`
- `docs\_generated\ui-scan\rescan-report-20260217-0639.md`
- `docs\_generated\ui-scan\select-risk-report.md`
- `docs\_generated\ui-scan\cli-prompts\admin-workdays.md`
- `docs\_generated\ui-scan\cli-prompts\index.md`

## 4. Schema
scheme.md no encontrado.

## 5. Git History

### Commits que mencionan 'workdays'
- 8b0d51c fix(security): Sprint 1 - RLS + MCO_BATCH_ID + console.log cleanup
- e41eb95 checkpoint: F0 complete - doc fixes, R2 naming, metrics corrected
- f3fdf8b chore: major cleanup + security hardening + UX updates
- 9a63d55 workdays
- 81c1bf9 Update admin-workdays.js

### Commits que tocan archivos *workdays*
- ea06bae refactor
- 8b0d51c fix(security): Sprint 1 - RLS + MCO_BATCH_ID + console.log cleanup
- 853528a chore: workspace cleanup + agent routing fixes
- 32949aa l
- 7e906ac s
- dff408e lit
- e03b54c feat(T1.1): connect 3 orphan admin pages to admin-index nav
- e41eb95 checkpoint: F0 complete - doc fixes, R2 naming, metrics corrected
- c00b9e8 feat: add flow-tracer + context-loader scripts, update README and watchdog
- f3fdf8b chore: major cleanup + security hardening + UX updates

## 6. Reportes previos (1 encontrados)

- `docs\output\qa\context-workdays.md`

## 7. Conversaciones previas (0 encontradas)

No se encontraron conversaciones recientes sobre 'workdays'.
