-- Fix: vw_bar_efficiency theoretical_consumption CTE
-- Bug: JSON key in master_recipes.ingredients is "quantity" but view read "qty" → always NULL
-- Result: theoretical consumption was always 0, making variance/efficiency calculations invalid
-- Impact: vw_night_snapshot.stock_loss now correctly computes; admin-workdays.js and admin-reportes.js unaffected (same columns)

CREATE OR REPLACE VIEW vw_bar_efficiency AS
WITH stock_movements AS (
    SELECT bss.session_id,
        bss.sku_id,
        sum(CASE WHEN bss.type = 'opening' THEN bss.quantity ELSE 0 END) AS stock_opening,
        sum(CASE WHEN bss.type = 'closing' THEN bss.quantity ELSE 0 END) AS stock_closing
    FROM bar_stock_snapshots bss
    GROUP BY bss.session_id, bss.sku_id
), replenished AS (
    SELECT bs_1.id AS session_id,
        ri.sku_id,
        sum(COALESCE(ri.adjust_packs, ri.requested_packs) * COALESCE(ms.pack_qty, 1::numeric)) AS units_replenished
    FROM replenishment_requests rr
        JOIN replenishment_items ri ON ri.request_id = rr.id
        JOIN bar_sessions bs_1 ON bs_1.work_day_id = rr.target_work_day_id AND rr.user_id = bs_1.opened_by
        LEFT JOIN master_sku ms ON ms.id = ri.sku_id
    WHERE ri.is_deleted = false AND (ri.status IS NULL OR ri.status <> 'cancelled')
    GROUP BY bs_1.id, ri.sku_id
), physical_consumption AS (
    SELECT sm.session_id,
        sm.sku_id,
        sm.stock_opening + COALESCE(rep.units_replenished, 0) - sm.stock_closing AS physical_qty,
        (sm.stock_opening + COALESCE(rep.units_replenished, 0) - sm.stock_closing) * COALESCE(ms.costo, 0) AS physical_cost
    FROM stock_movements sm
        LEFT JOIN replenished rep ON rep.session_id = sm.session_id AND rep.sku_id = sm.sku_id
        LEFT JOIN master_sku ms ON ms.id = sm.sku_id
), theoretical_consumption AS (
    SELECT bss.session_id,
        rec_item.value ->> 'sku_id' AS sku_id,
        -- FIX: changed 'qty' to 'quantity' to match actual JSONB key in master_recipes.ingredients
        sum(((rec_item.value ->> 'quantity')::numeric) * bss.quantity) AS theoretical_qty,
        sum(((rec_item.value ->> 'quantity')::numeric) * bss.quantity * COALESCE(ms.costo, 0)) AS theoretical_cost
    FROM bar_session_sales bss
        LEFT JOIN master_recipes mr ON mr.external_id = bss.external_id
        CROSS JOIN LATERAL jsonb_array_elements(mr.ingredients) rec_item(value)
        LEFT JOIN master_sku ms ON ms.id::text = (rec_item.value ->> 'sku_id')
    WHERE mr.id IS NOT NULL
    GROUP BY bss.session_id, (rec_item.value ->> 'sku_id')
), session_summary AS (
    SELECT COALESCE(pc.session_id, tc.session_id) AS session_id,
        sum(COALESCE(pc.physical_cost, 0)) AS cost_physical,
        sum(COALESCE(tc.theoretical_cost, 0)) AS cost_theoretical,
        sum(COALESCE(pc.physical_cost, 0) - COALESCE(tc.theoretical_cost, 0)) AS cost_difference,
        count(*) FILTER (WHERE (COALESCE(pc.physical_qty, 0) - COALESCE(tc.theoretical_qty, 0)) <> 0) AS skus_with_variance
    FROM physical_consumption pc
        FULL JOIN theoretical_consumption tc ON tc.session_id = pc.session_id AND tc.sku_id::uuid = pc.sku_id
    GROUP BY (COALESCE(pc.session_id, tc.session_id))
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
        WHEN COALESCE(ss.cost_theoretical, 0) > 0 THEN COALESCE(ss.cost_difference, 0) / ss.cost_theoretical * 100
        ELSE 0
    END AS variance_percentage,
    CASE
        WHEN COALESCE(ss.cost_theoretical, 0) = 0 THEN 'SIN_DATOS'
        WHEN abs(COALESCE(ss.cost_difference, 0) / ss.cost_theoretical * 100) <= 3 THEN 'EXCELENTE'
        WHEN abs(COALESCE(ss.cost_difference, 0) / ss.cost_theoretical * 100) <= 5 THEN 'BUENO'
        WHEN abs(COALESCE(ss.cost_difference, 0) / ss.cost_theoretical * 100) <= 10 THEN 'ACEPTABLE'
        ELSE 'CRÍTICO'
    END AS efficiency_rating,
    COALESCE(ss.skus_with_variance, 0) AS skus_with_variance,
    COALESCE(revenue.total_amount, 0) AS revenue_total,
    COALESCE(revenue.transaction_count, 0) AS transaction_count,
    COALESCE(revenue.total_amount, 0) - COALESCE(ss.cost_theoretical, 0) AS gross_margin,
    CASE
        WHEN COALESCE(revenue.total_amount, 0) > 0 THEN (COALESCE(revenue.total_amount, 0) - COALESCE(ss.cost_theoretical, 0)) / revenue.total_amount * 100
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
            sum(bar_session_sales.total_amount) AS total_amount,
            count(*) AS transaction_count
        FROM bar_session_sales
        GROUP BY bar_session_sales.session_id
    ) revenue ON revenue.session_id = bs.id;
