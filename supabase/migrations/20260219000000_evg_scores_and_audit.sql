-- EVG Manual Override (HITL) — Art. 14 EU AI Act
-- Tabele: evg_scores (oceny stanowisk, w tym ręczne korekty) i evg_audit_log (audit trail).

-- evg_scores: jedna ocena EVG per stanowisko i użytkownik
CREATE TABLE IF NOT EXISTS evg_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evg_score NUMERIC(5,2) NOT NULL CHECK (evg_score >= 0 AND evg_score <= 100),
  skills SMALLINT NOT NULL CHECK (skills >= 0 AND skills <= 25),
  effort SMALLINT NOT NULL CHECK (effort >= 0 AND effort <= 25),
  responsibility SMALLINT NOT NULL CHECK (responsibility >= 0 AND responsibility <= 25),
  conditions SMALLINT NOT NULL CHECK (conditions >= 0 AND conditions <= 25),
  ai_confidence NUMERIC(4,2) DEFAULT 0.85 CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  is_overridden BOOLEAN DEFAULT FALSE,
  overridden_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  overridden_at TIMESTAMPTZ,
  module TEXT NOT NULL DEFAULT 'pay_transparency' CONSTRAINT evg_scores_module_check CHECK (module IN ('pay_transparency', 'controller', 'common')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_evg_scores_user_id ON evg_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_evg_scores_position_id ON evg_scores(position_id);

-- evg_audit_log: historia ręcznych korekt (audit trail)
CREATE TABLE IF NOT EXISTS evg_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id TEXT NOT NULL,
  old_score NUMERIC(5,2) NOT NULL,
  new_score NUMERIC(5,2) NOT NULL,
  old_axes JSONB NOT NULL,
  new_axes JSONB NOT NULL,
  justification TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL DEFAULT 'pay_transparency' CONSTRAINT evg_audit_log_module_check CHECK (module IN ('pay_transparency', 'controller', 'common')),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evg_audit_log_position_id ON evg_audit_log(position_id);
CREATE INDEX IF NOT EXISTS idx_evg_audit_log_changed_by ON evg_audit_log(changed_by);

-- RLS: użytkownik widzi tylko swoje dane (user_id)
ALTER TABLE evg_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE evg_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS evg_scores_select_own ON evg_scores;
CREATE POLICY evg_scores_select_own ON evg_scores
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS evg_scores_insert_own ON evg_scores;
CREATE POLICY evg_scores_insert_own ON evg_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS evg_scores_update_own ON evg_scores;
CREATE POLICY evg_scores_update_own ON evg_scores
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS evg_audit_log_select_own ON evg_audit_log;
CREATE POLICY evg_audit_log_select_own ON evg_audit_log
  FOR SELECT USING (auth.uid() = changed_by);

DROP POLICY IF EXISTS evg_audit_log_insert_own ON evg_audit_log;
CREATE POLICY evg_audit_log_insert_own ON evg_audit_log
  FOR INSERT WITH CHECK (auth.uid() = changed_by);

-- Opcjonalnie: zezwól na odczyt wpisów audytu dla stanowisk użytkownika (gdy changed_by != user, ale position należy do user)
-- np. dla audytu wewnętrznego. Domyślnie tylko własne wpisy.
-- Aby rozszerzyć na company_id: dodaj kolumnę company_id do obu tabel i policy USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()))

COMMENT ON TABLE evg_scores IS 'Oceny EVG stanowisk; is_overridden=true oznacza ręczną korektę (HITL Art. 14).';
COMMENT ON TABLE evg_audit_log IS 'Audit trail ręcznych korekt ocen EVG.';
