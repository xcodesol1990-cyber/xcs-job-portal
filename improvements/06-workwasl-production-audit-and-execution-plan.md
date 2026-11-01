# WorkWasl Production Audit & Step-by-Step Execution Blueprint

> **Status:** Active Execution Plan  
> **Brand & Model:** WorkWasl — Flat \$1 Client & \$1 Freelancer Milestone Marketplace  
> **Target Architecture:** Zero-Debt, In-House PostgreSQL Foundation with Production Payment & Security Hardening

---

## 1. Executive Summary & Core Business Model

WorkWasl is built on a clear, disruptive market thesis: **eliminate abusive 10%–20% percentage-based contractor commissions and replace them with a flat, transparent \$1 platform fee from the client and \$1 from the freelancer per completed contract.**

### Core Economic Rule

- On a \$500 contract, before third-party merchant rails:
  - **Client pays:** \$501.00 (\$500.00 contract escrow + \$1.00 client platform fee).
  - **Freelancer receives:** \$499.00 (\$500.00 milestone earnings - \$1.00 freelancer platform fee).
  - **Platform earns:** \$2.00 gross revenue per successfully delivered contract.
- **Rule Enforcement:** Applied **once per contract**, never per milestone.
- **Snapshot Integrity:** Stored with exact amounts, ISO currency, and `fee_policy_version` on the contract record at signature, ensuring platform settings changes never alter historical contracts.

---

## 2. Comprehensive Implementation Audit & Current State

### Section 2: Complete User Journeys

#### Client Journey

| Requirement                                           |   Status    | Existing Implementation / File Path                                                                                                                                                                                                                                                                                                                                                                           | Gap / Action Needed                                                                                  |
| :---------------------------------------------------- | :---------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------- |
| **Register, verify email, sign in, recover password** | ✅ Verified | [`src/app/(auth)/register/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(auth)/register/page.tsx>), [`login/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(auth)/login/page.tsx>), [`forgot-password/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(auth)/forgot-password/page.tsx>), [`verify-email/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(auth)/verify-email/page.tsx>) | Ensure email verification tokens enforce database expiration and anti-tamper hashes.                 |
| **Create & complete client profile**                  | ✅ Verified | [`src/app/(dashboard)/client/profile/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(dashboard)/client/profile/page.tsx>), [`client-profile-form.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/client-profile-form.tsx)                                                                                                                                                                   | Add profile completeness percentage calculation widget.                                              |
| **Create, edit, preview, publish, pause, close job**  | 🟡 Partial  | [`src/components/forms/create-job-form.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/create-job-form.tsx), [`src/server/services/job.service.ts`](file:///d:/mywork/xcs-job-portal/src/server/services/job.service.ts)                                                                                                                                                                          | Creation and closing exist; add explicit "PAUSED" state machine transition and public preview modal. |
| **Upload job attachments securely**                   | 🟡 Partial  | Uses `@vercel/blob` via [`src/server/lib/storage.ts`](file:///d:/mywork/xcs-job-portal/src/server/lib/storage.ts)                                                                                                                                                                                                                                                                                             | Add strict MIME-type magic byte validation and private signed download URLs.                         |
| **Search and filter freelancer profiles**             | ✅ Verified | [`src/app/freelancers/[id]/page.tsx`](file:///d:/mywork/xcs-job-portal/src/app/freelancers/[id]/page.tsx), [`profile.service.ts`](file:///d:/mywork/xcs-job-portal/src/server/services/profile.service.ts)                                                                                                                                                                                                    | Add dedicated marketplace directory `/freelancers` with category and rate filtering.                 |
| **Receive, view, compare and shortlist proposals**    | ✅ Verified | [`src/app/(dashboard)/client/jobs/[id]/proposals/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(dashboard)/client/jobs/[id]/proposals/page.tsx>), [`proposal-comparison-matrix.tsx`](file:///d:/mywork/xcs-job-portal/src/components/proposals/proposal-comparison-matrix.tsx)                                                                                                                         | Complete with side-by-side comparison modal.                                                         |
| **Message a freelancer**                              | ✅ Verified | [`src/app/(dashboard)/messages/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(dashboard)/messages/page.tsx>), [`messaging.service.ts`](file:///d:/mywork/xcs-job-portal/src/server/services/messaging.service.ts)                                                                                                                                                                                      | Database-backed polling with conversation participant access checks.                                 |
| **Hire freelancer & define contract / milestones**    | ✅ Verified | [`src/components/forms/create-contract-form.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/create-contract-form.tsx), [`contract.service.ts`](file:///d:/mywork/xcs-job-portal/src/server/services/contract.service.ts)                                                                                                                                                                          | Update fee calculation to flat \$1 client + \$1 freelancer snapshot.                                 |
| **Fund milestones via payment provider**              | ✅ Verified | [`src/server/services/payment.service.ts`](file:///d:/mywork/xcs-job-portal/src/server/services/payment.service.ts), [`src/app/api/webhooks/stripe/route.ts`](file:///d:/mywork/xcs-job-portal/src/app/api/webhooks/stripe/route.ts)                                                                                                                                                                          | Stripe escrow PaymentIntents with webhook signature verification and ledger entry.                   |
| **Review work, approve or request revision**          | ✅ Verified | [`src/components/forms/contract-milestone-actions.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/contract-milestone-actions.tsx)                                                                                                                                                                                                                                                                 | Supports deliverable inspection, GitHub PR verification, and revision requests.                      |
| **Complete contract and leave review**                | ✅ Verified | [`src/components/forms/contract-review-form.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/contract-review-form.tsx), [`review.service.ts`](file:///d:/mywork/xcs-job-portal/src/server/services/review.service.ts)                                                                                                                                                                              | Enforces completion check; prevents self-reviews and duplicate reviews.                              |
| **View payment history, invoices & notifications**    | ✅ Verified | [`src/app/(dashboard)/notifications/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(dashboard)/notifications/page.tsx>), [`contract.service.ts`](file:///d:/mywork/xcs-job-portal/src/server/services/contract.service.ts)                                                                                                                                                                              | Add downloadable PDF/HTML invoice generation view for milestone releases.                            |

#### Freelancer Journey

| Requirement                                            |   Status    | Existing Implementation / File Path                                                                                                                                                                                                       | Gap / Action Needed                                                               |
| :----------------------------------------------------- | :---------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **Register, verify email and sign in**                 | ✅ Verified | [`src/components/forms/register-form.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/register-form.tsx), [`login-form.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/login-form.tsx)                             | Fully operational with dual-persona registration.                                 |
| **Complete profile, skills, portfolio & availability** | ✅ Verified | [`src/components/forms/freelancer-profile-form.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/freelancer-profile-form.tsx), [`portfolio-list.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/portfolio-list.tsx) | Complete with category selection, skills pills, and custom specialization tags.   |
| **Search, filter and save jobs**                       | ✅ Verified | [`src/app/jobs/page.tsx`](file:///d:/mywork/xcs-job-portal/src/app/jobs/page.tsx), [`save-job-button.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/save-job-button.tsx)                                                     | Full-text keyword search and category filtering in place.                         |
| **Submit, edit or withdraw proposal**                  | 🟡 Partial  | [`src/components/forms/apply-job-form.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/apply-job-form.tsx), [`proposal.service.ts`](file:///d:/mywork/xcs-job-portal/src/server/services/proposal.service.ts)                  | Submission exists; add proposal withdrawal button when proposal is still pending. |
| **Accept contract and review terms**                   | ✅ Verified | [`src/app/(dashboard)/contracts/[id]/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(dashboard)/contracts/[id]/page.tsx>)                                                                                                           | Full contract term breakdown and milestone timeline view.                         |
| **Submit deliverables & respond to revisions**         | ✅ Verified | [`src/components/forms/contract-milestone-actions.tsx`](file:///d:/mywork/xcs-job-portal/src/components/forms/contract-milestone-actions.tsx)                                                                                             | Deliverable handover notes, GitHub commit diff verifier, and status tracking.     |
| **View earnings, fees, payment and payout status**     | ✅ Verified | [`src/app/(dashboard)/freelancer/payouts/page.tsx`](<file:///d:/mywork/xcs-job-portal/src/app/(dashboard)/freelancer/payouts/page.tsx>)                                                                                                   | Stripe Express connect status and ledger balance tracking.                        |

#### Admin Journey

| Requirement                                           |   Status    | Existing Implementation / File Path                                                                                                                                                                               | Gap / Action Needed                                                                   |
| :---------------------------------------------------- | :---------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| **Secure admin access (no public signup/escalation)** | ✅ Verified | [`src/server/policies/authorize.ts`](file:///d:/mywork/xcs-job-portal/src/server/policies/authorize.ts), [`src/middleware.ts`](file:///d:/mywork/xcs-job-portal/src/middleware.ts)                                | Role checks enforced server-side; registration restricts to `CLIENT` or `FREELANCER`. |
| **Manage users, jobs, reports and moderation**        | ✅ Verified | [`src/app/admin/users/page.tsx`](file:///d:/mywork/xcs-job-portal/src/app/admin/users/page.tsx), [`reports/page.tsx`](file:///d:/mywork/xcs-job-portal/src/app/admin/reports/page.tsx)                            | Admin user suspensions, job removals, and report triage.                              |
| **Review disputes with immutable audit trail**        | ✅ Verified | [`src/app/admin/disputes/page.tsx`](file:///d:/mywork/xcs-job-portal/src/app/admin/disputes/page.tsx), [`dispute-resolver.tsx`](file:///d:/mywork/xcs-job-portal/src/components/admin/dispute-resolver.tsx)       | 3-way split arbitration and audit log tracking.                                       |
| **View contracts, payments, refunds, ledger**         | ✅ Verified | [`src/app/admin/ledger/page.tsx`](file:///d:/mywork/xcs-job-portal/src/app/admin/ledger/page.tsx)                                                                                                                 | Full double-entry ledger explorer with balance sheet verification.                    |
| **Configure platform settings & business rules**      | ✅ Verified | [`src/app/admin/settings/page.tsx`](file:///d:/mywork/xcs-job-portal/src/app/admin/settings/page.tsx), [`admin-settings-tabs.tsx`](file:///d:/mywork/xcs-job-portal/src/components/admin/admin-settings-tabs.tsx) | 8-tab configuration suite with audit trail.                                           |

---

## 3. Business Rules Gap Analysis: Transitioning to the Flat $1 Fee Model

### The Current vs. Intended Rule Discrepancy

- **Current implementation:** `contract.service.ts` uses `platformFeeBps = 1000` (10%) and charges `(milestone.amountCents * platformFeeBps) / 10000n` per milestone release.
- **WorkWasl Intended Business Rule:**
  1. Flat **\$1.00** from the client (100 cents).
  2. Flat **\$1.00** from the freelancer (100 cents).
  3. Charged **once per contract** upon successful completion (or at first milestone funding / final release).
  4. Snapshot the exact agreed fee (`clientFeeCents: 100`, `freelancerFeeCents: 100`, `feePolicyVersion: "v1_flat_1_dollar"`) on the contract at creation.
  5. Both parties see the exact fee breakdown before entering the contract.

### Required Architecture Updates

1. **Schema Migration:**
   - Add fields to `Contract` model in `prisma/schema.prisma`:
     - `clientFeeCents BigInt @default(100) @map("client_fee_cents")`
     - `freelancerFeeCents BigInt @default(100) @map("freelancer_fee_cents")`
     - `feePolicyVersion String @default("v1_flat_1_dollar") @map("fee_policy_version")`
     - `clientFeeCharged Boolean @default(false) @map("client_fee_charged")`
     - `freelancerFeeCharged Boolean @default(false) @map("freelancer_fee_charged")`
2. **Contract Service Updates:**
   - On contract funding: charge client `totalCents + clientFeeCents` once.
   - On milestone release: deduct freelancer fee only on the final milestone or first milestone release, ensuring total deduction across the contract is strictly \$1.00.
3. **Double-Entry Ledger:**
   - Create distinct ledger entries for `CLIENT_PLATFORM_FEE` (\$1.00) and `FREELANCER_PLATFORM_FEE` (\$1.00).

---

## 4. Payment and Financial Integrity (P0)

| Requirement                            | Implementation Strategy                                                                                                                                                                    |   Status    |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
| **PaymentProvider interface**          | Behind [`src/server/lib/stripe.ts`](file:///d:/mywork/xcs-job-portal/src/server/lib/stripe.ts) with `StripePaymentProvider` implementation.                                                | ✅ Complete |
| **Webhook verification & idempotency** | Implemented in [`src/app/api/webhooks/stripe/route.ts`](file:///d:/mywork/xcs-job-portal/src/app/api/webhooks/stripe/route.ts) with Stripe signature check and database idempotency locks. | ✅ Complete |
| **Row-level locking for funds**        | Managed via Prisma `$transaction` with optimistic concurrency versioning (`version Int @default(0)`).                                                                                      | ✅ Complete |
| **Append-only ledger**                 | `LedgerEntry` table records debits and credits with zero updates/deletions.                                                                                                                | ✅ Complete |
| **Compensating refunds**               | Refunds create counterbalancing ledger records rather than overwriting historical entries.                                                                                                 | ✅ Complete |

---

## 5. Security & Abuse Prevention (P0)

| Requirement                                     | Mechanism                                                                                             |    Status    |
| :---------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :----------: |
| **Server-side authorization on all operations** | Checked in `authorize.ts` using strict user ID matches and role membership.                           | ✅ Complete  |
| **IDOR / BOLA Prevention**                      | Contracts, messages, proposals, and dispute actions verify participant IDs against session.           | ✅ Complete  |
| **Input validation & sanitization**             | Zod schemas in all server actions; `src/server/lib/sanitize.ts` strips script tags from rich content. | ✅ Complete  |
| **Uploaded file security**                      | MIME-type verification, 10MB file size ceiling, and extension whitelisting.                           | 🟡 Hardening |
| **Database-backed rate limiting**               | `src/server/lib/rate-limit.ts` enforces sliding-window in-memory/DB request limits.                   | ✅ Complete  |
| **CSRF & Security Headers**                     | Configured in `next.config.ts` (HSTS, X-Content-Type-Options, Referrer-Policy, Frame-Options).        | ✅ Complete  |

---

## 6. Build In-House Where Practical

| Feature                      | In-House Architecture                                                                                |   Status    |
| :--------------------------- | :--------------------------------------------------------------------------------------------------- | :---------: |
| **Search**                   | PostgreSQL full-text search with `to_tsvector` and GIN index.                                        | ✅ In-House |
| **Matching**                 | Pure application-level scoring based on skills intersection, category taxonomy, and hourly rate fit. | ✅ In-House |
| **Messaging**                | Database-persisted messages with transactional polling; zero third-party socket bills.               | ✅ In-House |
| **Background Cron**          | Secure HTTP cron endpoints guarded by `CRON_SECRET` executing via platform scheduler.                | ✅ In-House |
| **Feature Flags & Settings** | Database-backed `PlatformSetting` model with instant admin GUI management.                           | ✅ In-House |
| **Analytics**                | SQL aggregations and live dashboard stat cards.                                                      | ✅ In-House |

---

## 7. Phased Step-by-Step Execution Plan

```mermaid
flowchart TD
    Step1["Step 1: Audit & Documentation (Complete)"] --> Step2["Step 2: Flat $1 Fee Migration & Business Rules"]
    Step2 --> Step3["Step 3: Core User Journeys & State Machines"]
    Step3 --> Step4["Step 4: Security & IDOR Verification"]
    Step4 --> Step5["Step 5: Automated Testing & Reliability"]
    Step5 --> Step6["Step 6: Production Launch Sign-Off"]
```

### Step 1: Audit Existing Implementation ✅ (Completed)

- Mapped all requirements to file paths and evidence.
- Created this comprehensive production blueprint.

### Step 2: Implement WorkWasl Flat $1 Fee Model (Next Immediate Task)

- Update `prisma/schema.prisma` to add fee snapshot columns to `Contract`.
- Update `contract.service.ts` to replace 10% calculation with flat \$1 client + \$1 freelancer.
- Update UI breakdowns in `apply-job-form.tsx`, `create-contract-form.tsx`, and `contract/[id]/page.tsx`.
- Add unit tests validating exact \$1 fee debits and idempotency.

### Step 3: Complete Core User Journeys

- Add proposal withdrawal action for freelancers.
- Add job pause/resume state machine transitions.
- Ensure all public pages have clean titles and metadata.

### Step 4: Security & Abuse Prevention Hardening

- Add magic-number file signature validation to upload handlers.
- Verify IDOR protection on all proposal, message, and review routes.

### Step 5: Comprehensive Automated Testing

- Add concurrency tests for simultaneous proposal acceptance.
- Verify double-entry ledger reconciliation on partial dispute refunds.
- Run type-check, lint, and full test suite.
