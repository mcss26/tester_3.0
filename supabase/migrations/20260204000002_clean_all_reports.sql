-- Clean All Reports for Fresh Start
-- This will delete all consumption and revenue reports

-- Delete all revenue details (new table)
DELETE FROM revenue_details;

-- Delete all revenue reports (new table)
DELETE FROM revenue_reports;

-- Delete all consumption details
DELETE FROM consumption_details;

-- Delete all consumption reports (including any old revenue ones)
DELETE FROM consumption_reports;

-- Verify tables are empty
SELECT 'revenue_reports' as table_name, COUNT(*) as count FROM revenue_reports
UNION ALL
SELECT 'revenue_details', COUNT(*) FROM revenue_details
UNION ALL
SELECT 'consumption_reports', COUNT(*) FROM consumption_reports
UNION ALL
SELECT 'consumption_details', COUNT(*) FROM consumption_details;
