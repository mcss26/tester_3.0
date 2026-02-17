CREATE OR REPLACE VIEW vw_stock_audit_nightly AS
WITH physical_consumption_by_day AS (
    SELECT
        wd.id AS work_day_id,
        ss.sku_id,
        SUM(ss.quantity) FILTER (WHERE ss.type = 'opening') AS opening_stock,
        SUM(ss.quantity) FILTER (WHERE ss.type = 'closing') AS closing_stock
    FROM work_days wd
    JOIN bar_sessions bs ON bs.work_day_id = wd.id
    JOIN bar_stock_snapshots ss ON ss.session_id = bs.id
    WHERE wd.status IN ('ACTIVE', 'CLOSED')
      AND ss.type IN ('opening', 'closing')
    GROUP BY wd.id, ss.sku_id
),
theoretical_consumption_by_day AS (
    SELECT
        bs.work_day_id,
        (ing->>'sku_id')::uuid AS sku_id,
        SUM(bss.quantity * (ing->>'quantity')::numeric) AS theoretical_units
    FROM bar_session_sales bss
    JOIN bar_sessions bs ON bss.session_id = bs.id
    JOIN work_days wd ON bs.work_day_id = wd.id
    JOIN master_recipes mr ON mr.external_id = bss.external_id
    CROSS JOIN LATERAL jsonb_array_elements(mr.ingredients) AS ing
    WHERE wd.status IN ('ACTIVE', 'CLOSED')
    GROUP BY bs.work_day_id, (ing->>'sku_id')::uuid
),
daily_sku_variance AS (
    SELECT
        wd.work_date,
        COALESCE(pc.work_day_id, tc.work_day_id) AS work_day_id,
        COALESCE(pc.sku_id, tc.sku_id) AS sku_id,
        (COALESCE(pc.opening_stock, 0) - COALESCE(pc.closing_stock, 0)) AS consumo_fisico,
        COALESCE(tc.theoretical_units, 0) AS consumo_teorico,
        ((COALESCE(pc.opening_stock, 0) - COALESCE(pc.closing_stock, 0)) - COALESCE(tc.theoretical_units, 0)) AS diferencia_unidades,
        ((COALESCE(pc.opening_stock, 0) - COALESCE(pc.closing_stock, 0)) * ms.costo) AS costo_real,
        (COALESCE(tc.theoretical_units, 0) * ms.costo) AS costo_sistema
    FROM physical_consumption_by_day pc
    FULL OUTER JOIN theoretical_consumption_by_day tc ON pc.work_day_id = tc.work_day_id AND pc.sku_id = tc.sku_id
    JOIN master_sku ms ON ms.id = COALESCE(pc.sku_id, tc.sku_id)
    JOIN work_days wd ON wd.id = COALESCE(pc.work_day_id, tc.work_day_id)
    WHERE wd.status IN ('ACTIVE', 'CLOSED')
),
sessions_per_day AS (
    SELECT
        wd.id AS work_day_id,
        COUNT(DISTINCT bs.id) as total_sessions
    FROM work_days wd
    JOIN bar_sessions bs ON bs.work_day_id = wd.id
    WHERE wd.status IN ('ACTIVE', 'CLOSED')
    GROUP BY wd.id
)
SELECT
    dsv.work_date,
    COUNT(dsv.sku_id) AS total_skus,
    MAX(spd.total_sessions) AS total_sessions,
    COUNT(*) FILTER (WHERE dsv.diferencia_unidades > 0) AS alertas_perdida,
    COUNT(*) FILTER (
        WHERE (dsv.consumo_teorico = 0 AND dsv.consumo_fisico = 0) OR
              (dsv.consumo_teorico > 0 AND ABS(dsv.diferencia_unidades) / dsv.consumo_teorico <= 0.05)
    ) AS dentro_rango,
    COUNT(*) FILTER (WHERE dsv.diferencia_unidades < 0) AS errores_registro,
    SUM(dsv.costo_real) AS total_costo_real,
    SUM(dsv.costo_sistema) AS total_costo_sistema,
    SUM(dsv.costo_real - dsv.costo_sistema) AS total_costo_diferencia,
    (SUM(dsv.costo_real) - SUM(dsv.costo_sistema)) / NULLIF(SUM(dsv.costo_sistema), 0) AS varianza_pct_global
FROM daily_sku_variance dsv
JOIN sessions_per_day spd ON dsv.work_day_id = spd.work_day_id
GROUP BY dsv.work_date
ORDER BY dsv.work_date DESC;
