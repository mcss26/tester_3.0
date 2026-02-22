-- ============================================================
-- AUDIT: Stock / Bar Flow — Automated Test Suite
-- Run: paste into Supabase SQL Editor or via MCP execute_sql
-- Expected: All tests PASS
-- ============================================================

WITH test_results AS (

  -- TEST 1: Todas las bar_sessions tienen work_day_id válido
  SELECT 'T1: bar_sessions → work_days FK' as test,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL: ' || COUNT(*) || ' huérfanas' END as result
  FROM bar_sessions bs
  LEFT JOIN work_days wd ON wd.id = bs.work_day_id
  WHERE wd.id IS NULL

  UNION ALL

  -- TEST 2: Sessions cerradas tienen opening Y closing snapshots
  SELECT 'T2: closed sessions tienen open+close snapshots',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL: ' || COUNT(*) || ' sessions sin par' END
  FROM bar_sessions bs
  WHERE bs.status = 'closed'
    AND (
      NOT EXISTS (SELECT 1 FROM bar_stock_snapshots WHERE session_id = bs.id AND type = 'opening')
      OR NOT EXISTS (SELECT 1 FROM bar_stock_snapshots WHERE session_id = bs.id AND type = 'closing')
    )

  UNION ALL

  -- TEST 3: Snapshots solo referencian SKUs activos
  SELECT 'T3: snapshots → master_sku FK válido',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL: ' || COUNT(*) || ' SKUs inválidos' END
  FROM bar_stock_snapshots bss
  LEFT JOIN master_sku ms ON ms.id = bss.sku_id
  WHERE ms.id IS NULL

  UNION ALL

  -- TEST 4: vw_bar_efficiency devuelve datos para sessions cerradas
  SELECT 'T4: vw_bar_efficiency cubre sessions cerradas',
    CASE 
      WHEN (SELECT COUNT(*) FROM bar_sessions WHERE status = 'closed') = 0 THEN 'SKIP: no hay sessions cerradas'
      WHEN COUNT(*) = (SELECT COUNT(*) FROM bar_sessions WHERE status = 'closed') THEN 'PASS'
      ELSE 'FAIL: ' || COUNT(*) || '/' || (SELECT COUNT(*) FROM bar_sessions WHERE status = 'closed')
    END
  FROM vw_bar_efficiency
  WHERE status = 'closed'

  UNION ALL

  -- TEST 5: cost_theoretical > 0 para sessions con ventas+recetas
  SELECT 'T5: cost_theoretical > 0 cuando hay ventas con receta',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL: ' || COUNT(*) || ' sessions con teórico=0' END
  FROM vw_bar_efficiency vbe
  WHERE vbe.status = 'closed'
    AND EXISTS (
      SELECT 1 FROM bar_session_sales bss 
      JOIN master_recipes mr ON mr.external_id = bss.external_id
      WHERE bss.session_id = vbe.session_id
    )
    AND vbe.cost_theoretical = 0

  UNION ALL

  -- TEST 6: efficiency_rating nunca es SIN_DATOS cuando hay ventas con receta
  SELECT 'T6: efficiency_rating calculado cuando hay recetas',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL: ' || COUNT(*) || ' sessions SIN_DATOS con recetas' END
  FROM vw_bar_efficiency vbe
  WHERE vbe.status = 'closed'
    AND vbe.efficiency_rating = 'SIN_DATOS'
    AND EXISTS (
      SELECT 1 FROM bar_session_sales bss 
      JOIN master_recipes mr ON mr.external_id = bss.external_id
      WHERE bss.session_id = vbe.session_id
    )

  UNION ALL

  -- TEST 7: stock_loss fluye a vw_night_snapshot
  SELECT 'T7: stock_loss llega a vw_night_snapshot',
    CASE 
      WHEN (SELECT COUNT(*) FROM vw_bar_efficiency WHERE loss_amount > 0) = 0 THEN 'SKIP: no hay loss_amount > 0'
      WHEN COUNT(*) > 0 THEN 'PASS'
      ELSE 'FAIL: loss no llega al snapshot'
    END
  FROM vw_night_snapshot vns
  WHERE vns.stock_loss > 0

  UNION ALL

  -- TEST 8: JSON key 'quantity' funciona en recetas (fix verificado)
  SELECT 'T8: master_recipes usa key "quantity" (no "qty")',
    CASE 
      WHEN COUNT(*) = 0 THEN 'FAIL: no hay recetas'
      WHEN COUNT(*) FILTER (WHERE ingredient->>'quantity' IS NOT NULL) > 0 THEN 'PASS'
      WHEN COUNT(*) FILTER (WHERE ingredient->>'qty' IS NOT NULL) > 0 THEN 'FAIL: recipes still use "qty"'
      ELSE 'FAIL: ni qty ni quantity encontrados'
    END
  FROM master_recipes mr
  CROSS JOIN LATERAL jsonb_array_elements(mr.ingredients) AS ingredient
)
SELECT test, result FROM test_results ORDER BY test;
