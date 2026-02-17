-- =============================================================
-- Migración: fix_consumo_teorico
-- Actualiza vw_consumo_teorico para usar precio histórico
-- via get_sku_cost_at() en lugar del costo actual
-- NOTA: Usa estructura real: master_sku.costo, jsonb ingredients
-- =============================================================

CREATE OR REPLACE VIEW public.vw_consumo_teorico AS
SELECT
    c.noche,
    (elem.value ->> 'sku_id')::uuid AS sku_id,
    s.nombre AS sku_nombre,
    SUM(c.cantidad * ((elem.value ->> 'quantity')::numeric)) AS cantidad_consumida,
    COALESCE(SUM(
        c.cantidad * ((elem.value ->> 'quantity')::numeric) *
        COALESCE(
            public.get_sku_cost_at((elem.value ->> 'sku_id')::uuid, (c.noche || ' 23:59:59')::timestamptz),
            s.costo  -- fallback al costo actual si no hay historial
        )
    ), 0) AS costo_consumido,
    COUNT(DISTINCT c.gbol_ticket_id) AS tickets_origen
FROM import_gbol_comandas c
JOIN master_recipes r ON r.external_id = c.external_id
CROSS JOIN LATERAL jsonb_array_elements(r.ingredients) elem(value)
JOIN master_sku s ON s.id = (elem.value ->> 'sku_id')::uuid
WHERE c.tipo = 'venta'
GROUP BY c.noche, (elem.value ->> 'sku_id')::uuid, s.nombre;

COMMENT ON VIEW public.vw_consumo_teorico IS
    'Consumo teórico de SKUs por noche, calculado desde comandas GBOL × recetas. '
    'Usa get_sku_cost_at() para precio histórico (fallback: costo actual).';
