-- =============================================================
-- Migración: sku_price_history
-- Crea tabla de historial de precios de costo + trigger + seed
-- Resuelve bug: CMV calculado con costo actual, no histórico
-- NOTA: Tabla real = master_sku, columna real = costo
-- =============================================================

-- 1. Tabla de historial
CREATE TABLE IF NOT EXISTS public.sku_price_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id uuid NOT NULL REFERENCES public.master_sku(id) ON DELETE CASCADE,
    cost_price numeric NOT NULL,
    effective_from timestamptz NOT NULL DEFAULT now(),
    effective_to timestamptz, -- NULL = precio vigente
    changed_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.sku_price_history IS
    'Historial de cambios en costo de master_sku. '
    'effective_to = NULL indica el precio actualmente vigente.';

CREATE INDEX IF NOT EXISTS idx_sku_price_history_lookup
    ON public.sku_price_history(sku_id, effective_from DESC);

-- 2. Trigger: registrar cambios de costo automáticamente
CREATE OR REPLACE FUNCTION public.trg_sku_cost_price_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF OLD.costo IS DISTINCT FROM NEW.costo THEN
        -- Cerrar precio anterior
        UPDATE public.sku_price_history
        SET effective_to = now()
        WHERE sku_id = NEW.id AND effective_to IS NULL;

        -- Insertar nuevo precio
        INSERT INTO public.sku_price_history (sku_id, cost_price, changed_by)
        VALUES (NEW.id, NEW.costo, auth.uid());
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sku_cost_price_after_update ON public.master_sku;
CREATE TRIGGER trg_sku_cost_price_after_update
AFTER UPDATE OF costo ON public.master_sku
FOR EACH ROW EXECUTE FUNCTION public.trg_sku_cost_price_history();

-- 3. Seed: insertar precios actuales como punto de partida
INSERT INTO public.sku_price_history (sku_id, cost_price, effective_from)
SELECT id, costo, COALESCE(created_at, now())
FROM public.master_sku
WHERE costo > 0;

-- 4. Helper: obtener costo vigente en una fecha dada
CREATE OR REPLACE FUNCTION public.get_sku_cost_at(
    p_sku_id uuid,
    p_date timestamptz
)
RETURNS numeric
LANGUAGE sql STABLE AS $$
    SELECT cost_price
    FROM public.sku_price_history
    WHERE sku_id = p_sku_id
      AND effective_from <= p_date
      AND (effective_to IS NULL OR effective_to > p_date)
    ORDER BY effective_from DESC
    LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_sku_cost_at IS
    'Retorna el costo de un SKU vigente en la fecha dada. '
    'Usa sku_price_history con rango [effective_from, effective_to).';

-- 5. RLS básico (lectura para autenticados)
ALTER TABLE public.sku_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read sku_price_history"
    ON public.sku_price_history FOR SELECT
    USING (auth.role() = 'authenticated');
