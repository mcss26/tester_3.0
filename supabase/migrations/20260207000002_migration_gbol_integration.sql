-- ═══════════════════════════════════════════════════════════════════════
-- GBOL API Integration — Schema Migration
-- Date: 2026-02-08
-- Description: Creates tables, views, and column additions for GBOL
--              endpoint integration into tester_3.0 critical flows.
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- 1. import_gbol_facturacion — Fiscal tickets from Endpoint #1
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS import_gbol_facturacion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gbol_ticket_id TEXT NOT NULL,
    noche DATE NOT NULL,

    -- Clasificación fiscal: blanco = AFIP aprobado, negro = sin enviar
    tipo_fiscal TEXT NOT NULL CHECK (tipo_fiscal IN ('blanco', 'negro')),
    tipo_comprobante TEXT CHECK (tipo_comprobante IN ('A', 'B', 'X')),
    cae TEXT,
    nro_factura TEXT,
    punto_venta INT,

    -- Montos
    total NUMERIC(12,2) DEFAULT 0,
    efectivo NUMERIC(12,2) DEFAULT 0,
    digital NUMERIC(12,2) DEFAULT 0,
    tarjetas NUMERIC(12,2) DEFAULT 0,
    mercadopago NUMERIC(12,2) DEFAULT 0,
    base_imponible NUMERIC(12,2) DEFAULT 0,
    iva NUMERIC(12,2) DEFAULT 0,

    -- Terminal mapping
    gbol_caja_nombre TEXT,
    terminal_id UUID REFERENCES pos_terminals(id),

    -- Cliente
    cliente_cuit TEXT,
    cliente_razon TEXT,

    -- Audit
    raw_data JSONB,
    imported_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(gbol_ticket_id, noche)
);

CREATE INDEX IF NOT EXISTS idx_gbol_fact_noche ON import_gbol_facturacion(noche);
CREATE INDEX IF NOT EXISTS idx_gbol_fact_fiscal ON import_gbol_facturacion(tipo_fiscal);
CREATE INDEX IF NOT EXISTS idx_gbol_fact_terminal ON import_gbol_facturacion(terminal_id);

COMMENT ON TABLE import_gbol_facturacion IS 'Tickets fiscales importados desde GBOL API Endpoint #1 (facturacionElectronicaConsulta)';


-- ─────────────────────────────────────────────────────────────────────
-- 2. import_gbol_comandas — Item-level sales from Endpoint #3
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS import_gbol_comandas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gbol_ticket_id TEXT NOT NULL,
    noche DATE NOT NULL,

    -- Item
    tipo TEXT NOT NULL CHECK (tipo IN ('venta', 'descuento', 'cortesia')),
    gbol_caja TEXT,
    hora TEXT,
    external_id TEXT NOT NULL,
    product_name TEXT,
    cantidad NUMERIC(10,2) DEFAULT 0,
    monto NUMERIC(12,2) DEFAULT 0,
    precio_unitario NUMERIC(12,2) DEFAULT 0,

    -- Audit
    imported_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(gbol_ticket_id, external_id, noche)
);

CREATE INDEX IF NOT EXISTS idx_gbol_cmd_noche ON import_gbol_comandas(noche);
CREATE INDEX IF NOT EXISTS idx_gbol_cmd_external ON import_gbol_comandas(external_id);

COMMENT ON TABLE import_gbol_comandas IS 'Detalle de items vendidos por ticket desde GBOL API Endpoint #3 (comandas por noche)';


-- ─────────────────────────────────────────────────────────────────────
-- 3. gbol_sync_log — Audit trail for all sync operations
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gbol_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL,
    noche DATE NOT NULL,
    punto_venta TEXT,
    records_imported INT DEFAULT 0,
    status TEXT CHECK (status IN ('success', 'partial', 'error')),
    error_detail TEXT,
    duration_ms INT,
    synced_by UUID REFERENCES auth.users(id),
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gbol_sync_noche ON gbol_sync_log(noche);

COMMENT ON TABLE gbol_sync_log IS 'Audit log for GBOL API synchronization operations';


-- ─────────────────────────────────────────────────────────────────────
-- 4. ALTER pos_terminals — Add gbol_alias for cajanom mapping
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE pos_terminals
    ADD COLUMN IF NOT EXISTS gbol_alias TEXT;

COMMENT ON COLUMN pos_terminals.gbol_alias
    IS 'Nombre de la caja en GBOL POS (ej: "CAJA 1") para mapeo automático con cajanom';


-- ─────────────────────────────────────────────────────────────────────
-- 5. VIEW vw_fiscal_summary — Fiscal breakdown per night
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_fiscal_summary AS
SELECT
    f.noche,
    COUNT(*) AS total_tickets,
    COUNT(*) FILTER (WHERE f.tipo_fiscal = 'blanco') AS tickets_blanco,
    COUNT(*) FILTER (WHERE f.tipo_fiscal = 'negro') AS tickets_negro,
    COALESCE(SUM(f.total), 0) AS total_bruto,
    COALESCE(SUM(f.total) FILTER (WHERE f.tipo_fiscal = 'blanco'), 0) AS total_blanco,
    COALESCE(SUM(f.total) FILTER (WHERE f.tipo_fiscal = 'negro'), 0) AS total_negro,
    COALESCE(SUM(f.efectivo), 0) AS total_efectivo,
    COALESCE(SUM(f.digital), 0) AS total_digital,
    COALESCE(SUM(f.tarjetas), 0) AS total_tarjetas,
    COALESCE(SUM(f.mercadopago), 0) AS total_mercadopago,
    COALESCE(SUM(f.iva), 0) AS total_iva,
    COALESCE(SUM(f.base_imponible), 0) AS total_base_imponible,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE f.tipo_fiscal = 'blanco')
        / NULLIF(COUNT(*), 0), 1
    ) AS pct_blanqueado,
    -- Per-terminal breakdown
    COUNT(DISTINCT f.gbol_caja_nombre) AS total_cajas
FROM import_gbol_facturacion f
GROUP BY f.noche;

COMMENT ON VIEW vw_fiscal_summary IS 'Resumen fiscal por noche: blanco vs negro, medios de pago, IVA';


-- ─────────────────────────────────────────────────────────────────────
-- 6. VIEW vw_consumo_teorico — Theoretical consumption via recipes
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_consumo_teorico AS
SELECT
    c.noche,
    ri.sku_id,
    s.name AS sku_nombre,
    s.unit AS sku_unidad,
    SUM(c.cantidad * ri.quantity) AS cantidad_consumida,
    COALESCE(SUM(c.cantidad * ri.quantity * s.cost_price), 0) AS costo_consumido,
    COUNT(DISTINCT c.gbol_ticket_id) AS tickets_origen
FROM import_gbol_comandas c
JOIN master_recipes r ON r.external_id = c.external_id
JOIN recipe_items ri ON ri.recipe_id = r.id
JOIN inventory_skus s ON s.id = ri.sku_id
WHERE c.tipo = 'venta'
GROUP BY c.noche, ri.sku_id, s.name, s.unit, s.cost_price;

COMMENT ON VIEW vw_consumo_teorico IS 'Consumo teórico de SKUs por noche, calculado desde comandas GBOL × recetas';


-- ═══════════════════════════════════════════════════════════════════════
-- RLS Policies (adapt to your security model)
-- ═══════════════════════════════════════════════════════════════════════
-- ALTER TABLE import_gbol_facturacion ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE import_gbol_comandas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE gbol_sync_log ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Authenticated read" ON import_gbol_facturacion FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Admin insert" ON import_gbol_facturacion FOR INSERT WITH CHECK (auth.role() = 'authenticated');
