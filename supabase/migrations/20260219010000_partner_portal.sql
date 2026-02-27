-- Partner Portal v1: profiles (role), companies (partner_id), subscriptions, partner_payouts, RLS
-- Order: ensure profiles columns exist first, then companies/subscriptions/partner_payouts, then RLS.

-- 1. Profiles table (create if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns to profiles if they don't exist (idempotent — safe when profiles already existed e.g. from Auth)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'partner', 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'company_id') THEN
    ALTER TABLE profiles ADD COLUMN company_id UUID NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'partner_id') THEN
    ALTER TABLE profiles ADD COLUMN partner_id UUID NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_partner_id ON profiles(partner_id);

-- 3. Companies: firmy klientów (partner_id = partner, który dodał klienta)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nip TEXT NOT NULL,
  employee_count INT NOT NULL CHECK (employee_count >= 0),
  tier TEXT NOT NULL DEFAULT 'compliance' CHECK (tier IN ('compliance', 'strategia')),
  partner_id UUID NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'partner_id') THEN
    ALTER TABLE companies ADD COLUMN partner_id UUID NULL REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_companies_partner_id ON companies(partner_id);
CREATE INDEX IF NOT EXISTS idx_companies_nip ON companies(nip);

-- 4. Subscriptions: subskrypcja firmy (trial / active / cancelled)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'compliance' CHECK (tier IN ('compliance', 'strategia')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'inactive')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions(company_id);

-- 5. Partner payouts: wypłaty dla partnerów (with module)
CREATE TABLE IF NOT EXISTS partner_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  amount_pln NUMERIC(10,2) NOT NULL CHECK (amount_pln >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  module TEXT NOT NULL DEFAULT 'pay_transparency' CONSTRAINT partner_payouts_module_check CHECK (module IN ('pay_transparency', 'controller', 'common')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner_month ON partner_payouts(partner_id, month);

-- 6. RLS: profiles — użytkownik widzi tylko swój profil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. RLS: companies — partner widzi swoje firmy; user widzi firmę gdzie company_id w profiles
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS companies_select_partner ON companies;
CREATE POLICY companies_select_partner ON companies
  FOR SELECT USING (partner_id = auth.uid());
DROP POLICY IF EXISTS companies_select_user_company ON companies;
CREATE POLICY companies_select_user_company ON companies
  FOR SELECT USING (
    id = (SELECT company_id FROM profiles WHERE id = auth.uid() AND company_id IS NOT NULL)
  );
DROP POLICY IF EXISTS companies_insert_partner ON companies;
CREATE POLICY companies_insert_partner ON companies
  FOR INSERT WITH CHECK (partner_id = auth.uid());
DROP POLICY IF EXISTS companies_update_partner ON companies;
CREATE POLICY companies_update_partner ON companies
  FOR UPDATE USING (partner_id = auth.uid());

-- 8. RLS: subscriptions — dostęp przez company (partner lub user z company_id)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subscriptions_select_via_company ON subscriptions;
CREATE POLICY subscriptions_select_via_company ON subscriptions
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM companies WHERE partner_id = auth.uid()
      UNION
      SELECT id FROM companies WHERE id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );
DROP POLICY IF EXISTS subscriptions_insert_partner ON subscriptions;
CREATE POLICY subscriptions_insert_partner ON subscriptions
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE partner_id = auth.uid())
  );

-- 9. RLS: partner_payouts — partner widzi tylko swoje
ALTER TABLE partner_payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS partner_payouts_select_own ON partner_payouts;
CREATE POLICY partner_payouts_select_own ON partner_payouts
  FOR SELECT USING (partner_id = auth.uid());

COMMENT ON TABLE profiles IS 'Role: user, partner, admin. company_id = firma użytkownika (klienta).';
COMMENT ON TABLE companies IS 'Firmy klientów; partner_id = partner (biuro rachunkowe) który dodał klienta.';
COMMENT ON TABLE subscriptions IS 'Subskrypcje firm (trial/active).';
COMMENT ON TABLE partner_payouts IS 'Wypłaty dla partnerów (MRR / rozliczenia).';
