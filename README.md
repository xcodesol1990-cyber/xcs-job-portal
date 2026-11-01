# WorkWasl &mdash; Production-Grade Freelance Marketplace

WorkWasl is an enterprise-ready, high-trust freelance talent marketplace engineered with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **PostgreSQL with Prisma**, **Auth.js v5**, and **Stripe Connect**.

Designed specifically for mission-critical client-freelancer interactions, WorkWasl features a transparent **flat $1 client + $1 freelancer** contract fee model, milestone-based escrow state machines, double-entry financial ledger auditing, dispute arbitration, real-time messaging, and automated PostgreSQL background workers.

---

## ⚡ Quick Demo Persona Logins

For demo and testing purposes, standard seeded credentials with pre-configured personas are available. All accounts share the demo password:

**Password for all personas:** `WorkNestDemo!2026`

| Persona                    | Role         | Email                          | Capabilities                                                                        |
| :------------------------- | :----------- | :----------------------------- | :---------------------------------------------------------------------------------- |
| **Platform Administrator** | `ADMIN`      | `admin@worknest.dev`           | Mission Control, arbitration rulings, KYC review, user suspension, ledger audit     |
| **Enterprise Client**      | `CLIENT`     | `client@worknest.dev`          | Post jobs, evaluate proposals, fund milestone escrow, approve deliverables          |
| **Acme Technologies**      | `CLIENT`     | `client.acme@worknest.dev`     | Secondary client profile with verified payment status                               |
| **Senior Freelancer**      | `FREELANCER` | `freelancer@worknest.dev`      | Senior Fullstack Dev profile, submit proposals, submit deliverables, Stripe payouts |
| **Alex Rivera**            | `FREELANCER` | `freelancer.alex@worknest.dev` | Senior Freelancer profile with active milestone contracts                           |

_(Quick 1-click persona fill buttons are also available directly on the `/login` screen)._

---

## 🚀 Key Features & Architecture

### 1. Robust Authentication & RBAC

- **NextAuth v5 (Auth.js)** with custom Credentials & Argon2id password hashing.
- Brute-force account lockout with exponential backoff & RFC 6238 TOTP two-factor authentication.
- Strict isolation: `ADMIN` roles cannot be self-registered and require database seeding or platform administrative delegation.
- Automated email verification flow and secure password reset tokens.

### 2. Milestone-Based Escrow State Machine

- Strict deterministic state transitions: `PENDING_FUNDING` &rarr; `ACTIVE` &rarr; `COMPLETED` / `CANCELLED` / `DISPUTED`.
- Milestone stages: `PENDING` &rarr; `FUNDED` &rarr; `SUBMITTED` &rarr; `REVISION_REQUESTED` &rarr; `APPROVED` &rarr; `RELEASED` / `REFUNDED` / `DISPUTED`.
- **Double-Entry Financial Ledger:** Every escrow movement records an immutable `LedgerEntry` with a unique cryptographic idempotency key, preventing duplicate charges or payout leaks.

### 3. Payment Processing & Stripe Connect

- Seamless onboarding with **Stripe Connect Express** for freelancer bank payouts.
- Raw-body Stripe webhook handler (`/api/webhooks/stripe`) with idempotency deduplication in `WebhookEvent`.
- 100% server-side money math in integer cents (`BigInt`), completely eliminating floating-point rounding drift.

### 4. Dispute Resolution & Community Moderation

- Both parties can file disputes on contested milestones, automatically pausing escrow releases.
- Admin judicial arbitration engine supporting:
  - `RESOLVED_CLIENT`: 100% refund to client.
  - `RESOLVED_FREELANCER`: 100% release to freelancer (minus platform fee).
  - `RESOLVED_SPLIT`: Custom percentage split of escrowed funds.
- Community reporting queue to flag suspicious jobs, abusive messages, or bad actors.

### 5. Automated Background Crons (`vercel.json`)

- Protected by a strict `CRON_SECRET` bearer check and PostgreSQL advisory locks (`pg_try_advisory_lock`):
  - `/api/cron/daily`: Runs daily at `0 0 * * *` (Vercel Hobby plan compliant), sequentially executing:
    - Transactional outbox retry & dead-letter queue processing
    - Deliverable auto-approval for milestones waiting > 14 days without client action
    - Auto-cancellation of unfunded contract offers > 7 days
    - Double-entry ledger integrity reconciliation & audit logging
    - Data hygiene cleanup of expired idempotency keys and tokens
    - Job Success Score (JSS) recalculation for active talent

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15.5+ (App Router, Server Actions, Dynamic Streaming)
- **UI & Styling:** React 19, Tailwind CSS, Lucide Icons, Reusable UI Component Primitives
- **Database & ORM:** PostgreSQL, Prisma ORM with PgBouncer connection pooling
- **Security & Crypto:** `@node-rs/argon2`, Node `crypto` AES-256-GCM, Citext, DOMPurify sanitization
- **File Storage:** `@vercel/blob` with fallback local storage
- **Payments:** Stripe API (Stripe Connect Express)
- **Testing:** Vitest with comprehensive unit and state-machine test suites
- **CI / CD:** GitHub Actions (`.github/workflows/ci.yml` and `codeql.yml`)

---

## 💻 Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/<your-repo>/xcs-job-portal.git
cd xcs-job-portal
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure the following core variables are configured:

```env
NODE_ENV=development
APP_URL=http://localhost:3000

# NextAuth secret (32+ character hex string)
AUTH_SECRET=6bdd41e45d21ddfc053160c323172d12887387698c52a7fb527f431a3d2c6b23

# AES-256-GCM encryption key (64 hex characters / 32 bytes)
ENCRYPTION_KEY=97022bb2602c4fb83aa8cb274726070580ce0dd6b66d0a01a37964c0f2e4cad8

# Cron secret for background jobs
CRON_SECRET=6e3ef7eb518fe2411f5085e4eb713cada632c7a3b64ed0195c126e93997c9f03

# PostgreSQL connection strings
DATABASE_URL="postgresql://user:password@host:5432/worknest?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:password@host:5432/worknest"

# Stripe (Optional in local development)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Database Migration & Seeding

```bash
# Push schema & generate client
pnpm prisma generate
pnpm prisma migrate deploy

# Seed demo personas & categories
pnpm db:seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the test suite, linting, and typechecks:

```bash
# Run unit tests
pnpm test

# Run TypeScript type check
pnpm typecheck

# Run ESLint
pnpm lint

# Run Prettier code formatting check
pnpm format:check

# Run production build test
pnpm next build
```

---

## 🌐 Production Deployment (Vercel)

Detailed deployment and post-deploy verification steps are documented in [docs/13-deployment-and-production-checklist.md](docs/13-deployment-and-production-checklist.md).

1. Connect your repository to **Vercel**.
2. Configure Environment Variables (`DATABASE_URL`, `DIRECT_URL`, `APP_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET`).
3. Set the build command to automatically apply migrations and seeds on every release:
   ```bash
   prisma generate && prisma migrate deploy && tsx prisma/seed.ts && next build
   ```
4. Verify `/api/health` returns `200 OK` and execute the 8-step smoke test in [docs/13-deployment-and-production-checklist.md](docs/13-deployment-and-production-checklist.md).

---

## 📄 License

MIT License. Built with ❤️ for open, verifiable freelance collaboration.
