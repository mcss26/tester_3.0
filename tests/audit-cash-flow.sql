-- ============================================================
-- AUDIT: Cash Flow — Automated Test Suite
-- Run: paste into Supabase SQL Editor or via MCP execute_sql
-- Expected: All tests PASS
-- ============================================================

WITH test_results AS (

  -- TEST 1: cash_closings tienen work_day_id válido
  SELECT 'T1: cash_closings → work_days FK' as test,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL: ' || COUNT(*) || ' huérfanas' END as result
  FROM cash_closings cc
  LEFT JOIN work_days wd ON wd.id = cc.work_day_id
  WHERE wd.id IS NULL

  UNION ALL

  -- TEST 2: closing_terminals → cash_closings FK
  SELECT 'T2: closing_terminals → cash_closings FK',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL: ' || COUNT(*) || ' huérfanas' END
  FROM closing_terminals ct
  LEFT JOIN cash_closings cc ON cc.id = ct.cash_closing_id
  WHERE cc.id IS NULL

  UNION ALL

  -- TEST 3: closing_terminals → pos_terminals FK
  SELECT 'T3: closing_terminals → pos_terminals FK',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL: ' || COUNT(*) || ' terminales inválidas' END
  FROM closing_terminals ct
  LEFT JOIN pos_terminals pt ON pt.id = ct.terminal_id
  WHERE pt.id IS NULL

  UNION ALL

  -- TEST 4: No hay cash_closings 'open/pending' con work_days 'CLOSED'
  SELECT 'T4: No closings abiertos con jornada cerrada',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' 
         ELSE 'FAIL: ' || COUNT(*) || ' closings abiertos en jornadas cerradas' 
    END
  FROM cash_closings cc
  JOIN work_days wd ON wd.id = cc.work_day_id
  WHERE cc.status IN ('open', 'pending') AND wd.status = 'CLOSED'

  UNION ALL

  -- TEST 5: total_difference = total_declared - total_system (signo correcto)
  SELECT 'T5: total_difference = declared - system',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' 
         ELSE 'FAIL: ' || COUNT(*) || ' closings con diferencia inconsistente'
    END
  FROM cash_closings cc
  WHERE cc.status = 'closed'
    AND cc.total_difference != (cc.total_declared - cc.total_system)

  UNION ALL

  -- TEST 6: conciliacion_diff en vista = declared - system (mismo signo que cash_closings)
  SELECT 'T6: conciliacion_diff signo consistente con cash_closings',
    CASE 
      WHEN COUNT(*) = 0 THEN 'SKIP: no hay datos para comparar'
      WHEN COUNT(*) FILTER (WHERE sign(vns.conciliacion_diff) != sign(cc.total_difference) 
                             AND cc.total_difference != 0) = 0 THEN 'PASS'
      ELSE 'FAIL: ' || COUNT(*) FILTER (WHERE sign(vns.conciliacion_diff) != sign(cc.total_difference) 
                                          AND cc.total_difference != 0) || ' con signo invertido'
    END
  FROM vw_night_snapshot vns
  JOIN cash_closings cc ON cc.work_day_id = vns.work_day_id
  WHERE cc.status = 'closed'

  UNION ALL

  -- TEST 7: cash_movements → cash_closings FK
  SELECT 'T7: cash_movements → cash_closings FK',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL: ' || COUNT(*) || ' movimientos huérfanos' END
  FROM cash_movements cm
  LEFT JOIN cash_closings cc ON cc.id = cm.cash_closing_id
  WHERE cc.id IS NULL

  UNION ALL

  -- TEST 8: Retiros totales coinciden con vw_night_snapshot
  SELECT 'T8: total_retiros en snapshot = SUM(cash_movements)',
    CASE 
      WHEN COUNT(*) = 0 THEN 'SKIP: no hay retiros'
      WHEN COUNT(*) FILTER (WHERE abs(vns.total_retiros - COALESCE(cm_sum.total, 0)) > 0.01) = 0 THEN 'PASS'
      ELSE 'FAIL: retiros no coinciden en ' || COUNT(*) FILTER (WHERE abs(vns.total_retiros - COALESCE(cm_sum.total, 0)) > 0.01) || ' jornadas'
    END
  FROM vw_night_snapshot vns
  LEFT JOIN (
    SELECT cc.work_day_id, SUM(cm.amount) as total
    FROM cash_movements cm
    JOIN cash_closings cc ON cc.id = cm.cash_closing_id
    WHERE cm.type = 'withdrawal'
    GROUP BY cc.work_day_id
  ) cm_sum ON cm_sum.work_day_id = vns.work_day_id
  WHERE vns.total_retiros > 0 OR cm_sum.total > 0

  UNION ALL

  -- TEST 9: gbol_efectivo en snapshot = SUM(system_cash) de terminales
  SELECT 'T9: gbol_efectivo = SUM(closing_terminals.system_cash)',
    CASE 
      WHEN (SELECT COUNT(*) FROM closing_terminals) = 0 THEN 'SKIP: no hay terminales'
      WHEN COUNT(*) FILTER (WHERE abs(vns.gbol_efectivo - COALESCE(ct_sum.total_sys_cash, 0)) > 0.01) = 0 THEN 'PASS'
      ELSE 'FAIL: gbol_efectivo no coincide en ' || COUNT(*) FILTER (WHERE abs(vns.gbol_efectivo - COALESCE(ct_sum.total_sys_cash, 0)) > 0.01) || ' jornadas'
    END
  FROM vw_night_snapshot vns
  LEFT JOIN (
    SELECT cc.work_day_id, SUM(ct.system_cash) as total_sys_cash
    FROM closing_terminals ct
    JOIN cash_closings cc ON cc.id = ct.cash_closing_id
    GROUP BY cc.work_day_id
  ) ct_sum ON ct_sum.work_day_id = vns.work_day_id
  WHERE vns.gbol_efectivo > 0 OR ct_sum.total_sys_cash > 0

  UNION ALL

  -- TEST 10: closing_terminals tiene columna notes
  SELECT 'T10: closing_terminals.notes existe',
    CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL: columna notes no existe' END
  FROM information_schema.columns
  WHERE table_name = 'closing_terminals' AND column_name = 'notes' AND table_schema = 'public'
)
SELECT test, result FROM test_results ORDER BY test;
