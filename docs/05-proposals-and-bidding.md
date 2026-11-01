# 05. Proposals & Bidding System

## Overview

The Proposals module allows qualified freelancers to submit competitive pitches, breakdown deliverable milestones, and negotiate pricing with clients. Clients receive submissions through a dedicated proposal review desk where they can compare candidates, review past performance, and award contracts with 1 click.

---

## Key Files & Modules

- `src/server/services/proposal.service.ts`: Proposal submission, duplicate check validation, milestone formatting, and status transitions.
- `src/app/jobs/[id]/apply/page.tsx`: Freelancer proposal submission form.
- `src/app/(dashboard)/client/jobs/[id]/proposals/page.tsx`: Client proposal review desk.
- `src/app/(dashboard)/freelancer/proposals/page.tsx`: Freelancer proposal management board tracking active pitches.

---

## Proposal State Lifecycle

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED: Freelancer submits proposal
    SUBMITTED --> UNDER_REVIEW: Client opens proposal details
    UNDER_REVIEW --> ACCEPTED: Client accepts & creates contract
    UNDER_REVIEW --> REJECTED: Client declines proposal
    SUBMITTED --> WITHDRAWN: Freelancer retracts bid
    ACCEPTED --> [*]
    REJECTED --> [*]
    WITHDRAWN --> [*]
```

---

## Capabilities & Business Rules

1. **One Active Proposal Per Freelancer Per Job**:
   - The database enforces uniqueness on `[jobId, freelancerId]` to prevent spamming duplicate bids.
2. **Milestone Schedule Breakdown**:
   - Proposals can include structured milestone proposals (e.g., Milestone 1: Design ($500), Milestone 2: Implementation ($1,500), Milestone 3: QA ($500)).
3. **Cover Letter & Estimated Timeline**:
   - Freelancer specifies projected turnaround time (e.g., `< 1 month`, `1 to 3 months`).
4. **Zero-Tax Protocol & Net Take-Home Transparency**:
   - System displays the transparent fee breakdown: 0% WorkNest platform fee for freelancers, pass-through Stripe merchant processing (2.9% + $0.30), and exact net deposited to bank.
5. **Interactive Side-by-Side Proposal Comparison Matrix**:
   - Integrated into `/client/jobs/[id]/proposals` via `<ProposalComparisonMatrix />`.
   - Allows hiring managers to select up to 3 candidate bids and benchmark them side-by-side on bid price, delivery days, experience level, and strategy pitch.
   - Highlights best value bid and fastest turnaround milestones with 1-click contract initiation.

---

## End-to-End Use Cases

### Use Case 5.1: Freelancer Submits a Detailed Proposal

- **Actor**: Freelancer
- **Workflow**:
  1. Freelancer navigates to `/jobs/[id]/apply`.
  2. Writes a targeted cover letter outlining past relevant projects.
  3. Proposes total bid amount: `$2,500.00`.
  4. Outlines milestones:
     - Milestone 1: Architecture RFC & Database Schema ($500)
     - Milestone 2: API & Core Logic ($1,200)
     - Milestone 3: Test Suite & Production Rollout ($800)
  5. Reviews net earnings preview (Gross $2,500.00 minus 10% platform fee = $2,250.00).
  6. Clicks **Submit Proposal**.
  7. Client receives an in-app notification of the new bid.

### Use Case 5.2: Client Evaluates Proposals & Awards Contract

- **Actor**: Client
- **Workflow**:
  1. Client navigates to `/client/jobs/[id]/proposals`.
  2. Views all applicant cards sorted by submission date and freelancer rating.
  3. Clicks on the applicant's profile to view portfolio and client feedback ratings.
  4. Clicks **Accept Proposal & Create Contract**.
  5. The server creates a formal `Contract` entity with draft milestones matching the proposal breakdown.
  6. Status of the selected proposal transitions to `ACCEPTED`, while remaining proposals can be respectfully set to `REJECTED`.
