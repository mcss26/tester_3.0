-- =============================================================
-- Migración: payment_reconciliation
-- Tabla de tracking para conciliación de pagos digitales
-- Lifecycle: pending → matched (auto) | mismatch → resolved (manual)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.payment_reconciliation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    work_day_id uuid NOT NULL REFERENCES public.work_days(id) ON DELETE CASCADE,
    terminal_id uuid REFERENCES public.pos_terminals(id),
    payment_method text NOT NULL CHECK (payment_method IN ('efectivo', 'mercadopago', 'tarjeta', 'digital')),
    system_amount numeric NOT NULL DEFAULT 0,
    declared_amount numeric NOT NULL DEFAULT 0,
    settled_amount numeric, -- NULL = liquidación pendiente
    diff_amount numeric GENERATED ALWAYS AS (declared_amount - system_amount) STORED,
    status text NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'matched', 'mismatch', 'resolved', 'expired')),
    resolved_by uuid REFERENCES auth.users(id),
    resolved_at timestamptz,
    resolution_notes text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reconciliation_workday ON public.payment_reconciliation(work_day_id);
CREATE INDEX idx_reconciliation_status ON public.payment_reconciliation(status);

COMMENT ON TABLE public.payment_reconciliation IS
    'Tracking de conciliación por método de pago digital. '
    'Compara sistema vs declarado vs liquidación real de la plataforma. '
    'Status: pending → matched (auto, diff < threshold) | mismatch → resolved (manual).';

-- Vista resumen
CREATE OR REPLACE VIEW public.vw_reconciliation_status AS
SELECT
    pr.work_day_id,
    wd.work_date,
    COUNT(*) AS total_items,
    COUNT(*) FILTER (WHERE pr.status = 'matched') AS matched_count,
    COUNT(*) FILTER (WHERE pr.status = 'mismatch') AS mismatch_count,
    COUNT(*) FILTER (WHERE pr.status = 'pending') AS pending_count,
    SUM(pr.diff_amount) AS total_diff,
    CASE
        WHEN COUNT(*) FILTER (WHERE pr.status = 'mismatch') > 0 THEN 'MISMATCH'
        WHEN COUNT(*) FILTER (WHERE pr.status = 'pending') > 0 THEN 'PENDING'
        ELSE 'OK'
    END AS overall_status
FROM public.payment_reconciliation pr
JOIN public.work_days wd ON wd.id = pr.work_day_id
GROUP BY pr.work_day_id, wd.work_date
ORDER BY wd.work_date DESC;

COMMENT ON VIEW public.vw_reconciliation_status IS
    'Dashboard de conciliación por jornada: muestra conteo matched/mismatch/pending.';

-- RLS
ALTER TABLE public.payment_reconciliation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read payment_reconciliation"
    ON public.payment_reconciliation FOR SELECT
    USING (auth.role() = 'authenticated');
