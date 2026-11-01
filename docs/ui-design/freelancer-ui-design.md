# Freelancer Hub UI & UX Design

## Overview
The **Freelancer Hub** (`/freelancer`) is tailored to independent software engineers, designers, and consultants. Its UX focuses on opportunity discovery, transparency around platform fees and take-home earnings, streamlined milestone deliverable submissions, and real-time payout tracking.

---

## Navigation & Workspace Shell
- **Shell**: Consumer / Marketplace Shell (`src/app/(dashboard)/layout.tsx`)
- **Top Navigation Bar**:
  - Brand Logo + "Freelancer Hub" badge
  - Main Links: `Find Work`, `My Proposals`, `Active Contracts`, `Messages`, `Payouts`
  - Right Controls: Workspace Switcher ("Switch to Client"), Notification Bell, Profile Avatar

---

## Key Views & Components

### 1. Freelancer Dashboard (`/freelancer`)
- **Earnings & Pipeline Cards**:
  - *Available for Payout*: Green highlighted metric card with `Withdraw Funds` CTA.
  - *Pending in Escrow*: Total dollar amount of milestones currently funded by clients.
  - *Active Proposals*: Counter of submitted pitches currently under client review.
- **Assigned Contracts Feed**: Interactive progress cards showing milestones currently in development and due dates.
- **Recommended Jobs Carousel**: Algorithmic recommendations matching the freelancer's skill tags.

### 2. Job Discovery & Marketplace (`/jobs`)
- **Sticky Filter Sidebar**:
  - Full-text search with instant debounced query execution.
  - Category checkbox list with job count counters.
  - Payment type toggle (`All`, `Fixed Price`, `Hourly`).
  - Budget range inputs (Min $ / Max $).
  - Experience tier checkboxes (`Entry`, `Intermediate`, `Expert`).
- **Job Card Item**:
  - Title and relative post time (e.g., "Posted 2 hours ago").
  - Client trust badge: Rating stars, total dollars spent, and country.
  - Budget pill (e.g. `$2,500 Est. Budget`).
  - Skill tag pills with hover effects.
  - Description snippet with line clamping (`line-clamp-2`).

### 3. Proposal Submission Form (`/jobs/[id]/apply`)
- **Smart Fee Calculation Box**:
  - Inputs: Freelancer Bid Amount (e.g., `$1,000.00`).
  - Real-time Fee Deduction: Platform Fee 10% (-`$100.00`).
  - Highlighted Net Earnings: **`$900.00`** highlighted in emerald typography.
- **Milestone Breakdown Builder**:
  - Dynamic add/remove milestone rows.
  - Real-time sum validation ensuring milestone totals equal the bid amount.
- **Cover Letter Editor**:
  - Textarea with formatting shortcuts and project timeline dropdown (`< 1 month`, `1 to 3 months`, `3 to 6 months`).

### 4. Deliverable Submission Locker (`/contracts/[id]`)
- **Submission Modal**:
  - Deliverable link input (URL validation for GitHub PR, Figma, Demo staging).
  - Release notes textarea detailing completed acceptance criteria.
  - Submit button with instant toast confirmation.
  - Status transitions to `WORK_SUBMITTED`, triggering the client review timer.

### 5. Payouts & Earnings Board (`/freelancer/payouts`)
- **Available Balance Summary**: Real-time ledger-backed available funds.
- **Stripe Express Connect Integration**: One-click onboarding to connect bank accounts.
- **Historical Payout Table**: Date, Contract, Gross Amount, Platform Fee, Net Transferred, Status.

---

## Responsive Breakpoints & Mobile UX
- On mobile devices, the job filter panel converts into a bottom slide-up drawer triggered by a sticky "Filters" button.
- Proposal submission calculates fees live without requiring keyboard dismissal.
