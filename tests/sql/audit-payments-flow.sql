-- =============================================================
-- Audit Suite: Payments Flow (finance_payments → vw_workday_pnl)
-- 8 tests — Run via: npm run test:payments
-- =============================================================

SELECT * FROM (

  -- TEST 1: finance_payments → work_days FK válido
  SELECT 'T1: finance_payments.work_day_id FK válido',
    CASE WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL: ' || COUNT(*) || ' pagos con work_day_id huérfano'
    END AS result
  FROM finance_payments fp
  WHERE fp.work_day_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM work_days wd WHERE wd.id = fp.work_day_id)

  UNION ALL

  -- TEST 2: finance_payments → cost_definitions FK válido
  SELECT 'T2: finance_payments.cost_definition_id FK válido',
    CASE WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL: ' || COUNT(*) || ' pagos con cost_definition_id huérfano'
    END
  FROM finance_payments fp
  WHERE fp.cost_definition_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM cost_definitions cd WHERE cd.id = fp.cost_definition_id)

  UNION ALL

  -- TEST 3: finance_payments → master_proveedores FK válido
  SELECT 'T3: finance_payments.supplier_id FK válido',
    CASE WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL: ' || COUNT(*) || ' pagos con supplier_id huérfano'
    END
  FROM finance_payments fp
  WHERE fp.supplier_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM master_proveedores mp WHERE mp.id = fp.supplier_id)

  UNION ALL

  -- TEST 4: Pagos DONE deben tener payment_method
  SELECT 'T4: DONE payments tienen payment_method',
    CASE WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL: ' || COUNT(*) || ' pagos DONE sin método de pago'
    END
  FROM finance_payments fp
  WHERE fp.status = 'DONE'
    AND (fp.payment_method IS NULL OR fp.payment_method = '')

  UNION ALL

  -- TEST 5: Pagos DONE deben tener done_at
  SELECT 'T5: DONE payments tienen done_at',
    CASE WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL: ' || COUNT(*) || ' pagos DONE sin fecha de cierre'
    END
  FROM finance_payments fp
  WHERE fp.status = 'DONE'
    AND fp.done_at IS NULL

  UNION ALL

  -- TEST 6: vw_workday_pnl.expense_extras refleja pagos APPROVED+DONE
  SELECT 'T6: PnL expense_extras = SUM(APPROVED+DONE)',
    CASE
      WHEN COUNT(*) = 0 THEN 'SKIP: no hay jornadas con pagos APPROVED/DONE'
      WHEN COUNT(*) FILTER (
        WHERE ABS(pnl.expense_extras - fp_sum.total) > 0.01
      ) = 0 THEN 'PASS'
      ELSE 'FAIL: ' || COUNT(*) FILTER (
        WHERE ABS(pnl.expense_extras - fp_sum.total) > 0.01
      ) || ' jornadas con expense_extras descuadrado'
    END
  FROM (
    SELECT work_day_id, SUM(amount_total) AS total
    FROM finance_payments
    WHERE status IN ('APPROVED', 'DONE')
      AND work_day_id IS NOT NULL
    GROUP BY work_day_id
  ) fp_sum
  JOIN vw_workday_pnl pnl ON pnl.work_day_id = fp_sum.work_day_id

  UNION ALL

  -- TEST 7: No hay pagos con amount_total = 0
  SELECT 'T7: No pagos con monto cero',
    CASE WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL: ' || COUNT(*) || ' pagos con amount_total = 0'
    END
  FROM finance_payments fp
  WHERE fp.amount_total = 0 OR fp.amount_total IS NULL

  UNION ALL

  -- TEST 8: No duplicados (mismo cost_definition + work_day)
  SELECT 'T8: No pagos duplicados por definición+jornada',
    CASE WHEN COUNT(*) = 0 THEN 'PASS'
         ELSE 'FAIL: ' || COUNT(*) || ' combinaciones duplicadas'
    END
  FROM (
    SELECT cost_definition_id, work_day_id, COUNT(*) AS n
    FROM finance_payments
    WHERE cost_definition_id IS NOT NULL
      AND work_day_id IS NOT NULL
    GROUP BY cost_definition_id, work_day_id
    HAVING COUNT(*) > 1
  ) dupes

) audit_results;
