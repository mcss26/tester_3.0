# Workdays Verification Report

> Generado: 2026-02-16 09:41
> Resultado: 18 OK, 4 warnings, 3 alerts

---

- [OK] admin-workdays.html (1276 lineas, 81.9KB)
- [OK] admin-workdays.js (2691 lineas, 121.6KB)
- [OK] admin-workdays.css (718 lineas, 16.2KB)
- [WARN] 6 IDs en JS que NO existen en HTML:
  - `btn-back-list`
  - `panelEvento`
  - `panelHistorico`
  - `panelPlan`
  - `panelStockAudit`
  - `stock-variance`
- [INFO] HTML tiene 190 IDs, JS referencia 153 IDs
- [OK] Estado 'DRAFT' encontrado (1 refs)
- [OK] Estado 'PLANNED' encontrado (1 refs)
- [OK] Estado 'ACTIVE' encontrado (1 refs)
- [OK] Estado 'CLOSED' encontrado (1 refs)
- [OK] Estado 'CANCELLED' encontrado (1 refs)
- [OK] No se detectaron estados en minuscula
- [ALERT] vw_night_snapshot NO encontrada en scheme.md
- [ALERT] vw_bar_audit_variance NO encontrada en scheme.md
- [OK] vw_bar_efficiency documentada en scheme.md
- [OK] vw_staff_accruals_summary documentada en scheme.md
- [ALERT] vw_fiscal_summary NO encontrada en scheme.md
- [OK] vw_finance_weekly documentada en scheme.md
- [OK] vw_workday_pnl documentada en scheme.md
- [OK] vw_workday_benchmarks documentada en scheme.md
- [OK] Tabla work_day_templates documentada en scheme.md
- [INFO] Tabla zoco_settlements no existe aun (Sprint Diferido)
- [INFO] category 'guardarropas' no existe aun (Sprint S8)
- [WARN] vw_finance_weekly NO tiene columnas ZOCO (Gap #7 confirmado)
- [WARN] rpc_create_work_day NO referenciado en JS
- [WARN] rpc_plan_work_day NO referenciado en JS
- [OK] rpc_open_work_day referenciado en JS
- [OK] rpc_close_work_day referenciado en JS
- [OK] rpc_revert_work_day referenciado en JS
### Sprint 4: 6/6
### Sprint 5: 4/4
### Sprint 6: 0/2
### Sprint 7: 0/3
### Sprint 8: 0/2
- [INFO] TOTAL: 10/17 items (59%)

---

*Generado por scripts/workdays-verifier.ps1*

