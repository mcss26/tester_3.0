# Contexto: workdays
Generado: 2026-02-16 08:02 | Topic: `workdays`

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

- `pages\admin\admin-workdays.html` (79.850 bytes, mod: 2026-02-16 02:57)
- `pages\prototypes\lab-workdays` (1 bytes, mod: 2026-02-13 01:21)
- `pages\prototypes\lab-workdays-night` (1 bytes, mod: 2026-02-13 01:21)
- `assets\js\modules\admin\admin-workdays.js` (115.154 bytes, mod: 2026-02-16 03:01)
- `assets\css\admin-workdays.css` (11.157 bytes, mod: 2026-02-16 02:58)

### admin-workdays.js - Analisis
**Funciones:** `getStatusDisplay``, ``init``, ``bindEvents``, ``changeDateByOffset``, ``switchTab``, ``updateTabVisibility``, ``bindFileHandler``, ``loadInitialData``, ``handleDateChange``, ``loadDayDetails``, ``renderBasicPanels``, ``renderEventsDropdown``, ``renderStaffList``, ``renderStaffSlots``, ``uRole``, ``renderCostsList``, ``calculateTotals``, ``handleConfirmOrUpdate``, ``handleCreate``, ``handleConfirmPlan``, ``handleOpen``, ``showPreFlightModal``, ``runPreFlightChecks``, ``handlePreFlightConfirm``, ``handleRevert``, ``updateFooterButtons``, ``handleUpdate``, ``openEventModal``, ``closeEventModal``, ``openCostModal``, ``closeCostModal``, ``handleSaveCost``, ``handleCreateEvent``, ``handleCloseWorkday``, ``applyDiffClass``, ``loadCierreData``, ``renderCierreTable``, ``diff``, ``renderCierreTotals``, ``loadQrStats``, ``src``, ``updateQrDiffs``, ``loadBreakdown``, ``renderBreakdown``, ``el``, ``openCloseNightModal``, ``fmtPnl``, ``performCloseNight``, ``handleSaveNotes``, ``startPolling``, ``stopPolling``, ``pollKPIs``, ``checkAnomalies``, ``loadAccruals``, ``renderAccruals``, ``total``, ``generateAccruals``, ``adjustAccrual``, ``handleGbolSync``, ``loadFiscalSummary``, ``loadStockAuditData``, ``getEfficiencyRating``, ``renderSessionsTable``, ``renderVarianceTable``, ``renderConsumoTeorico``, ``renderHistoryTable``, ``fmt``, ``diffCell``, ``loadReportDashboard``, ``accruals``, ``loadReportHeader``, ``loadReportKpis``, ``avg``, ``setDelta``, ``pct``, ``initReportChart``, ``renderReportFiscal``, ``renderReportAnomalies``, ``renderReportOps`
**Tablas Supabase:** `bar_sessions``, ``cash_closings``, ``closing_terminals``, ``cost_definitions``, ``events``, ``finance_payments``, ``master_staff_roles``, ``pos_terminals``, ``profiles``, ``qr_batches``, ``qr_codes``, ``staff_accruals``, ``staff_convocations``, ``vw_bar_audit_variance``, ``vw_bar_efficiency``, ``vw_consumo_teorico``, ``vw_daily_sales``, ``vw_fiscal_summary``, ``vw_night_snapshot``, ``vw_workday_pnl``, ``work_day_staff_planning``, ``work_days`

## 3. Documentacion (26 archivos)

- `docs\estado-presente.md`
- `docs\INDEX.md`
- `docs\screen-map.md`
- `docs\ui-golden-standard.md`
- `docs\important-data-reference\user-flows-by-role.md`
- `docs\migration\README.md`
- `docs\migration\artifacts\erp-diagnostic-workdays.md`
- `docs\migration\artifacts\kpi-audit.md`
- `docs\migration\artifacts\README.md`
- `docs\migration\artifacts\roadmap_production.md`
- `docs\migration\artifacts\sprint3-implementation_plan.md`
- `docs\migration\artifacts\sprint3-walkthrough.md`
- `docs\migration\artifacts\ux_research_workdays.md`
- `docs\migration\artifacts\workdays-ui-implementation_plan.md`
- `docs\migration\artifacts\workdays-ui-walkthrough.md`
- `docs\modules\admin\admin-master-pos.md`
- `docs\modules\admin\admin-master-tarifario.md`
- `docs\modules\admin\admin-pagos.md`
- `docs\modules\admin\test-devenciones.md`
- `docs\modules\admin\workdays.md`
- `docs\output\README.md`
- `docs\output\frontend\2026-02-16_plan_workdays-unified.md`
- `docs\output\frontend\2026-02-16_research_workdays-deep-research.md`
- `docs\output\frontend\2026-02-16_spec_workdays-screen-map.md`
- `docs\output\qa\2026-02-16_audit_flow-trace.md`
- `docs\output\qa\context-workdays.md`

## 4. Schema

No se encontraron tablas sobre 'workdays' en scheme.md.

## 5. Git History

### Commits que mencionan 'workdays'
- f3fdf8b chore: major cleanup + security hardening + UX updates
- 9a63d55 workdays
- 81c1bf9 Update admin-workdays.js

### Commits que tocan archivos *workdays*
- c00b9e8 feat: add flow-tracer + context-loader scripts, update README and watchdog
- f3fdf8b chore: major cleanup + security hardening + UX updates
- aaaf6aa agent
- bef8c6f css
- 6807fae aline
- a43ad0d wd
- 2ac69db 116
- 8760191 sprint
- 657e591 sprint
- 2ed7cc0 pre prod

## 6. Reportes previos (16 encontrados)

- `docs\output\README.md`
- `docs\output\frontend\2026-02-16_plan_workdays-unified.md`
- `docs\output\frontend\2026-02-16_research_workdays-deep-research.md`
- `docs\output\frontend\2026-02-16_spec_workdays-screen-map.md`
- `docs\output\qa\2026-02-16_audit_flow-trace.md`
- `docs\output\qa\context-workdays.md`
- `docs\migration\README.md`
- `docs\migration\artifacts\erp-diagnostic-workdays.md`
- `docs\migration\artifacts\kpi-audit.md`
- `docs\migration\artifacts\README.md`
- `docs\migration\artifacts\roadmap_production.md`
- `docs\migration\artifacts\sprint3-implementation_plan.md`
- `docs\migration\artifacts\sprint3-walkthrough.md`
- `docs\migration\artifacts\ux_research_workdays.md`
- `docs\migration\artifacts\workdays-ui-implementation_plan.md`
- `docs\migration\artifacts\workdays-ui-walkthrough.md`

## 7. Conversaciones previas (0 encontradas)

No se encontraron conversaciones recientes sobre 'workdays'.
