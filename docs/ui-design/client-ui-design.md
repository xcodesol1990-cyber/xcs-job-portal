# Client Workspace UI & UX Design

## Overview

The **Client Workspace** (`/client`) is designed for enterprise hiring managers, project leads, and startup founders. Its design emphasizes speed of job creation, clarity when comparing candidates, and transparent milestone escrow oversight.

---

## Navigation & Workspace Shell

- **Shell**: Consumer / Marketplace Shell (`src/app/(dashboard)/layout.tsx`)
- **Top Navigation Bar**:
  - Brand Logo + "Client Workspace" badge
  - Main Links: `Dashboard`, `My Jobs`, `Contracts`, `Messages`, `Browse Talent`
  - Right Controls: Workspace Switcher ("Switch to Freelancer"), Unread Notification Bell, Profile Avatar

---

## Key Views & Components

### 1. Client Dashboard (`/client`)

- **Metric Highlights**:
  - _Active Contracts_: Total active projects currently funded.
  - _Total Spent_: Cumulative released funds in USD.
  - _Pending Approvals_: Milestones awaiting review with urgent amber highlight.
- **Quick Action Bar**: Prominent gradient CTA button `+ Post a Job`.
- **Active Contracts Grid**: Card layout displaying contract title, freelancer avatar, current milestone progress bar, and 1-click review action.

### 2. Job Creation Wizard (`/client/jobs/new`)

- **Visual Structure**: Multi-step structured card layout.
- **Form Controls**:
  - Title input with character counter.
  - Category selector dropdown with icon indicators.
  - Dual payment mode toggle:
    - `Fixed Price`: Single budget input formatted in currency.
    - `Hourly`: Min/max hourly rate slider and weekly hours estimate.
  - Experience tier segment button (`Entry`, `Intermediate`, `Expert`).
  - Interactive skill tag pill input with autocompletion.
  - Markdown-supported project description editor.

### 3. Proposal Review Desk (`/client/jobs/[id]/proposals`)

- **Visual Structure**: Dual-pane comparison workspace.
  - _Left Pane_: Applicant list sorted by rating, proposal submission time, and proposed budget.
  - _Right Pane_: Full proposal view containing candidate bio, verified KYC badge, cover letter, and proposed milestone schedule.
- **Action Controls**:
  - `Message Candidate`: Opens embedded chat drawer.
  - `Accept Proposal & Award Contract`: Primary purple gradient button.
  - `Decline Proposal`: Subtle text button with confirmation dialog.

### 4. Contract Command Center (`/contracts/[id]`)

- **Milestone Stepper**: Horizontal or vertical timeline displaying milestones:
  - `Funded`: Green lock icon indicating money is safe in escrow.
  - `Work Submitted`: Pulsing amber indicator with deliverable links (GitHub PR, Figma, Staging URL).
  - `Pending Funding`: Gray outlined card with `Fund Escrow` button.
- **Approval Drawer**:
  - Full deliverable inspection notes.
  - Direct 1-click **Approve & Release Funds** button.
  - Secondary **Request Revisions** or **Open Dispute** button.

---

## Responsive Breakpoints & Mobile UX

- On viewports `< 768px`, the proposal comparison workspace collapses into a full-width drawer where tapping an applicant opens a slide-over sheet.
- Milestone review buttons remain sticky at the bottom of the viewport on mobile devices for easy approval on the go.
