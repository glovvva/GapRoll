-- Skrzynka Wniosków Pracowniczych (Art. 7 Dyrektywy 2023/970)
-- Tabele: employee_request_links (link publiczny), employee_requests (wnioski)
-- + kolumna allowed_email_domains w companies

-- 1. allowed_email_domains w companies (domena służbowa dla Track A)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'allowed_email_domains') THEN
    ALTER TABLE companies ADD COLUMN allowed_email_domains TEXT[] DEFAULT NULL;
  END IF;
END $$;
COMMENT ON COLUMN companies.allowed_email_domains IS 'Domeny email dozwolone dla wniosków online (np. ARRAY[''firma.pl'']). Puste = brak restrykcji.';

-- 2. Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_request_source') THEN
    CREATE TYPE employee_request_source AS ENUM ('online', 'manual');
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submitted_channel_enum') THEN
    CREATE TYPE submitted_channel_enum AS ENUM ('online', 'ustny', 'papierowy');
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_request_status') THEN
    CREATE TYPE employee_request_status AS ENUM ('pending', 'in_review', 'approved', 'sent');
  END IF;
END $$;

-- 3. Link publiczny (Grażyna generuje → /wnioski/[token])
CREATE TABLE IF NOT EXISTS employee_request_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(token)
);
CREATE INDEX IF NOT EXISTS idx_employee_request_links_company ON employee_request_links(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_request_links_token ON employee_request_links(token);
COMMENT ON TABLE employee_request_links IS 'Unikalne linki do formularza wniosku Art. 7 (Track A). URL: /wnioski/[token].';

-- 4. Wnioski pracownicze
CREATE TABLE IF NOT EXISTS employee_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_email TEXT,
  employee_position TEXT,
  evg_group_id UUID,
  source employee_request_source NOT NULL,
  auth_verified BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_channel submitted_channel_enum NOT NULL DEFAULT 'online',
  status employee_request_status NOT NULL DEFAULT 'pending',
  deadline_at TIMESTAMPTZ,
  verification_token UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_employee_requests_organization ON employee_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_requests_verification_token ON employee_requests(verification_token);
CREATE INDEX IF NOT EXISTS idx_employee_requests_status ON employee_requests(status);
COMMENT ON TABLE employee_requests IS 'Wnioski pracowników Art. 7 Dyrektywy 2023/970. source=online (Track A) lub manual (Track B).';
COMMENT ON COLUMN employee_requests.verification_token IS 'Token do weryfikacji po magic linku (Track A).';
COMMENT ON COLUMN employee_requests.deadline_at IS 'created_at + 60 dni (Art. 7 ust. 4).';

-- 5. Trigger updated_at
CREATE OR REPLACE FUNCTION set_employee_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS employee_requests_updated_at ON employee_requests;
CREATE TRIGGER employee_requests_updated_at
  BEFORE UPDATE ON employee_requests
  FOR EACH ROW EXECUTE PROCEDURE set_employee_requests_updated_at();

-- 6. RLS: employee_request_links — tylko użytkownicy z dostępem do firmy
ALTER TABLE employee_request_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS employee_request_links_select ON employee_request_links;
CREATE POLICY employee_request_links_select ON employee_request_links
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE partner_id = auth.uid()
      UNION
      SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );
DROP POLICY IF EXISTS employee_request_links_insert ON employee_request_links;
CREATE POLICY employee_request_links_insert ON employee_request_links
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE partner_id = auth.uid()
      UNION
      SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- 7. RLS: employee_requests — SELECT/INSERT/UPDATE dla swojej organizacji
ALTER TABLE employee_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS employee_requests_select ON employee_requests;
CREATE POLICY employee_requests_select ON employee_requests
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM companies WHERE partner_id = auth.uid()
      UNION
      SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );
DROP POLICY IF EXISTS employee_requests_insert ON employee_requests;
CREATE POLICY employee_requests_insert ON employee_requests
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT id FROM companies WHERE partner_id = auth.uid()
      UNION
      SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );
DROP POLICY IF EXISTS employee_requests_update ON employee_requests;
CREATE POLICY employee_requests_update ON employee_requests
  FOR UPDATE USING (
    organization_id IN (
      SELECT id FROM companies WHERE partner_id = auth.uid()
      UNION
      SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- Publiczny INSERT (bez auth) — NIE włączamy; API używa service_role_key do wstawiania Track A.
