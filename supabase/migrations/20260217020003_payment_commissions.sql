-- =============================================================
-- Migración: payment_commissions
-- Tabla de configuración de tasas de comisión por medio de pago
-- + Vista de cálculo de comisiones por noche operativa
-- =============================================================

-- 1. Tabla de configuración
CREATE TABLE IF NOT EXISTS public.payment_commission_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_method text NOT NULL UNIQUE, -- 'mercadopago_qr', 'mercadopago_punto', 'tarjeta_credito', 'tarjeta_debito'
    commission_rate numeric NOT NULL DEFAULT 0, -- ej: 0.045 = 4.5%
    iva_on_commission numeric NOT NULL DEFAULT 0.21, -- IVA sobre la comisión
    settlement_delay_days integer DEFAULT 0, -- desfase en días hábiles para liquidación
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.payment_commission_config IS
    'Configuración de tasas de comisión por medio de pago digital. '
    'Cada método tiene su tasa, IVA sobre comisión y desfase de liquidación.';

-- 2. Seed: tasas reales (basadas en prototipo mock-data.js)
INSERT INTO public.payment_commission_config (payment_method, commission_rate, settlement_delay_days, notes) VALUES
    ('mercadopago_qr', 0.0099, 1, 'QR estático MP - comisión baja, acreditación inmediata'),
    ('mercadopago_punto', 0.0449, 14, 'Point MP - comisión estándar, liquidación 14 días'),
    ('tarjeta_credito', 0.03, 14, 'Tarjeta crédito vía terminal'),
    ('tarjeta_debito', 0.015, 3, 'Tarjeta débito vía terminal')
ON CONFLICT (payment_method) DO NOTHING;

-- 3. Vista: comisiones calculadas por noche
CREATE OR REPLACE VIEW public.vw_workday_commissions AS
SELECT
    f.noche AS work_date,
    -- Montos brutos por método
    SUM(f.mercadopago) AS total_mp_bruto,
    SUM(f.tarjetas) AS total_tarjetas_bruto,
    SUM(f.digital) AS total_digital_bruto,
    -- Comisiones estimadas
    ROUND(SUM(f.mercadopago * COALESCE(pcc_mp.commission_rate, 0)), 2) AS comision_mp,
    ROUND(SUM(f.tarjetas * COALESCE(pcc_tc.commission_rate, 0)), 2) AS comision_tarjetas,
    -- Total comisiones
    ROUND(
        SUM(f.mercadopago * COALESCE(pcc_mp.commission_rate, 0))
      + SUM(f.tarjetas * COALESCE(pcc_tc.commission_rate, 0))
    , 2) AS total_comisiones,
    -- Neto a recibir (digital - comisiones)
    ROUND(
        SUM(f.digital)
      - SUM(f.mercadopago * COALESCE(pcc_mp.commission_rate, 0))
      - SUM(f.tarjetas * COALESCE(pcc_tc.commission_rate, 0))
    , 2) AS neto_digital
FROM public.import_gbol_facturacion f
LEFT JOIN public.payment_commission_config pcc_mp
    ON pcc_mp.payment_method = 'mercadopago_punto' AND pcc_mp.is_active = true
LEFT JOIN public.payment_commission_config pcc_tc
    ON pcc_tc.payment_method = 'tarjeta_credito' AND pcc_tc.is_active = true
GROUP BY f.noche
ORDER BY f.noche DESC;

COMMENT ON VIEW public.vw_workday_commissions IS
    'Comisiones estimadas por noche operativa. '
    'Aplica tasas de payment_commission_config sobre import_gbol_facturacion.';

-- 4. RLS
ALTER TABLE public.payment_commission_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read payment_commission_config"
    ON public.payment_commission_config FOR SELECT
    USING (auth.role() = 'authenticated');
