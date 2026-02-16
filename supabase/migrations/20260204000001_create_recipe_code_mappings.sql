-- Migration: Create recipe code mappings table
-- This allows manual mapping of POS codes to recipes

CREATE TABLE IF NOT EXISTS recipe_code_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pos_code text NOT NULL,
    recipe_id uuid NOT NULL REFERENCES master_recipes(id) ON DELETE CASCADE,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT unique_pos_code UNIQUE(pos_code)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recipe_code_mappings_pos_code 
    ON recipe_code_mappings(pos_code);
    
CREATE INDEX IF NOT EXISTS idx_recipe_code_mappings_recipe_id 
    ON recipe_code_mappings(recipe_id);

-- RLS Policies
ALTER TABLE recipe_code_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read code mappings" ON recipe_code_mappings;
CREATE POLICY "Allow authenticated users to read code mappings"
    ON recipe_code_mappings FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert code mappings" ON recipe_code_mappings;
CREATE POLICY "Allow authenticated users to insert code mappings"
    ON recipe_code_mappings FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update code mappings" ON recipe_code_mappings;
CREATE POLICY "Allow authenticated users to update code mappings"
    ON recipe_code_mappings FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete code mappings" ON recipe_code_mappings;
CREATE POLICY "Allow authenticated users to delete code mappings"
    ON recipe_code_mappings FOR DELETE
    TO authenticated
    USING (true);

COMMENT ON TABLE recipe_code_mappings IS 'Manual mapping of POS codes to recipes for revenue import matching';
COMMENT ON COLUMN recipe_code_mappings.pos_code IS 'Code from POS system (Excel column: Codigo)';
COMMENT ON COLUMN recipe_code_mappings.recipe_id IS 'Reference to master_recipes table';
