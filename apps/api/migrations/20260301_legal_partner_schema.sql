-- Migration: Legal Partner Schema Extension
-- Date: 2026-03-01
-- Adds: partner_type enum, audit_tokens, audit_token_usage, white_label_config
-- Preserves: all existing accounting partner data

-- =============================================================================
-- 1. partner_type enum and column on profiles
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_type') THEN
    CREATE TYPE partner_type AS ENUM ('accounting', 'legal');
  END IF;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_type partner_type DEFAULT 'accounting';

COMMENT ON COLUMN profiles.partner_type IS 'accounting = biuro rachunkowe, legal = kancelaria prawna';

-- =============================================================================
-- 2. audit_tokens and audit_token_usage (legal firm pay-per-audit model)
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_purchased INT NOT NULL DEFAULT 0,
  total_used INT NOT NULL DEFAULT 0,
  price_per_token_pln INT NOT NULL DEFAULT 150000, -- grosze (1500 PLN)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tokens_partner_id ON audit_tokens(partner_id);

CREATE TABLE IF NOT EXISTS audit_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_account_id UUID NOT NULL REFERENCES audit_tokens(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_company_name TEXT NOT NULL,
  client_nip TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  audit_id UUID, -- links to future audit record
  report_generated BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_audit_token_usage_partner_id ON audit_token_usage(partner_id);
CREATE INDEX IF NOT EXISTS idx_audit_token_usage_token_account_id ON audit_token_usage(token_account_id);

ALTER TABLE audit_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_token_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partner sees own tokens" ON audit_tokens;
CREATE POLICY "Partner sees own tokens" ON audit_tokens
  FOR ALL USING (partner_id = auth.uid());

DROP POLICY IF EXISTS "Partner sees own token usage" ON audit_token_usage;
CREATE POLICY "Partner sees own token usage" ON audit_token_usage
  FOR ALL USING (partner_id = auth.uid());

COMMENT ON TABLE audit_tokens IS 'Legal partner token balance: pay-per-audit (1 token = 1 audit).';
COMMENT ON TABLE audit_token_usage IS 'Log of audit tokens consumed per client.';

-- =============================================================================
-- 3. white_label_config (legal firm branding)
-- =============================================================================

CREATE TABLE IF NOT EXISTS white_label_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  firm_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color_hex TEXT DEFAULT '#003366',
  legal_disclaimer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (partner_id)
);

CREATE INDEX IF NOT EXISTS idx_white_label_config_partner_id ON white_label_config(partner_id);

ALTER TABLE white_label_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partner manages own branding" ON white_label_config;
CREATE POLICY "Partner manages own branding" ON white_label_config
  FOR ALL USING (partner_id = auth.uid());

COMMENT ON TABLE white_label_config IS 'Legal partner white-label: firm name, logo, colors, PDF disclaimer.';
COMMENT ON COLUMN white_label_config.logo_url IS 'Supabase Storage URL (e.g. partner-logos bucket).';
COMMENT ON COLUMN white_label_config.primary_color_hex IS 'Navy #003366 default.';
COMMENT ON COLUMN white_label_config.legal_disclaimer IS 'Custom disclaimer text for PDF reports.';

-- =============================================================================
-- 4. Storage bucket: partner-logos (private, 2MB, images only)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-logos',
  'partner-logos',
  false,
  2097152,  -- 2MB
  ARRAY['image/svg+xml', 'image/png', 'image/jpeg']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Optional: policy so authenticated users can upload to their partner folder (path: partner_id/filename)
-- Uncomment and adjust if you want partners to upload via API; otherwise use signed upload URLs from backend.
/*
DROP POLICY IF EXISTS "Partners upload own logo" ON storage.objects;
CREATE POLICY "Partners upload own logo" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'partner-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
DROP POLICY IF EXISTS "Partners read own logo" ON storage.objects;
CREATE POLICY "Partners read own logo" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'partner-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
*/
