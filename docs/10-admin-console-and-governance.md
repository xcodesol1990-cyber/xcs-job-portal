# 10. Admin Console & Platform Governance

## Overview
The Admin Console (`/admin`) serves as the operational headquarters for platform executives, legal arbiters, and trust/safety teams. It is architected as an isolated, modern **Sidebar Application Shell** (inspired by Tailwind UI Catalyst, Tremor, and Stripe) completely separate from the consumer marketplace navigation.

---

## Key Files & Modules
- `src/app/admin/layout.tsx`: Dedicated admin application layout enforcing `ADMIN` role, fetching live dispute/report counters, and rendering the fixed sidebar + topbar shell.
- `src/components/admin/admin-sidebar.tsx`: Fixed dark sidebar (`w-64`) with categorized navigation, cluster environment indicator (`US-East iad1`), dynamic badge counters, and workspace quick switches.
- `src/components/admin/admin-topbar.tsx`: Sticky blurred topbar with breadcrumb telemetry (`Console / Mission Control`), global search input (`⌘K`), PostgreSQL live indicator, and mobile navigation drawer.
- `src/app/admin/page.tsx`: Mission Control dashboard with Tremor-style sparkline KPI cards, escrow liquidity breakdown bar, priority action desk, and real-time ledger stream.
- `src/components/ui/skeleton.tsx`: Custom shimmering skeleton library (`@keyframes shimmer`) powering streaming `loading.tsx` states across all admin subroutes.
- `src/components/admin/seed-database-button.tsx`: 1-click database sync button for test and staging environments.

---

## Console UI Layout Architecture

```
┌─────────────────┬─────────────────────────────────────────────────────────────┐
│ WORKNEST ADMIN  │ Topbar: Breadcrumbs  |  Search ⌘K  |  Health  |  Sync Seed   │
│ Live: US-East   ├─────────────────────────────────────────────────────────────┤
├─────────────────┤ Tremor Metric Cards with Custom SVG Sparklines:             │
│ Mission Control │ [Active Escrow]    [Settled GMV]   [Disputes]   [Reports]   │
│ Users & KYC     ├──────────────────────────────────┬──────────────────────────┤
│ Disputes (2)    │ Escrow Liquidity Breakdown:      │ Recent Double-Entry      │
│ Moderation (1)  │ [Released % | Held % | Refund %] │ Ledger Activity Stream   │
│ Ledger Audit    ├──────────────────────────────────┴──────────────────────────┤
├─────────────────┤ Priority Action Center:                                     │
│ Switch: Client  │ [Open Disputes Queue]         |  [Flagged Content Reports]  │
│ Switch: Talent  │  - 1-Click Judicial Modal     |   - 1-Click Resolve/Dismiss │
│ Profile & Logout│                               |                             │
└─────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## Key Administrative Views

### 1. Mission Control (`/admin`)
- **Metric Sparklines**:
  - *Active Escrow Locked*: Total cents held in escrow trust with green security badge.
  - *Total Settled GMV*: Cumulative marketplace payouts.
  - *Open Disputes*: Active disputes needing judicial intervention.
  - *Flagged Reports*: Community moderation tickets.
- **Escrow Liquidity Bar**: Visual distribution of all gross inflows categorized by Released to Talent, Active Locked, and Client Refunds.
- **Priority Action Center**: Split-screen workbench featuring urgent disputes and moderation tickets with direct modal actions.

### 2. Users & KYC Directory (`/admin/users`)
- Comprehensive table of all registered accounts.
- Filter by role (`CLIENT`, `FREELANCER`, `ADMIN`) or KYC state.
- Interactive status controls: Suspend/Activate account, Verify/Reject KYC credentials with Sonner toast feedback.

### 3. Disputes & Arbitration (`/admin/disputes`)
- Active and historical dispute records.
- Detailed deliverable and claim view.
- Arbitration resolver modal with interactive split slider.

### 4. Moderation Queue (`/admin/reports`)
- User-submitted flags for suspicious jobs or abuse.
- Direct review and dismiss/resolve controls.

### 5. Double-Entry Ledger Audit (`/admin/ledger`)
- Cryptographic log of all credits and debits across `ESCROW_HOLDING`, `CLIENT_WALLET`, `FREELANCER_PAYABLE`, and `PLATFORM_REVENUE`.

---

## End-to-End Use Cases

### Use Case 10.1: Daily Platform Oversight & Health Check
- **Actor**: Super Admin
- **Workflow**:
  1. Admin signs into `/login` with `admin@worknest.dev`.
  2. Routed immediately to `/admin`.
  3. Inspects the topbar PostgreSQL health status badge and cluster telemetry.
  4. Reviews 24-hour GMV sparkline card to monitor payment trends.
  5. Inspects Escrow Liquidity bar to verify that active locked escrow matches live contracts.

### Use Case 10.2: Fast Action from Priority Action Desk
- **Actor**: Super Admin
- **Workflow**:
  1. From the Mission Control overview, admin notices an urgent dispute card in the Priority Action Center.
  2. Clicks **Arbitrate** directly from the card.
  3. Modal opens with pre-populated figures; admin adjusts the split to 80/20 and submits resolution.
  4. Sonner fires confirmation toast; the card disappears from the urgent queue; metric counters recalculate instantly.
