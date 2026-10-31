# ROLE

You are a senior full-stack engineer and security architect. Build a production-grade freelance marketplace (like Upwork) called **"WorkNest"** (rename freely). Clients post jobs, freelancers send proposals, a contract is created, the client funds milestones into escrow, the freelancer delivers, the client approves, and the freelancer is paid. Work in the phases listed at the end. Do NOT move to the next phase until the current one builds, lints, type-checks, and its tests pass.

# 1. TECH STACK (fixed, do not substitute without asking)

- **Framework:** Next.js 15 (App Router) + TypeScript (strict) + React Server Components
- **UI:** Tailwind CSS + shadcn/ui, fully responsive, accessible (WCAG AA), dark mode
- **DB:** PostgreSQL (Neon or Supabase) with **pooled connection string** for runtime and **direct connection string** for migrations
- **ORM:** Prisma (use `prisma migrate`, never `db push` in production)
- **Auth:** Auth.js (NextAuth v5): email+password (argon2id), Google/GitHub OAuth, email verification, password reset, optional TOTP 2FA
- **Validation:** Zod on EVERY input (API, server actions, env vars, webhooks)
- **Payments:** Stripe Connect (Express accounts) behind a `PaymentProvider` interface so another provider can be swapped in if Stripe is unavailable in a given country. Never hold user funds yourself outside a payment provider's escrow-like flow (separate charges and transfers).
- **Rate limiting / cache / locks:** Upstash Redis (`@upstash/ratelimit`)
- **File storage:** Vercel Blob or S3-compatible with pre-signed uploads (NO local disk, since Vercel is read-only and ephemeral)
- **Realtime messaging:** Pusher or Ably (Vercel serverless does NOT support persistent WebSockets). Fall back to polling.
- **Email:** Resend + React Email templates
- **Background jobs:** Vercel Cron + an `outbox` table (no in-memory queues; serverless functions die after the response)
- **Monitoring:** Sentry + structured logging (pino) with PII redaction
- **Testing:** Vitest (unit), Playwright (e2e), plus concurrency tests for payments and proposals
- **Package manager:** pnpm. Lockfile committed.

# 2. CORE FEATURES

## Roles

`CLIENT`, `FREELANCER`, `ADMIN`. A user can hold both CLIENT and FREELANCER profiles. ADMIN is assigned only via DB seed or an admin-only script, never through the UI or signup API.

## Client

- Create, edit, publish, pause, close, and delete (soft) job posts: title, description (sanitized rich text), category, skills, budget type (fixed/hourly), budget range, duration, experience level, attachments, visibility
- View proposals, shortlist, message, reject, or hire
- Create contract, fund milestones (escrow), approve or reject deliverables, request revision, release payment, open dispute, leave review
- Saved freelancers, invoices/receipts, payment methods

## Freelancer

- Profile: headline, bio, skills, hourly rate, portfolio items, work history, education, languages, availability, avatar
- Search and filter jobs, save jobs, submit proposal (cover letter, bid, estimated duration, attachments), withdraw proposal
- Submit work per milestone, request milestone payment, view earnings, withdraw to bank (Stripe Connect payout)
- Reviews, job success score computed from completed contracts

## Shared

- Real-time 1:1 messaging per proposal/contract with attachments
- Notifications (in-app + email) with preferences
- Full-text search (Postgres `tsvector` + GIN index) with filters and **cursor pagination** (never OFFSET on large tables)
- Reviews (only after contract completion, one per party per contract)
- Reports/flagging of jobs, users, messages

## Admin

- User management (suspend/ban/verify), job moderation queue, dispute resolution, reports queue, platform fee settings, audit log viewer, financial overview (read-only ledger)

# 3. DATABASE SCHEMA (PostgreSQL)

Rules for the whole schema:

- Primary keys: `uuid` (use `gen_random_uuid()`) or `cuid2`. Never expose sequential IDs.
- **Money is stored as integer minor units (cents) + `currency CHAR(3)`. NEVER float/decimal math in app code.**
- All tables: `created_at timestamptz DEFAULT now()`, `updated_at timestamptz`. All timestamps in UTC.
- Soft delete (`deleted_at`) for users, jobs, messages. Financial tables are NEVER deleted (append-only).
- Enums via Postgres ENUM types or CHECK constraints.
- Every foreign key has an explicit `ON DELETE` rule and an index.
- Mutable business tables that can be raced (jobs, contracts, milestones, wallets) have `version int NOT NULL DEFAULT 0` for optimistic locking.

```sql
-- ========== AUTH & USERS ==========
CREATE TYPE user_role AS ENUM ('CLIENT','FREELANCER','ADMIN');
CREATE TYPE user_status AS ENUM ('PENDING_VERIFICATION','ACTIVE','SUSPENDED','BANNED','DELETED');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,              -- case-insensitive uniqueness (CREATE EXTENSION citext)
  email_verified_at timestamptz,
  password_hash text,                        -- argon2id, NULL for OAuth-only
  name text NOT NULL,
  image_url text,
  roles user_role[] NOT NULL DEFAULT '{}',
  status user_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  totp_secret_enc text,                      -- encrypted at rest (AES-256-GCM, key in env)
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

CREATE TABLE accounts (            -- OAuth providers (Auth.js)
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL, provider_account_id text NOT NULL,
  UNIQUE (provider, provider_account_id)
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token_hash text NOT NULL UNIQUE,   -- store HASH only
  ip inet, user_agent text,
  expires_at timestamptz NOT NULL, revoked_at timestamptz
);

CREATE TABLE verification_tokens (   -- email verify / password reset
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('EMAIL_VERIFY','PASSWORD_RESET','EMAIL_CHANGE')),
  token_hash text NOT NULL UNIQUE,           -- SHA-256 of the random token, single use
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

-- ========== PROFILES ==========
CREATE TABLE freelancer_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline text, bio text, hourly_rate_cents int CHECK (hourly_rate_cents >= 0),
  currency char(3) DEFAULT 'USD', availability text, experience_level text,
  job_success_score numeric(5,2), total_earned_cents bigint NOT NULL DEFAULT 0,
  search_vector tsvector
);
CREATE TABLE client_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name text, website text, payment_verified boolean NOT NULL DEFAULT false,
  total_spent_cents bigint NOT NULL DEFAULT 0
);
CREATE TABLE categories (id serial PRIMARY KEY, name text NOT NULL UNIQUE, slug text NOT NULL UNIQUE, parent_id int REFERENCES categories(id));
CREATE TABLE skills (id serial PRIMARY KEY, name citext NOT NULL UNIQUE, slug text NOT NULL UNIQUE);
CREATE TABLE freelancer_skills (
  freelancer_id uuid REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE,
  skill_id int REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (freelancer_id, skill_id)          -- prevents duplicate skills
);
CREATE TABLE portfolio_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), freelancer_id uuid NOT NULL REFERENCES freelancer_profiles(user_id) ON DELETE CASCADE, title text NOT NULL, description text, url text, created_at timestamptz DEFAULT now());

-- ========== JOBS ==========
CREATE TYPE job_status AS ENUM ('DRAFT','PENDING_REVIEW','OPEN','IN_PROGRESS','COMPLETED','CLOSED','CANCELLED','REJECTED');
CREATE TYPE budget_type AS ENUM ('FIXED','HOURLY');

CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  category_id int REFERENCES categories(id),
  title text NOT NULL CHECK (char_length(title) BETWEEN 10 AND 120),
  description text NOT NULL CHECK (char_length(description) BETWEEN 50 AND 20000),
  budget_type budget_type NOT NULL,
  budget_min_cents int CHECK (budget_min_cents > 0),
  budget_max_cents int CHECK (budget_max_cents >= budget_min_cents),
  currency char(3) NOT NULL DEFAULT 'USD',
  experience_level text, duration text,
  status job_status NOT NULL DEFAULT 'DRAFT',
  proposals_count int NOT NULL DEFAULT 0,
  dedupe_hash text NOT NULL,               -- sha256(client_id + normalized title + normalized description)
  search_vector tsvector,
  version int NOT NULL DEFAULT 0,
  published_at timestamptz, expires_at timestamptz, deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
-- Block accidental double-posting of the same job by the same client while it is live
CREATE UNIQUE INDEX uq_jobs_live_dedupe ON jobs (dedupe_hash) WHERE status IN ('DRAFT','PENDING_REVIEW','OPEN') AND deleted_at IS NULL;
CREATE INDEX idx_jobs_status_published ON jobs (status, published_at DESC);
CREATE INDEX idx_jobs_client ON jobs (client_id);
CREATE INDEX idx_jobs_search ON jobs USING GIN (search_vector);
CREATE TABLE job_skills (job_id uuid REFERENCES jobs(id) ON DELETE CASCADE, skill_id int REFERENCES skills(id), PRIMARY KEY (job_id, skill_id));
CREATE TABLE saved_jobs (user_id uuid REFERENCES users(id) ON DELETE CASCADE, job_id uuid REFERENCES jobs(id) ON DELETE CASCADE, PRIMARY KEY (user_id, job_id));

-- ========== PROPOSALS ==========
CREATE TYPE proposal_status AS ENUM ('SUBMITTED','SHORTLISTED','ACCEPTED','REJECTED','WITHDRAWN');
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
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, freelancer_id)                         -- ONE proposal per freelancer per job
);
-- Only ONE accepted proposal per job, enforced by the DB, not just app code
CREATE UNIQUE INDEX uq_one_accepted_proposal ON proposals (job_id) WHERE status = 'ACCEPTED';
CREATE INDEX idx_proposals_freelancer ON proposals (freelancer_id, status);

-- ========== CONTRACTS & MILESTONES ==========
CREATE TYPE contract_status AS ENUM ('PENDING_FUNDING','ACTIVE','COMPLETED','CANCELLED','DISPUTED');
CREATE TABLE contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  proposal_id uuid NOT NULL UNIQUE REFERENCES proposals(id),   -- one contract per proposal
  client_id uuid NOT NULL REFERENCES users(id), freelancer_id uuid NOT NULL REFERENCES users(id),
  total_cents bigint NOT NULL CHECK (total_cents > 0), currency char(3) NOT NULL,
  platform_fee_bps int NOT NULL CHECK (platform_fee_bps BETWEEN 0 AND 5000), -- snapshot of fee at signing
  status contract_status NOT NULL DEFAULT 'PENDING_FUNDING',
  version int NOT NULL DEFAULT 0,
  started_at timestamptz, completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (client_id <> freelancer_id)                     -- cannot hire yourself
);
CREATE UNIQUE INDEX uq_one_live_contract_per_job ON contracts (job_id) WHERE status IN ('PENDING_FUNDING','ACTIVE','DISPUTED');

CREATE TYPE milestone_status AS ENUM ('PENDING','FUNDED','SUBMITTED','REVISION_REQUESTED','APPROVED','RELEASED','REFUNDED','DISPUTED');
CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  position int NOT NULL, title text NOT NULL, description text,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  status milestone_status NOT NULL DEFAULT 'PENDING',
  due_date date, submitted_at timestamptz, approved_at timestamptz, released_at timestamptz,
  version int NOT NULL DEFAULT 0,
  UNIQUE (contract_id, position)
);
-- App + trigger must enforce: SUM(milestones.amount_cents) = contracts.total_cents

-- ========== PAYMENTS (append-only double-entry style ledger) ==========
CREATE TYPE ledger_type AS ENUM ('ESCROW_FUND','ESCROW_RELEASE','PLATFORM_FEE','PAYOUT','REFUND','DISPUTE_ADJUSTMENT');
CREATE TABLE payments (                                  -- 1 row per Stripe PaymentIntent
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES milestones(id),
  payer_id uuid NOT NULL REFERENCES users(id),
  amount_cents bigint NOT NULL CHECK (amount_cents > 0), currency char(3) NOT NULL,
  provider text NOT NULL DEFAULT 'stripe',
  provider_payment_id text NOT NULL UNIQUE,              -- no duplicate charges
  status text NOT NULL CHECK (status IN ('REQUIRES_ACTION','PROCESSING','SUCCEEDED','FAILED','REFUNDED','PARTIALLY_REFUNDED')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
-- Only one successful/in-flight payment per milestone
CREATE UNIQUE INDEX uq_milestone_active_payment ON payments (milestone_id) WHERE status IN ('REQUIRES_ACTION','PROCESSING','SUCCEEDED');

CREATE TABLE ledger_entries (                            -- NEVER UPDATE or DELETE rows (enforce with trigger + revoked privileges)
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type ledger_type NOT NULL,
  contract_id uuid REFERENCES contracts(id), milestone_id uuid REFERENCES milestones(id),
  user_id uuid REFERENCES users(id),
  amount_cents bigint NOT NULL, currency char(3) NOT NULL,
  provider_ref text,                                     -- e.g. Stripe transfer id
  idempotency_key text NOT NULL UNIQUE,                  -- e.g. "release:<milestone_id>"; second attempt fails harmlessly
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id uuid NOT NULL REFERENCES users(id),
  amount_cents bigint NOT NULL CHECK (amount_cents > 0), currency char(3) NOT NULL,
  provider_payout_id text UNIQUE, status text NOT NULL, created_at timestamptz DEFAULT now()
);

-- ========== DELIVERABLES / FILES ==========
CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id),
  storage_key text NOT NULL UNIQUE, filename text NOT NULL,
  mime_type text NOT NULL, size_bytes bigint NOT NULL CHECK (size_bytes <= 26214400),
  sha256 text NOT NULL, scan_status text NOT NULL DEFAULT 'PENDING' CHECK (scan_status IN ('PENDING','CLEAN','INFECTED')),
  -- polymorphic link, exactly ONE parent set:
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE,
  milestone_id uuid REFERENCES milestones(id) ON DELETE CASCADE,
  message_id uuid,
  CHECK (num_nonnulls(job_id, proposal_id, milestone_id, message_id) = 1)
);

-- ========== MESSAGING ==========
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL, contract_id uuid REFERENCES contracts(id),
  client_id uuid NOT NULL REFERENCES users(id), freelancer_id uuid NOT NULL REFERENCES users(id),
  last_message_at timestamptz,
  UNIQUE (job_id, client_id, freelancer_id)              -- no duplicate conversations
);
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  client_msg_id uuid NOT NULL,                           -- generated client-side; dedupes retries/double-clicks
  read_at timestamptz, deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, sender_id, client_msg_id)
);
CREATE INDEX idx_messages_conv_created ON messages (conversation_id, created_at DESC);

-- ========== REVIEWS ==========
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id),
  reviewer_id uuid NOT NULL REFERENCES users(id), reviewee_id uuid NOT NULL REFERENCES users(id),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5), comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (contract_id, reviewer_id),                     -- one review per party per contract
  CHECK (reviewer_id <> reviewee_id)
);

-- ========== DISPUTES, REPORTS, NOTIFICATIONS ==========
CREATE TABLE disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES contracts(id), milestone_id uuid REFERENCES milestones(id),
  opened_by uuid NOT NULL REFERENCES users(id), reason text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','UNDER_REVIEW','RESOLVED_CLIENT','RESOLVED_FREELANCER','RESOLVED_SPLIT')),
  resolution_note text, resolved_by uuid REFERENCES users(id), created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX uq_one_open_dispute_per_milestone ON disputes (milestone_id) WHERE status IN ('OPEN','UNDER_REVIEW');
CREATE TABLE reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL REFERENCES users(id), target_type text NOT NULL, target_id uuid NOT NULL, reason text NOT NULL, status text NOT NULL DEFAULT 'OPEN', created_at timestamptz DEFAULT now(), UNIQUE (reporter_id, target_type, target_id));
CREATE TABLE notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, type text NOT NULL, payload jsonb NOT NULL, read_at timestamptz, created_at timestamptz DEFAULT now());
CREATE INDEX idx_notif_user_unread ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;

-- ========== RELIABILITY / SECURITY INFRA ==========
CREATE TABLE idempotency_keys (                          -- for every mutating API that costs money or creates records
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key text NOT NULL, endpoint text NOT NULL, request_hash text NOT NULL,
  response_status int, response_body jsonb,
  locked_at timestamptz, created_at timestamptz DEFAULT now(), expires_at timestamptz NOT NULL,
  UNIQUE (user_id, endpoint, key)
);
CREATE TABLE webhook_events (                            -- Stripe sends the same event multiple times
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL, event_id text NOT NULL, type text NOT NULL, payload jsonb NOT NULL,
  processed_at timestamptz, error text, attempts int NOT NULL DEFAULT 0, created_at timestamptz DEFAULT now(),
  UNIQUE (provider, event_id)
);
CREATE TABLE outbox (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), topic text NOT NULL, payload jsonb NOT NULL, run_after timestamptz DEFAULT now(), attempts int DEFAULT 0, done_at timestamptz);
CREATE TABLE audit_logs (id bigserial PRIMARY KEY, actor_id uuid, action text NOT NULL, entity_type text, entity_id uuid, ip inet, user_agent text, metadata jsonb, created_at timestamptz DEFAULT now());  -- append-only
CREATE TABLE platform_settings (key text PRIMARY KEY, value jsonb NOT NULL);  -- fee bps, limits
```

Also generate: DB triggers for `updated_at`, for `ledger_entries`/`audit_logs` immutability, and for `SUM(milestones) = contract total`; the `tsvector` update triggers; seed script (categories, skills, 1 admin, demo users); and the equivalent **Prisma schema** (use `@@unique`, `@@index`, and raw SQL migrations for partial unique indexes since Prisma cannot express them).

# 4. NO DUPLICATES, NO DUPLICATE ORDERS (MANDATORY RULES)

Duplicates happen from double-clicks, network retries, two tabs, webhook retries, and race conditions. Defend at EVERY layer:

1. **Database is the final authority.** Unique constraints and partial unique indexes (see schema) must exist. App code catches Postgres error `23505` and returns a friendly `409 Conflict`, never a 500.
2. **Idempotency-Key header** on all POST endpoints that create jobs, proposals, contracts, payments, payouts, and messages. Implementation:
   - Client generates a UUID per user action (not per click) and reuses it on retry.
   - Server inserts the key (`UNIQUE(user_id, endpoint, key)`) and compares `request_hash`. Same key + different body = `422`. Same key + same body = return the stored response. In-flight = `409`/`Retry-After`.
   - Keys expire after 24h (cleanup cron).
3. **Pass idempotency keys to Stripe too**: `stripe.paymentIntents.create(params, { idempotencyKey: 'fund:<milestone_id>' })`, and the same for transfers (`release:<milestone_id>`) and payouts.
4. **Transactions + row locks** for state transitions: `SELECT ... FOR UPDATE` on the contract/milestone row inside `prisma.$transaction`, then check state, then update with `WHERE version = :v` (optimistic locking). If 0 rows are updated, return `409`.
5. **State machines** (explicit allowed-transition maps in one file, unit-tested): e.g. milestone `FUNDED -> SUBMITTED -> APPROVED -> RELEASED`. Any illegal transition throws. A released milestone can NEVER be released again.
6. **Webhooks are the source of truth for payment state**, not the browser redirect. Verify signature using the **raw body** (`await req.text()`, not `req.json()`), insert into `webhook_events` (unique on `event_id`), process only if newly inserted, handle out-of-order events, return `2xx` fast, and reprocess failures via cron.
7. **Frontend:** disable the button while pending (`useTransition`/`useFormStatus`), optimistic UI that rolls back on error, one idempotency key per form instance.
8. **Messages:** `client_msg_id` unique constraint dedupes retried sends.
9. **Job post dedupe:** `dedupe_hash` partial unique index; show "You already posted a similar job."
10. **Email/notification dedupe:** outbox rows keyed by `(topic, entity_id)` so retries don't send two emails.
11. **Cron jobs** must be idempotent and use a Redis/DB advisory lock (`pg_try_advisory_lock`) so overlapping runs don't double-process.
12. **Write concurrency tests** (Promise.all of 20 simultaneous requests) proving: only 1 proposal per job/freelancer, only 1 contract per proposal, only 1 payment per milestone, only 1 release per milestone, and only 1 payout per request.

# 5. SECURITY REQUIREMENTS (OWASP Top 10 + more)

**Authentication**

- argon2id hashing with sane params; never log or return hashes. Minimum password length 10 and check against breached passwords (HIBP k-anonymity API).
- Email verification required before posting, proposing, or paying. Password reset tokens: random 32 bytes, stored as SHA-256, single-use, 30-minute expiry. Always return the same response for "email exists/doesn't exist" (prevent user enumeration), with constant-time comparisons.
- Account lockout/backoff after repeated failures; rotate the session on login and privilege change; secure session cookies (`HttpOnly`, `Secure`, `SameSite=Lax`, `__Host-` prefix); revoke all sessions on password change; optional TOTP 2FA with hashed recovery codes.

**Authorization**

- Deny by default. A central `authorize(user, action, resource)` helper is used by EVERY route/server action. Never trust IDs from the client: always check ownership (prevents IDOR/BOLA). Example: a freelancer can only fetch milestones of contracts where `freelancer_id = session.user.id`.
- Role checks are server-side only. Admin routes are protected in middleware AND inside each handler. Prevent mass assignment: whitelist fields with Zod, never spread `req.body` into Prisma.

**Input/Output**

- Zod validation on all inputs with max lengths; reject unknown keys (`.strict()`).
- Rich text is sanitized server-side with DOMPurify/`sanitize-html` allowlist; no `dangerouslySetInnerHTML` without sanitization. Prisma parameterized queries only; if you use `$queryRaw`, use tagged templates and never string-concatenate. Search input is escaped for `tsquery`.
- Open-redirect protection on `callbackUrl` (allow relative paths only). SSRF protection for any URL fetch (block private IP ranges).

**HTTP hardening** (set in `next.config.ts` / `middleware.ts`)

- Strict CSP with nonces, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'none'`, and `Cache-Control: no-store` on authenticated/API responses.
- CSRF: Server Actions' built-in origin checks + SameSite cookies; for custom route handlers, verify `Origin`/`Host` and require a custom header. Strict CORS allowlist (no `*` with credentials).

**Abuse protection**

- Rate limits via Upstash (per IP + per user + per endpoint): login, signup, password reset, proposals, messages, uploads, search; stricter on payment endpoints. Return `429` with `Retry-After`.
- Bot protection (Cloudflare Turnstile/hCaptcha) on signup, login after failures, and posting. Limits: max N proposals per day per new account, max open jobs per client, and flag new accounts that try to share contact info or move off-platform in messages.

**Files**

- Pre-signed direct uploads with an allowlist of MIME types AND magic-byte verification, size limit (25 MB), random storage keys (never the user's filename), served from a separate domain/bucket with `Content-Disposition: attachment`, antivirus scan hook (status `PENDING -> CLEAN`; block download until clean), private files served via short-lived signed URLs only after an authorization check.

**Secrets & data**

- Validate env vars at boot with Zod (`env.ts`, fail fast). Secrets only in Vercel Environment Variables, never in the repo and never `NEXT_PUBLIC_` unless truly public. Encrypt sensitive columns (TOTP secret) with AES-256-GCM. Never store card data (Stripe handles it, PCI SAQ-A). Redact PII/tokens in logs and Sentry (`beforeSend`). Enable DB SSL, least-privilege DB role for the app (no DDL, no DELETE on ledger/audit tables). Backups and point-in-time recovery enabled.

**Payments**

- Amounts are ALWAYS computed server-side from DB values, never from the client. Verify currency and amount on webhook vs DB before marking funded. Platform fee is snapshotted in the contract. Handle Stripe `charge.refunded`, `charge.dispute.created`, `payment_intent.payment_failed`, `account.updated`, `payout.failed`, and `transfer.reversed`. Reconciliation cron compares the ledger against Stripe daily and alerts on drift.

**Supply chain / repo**

- `.gitignore` (`.env*`, `.next`, `node_modules`, `*.pem`), a committed `.env.example` with placeholders only, GitHub secret scanning + push protection, Dependabot, `pnpm audit` in CI, pinned lockfile, CodeQL workflow, branch protection (PR + CI required), no `eval`, and `npm` postinstall scripts reviewed.

# 6. ERROR HANDLING & EDGE CASES (handle ALL of these)

- **Standard error format:** `{ error: { code, message, details?, requestId } }` with correct HTTP statuses (400, 401, 403, 404, 409, 422, 429, 500). Never leak stack traces or SQL errors. Every request gets a `requestId` shown in the UI and logs. `error.tsx`, `not-found.tsx`, and `global-error.tsx` exist.
- Client posts a job, then deletes the account, so jobs with active contracts block account deletion (anonymize instead, keep financial records).
- Freelancer withdraws a proposal after it is accepted (reject) or while the contract is pending funding (cancel flow).
- Client never funds, so contract auto-cancels after 7 days (cron).
- Client never responds to a submission, so auto-approve after N days with a notice (configurable).
- Payment requires 3D Secure (`REQUIRES_ACTION`), card declined, payment succeeded but webhook delayed (UI polls status, shows "processing"), webhook arrives before the DB commit (retry with backoff), duplicate/out-of-order webhooks.
- Partial refunds, full refunds, chargebacks, and disputes freeze release of that milestone.
- Freelancer's Stripe account not onboarded or payouts disabled, so funds are held and the user is prompted to finish onboarding.
- Currency mismatch between job, proposal, and client payment method; rounding on fee calculation (use integer math, round half-up, put the remainder on the platform fee).
- Edits to a job after proposals exist (lock budget-critical fields or notify proposers).
- Users banned mid-contract (admin must resolve funds via dispute/refund flow).
- Timezones (store UTC, render in the user's timezone), deadline logic across DST.
- Pagination edge cases (deleted items between pages, empty states), search with special characters/empty query, very long text, emoji/Unicode normalization (NFC) before dedupe hashing.
- Network failure/offline mid-submit, double submit across two tabs, back-button after submit, expired session mid-form (preserve draft in localStorage).
- Large file upload failure/resume, orphaned uploads cleaned by cron.
- Database errors: connection pool exhaustion (use pooled URL, `connection_limit=1` per serverless instance in Prisma, reuse the Prisma singleton in dev to avoid hot-reload leaks), deadlocks (retry with jittered backoff, max 3), serialization failures, statement timeout set.
- Vercel limits: function timeout (set `maxDuration`, keep handlers short, push heavy work to cron/outbox), 4.5 MB request body limit (so uploads go direct to storage), no WebSockets, no writable filesystem, cold starts, Edge runtime cannot use Prisma/Node crypto (use Node runtime for DB routes).
- Hydration mismatches, `Date` formatting differences between server and client, missing `key` props, unhandled promise rejections, and `await` missing on async calls.

# 7. PROJECT STRUCTURE

```
/src
  /app            (routes: (marketing), (auth), (dashboard)/client, /freelancer, /admin, /api/webhooks/stripe, /api/cron/*)
  /components     (ui/, forms/, layout/)
  /server
    /actions      (server actions, thin)
    /services     (business logic: jobs, proposals, contracts, payments, disputes)
    /policies     (authorize.ts, state-machines.ts)
    /db           (prisma.ts singleton, repositories)
    /lib          (idempotency.ts, rate-limit.ts, stripe.ts, crypto.ts, sanitize.ts, errors.ts, env.ts, logger.ts)
  /emails
/prisma           (schema.prisma, migrations/, seed.ts)
/tests            (unit/, integration/, e2e/, concurrency/)
/.github/workflows (ci.yml, codeql.yml)
/vercel.json      (crons, headers, regions close to the DB region)
```

Business logic lives in `/server/services`, not in components or route handlers, so it can be unit-tested.

# 8. GITHUB + VERCEL DEPLOYMENT

- `ci.yml`: install -> `tsc --noEmit` -> ESLint -> Prettier check -> Vitest -> `prisma validate` -> `pnpm audit --prod` -> build. Required status check on `main`.
- Branches: `main` (production), PRs get Vercel Preview deployments with a separate Neon branch/preview DB (never point previews at the production DB). Separate Stripe test keys for preview/dev, live keys only in Production env.
- Build command: `prisma generate && prisma migrate deploy && next build` (migrations use `DIRECT_URL`; runtime uses the pooled `DATABASE_URL`). Add `"postinstall": "prisma generate"`.
- Configure the Stripe webhook endpoint per environment (`/api/webhooks/stripe`), with `export const runtime = 'nodejs'`.
- `vercel.json` crons (all protected by a `CRON_SECRET` bearer check): expire unfunded contracts, auto-approve milestones, clean idempotency keys/orphan uploads, retry failed webhooks/outbox, reconcile ledger, recompute job success score.
- Provide `README.md` (setup, env table, scripts, architecture diagram, deploy steps), `.env.example`, `SECURITY.md`, `CONTRIBUTING.md`, and a LICENSE.
- Health endpoint `/api/health` (DB ping) and uptime monitoring.

# 9. ADDITIONAL REQUIREMENTS I MAY HAVE FORGOTTEN (include them)

Terms of Service/Privacy/Cookie consent pages, GDPR-style data export and account deletion, KYC/identity verification via Stripe Identity for payouts, email preferences and unsubscribe links, SEO (metadata, sitemap, robots, OpenGraph, JSON-LD `JobPosting`), accessibility, i18n-ready strings, loading skeletons and empty states, admin impersonation WITHOUT password access (audited), feature flags, observability dashboards, a hard cap on payout amounts for new accounts, and hold periods for new freelancers.

Nice-to-have after MVP: hourly contracts with time tracking, teams/agencies, connects/credits system, saved searches and alerts, video calls, AI-assisted proposal drafts.

# 10. BUILD PHASES (stop and report after each, with tests passing)

1. Scaffold, env validation, Prisma schema + migrations + seed, CI, security headers, error handling, logger
2. Auth (signup, verify, login, reset, 2FA), RBAC, rate limiting
3. Profiles, categories, skills, file uploads
4. Jobs (CRUD, search, pagination, moderation)
5. Proposals + messaging + notifications
6. Contracts + milestones + state machines
7. Stripe Connect: onboarding, funding, webhooks, release, payouts, refunds, ledger
8. Reviews, disputes, reports, admin panel
9. Crons, reconciliation, concurrency/e2e tests, security review checklist, performance pass (indexes, N+1, caching)
10. Docs, deployment to Vercel, post-deploy smoke test

# OUTPUT RULES

- Write complete, working, typed code, no placeholders like "TODO" or "implement here".
- Before each phase, list the files you'll create. After each phase, list what was tested and any assumptions.
- If a requirement conflicts with Vercel/Stripe/Prisma limits, say so and propose the closest safe alternative instead of silently skipping it.
- Ask me before adding any dependency not listed in section 1.
