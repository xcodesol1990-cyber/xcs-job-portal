CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('CLIENT', 'FREELANCER', 'ADMIN');
CREATE TYPE user_status AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED');
CREATE TYPE "VerificationPurpose" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET', 'EMAIL_CHANGE');
CREATE TYPE job_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED', 'REJECTED');
CREATE TYPE budget_type AS ENUM ('FIXED', 'HOURLY');
CREATE TYPE proposal_status AS ENUM ('SUBMITTED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE contract_status AS ENUM ('PENDING_FUNDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED');
CREATE TYPE milestone_status AS ENUM ('PENDING', 'FUNDED', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'RELEASED', 'REFUNDED', 'DISPUTED');
CREATE TYPE ledger_type AS ENUM ('ESCROW_FUND', 'ESCROW_RELEASE', 'PLATFORM_FEE', 'PAYOUT', 'REFUND', 'DISPUTE_ADJUSTMENT');
CREATE TYPE "PaymentStatus" AS ENUM ('REQUIRES_ACTION', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_CLIENT', 'RESOLVED_FREELANCER', 'RESOLVED_SPLIT');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  email_verified_at timestamptz,
  password_hash text,
  name text NOT NULL,
  image_url text,
  roles user_role[] NOT NULL DEFAULT '{}',
  status user_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  totp_secret_enc text,
  totp_enabled boolean NOT NULL DEFAULT false,
  failed_login_count int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  stripe_customer_id text UNIQUE,
  stripe_connect_account_id text UNIQUE,
  stripe_payouts_enabled boolean NOT NULL DEFAULT false,
  country char(2),
  timezone text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'oauth',
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at int,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_account_id)
);
CREATE INDEX idx_accounts_user_id ON accounts (user_id);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL UNIQUE,
  ip inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user_id ON sessions (user_id);

CREATE TABLE verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose "VerificationPurpose" NOT NULL,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens (user_id);

CREATE TABLE freelancer_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline text,
  bio text,
  hourly_rate_cents int CHECK (hourly_rate_cents >= 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  availability text,
  experience_level text,
  job_success_score numeric(5, 2),
  total_earned_cents bigint NOT NULL DEFAULT 0,
  search_vector tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE client_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name text,
  website text,
  payment_verified boolean NOT NULL DEFAULT false,
  total_spent_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  parent_id int REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_parent_id ON categories (parent_id);

CREATE TABLE skills (
  id serial PRIMARY KEY,
  name citext NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE freelancer_skills (
  freelancer_id uuid NOT NULL REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  skill_id int NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (freelancer_id, skill_id)
);
CREATE INDEX idx_freelancer_skills_skill_id ON freelancer_skills (skill_id);

CREATE TABLE portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_portfolio_items_freelancer_id ON portfolio_items (freelancer_id);

CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category_id int REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 10 AND 120),
  description text NOT NULL CHECK (char_length(description) BETWEEN 50 AND 20000),
  budget_type budget_type NOT NULL,
  budget_min_cents int CHECK (budget_min_cents > 0),
  budget_max_cents int CHECK (budget_max_cents >= budget_min_cents),
  currency char(3) NOT NULL DEFAULT 'USD',
  experience_level text,
  duration text,
  status job_status NOT NULL DEFAULT 'DRAFT',
  proposals_count int NOT NULL DEFAULT 0,
  dedupe_hash text NOT NULL,
  search_vector tsvector,
  version int NOT NULL DEFAULT 0,
  published_at timestamptz,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_jobs_live_dedupe ON jobs (dedupe_hash)
  WHERE status IN ('DRAFT', 'PENDING_REVIEW', 'OPEN') AND deleted_at IS NULL;
CREATE INDEX idx_jobs_status_published ON jobs (status, published_at DESC);
CREATE INDEX idx_jobs_client ON jobs (client_id);
CREATE INDEX idx_jobs_category_id ON jobs (category_id);
CREATE INDEX idx_jobs_dedupe_hash ON jobs (dedupe_hash);
CREATE INDEX idx_jobs_search ON jobs USING GIN (search_vector);

CREATE TABLE job_skills (
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id int NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  PRIMARY KEY (job_id, skill_id)
);
CREATE INDEX idx_job_skills_skill_id ON job_skills (skill_id);

CREATE TABLE saved_jobs (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, job_id)
);
CREATE INDEX idx_saved_jobs_job_id ON saved_jobs (job_id);

CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  cover_letter text NOT NULL CHECK (char_length(cover_letter) BETWEEN 50 AND 5000),
  bid_cents int NOT NULL CHECK (bid_cents > 0),
  currency char(3) NOT NULL DEFAULT 'USD',
  estimated_days int CHECK (estimated_days > 0),
  status proposal_status NOT NULL DEFAULT 'SUBMITTED',
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, freelancer_id)
);

CREATE UNIQUE INDEX uq_one_accepted_proposal ON proposals (job_id) WHERE status = 'ACCEPTED';
CREATE INDEX idx_proposals_freelancer ON proposals (freelancer_id, status);

CREATE TABLE contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  proposal_id uuid NOT NULL UNIQUE REFERENCES proposals(id) ON DELETE RESTRICT,
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  freelancer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  total_cents bigint NOT NULL CHECK (total_cents > 0),
  currency char(3) NOT NULL,
  platform_fee_bps int NOT NULL CHECK (platform_fee_bps BETWEEN 0 AND 5000),
  status contract_status NOT NULL DEFAULT 'PENDING_FUNDING',
  version int NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (client_id <> freelancer_id)
);

CREATE UNIQUE INDEX uq_one_live_contract_per_job ON contracts (job_id)
  WHERE status IN ('PENDING_FUNDING', 'ACTIVE', 'DISPUTED');
CREATE INDEX idx_contracts_job_id ON contracts (job_id);
CREATE INDEX idx_contracts_client_id ON contracts (client_id);
CREATE INDEX idx_contracts_freelancer_id ON contracts (freelancer_id);

CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  position int NOT NULL,
  title text NOT NULL,
  description text,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  status milestone_status NOT NULL DEFAULT 'PENDING',
  due_date date,
  submitted_at timestamptz,
  approved_at timestamptz,
  released_at timestamptz,
  version int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id, position)
);
CREATE INDEX idx_milestones_contract_id ON milestones (contract_id);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES milestones(id) ON DELETE RESTRICT,
  payer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  currency char(3) NOT NULL,
  provider text NOT NULL DEFAULT 'stripe',
  provider_payment_id text NOT NULL UNIQUE,
  status "PaymentStatus" NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_milestone_active_payment ON payments (milestone_id)
  WHERE status IN ('REQUIRES_ACTION', 'PROCESSING', 'SUCCEEDED');
CREATE INDEX idx_payments_milestone_id ON payments (milestone_id);
CREATE INDEX idx_payments_payer_id ON payments (payer_id);

CREATE TABLE ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type ledger_type NOT NULL,
  contract_id uuid REFERENCES contracts(id) ON DELETE RESTRICT,
  milestone_id uuid REFERENCES milestones(id) ON DELETE RESTRICT,
  user_id uuid REFERENCES users(id) ON DELETE RESTRICT,
  amount_cents bigint NOT NULL,
  currency char(3) NOT NULL,
  provider_ref text,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ledger_entries_contract_id ON ledger_entries (contract_id);
CREATE INDEX idx_ledger_entries_milestone_id ON ledger_entries (milestone_id);
CREATE INDEX idx_ledger_entries_user_id ON ledger_entries (user_id);

CREATE TABLE payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  currency char(3) NOT NULL,
  provider_payout_id text UNIQUE,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payouts_freelancer_id ON payouts (freelancer_id);

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES contracts(id) ON DELETE RESTRICT,
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  freelancer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, client_id, freelancer_id)
);
CREATE INDEX idx_conversations_contract_id ON conversations (contract_id);
CREATE INDEX idx_conversations_client_id ON conversations (client_id);
CREATE INDEX idx_conversations_freelancer_id ON conversations (freelancer_id);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  client_msg_id uuid NOT NULL,
  read_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, sender_id, client_msg_id)
);
CREATE INDEX idx_messages_conv_created ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages (sender_id);

CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  storage_key text NOT NULL UNIQUE,
  filename text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes <= 26214400),
  sha256 text NOT NULL,
  scan_status "ScanStatus" NOT NULL DEFAULT 'PENDING',
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES milestones(id) ON DELETE CASCADE,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(job_id, proposal_id, milestone_id, message_id) = 1)
);
CREATE INDEX idx_attachments_owner_id ON attachments (owner_id);
CREATE INDEX idx_attachments_job_id ON attachments (job_id);
CREATE INDEX idx_attachments_proposal_id ON attachments (proposal_id);
CREATE INDEX idx_attachments_milestone_id ON attachments (milestone_id);
CREATE INDEX idx_attachments_message_id ON attachments (message_id);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reviewee_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id, reviewer_id),
  CHECK (reviewer_id <> reviewee_id)
);
CREATE INDEX idx_reviews_reviewee_id ON reviews (reviewee_id);

CREATE TABLE disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  milestone_id uuid REFERENCES milestones(id) ON DELETE RESTRICT,
  opened_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  status "DisputeStatus" NOT NULL DEFAULT 'OPEN',
  resolution_note text,
  resolved_by uuid REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_one_open_dispute_per_milestone ON disputes (milestone_id)
  WHERE status IN ('OPEN', 'UNDER_REVIEW');
CREATE INDEX idx_disputes_contract_id ON disputes (contract_id);
CREATE INDEX idx_disputes_milestone_id ON disputes (milestone_id);
CREATE INDEX idx_disputes_opened_by ON disputes (opened_by);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, target_type, target_id)
);
CREATE INDEX idx_reports_status ON reports (status);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_created ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notif_user_unread ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;

CREATE TABLE idempotency_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key text NOT NULL,
  endpoint text NOT NULL,
  request_hash text NOT NULL,
  response_status int,
  response_body jsonb,
  locked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE (user_id, endpoint, key)
);
CREATE INDEX idx_idempotency_keys_expires_at ON idempotency_keys (expires_at);

CREATE TABLE webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  error text,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);
CREATE INDEX idx_webhook_events_processed_at ON webhook_events (processed_at);

CREATE TABLE outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  entity_id uuid,
  payload jsonb NOT NULL,
  run_after timestamptz NOT NULL DEFAULT now(),
  attempts int NOT NULL DEFAULT 0,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_outbox_topic_entity ON outbox (topic, entity_id);
CREATE INDEX idx_outbox_run_done ON outbox (run_after, done_at);

CREATE TABLE audit_logs (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  ip inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

CREATE TABLE platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'accounts', 'sessions', 'verification_tokens',
    'freelancer_profiles', 'client_profiles', 'categories', 'skills',
    'portfolio_items', 'jobs', 'proposals', 'contracts', 'milestones',
    'payments', 'payouts', 'attachments', 'conversations', 'messages',
    'reviews', 'disputes', 'reports', 'idempotency_keys', 'platform_settings'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE set_updated_at()',
      t
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION forbid_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Table % is append-only', TG_TABLE_NAME USING ERRCODE = 'restrict_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_entries_immutable
  BEFORE UPDATE OR DELETE ON ledger_entries
  FOR EACH ROW EXECUTE PROCEDURE forbid_mutation();

CREATE TRIGGER audit_logs_immutable
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE PROCEDURE forbid_mutation();

CREATE OR REPLACE FUNCTION check_milestone_sum()
RETURNS trigger AS $$
DECLARE
  cid uuid;
  contract_total bigint;
  milestone_sum bigint;
BEGIN
  cid := COALESCE(NEW.contract_id, OLD.contract_id);
  SELECT total_cents INTO contract_total FROM contracts WHERE id = cid;
  SELECT COALESCE(SUM(amount_cents), 0) INTO milestone_sum FROM milestones WHERE contract_id = cid;
  IF contract_total IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF milestone_sum <> contract_total THEN
    RAISE EXCEPTION 'Milestone amounts (%) must equal contract total (%)', milestone_sum, contract_total
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER milestones_sum_equals_contract
  AFTER INSERT OR UPDATE OR DELETE ON milestones
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE PROCEDURE check_milestone_sum();

CREATE OR REPLACE FUNCTION jobs_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_search_vector
  BEFORE INSERT OR UPDATE OF title, description ON jobs
  FOR EACH ROW EXECUTE PROCEDURE jobs_search_vector_update();

CREATE OR REPLACE FUNCTION freelancer_search_vector_update()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.headline, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER freelancer_search_vector
  BEFORE INSERT OR UPDATE OF headline, bio ON freelancer_profiles
  FOR EACH ROW EXECUTE PROCEDURE freelancer_search_vector_update();
