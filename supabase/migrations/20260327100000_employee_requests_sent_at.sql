-- Kolumna sent_at dla wniosków (po wysłaniu odpowiedzi)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'employee_requests' AND column_name = 'sent_at') THEN
    ALTER TABLE employee_requests ADD COLUMN sent_at TIMESTAMPTZ;
  END IF;
END $$;
COMMENT ON COLUMN employee_requests.sent_at IS 'Data i godzina wysłania odpowiedzi na wniosek (email / wydruk).';
