-- Migration: Extend site_config for Passline Links
-- Date: 2026-01-30
-- Purpose: Add name, description, sort_order columns to site_config
--          to support editable Passline link management

-- Step 1: Extend site_config table with new columns
ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Step 2: Create indexes for better performance on passline queries
CREATE INDEX IF NOT EXISTS idx_site_config_key_prefix
  ON site_config(key) WHERE key LIKE 'passline_%';

CREATE INDEX IF NOT EXISTS idx_site_config_sort_order
  ON site_config(sort_order);

-- Step 3: Insert default Passline links
-- Using ON CONFLICT to update if keys already exist
INSERT INTO site_config (key, name, description, url, is_active, sort_order) VALUES
  ('passline_accesos_200', 'ACCESOS 2.00', 'Entrada general al evento', 'https://placeholderpassline.com', true, 10),
  ('passline_accesos_200_alt', 'ACCESOS 2.00 (Alternativo)', 'Entrada general - link alternativo', 'https://placeholderpassline.com', true, 20),
  ('passline_members_pass_200', 'MEMBERS PASS 2.00', 'Pase especial para miembros', 'https://placeholderpassline.com', true, 30),
  ('passline_member_priority_390', 'MEMBER PRIORITY PASS 3.90', 'Pase prioritario para miembros VIP', 'https://placeholderpassline.com', true, 40),
  ('passline_members_vip_only', 'MEMBERS VIP ONLY', 'Acceso exclusivo VIP', 'https://placeholderpassline.com', true, 50)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- Step 4: Verify RLS policies (should already exist)
-- Run this query manually to check:
-- SELECT * FROM pg_policies WHERE tablename = 'site_config';

-- Expected policies:
-- - SELECT: All authenticated users
-- - INSERT/UPDATE/DELETE: admin and operativo roles only

COMMENT ON COLUMN site_config.name IS 'Display name for the configuration item (editable)';
COMMENT ON COLUMN site_config.description IS 'Description or notes for the configuration item (optional)';
COMMENT ON COLUMN site_config.sort_order IS 'Sort order for display purposes (lower numbers appear first)';
