-- Enable extensions (if not auto-enabled by Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function: update_timestamp (used in triggers)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table: users
CREATE TABLE users (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT        NOT NULL UNIQUE,
  name                TEXT,
  onboarding_complete BOOLEAN     NOT NULL DEFAULT false,
  github_app_installed BOOLEAN    NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_self ON users
  USING (id = auth.uid());

-- Optional: Trigger for auto-insert into public.users on auth.users creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, onboarding_complete, github_app_installed)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', false, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Table: repos
CREATE TABLE repos (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_repo_id        BIGINT      NOT NULL UNIQUE,
  name                  TEXT        NOT NULL,
  full_name             TEXT        NOT NULL,
  clone_url             TEXT        NOT NULL,
  default_branch        TEXT        NOT NULL DEFAULT 'main',
  tier                  TEXT        CHECK (tier IN ('simple','medium','complex')),
  health_grade          TEXT        CHECK (health_grade IN ('A','B','C','D','F')),
  previous_health_grade TEXT        CHECK (previous_health_grade IN ('A','B','C','D','F')),
  scan_status           TEXT        NOT NULL DEFAULT 'idle'
                        CHECK (scan_status IN ('idle','queued','scanning','complete','error')),
  last_scanned_at       TIMESTAMPTZ,
  github_app_connected  BOOLEAN     NOT NULL DEFAULT false,
  github_installation_id BIGINT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_repos_user_id ON repos(user_id);
CREATE INDEX idx_repos_scan_status ON repos(scan_status) WHERE scan_status != 'idle';
CREATE INDEX idx_repos_github_id ON repos(github_repo_id);

ALTER TABLE repos ENABLE ROW LEVEL SECURITY;
CREATE POLICY repos_owner ON repos
  USING (user_id = auth.uid());

-- Function: compute_health_grade
CREATE OR REPLACE FUNCTION compute_health_grade(p_repo_id UUID)
RETURNS TEXT AS $$
DECLARE
  score     NUMERIC := 0;
  v_grade   TEXT;
BEGIN
  SELECT
    SUM(CASE
      WHEN impact_type = 'data_exposure'         THEN 3
      WHEN impact_type = 'privilege_escalation'  THEN 3
      WHEN impact_type = 'admin_boundary'        THEN 2
      WHEN status = 'advisory'                   THEN 0.5
      ELSE 2
    END)
  INTO score
  FROM findings
  WHERE repo_id = p_repo_id AND status IN ('confirmed','advisory');

  v_grade := CASE
    WHEN score = 0     THEN 'A'
    WHEN score <= 2    THEN 'B'
    WHEN score <= 5    THEN 'C'
    WHEN score <= 9    THEN 'D'
    ELSE 'F'
  END;

  UPDATE repos
  SET previous_health_grade = health_grade,
      health_grade = v_grade,
      updated_at = now()
  WHERE id = p_repo_id;

  RETURN v_grade;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Table: repo_configs
CREATE TABLE repo_configs (
  id                       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id                  UUID         NOT NULL UNIQUE REFERENCES repos(id) ON DELETE CASCADE,
  user_id                  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  confidence_threshold_t1  NUMERIC(3,2) NOT NULL DEFAULT 0.50
                           CHECK (confidence_threshold_t1 BETWEEN 0.30 AND 0.90),
  confidence_threshold_t2  NUMERIC(3,2) NOT NULL DEFAULT 0.75
                           CHECK (confidence_threshold_t2 BETWEEN 0.50 AND 0.95),
  scan_frequency           TEXT         NOT NULL DEFAULT 'pr_only'
                           CHECK (scan_frequency IN ('manual','pr_only','daily','weekly')),
  pr_blocking_enabled      BOOLEAN      NOT NULL DEFAULT false,
  memory_bias_enabled      BOOLEAN      NOT NULL DEFAULT true,
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Table: scans
CREATE TABLE scans (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id          UUID        NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger          TEXT        NOT NULL CHECK (trigger IN ('manual','pr','scheduled')),
  pr_number        INTEGER,
  pr_head_sha      TEXT,
  tier             TEXT        CHECK (tier IN ('simple','medium','complex')),
  status           TEXT        NOT NULL DEFAULT 'queued'
                   CHECK (status IN ('queued','running','complete','complete_no_findings','error','timeout')),
  progress_percent INTEGER     NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  current_step     TEXT,
  error_message    TEXT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ
);

CREATE INDEX idx_scans_repo_id ON scans(repo_id);
CREATE INDEX idx_scans_status ON scans(status) WHERE status IN ('queued','running');
CREATE INDEX idx_scans_repo_status ON scans(repo_id, status);

-- Table: app_fingerprints
CREATE TABLE app_fingerprints (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id          UUID        NOT NULL UNIQUE REFERENCES repos(id) ON DELETE CASCADE,
  stack            TEXT        NOT NULL,
  auth_type        TEXT,
  route_count      INTEGER     NOT NULL DEFAULT 0,
  model_count      INTEGER     NOT NULL DEFAULT 0,
  role_count       INTEGER     NOT NULL DEFAULT 0,
  ownership_field  TEXT,
  fingerprint_hash TEXT        NOT NULL,
  raw_metadata     JSONB,
  detected_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: findings
CREATE TABLE findings (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id               UUID         NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  repo_id               UUID         NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
  user_id               UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status                TEXT         NOT NULL DEFAULT 'advisory'
                        CHECK (status IN ('confirmed','advisory','resolved','ignored')),
  type                  TEXT         NOT NULL
                        CHECK (type IN ('IDOR','privilege_escalation','mass_assignment','role_bypass','missing_auth')),
  impact_type           TEXT         CHECK (impact_type IN ('data_exposure','privilege_escalation','admin_boundary','other')),
  impact_priority       INTEGER      NOT NULL DEFAULT 5 CHECK (impact_priority BETWEEN 1 AND 7),
  plain_language_summary TEXT        NOT NULL,
  route                 TEXT         NOT NULL,
  method                TEXT         NOT NULL CHECK (method IN ('GET','POST','PUT','PATCH','DELETE')),
  symbolic_score        NUMERIC(4,3) NOT NULL CHECK (symbolic_score BETWEEN 0 AND 1),
  llm_hint_confidence   NUMERIC(4,3) CHECK (llm_hint_confidence BETWEEN 0 AND 1),
  final_confidence      NUMERIC(4,3) NOT NULL CHECK (final_confidence BETWEEN 0 AND 1),
  runtime_validated     BOOLEAN      NOT NULL DEFAULT false,
  ignore_reason         TEXT,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_findings_repo_id ON findings(repo_id);
CREATE INDEX idx_findings_user_status ON findings(user_id, status);
CREATE INDEX idx_findings_impact_sort ON findings(user_id, impact_priority ASC, created_at DESC);
CREATE INDEX idx_findings_repo_status ON findings(repo_id, status);
CREATE INDEX idx_findings_fts ON findings USING gin(to_tsvector('english', plain_language_summary || ' ' || route));

CREATE OR REPLACE FUNCTION compute_impact_priority()
RETURNS TRIGGER AS $$
BEGIN
  NEW.impact_priority := CASE
    WHEN NEW.status = 'confirmed' AND NEW.impact_type = 'data_exposure'         THEN 1
    WHEN NEW.status = 'confirmed' AND NEW.impact_type = 'privilege_escalation'  THEN 2
    WHEN NEW.status = 'confirmed' AND NEW.impact_type = 'admin_boundary'        THEN 3
    WHEN NEW.status = 'confirmed'                                               THEN 4
    WHEN NEW.status = 'advisory'                                                THEN 5
    WHEN NEW.status = 'resolved'                                                THEN 6
    WHEN NEW.status = 'ignored'                                                 THEN 7
    ELSE 5
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER findings_impact_priority
  BEFORE INSERT OR UPDATE OF status, impact_type ON findings
  FOR EACH ROW EXECUTE FUNCTION compute_impact_priority();

-- Table: evidence_packages
CREATE TABLE evidence_packages (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id            UUID        NOT NULL UNIQUE REFERENCES findings(id) ON DELETE CASCADE,
  attack_type           TEXT        NOT NULL,
  auth_context          JSONB       NOT NULL,
  sandbox_user_attacker TEXT        NOT NULL,
  sandbox_user_victim   TEXT        NOT NULL,
  request               JSONB       NOT NULL,
  response              JSONB       NOT NULL,
  response_diff         JSONB       NOT NULL,
  verdict               TEXT        NOT NULL,
  repro_script          TEXT        NOT NULL,
  sandbox_log_s3_key    TEXT,
  confirmed_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evidence_finding_id ON evidence_packages(finding_id);

-- Table: exploit_paths
CREATE TABLE exploit_paths (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id          UUID        NOT NULL UNIQUE REFERENCES findings(id) ON DELETE CASCADE,
  nodes               JSONB       NOT NULL,
  edges               JSONB       NOT NULL,
  deterministic_trace JSONB       NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: patch_records
CREATE TABLE patch_records (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id            UUID        NOT NULL UNIQUE REFERENCES findings(id) ON DELETE CASCADE,
  status                TEXT        NOT NULL DEFAULT 'generating'
                        CHECK (status IN ('generating','validating','verified','failed')),
  patch_diff            TEXT,
  file_path             TEXT,
  line_number           INTEGER,
  validation_steps      JSONB,
  fix_verified          BOOLEAN     NOT NULL DEFAULT false,
  retest_request        JSONB,
  retest_response       JSONB,
  pr_url                TEXT,
  pr_number             INTEGER,
  alternative_patch_diff TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: finding_events
CREATE TABLE finding_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID        NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN (
               'detected','sandbox_executed','confirmed','advisory_set',
               'patch_suggested','patch_validated','pr_created',
               'fix_merged','retested','resolved','ignored','reopened')),
  actor      TEXT        NOT NULL CHECK (actor IN ('system','developer')),
  detail     TEXT,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_finding_events_finding_id ON finding_events(finding_id);
CREATE INDEX idx_finding_events_order ON finding_events(finding_id, created_at ASC);

ALTER TABLE finding_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY finding_events_read ON finding_events FOR SELECT
  USING (finding_id IN (SELECT id FROM findings WHERE user_id = auth.uid()));
CREATE POLICY finding_events_insert ON finding_events FOR INSERT
  WITH CHECK (finding_id IN (SELECT id FROM findings WHERE user_id = auth.uid()));

-- Table: threat_memory
CREATE TABLE threat_memory (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id                  UUID        NOT NULL UNIQUE REFERENCES repos(id) ON DELETE CASCADE,
  user_id                  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ownership_check_patterns JSONB       NOT NULL DEFAULT '[]',
  middleware_patterns      JSONB       NOT NULL DEFAULT '[]',
  model_patterns           JSONB       NOT NULL DEFAULT '[]',
  dev_team_observations    JSONB       NOT NULL DEFAULT '[]',
  auth_fingerprint         JSONB,
  historical_exploit_types TEXT[]      NOT NULL DEFAULT '{}',
  scan_bias_weights        JSONB       NOT NULL DEFAULT '{}',
  scan_count               INTEGER     NOT NULL DEFAULT 0,
  last_updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: threat_memory_events
CREATE TABLE threat_memory_events (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_memory_id   UUID        NOT NULL REFERENCES threat_memory(id) ON DELETE CASCADE,
  type               TEXT        NOT NULL CHECK (type IN (
                       'pattern_learned','pattern_updated','bias_weight_set',
                       'exploit_resolved','exploit_ignored','memory_reset')),
  description        TEXT        NOT NULL,
  related_finding_id UUID        REFERENCES findings(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tm_events_memory_id ON threat_memory_events(threat_memory_id);