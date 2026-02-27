-- Data Table View (Podgląd Załadowanych Danych): reporting_period + data_corrections_audit
-- Run in Supabase SQL Editor if migrations are not applied automatically.

-- 1. Add reporting_period to payroll_data (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payroll_data' AND column_name = 'reporting_period'
  ) THEN
    ALTER TABLE payroll_data ADD COLUMN reporting_period TEXT DEFAULT '2025-Q4';
  END IF;
END $$;

-- 2. data_corrections_audit: audit log for inline edits
-- Uses user_id for RLS (matches payroll_data ownership; no organizations table in current schema)
CREATE TABLE IF NOT EXISTS data_corrections_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  record_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  justification TEXT NOT NULL CHECK (char_length(justification) >= 20),
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE data_corrections_audit ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view corrections for records they own (payroll_data.user_id)
DROP POLICY IF EXISTS data_corrections_audit_select_own ON data_corrections_audit;
CREATE POLICY data_corrections_audit_select_own ON data_corrections_audit FOR SELECT
  USING (user_id = auth.uid());

-- RLS: Users can insert corrections for their own records
DROP POLICY IF EXISTS data_corrections_audit_insert_own ON data_corrections_audit;
CREATE POLICY data_corrections_audit_insert_own ON data_corrections_audit FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_corrections_record_id ON data_corrections_audit(record_id);
CREATE INDEX IF NOT EXISTS idx_corrections_user_changed ON data_corrections_audit(user_id, changed_at DESC);
