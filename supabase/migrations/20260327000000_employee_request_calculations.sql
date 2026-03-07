-- Skrzynka Wniosków — część 2: obliczenia Art. 7 + PDF
-- Tabele: evg_groups (słownik), employee_request_calculations, kolumna pdf_url, bucket

-- 1. evg_groups: słownik grup EVG (EVG-1, EVG-2, EVG-3) — używany do wartościowania stanowisk
CREATE TABLE IF NOT EXISTS evg_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  min_score NUMERIC(5,2),
  max_score NUMERIC(5,2)
);
COMMENT ON TABLE evg_groups IS 'Grupy wartościowania stanowisk (EVG-1/2/3). Używane w employee_requests i obliczeniach Art. 7.';

-- Wstaw domyślne 3 grupy jeśli nie istnieją
INSERT INTO evg_groups (id, name, min_score, max_score)
SELECT gen_random_uuid(), 'EVG-1', 1, 33
WHERE NOT EXISTS (SELECT 1 FROM evg_groups WHERE name = 'EVG-1');
INSERT INTO evg_groups (id, name, min_score, max_score)
SELECT gen_random_uuid(), 'EVG-2', 33.01, 66
WHERE NOT EXISTS (SELECT 1 FROM evg_groups WHERE name = 'EVG-2');
INSERT INTO evg_groups (id, name, min_score, max_score)
SELECT gen_random_uuid(), 'EVG-3', 66.01, 100
WHERE NOT EXISTS (SELECT 1 FROM evg_groups WHERE name = 'EVG-3');

-- 2. Dodaj FK evg_group_id -> evg_groups (employee_requests już ma kolumnę evg_group_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'employee_requests_evg_group_id_fkey'
    AND table_name = 'employee_requests'
  ) THEN
    ALTER TABLE employee_requests
    ADD CONSTRAINT employee_requests_evg_group_id_fkey
    FOREIGN KEY (evg_group_id) REFERENCES evg_groups(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Tabela wyników obliczeń dla wniosku
CREATE TABLE IF NOT EXISTS employee_request_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES employee_requests(id) ON DELETE CASCADE,
  evg_group_id UUID REFERENCES evg_groups(id) ON DELETE SET NULL,
  employee_salary NUMERIC(12,2),
  median_female NUMERIC(12,2),
  median_male NUMERIC(12,2),
  gap_percent NUMERIC(6,2),
  n_female INT NOT NULL DEFAULT 0,
  n_male INT NOT NULL DEFAULT 0,
  rodo_masked BOOLEAN NOT NULL DEFAULT FALSE,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_erc_request_id ON employee_request_calculations(request_id);
CREATE INDEX IF NOT EXISTS idx_erc_calculated_at ON employee_request_calculations(request_id, calculated_at DESC);
COMMENT ON TABLE employee_request_calculations IS 'Wyniki obliczeń Art. 7 dla wniosku: mediana M/K, luka %, RODO masking.';

-- 4. Kolumna pdf_url w employee_requests
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'employee_requests' AND column_name = 'pdf_url') THEN
    ALTER TABLE employee_requests ADD COLUMN pdf_url TEXT;
  END IF;
END $$;
COMMENT ON COLUMN employee_requests.pdf_url IS 'URL do wygenerowanego PDF odpowiedzi (Supabase Storage: employee-requests/{org_id}/{request_id}/odpowiedz.pdf).';

-- 5. Bucket storage: utwórz w Supabase Dashboard (Storage → New bucket: employee-requests, private, 5MB, MIME application/pdf)
-- lub w SQL Editor (Storage):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('employee-requests', 'employee-requests', false, 5242880, ARRAY['application/pdf'])
-- ON CONFLICT (id) DO NOTHING;
