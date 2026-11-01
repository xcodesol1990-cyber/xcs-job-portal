# 07. Double-Entry Financial Ledger

## Overview

WorkNest maintains mathematical integrity across all marketplace finances using a **Cryptographic Double-Entry Ledger**. Rather than simply mutating an arbitrary `balance` column on user tables, every movement of capital is recorded as immutable, append-only credit and debit entries. At any time, the sum of debits must equal the sum of credits across the system, preventing money creation or loss.

---

## Key Files & Modules

- `src/server/services/admin.service.ts`: Ledger entry insertion, account balance aggregation, and financial reconciliation.
- `src/server/services/payment.service.ts`: Escrow payment intents, Stripe Connect onboarding, and webhook handlers (`handlePaymentSucceeded`, `handlePaymentFailed`, `handleChargeRefunded`, `handleAccountUpdated`).
- `src/app/api/webhooks/stripe/route.ts`: Idempotent webhook receiver with signature validation and `WebhookEvent` persistence.
- `src/app/admin/ledger/page.tsx`: Full cryptographic ledger audit log with filtering by user, contract, and account type.
- `src/app/(dashboard)/freelancer/payouts/page.tsx`: Freelancer banking portal with Stripe Connect Express status and ledger disbursement history.
- `src/app/api/cron/daily/route.ts`: Daily scheduled reconciliation job verifying ledger parity.

---

## Ledger Accounts & Normal Balances

WorkNest defines standard account types for double-entry bookkeeping:

| Account Type         | Description                                                         | Normal Balance |
| :------------------- | :------------------------------------------------------------------ | :------------- |
| `ESCROW_HOLDING`     | Funds deposited by clients held in trust pending milestone approval | Credit         |
| `CLIENT_WALLET`      | Client's funded capital or pending refund balance                   | Credit         |
| `FREELANCER_PAYABLE` | Earned freelancer funds available for bank withdrawal               | Credit         |
| `PLATFORM_REVENUE`   | Cumulative platform commission fees collected (e.g., 10%)           | Credit         |
| `STRIPE_CLEARING`    | External funds received through Stripe payment processing           | Debit          |

---

## Transaction Flows & Balancing Examples

### 1. Milestone Funding ($1,000.00 / 100,000 cents)

When a client funds a milestone via Stripe Checkout:

- **Debit**: `STRIPE_CLEARING` (100,000 cents)
- **Credit**: `ESCROW_HOLDING` (100,000 cents)
- _Invariant Check: Sum(Debits) - Sum(Credits) = 0_

### 2. Milestone Release with 10% Platform Commission

When the client approves the $1,000.00 deliverable:

- **Debit**: `ESCROW_HOLDING` (100,000 cents)
- **Credit**: `FREELANCER_PAYABLE` (90,000 cents)
- **Credit**: `PLATFORM_REVENUE` (10,000 cents)
- _Invariant Check: 100,000 Debit == 90,000 + 10,000 Credit_

### 3. Disputed Settlement (e.g., 60% Freelancer / 40% Client Refund)

When an administrator resolves an arbitration claim on a $1,000.00 milestone:

- **Debit**: `ESCROW_HOLDING` (100,000 cents)
- **Credit**: `FREELANCER_PAYABLE` (54,000 cents [60% of $900 net])
- **Credit**: `PLATFORM_REVENUE` (6,000 cents [6% platform take])
- **Credit**: `CLIENT_WALLET` (40,000 cents [40% full refund])
- _Invariant Check: 100,000 Debit == 54,000 + 6,000 + 40,000 Credit_

---

## End-to-End Use Cases

### Use Case 7.1: Super Admin Auditing System Ledger

- **Actor**: Super Admin
- **Workflow**:
  1. Admin navigates to `/admin/ledger`.
  2. Inspects real-time double-entry transaction log displaying:
     - Transaction ID
     - Timestamp
     - Account (`ESCROW_HOLDING`, `FREELANCER_PAYABLE`, `PLATFORM_REVENUE`)
     - User Associated
     - Related Contract & Milestone
     - Amount (cents formatted as USD)
     - Type (`DEBIT` or `CREDIT`)
  3. Uses search and filter controls to isolate a specific contract's transaction lifecycle from initial deposit to final payout.

### Use Case 7.2: Daily Parity Reconciliation Verification

- **Actor**: Automated System Cron
- **Workflow**:
  1. Every night at 00:00 UTC, the cron job executes `adminService.reconcileLedger()`.
  2. Aggregates all recorded `DEBIT` entries and compares against all `CREDIT` entries.
  3. If discrepancy equals 0, system records audit status `VERIFIED_BALANCED`.
  4. If discrepancy is non-zero, critical alert is dispatched to platform maintainers.
