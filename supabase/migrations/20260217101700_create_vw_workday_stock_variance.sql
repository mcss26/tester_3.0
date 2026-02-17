-- ============================================================================
-- Migration: vw_workday_stock_variance
-- Purpose:   Aggregate bar stock variance data per work_day + SKU.
--            Collapses per-session rows from vw_bar_audit_variance into
--            a single row per (work_day_id, sku_id) with totals and
--            classification.
-- Phase:     2 (Thick DB — Stock & Variance)
-- Depends:   vw_bar_audit_variance (must exist)
-- Created:   2026-02-17
-- ============================================================================

CREATE OR REPLACE VIEW public.vw_workday_stock_variance AS
SELECT
    v.work_day_id,
    v.work_date,
    v.sku_id,
    v.sku_nombre,
    v.categoria,

    -- Stock totals (summed across sessions for this work_day)
    SUM(v.stock_apertura)                               AS stock_apertura_total,
    SUM(v.unidades_repuestas)                           AS reposiciones_total,
    SUM(v.stock_cierre)                                 AS stock_cierre_real,

    -- Consumption
    SUM(v.consumo_real)                                 AS consumo_real_total,
    SUM(v.consumo_sistema)                              AS consumo_teorico_total,

    -- Stock esperado = apertura + reposiciones - consumo_teórico
    SUM(v.stock_apertura) + SUM(v.unidades_repuestas)
        - SUM(v.consumo_sistema)                        AS stock_esperado,

    -- Varianza = cierre_real - stock_esperado
    SUM(v.stock_cierre)
        - (SUM(v.stock_apertura) + SUM(v.unidades_repuestas)
           - SUM(v.consumo_sistema))                    AS varianza_unidades,

    -- Varianza % (safe division)
    CASE
        WHEN (SUM(v.stock_apertura) + SUM(v.unidades_repuestas)
              - SUM(v.consumo_sistema)) <> 0
        THEN ROUND(
            (
                (SUM(v.stock_cierre)
                 - (SUM(v.stock_apertura) + SUM(v.unidades_repuestas)
                    - SUM(v.consumo_sistema)))
                / NULLIF(
                    SUM(v.stock_apertura) + SUM(v.unidades_repuestas)
                    - SUM(v.consumo_sistema),
                    0)
            ) * 100, 2)
        ELSE 0
    END                                                 AS varianza_pct,

    -- Costos
    SUM(v.costo_real)                                   AS costo_real_total,
    SUM(v.costo_sistema)                                AS costo_teorico_total,
    SUM(v.costo_diferencia)                             AS costo_varianza,

    -- Diferencia real vs teórico (consumo)
    SUM(v.diferencia)                                   AS diferencia_consumo,

    -- Clasificación consolidada por jornada
    CASE
        WHEN SUM(v.consumo_real) = 0 AND SUM(v.consumo_sistema) = 0
            THEN 'SIN_MOVIMIENTO'
        WHEN SUM(v.consumo_real) = 0
            THEN 'ERROR_REGISTRO'
        WHEN ABS(
                (SUM(v.consumo_real) - SUM(v.consumo_sistema))
                / NULLIF(SUM(v.consumo_real), 0) * 100
             ) <= 5
            THEN 'DENTRO_DE_RANGO'
        WHEN (SUM(v.consumo_real) - SUM(v.consumo_sistema)) > 0
            THEN 'ALERTA_PERDIDA'
        ELSE 'ERROR_REGISTRO'
    END                                                 AS clasificacion,

    -- Metadata
    COUNT(DISTINCT v.session_id)                        AS session_count

FROM vw_bar_audit_variance v
GROUP BY
    v.work_day_id,
    v.work_date,
    v.sku_id,
    v.sku_nombre,
    v.categoria;

-- ============================================================================
-- Permissions
-- ============================================================================
GRANT SELECT ON public.vw_workday_stock_variance TO authenticated;
GRANT SELECT ON public.vw_workday_stock_variance TO service_role;
