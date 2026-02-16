-- Migration: Create Revenue Tables
-- Description: Separate tables for revenue/sales data with monetary amounts
-- Date: 2026-02-04

-- ============================================================================
-- REVENUE REPORTS (Header)
-- ============================================================================
CREATE TABLE IF NOT EXISTS revenue_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operational_date DATE NOT NULL UNIQUE,
    file_name TEXT,
    total_revenue NUMERIC(12, 2) DEFAULT 0, -- Total $ from all sales
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- REVENUE DETAILS (Line Items per Recipe)
-- ============================================================================
CREATE TABLE IF NOT EXISTS revenue_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES revenue_reports(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES master_recipes(id),
    recipe_name TEXT NOT NULL, -- Historical record
    external_code TEXT, -- Code from POS system
    q_paga NUMERIC(10, 2) DEFAULT 0, -- Paid quantity
    q_sin_cargo NUMERIC(10, 2) DEFAULT 0, -- Complimentary quantity
    q_vip NUMERIC(10, 2) DEFAULT 0, -- VIP card quantity
    total_quantity NUMERIC(10, 2) DEFAULT 0, -- Sum of above
    total_amount NUMERIC(12, 2) DEFAULT 0, -- Revenue in $
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_revenue_reports_date 
    ON revenue_reports(operational_date DESC);

CREATE INDEX IF NOT EXISTS idx_revenue_details_report 
    ON revenue_details(report_id);

CREATE INDEX IF NOT EXISTS idx_revenue_details_recipe 
    ON revenue_details(recipe_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_details ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read on revenue_reports"
    ON revenue_reports FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read on revenue_details"
    ON revenue_details FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert on revenue_reports"
    ON revenue_reports FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on revenue_details"
    ON revenue_details FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated update on revenue_reports"
    ON revenue_reports FOR UPDATE
    TO authenticated
    USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE revenue_reports IS 'Revenue/sales reports with total monetary amounts';
COMMENT ON TABLE revenue_details IS 'Line items per recipe with quantities and amounts';
COMMENT ON COLUMN revenue_details.q_paga IS 'Quantity sold (paid)';
COMMENT ON COLUMN revenue_details.q_sin_cargo IS 'Quantity given as complimentary';
COMMENT ON COLUMN revenue_details.q_vip IS 'Quantity sold with VIP card';
COMMENT ON COLUMN revenue_details.total_amount IS 'Total revenue in $ for this recipe';
