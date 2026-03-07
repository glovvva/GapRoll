-- Naprawa RLS profiles (infinite recursion 42P17) + kolumna partner_type
--
-- Problem: gdzieś poza migracjami dodano policy na profiles zawierającą
-- podzapytanie SELECT FROM profiles → nieskończona rekurencja przy każdym
-- zapytaniu do tabeli profiles (błąd HTTP 500).
--
-- Fix: usuń WSZYSTKIE istniejące polisy na profiles i utwórz je od nowa
-- używając wyłącznie auth.uid() = id (bez podzapytań na profiles).

-- 1. Kolumna partner_type (idempotentna — bezpieczna jeśli już istnieje)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'partner_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN partner_type TEXT DEFAULT 'standard';
  END IF;
END $$;
COMMENT ON COLUMN profiles.partner_type IS 'Typ partnera: standard | accounting | legal. Sidebar warunkuje wyświetlanie Portalu Kancelarii.';

-- 2. Upewnij się, że RLS jest włączone
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Usuń WSZYSTKIE istniejące polisy na profiles
--    (w tym tę wadliwą, która powoduje rekurencję 42P17)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END $$;

-- 4. Poprawne polisy — wyłącznie auth.uid() = id, zero podzapytań na profiles
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());
