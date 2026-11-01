# 13. Vercel Deployment & Post-Deploy Smoke Test Guide

This document defines the production deployment runbook, environment variable matrix, and end-to-end post-deployment verification protocol for the **WorkNest Enterprise Freelance Marketplace**.

---

## 1. Vercel Project Configuration

### Build & Output Settings

- **Framework Preset:** Next.js
- **Node.js Version:** `20.x` or higher
- **Root Directory:** `./`
- **Build Command:**
  ```bash
  prisma generate && prisma migrate deploy && tsx prisma/seed.ts && next build
  ```
  _(This automatically applies pending database migrations, seeds reference taxonomy & demo accounts, and compiles optimized Next.js serverless bundles)._
- **Output Directory:** `.next`
- **Install Command:**
  ```bash
  pnpm install
  ```

---

## 2. Environment Variables Matrix

Configure these variables in your Vercel Project Settings under **Environment Variables** (Production and Preview):

| Variable Name              | Required | Example / Description                                                                        |
| :------------------------- | :------- | :------------------------------------------------------------------------------------------- |
| `NODE_ENV`                 | Yes      | `production`                                                                                 |
| `APP_URL`                  | Yes      | `https://your-domain.vercel.app` (Canonical public base URL)                                 |
| `AUTH_SECRET`              | Yes      | `openssl rand -hex 32` (32+ character key for Auth.js cookie encryption)                     |
| `ENCRYPTION_KEY`           | Yes      | `openssl rand -hex 32` (64-character hex string / 32-byte AES-256-GCM key)                   |
| `CRON_SECRET`              | Yes      | `openssl rand -hex 32` (Bearer token for cron verification)                                  |
| `DATABASE_URL`             | Yes      | `postgresql://user:pass@ep-pooler.neon.tech/worknest?pgbouncer=true&connection_limit=1`      |
| `DIRECT_URL`               | Yes      | `postgresql://user:pass@ep-direct.neon.tech/worknest` (Used for migrations & advisory locks) |
| `STRIPE_SECRET_KEY`        | Optional | `sk_live_...` or `sk_test_...` for escrow payments                                           |
| `STRIPE_WEBHOOK_SECRET`    | Optional | `whsec_...` for raw body webhook signature verification                                      |
| `STRIPE_CONNECT_CLIENT_ID` | Optional | `ca_...` for Stripe Connect Express onboarding                                               |
| `SEED_PASSWORD`            | Optional | Default `WorkNestDemo!2026` for seeded demo personas                                         |

---

## 3. Database & Network Architecture (Neon PostgreSQL)

1. **Pooled Connection (`DATABASE_URL`):**
   - Must point to the Neon pooled endpoint with `?pgbouncer=true&connection_limit=1`.
   - Prevents connection pool exhaustion across Next.js serverless functions.
2. **Direct Connection (`DIRECT_URL`):**
   - Points directly to PostgreSQL instance without PgBouncer.
   - Required by Prisma for DDL schema migrations (`prisma migrate deploy`).
3. **Region Placement:**
   - Configure Vercel deployment regions (`iad1` / US East) to be co-located with your Neon database region to minimize network roundtrip latency.

---

## 4. Background Automation & Crons

WorkNest consolidates all background maintenance into a single daily cron job compatible with Vercel Hobby limits:

- **Endpoint:** `/api/cron/daily`
- **Schedule:** `0 0 * * *` (Daily at 00:00 UTC)
- **Concurrency Guard:** PostgreSQL session advisory lock `withCronAdvisoryLock(9999)` guarantees exactly-once execution.
- **Tasks Executed:**
  1. Transactional outbox retry & dead-letter queue processing
  2. Automatic deliverable approval for reviews inactive > 14 days
  3. Auto-cancellation of unfunded contract offers > 7 days
  4. Double-entry ledger integrity reconciliation & audit logging
  5. Purging expired idempotency records and ephemeral tokens
  6. Dynamic recalculation of freelancer Job Success Scores (JSS)

---

## 5. Post-Deploy Smoke Test Verification Protocol

Execute the following 8-step smoke test immediately following deployment:

### Step 1: Health & Database Connectivity Check

```bash
curl -I https://<your-domain>.vercel.app/api/health
```

- **Expected Status:** `200 OK`
- **Expected JSON:**
  ```json
  { "status": "ok", "db": "up", "requestId": "req_...", "latencyMs": 14 }
  ```

### Step 2: Persona Authentication & Self-Healing Seed

Navigate to `https://<your-domain>.vercel.app/login`:

- Test logging in as **Platform Administrator**:
  - Email: `admin@worknest.dev`
  - Password: `WorkNestDemo!2026`
  - Verify redirect to `/admin` dashboard.
- Test logging in as **Client**:
  - Email: `client@worknest.dev` (or `client.acme@worknest.dev`)
  - Password: `WorkNestDemo!2026`
  - Verify redirect to `/client` dashboard.
- Test logging in as **Freelancer**:
  - Email: `freelancer@worknest.dev` (or `freelancer.alex@worknest.dev`)
  - Password: `WorkNestDemo!2026`
  - Verify redirect to `/freelancer` hub.

### Step 3: Marketplace Browsing & Search

- Visit `/jobs` in an unauthenticated or incognito browser.
- Verify keyword search filters and category tags update the job stream.
- Click into any job (e.g., `/jobs/<id>`) and verify OpenGraph metadata, JSON-LD `JobPosting` schema tags, and client payment verification badges.

### Step 4: Job Creation & Modification Guards

- Sign in as `client@worknest.dev`.
- Post a new job from `/client/jobs/new`.
- Verify the job appears in `/client/jobs` with `OPEN` status.
- Confirm budget cannot be modified downwards if proposals have been received.

### Step 5: Proposal Submission

- Sign in as `freelancer@worknest.dev`.
- Navigate to the newly created job and click **Submit Proposal**.
- Provide a milestone breakdown, proposed fee, and pitch.
- Submit proposal and verify it appears under `/freelancer/proposals`.

### Step 6: Contract Formulation & Escrow Funding

- Sign back in as `client@worknest.dev`.
- Review the submitted proposal at `/client/jobs/<id>/proposals`.
- Accept the proposal to instantiate a draft `Contract`.
- Navigate to `/contracts/<id>` and verify escrow funding status.

### Step 7: Milestone Submission & Approval Flow

- Sign in as freelancer, navigate to `/contracts/<id>`, and submit milestone deliverables.
- Sign in as client, review deliverable notes, and trigger milestone approval.
- Verify that double-entry ledger entries are recorded and payout amounts reflect in `/freelancer/payouts`.

### Step 8: Cron Execution Smoke Test

Trigger the daily background cron using your configured `CRON_SECRET`:

```bash
curl -X GET https://<your-domain>.vercel.app/api/cron/daily \
  -H "Authorization: Bearer <YOUR_CRON_SECRET>"
```

- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  {
    "success": true,
    "result": {
      "outbox": { "processed": 0 },
      "autoApprove": { "approved": 0 },
      "expiredContracts": { "expired": 0 },
      "ledger": { "healthy": true, "discrepancies": 0 },
      "cleanup": { "cleaned": 0 },
      "jss": { "updated": 2 }
    }
  }
  ```

---

## 6. Rollback & Disaster Recovery Runbook

1. **Vercel Instant Rollback:**
   - If a fatal runtime regression occurs, open the Vercel Dashboard, select **Deployments**, locate the last healthy release, and click **Promote to Production**.
2. **Database Reversion:**
   - In the event of schema migration issues, use `prisma migrate resolve --rolled-back <migration_name>` on your direct connection string.
3. **Incident Escalation:**
   - Critical ledger imbalances or payment anomalies trigger automated entries in `AuditLog` visible from `/admin/ledger`.
