-- ============================================================
-- MIGRATION: 20260216_fix_bar_audit_math
-- FIX: Include replenishment items in physical consumption
--      calculation for both audit views.
-- CORRECTION: Link replenishments to specific bar sessions
--             via user_id = opened_by (prevents multi-bar duplication).
-- IMPACT: Zero DROP, zero ALTER. Only CREATE OR REPLACE VIEW.
-- ============================================================

-- ════════════════════════════════════════════════════════════════
-- VIEW 1: vw_bar_audit_variance (per-SKU detail)
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW vw_bar_audit_variance AS
WITH stock_movements AS (
    SELECT bss.session_id,
        bss.sku_id,
        SUM(CASE WHEN bss.type = 'opening' THEN bss.quantity ELSE 0 END) AS stock_opening,
        SUM(CASE WHEN bss.type = 'closing' THEN bss.quantity ELSE 0 END) AS stock_closing
    FROM bar_stock_snapshots bss
    GROUP BY bss.session_id, bss.sku_id
),
-- Replenishments linked to the SPECIFIC session via user_id = opened_by
replenished AS (
    SELECT
        bs.id AS session_id,
        ri.sku_id,
        SUM(
            COALESCE(ri.adjust_packs, ri.requested_packs)
            * COALESCE(ms.pack_qty, 1)
        ) AS units_replenished
    FROM replenishment_requests rr
    JOIN replenishment_items ri ON ri.request_id = rr.id
    JOIN bar_sessions bs ON bs.work_day_id = rr.target_work_day_id
                        AND rr.user_id = bs.opened_by
    LEFT JOIN master_sku ms ON ms.id = ri.sku_id
    WHERE ri.is_deleted = false
      AND (ri.status IS NULL OR ri.status != 'cancelled')
    GROUP BY bs.id, ri.sku_id
),
physical_consumption AS (
    SELECT sm.session_id,
        sm.sku_id,
        sm.stock_opening,
        sm.stock_closing,
        sm.stock_opening + COALESCE(rep.units_replenished, 0) AS stock_effective,
        (sm.stock_opening + COALESCE(rep.units_replenished, 0)) - sm.stock_closing AS consumo_real,
        ((sm.stock_opening + COALESCE(rep.units_replenished, 0)) - sm.stock_closing) * COALESCE(ms.costo, 0) AS costo_real
    FROM stock_movements sm
    LEFT JOIN replenished rep ON rep.session_id = sm.session_id
                              AND rep.sku_id = sm.sku_id
    LEFT JOIN master_sku ms ON ms.id = sm.sku_id
),
theoretical_consumption AS (
    SELECT bss.session_id,
        (rec_item.value ->> 'sku_id')::uuid AS sku_id,
        SUM(
            COALESCE(
                (rec_item.value ->> 'qty')::numeric,
                (rec_item.value ->> 'quantity')::numeric,
                0
            ) * bss.quantity
        ) AS consumo_sistema,
        SUM(
            COALESCE(
                (rec_item.value ->> 'qty')::numeric,
                (rec_item.value ->> 'quantity')::numeric,
                0
            ) * bss.quantity * COALESCE(ms.costo, 0)
        ) AS costo_sistema
    FROM bar_session_sales bss
    LEFT JOIN master_recipes mr ON mr.external_id = bss.external_id
    CROSS JOIN LATERAL jsonb_array_elements(mr.ingredients) rec_item(value)
    LEFT JOIN master_sku ms ON ms.id = (rec_item.value ->> 'sku_id')::uuid
    WHERE mr.id IS NOT NULL
    GROUP BY bss.session_id, (rec_item.value ->> 'sku_id')::uuid
)
SELECT bs.id AS session_id,
    bs.work_day_id,
    wd.work_date,
    bs.location,
    COALESCE(pc.sku_id, tc.sku_id) AS sku_id,
    ms.nombre AS sku_nombre,
    mc.nombre AS categoria,
    COALESCE(pc.stock_opening, 0) AS stock_apertura,
    COALESCE(pc.stock_closing, 0) AS stock_cierre,
    COALESCE(pc.consumo_real, 0) AS consumo_real,
    COALESCE(tc.consumo_sistema, 0) AS consumo_sistema,
    COALESCE(pc.consumo_real, 0) - COALESCE(tc.consumo_sistema, 0) AS diferencia,
    COALESCE(pc.costo_real, 0) AS costo_real,
    COALESCE(tc.costo_sistema, 0) AS costo_sistema,
    COALESCE(pc.costo_real, 0) - COALESCE(tc.costo_sistema, 0) AS costo_diferencia,
    CASE
        WHEN COALESCE(pc.consumo_real, 0) > 0
            THEN ROUND((COALESCE(pc.consumo_real, 0) - COALESCE(tc.consumo_sistema, 0)) / pc.consumo_real * 100, 2)
        ELSE 0
    END AS varianza_pct,
    CASE
        WHEN COALESCE(pc.consumo_real, 0) = 0 AND COALESCE(tc.consumo_sistema, 0) = 0 THEN 'SIN_MOVIMIENTO'
        WHEN COALESCE(pc.consumo_real, 0) = 0 THEN 'ERROR_REGISTRO'
        WHEN ABS((COALESCE(pc.consumo_real, 0) - COALESCE(tc.consumo_sistema, 0)) / NULLIF(pc.consumo_real, 0) * 100) <= 5 THEN 'DENTRO_DE_RANGO'
        WHEN (COALESCE(pc.consumo_real, 0) - COALESCE(tc.consumo_sistema, 0)) > 0 THEN 'ALERTA_PERDIDA'
        ELSE 'ERROR_REGISTRO'
    END AS clasificacion,
    COALESCE(pc.stock_effective, COALESCE(pc.stock_opening, 0)) AS stock_efectivo,
    COALESCE(rep_display.units_replenished, 0) AS unidades_repuestas,
    bs.status AS session_status,
    opened_by.full_name AS opened_by_name,
    closed_by.full_name AS closed_by_name,
    bs.opened_at,
    bs.closed_at
FROM bar_sessions bs
JOIN work_days wd ON wd.id = bs.work_day_id
LEFT JOIN physical_consumption pc ON pc.session_id = bs.id
FULL JOIN theoretical_consumption tc ON tc.session_id = bs.id AND tc.sku_id = pc.sku_id
LEFT JOIN master_sku ms ON ms.id = COALESCE(pc.sku_id, tc.sku_id)
LEFT JOIN master_categories mc ON mc.id = ms.categoria_id
LEFT JOIN replenished rep_display ON rep_display.session_id = bs.id
                                  AND rep_display.sku_id = COALESCE(pc.sku_id, tc.sku_id)
LEFT JOIN profiles opened_by ON opened_by.id = bs.opened_by
LEFT JOIN profiles closed_by ON closed_by.id = bs.closed_by
WHERE bs.status = 'closed';


-- ════════════════════════════════════════════════════════════════
-- VIEW 2: vw_bar_efficiency (per-session summary)
-- ════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW vw_bar_efficiency AS
WITH stock_movements AS (
    SELECT bss.session_id,
        bss.sku_id,
        SUM(CASE WHEN bss.type = 'opening' THEN bss.quantity ELSE 0 END) AS stock_opening,
        SUM(CASE WHEN bss.type = 'closing' THEN bss.quantity ELSE 0 END) AS stock_closing
    FROM bar_stock_snapshots bss
    GROUP BY bss.session_id, bss.sku_id
),
replenished AS (
    SELECT
        bs.id AS session_id,
        ri.sku_id,
        SUM(
            COALESCE(ri.adjust_packs, ri.requested_packs)
            * COALESCE(ms.pack_qty, 1)
        ) AS units_replenished
    FROM replenishment_requests rr
    JOIN replenishment_items ri ON ri.request_id = rr.id
    JOIN bar_sessions bs ON bs.work_day_id = rr.target_work_day_id
                        AND rr.user_id = bs.opened_by
    LEFT JOIN master_sku ms ON ms.id = ri.sku_id
    WHERE ri.is_deleted = false
      AND (ri.status IS NULL OR ri.status != 'cancelled')
    GROUP BY bs.id, ri.sku_id
),
physical_consumption AS (
    SELECT sm.session_id,
        sm.sku_id,
        (sm.stock_opening + COALESCE(rep.units_replenished, 0)) - sm.stock_closing AS physical_qty,
        ((sm.stock_opening + COALESCE(rep.units_replenished, 0)) - sm.stock_closing) * COALESCE(ms.costo, 0) AS physical_cost
    FROM stock_movements sm
    LEFT JOIN replenished rep ON rep.session_id = sm.session_id
                              AND rep.sku_id = sm.sku_id
    LEFT JOIN master_sku ms ON ms.id = sm.sku_id
),
theoretical_consumption AS (
    SELECT bss.session_id,
        rec_item.value ->> 'sku_id' AS sku_id,
        SUM(((rec_item.value ->> 'qty')::numeric) * bss.quantity) AS theoretical_qty,
        SUM(((rec_item.value ->> 'qty')::numeric) * bss.quantity * COALESCE(ms.costo, 0)) AS theoretical_cost
    FROM bar_session_sales bss
    LEFT JOIN master_recipes mr ON mr.external_id = bss.external_id
    CROSS JOIN LATERAL jsonb_array_elements(mr.ingredients) rec_item(value)
    LEFT JOIN master_sku ms ON ms.id::text = (rec_item.value ->> 'sku_id')
    WHERE mr.id IS NOT NULL
    GROUP BY bss.session_id, (rec_item.value ->> 'sku_id')
),
session_summary AS (
    SELECT COALESCE(pc.session_id, tc.session_id) AS session_id,
        SUM(COALESCE(pc.physical_cost, 0)) AS cost_physical,
        SUM(COALESCE(tc.theoretical_cost, 0)) AS cost_theoretical,
        SUM(COALESCE(pc.physical_cost, 0) - COALESCE(tc.theoretical_cost, 0)) AS cost_difference,
        COUNT(*) FILTER (WHERE (COALESCE(pc.physical_qty, 0) - COALESCE(tc.theoretical_qty, 0)) <> 0) AS skus_with_variance
    FROM physical_consumption pc
    FULL JOIN theoretical_consumption tc ON tc.session_id = pc.session_id AND tc.sku_id::uuid = pc.sku_id
    GROUP BY COALESCE(pc.session_id, tc.session_id)
)
SELECT bs.id AS session_id,
    bs.work_day_id,
    wd.work_date,
    bs.location,
    bs.status,
    bs.opened_at,
    bs.closed_at,
    opened_by.full_name AS opened_by_name,
    closed_by.full_name AS closed_by_name,
    COALESCE(ss.cost_physical, 0) AS cost_physical,
    COALESCE(ss.cost_theoretical, 0) AS cost_theoretical,
    COALESCE(ss.cost_difference, 0) AS cost_difference,
    CASE
        WHEN COALESCE(ss.cost_theoretical, 0) > 0
            THEN COALESCE(ss.cost_difference, 0) / ss.cost_theoretical * 100
        ELSE 0
    END AS variance_percentage,
    CASE
        WHEN COALESCE(ss.cost_theoretical, 0) = 0 THEN 'SIN_DATOS'
        WHEN ABS(COALESCE(ss.cost_difference, 0) / ss.cost_theoretical * 100) <= 3 THEN 'EXCELENTE'
        WHEN ABS(COALESCE(ss.cost_difference, 0) / ss.cost_theoretical * 100) <= 5 THEN 'BUENO'
        WHEN ABS(COALESCE(ss.cost_difference, 0) / ss.cost_theoretical * 100) <= 10 THEN 'ACEPTABLE'
        ELSE 'CRÍTICO'
    END AS efficiency_rating,
    COALESCE(ss.skus_with_variance, 0) AS skus_with_variance,
    COALESCE(revenue.total_amount, 0) AS revenue_total,
    COALESCE(revenue.transaction_count, 0) AS transaction_count,
    COALESCE(revenue.total_amount, 0) - COALESCE(ss.cost_theoretical, 0) AS gross_margin,
    CASE
        WHEN COALESCE(revenue.total_amount, 0) > 0
            THEN (COALESCE(revenue.total_amount, 0) - COALESCE(ss.cost_theoretical, 0)) / revenue.total_amount * 100
        ELSE 0
    END AS gross_margin_percentage,
    CASE
        WHEN COALESCE(ss.cost_difference, 0) > 0 THEN ss.cost_difference
        ELSE 0
    END AS loss_amount
FROM bar_sessions bs
LEFT JOIN work_days wd ON wd.id = bs.work_day_id
LEFT JOIN session_summary ss ON ss.session_id = bs.id
LEFT JOIN profiles opened_by ON opened_by.id = bs.opened_by
LEFT JOIN profiles closed_by ON closed_by.id = bs.closed_by
LEFT JOIN (
    SELECT bar_session_sales.session_id,
        SUM(bar_session_sales.total_amount) AS total_amount,
        COUNT(*) AS transaction_count
    FROM bar_session_sales
    GROUP BY bar_session_sales.session_id
) revenue ON revenue.session_id = bs.id;
