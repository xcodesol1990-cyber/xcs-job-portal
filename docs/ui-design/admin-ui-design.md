# Admin Console UI & UX Design

## Overview

The **Admin Console** (`/admin`) is a specialized enterprise control plane built for platform administrators, risk managers, and legal arbiters. Unlike the consumer client/freelancer views, the admin console uses an isolated **Desktop Sidebar Application Shell** designed for high information density, rapid adjudication, and real-time financial telemetry.

---

## Architectural Shell Layout (`src/app/admin/layout.tsx`)

The Admin console is decoupled from the marketplace navbar and features:

1. **Fixed Left Sidebar (`w-64`)**: High-contrast dark sidebar (`bg-zinc-950 border-r border-zinc-800`).
2. **Sticky Topbar (`h-16`)**: Glassmorphism backdrop-blur header (`bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md`).
3. **Wide Main Canvas (`max-w-[1600px]`)**: Data-dense multi-column layout.

---

## Visual & Component Highlights

### 1. Fixed Dark Sidebar (`AdminSidebar`)

- **Brand & Console Header**: WorkNest shield logo with purple badge `ADMIN` and "Enterprise Console" subtitle.
- **Cluster Telemetry Pill**:
  - Live green ping animation (`animate-ping bg-emerald-400`).
  - Environment label: "Live Production" with regional node `iad1` (US-East).
- **Categorized Navigation**:
  - _ANALYTICS & CORE_: Mission Control.
  - _DIRECTORY & OPERATIONS_: Users & KYC, Marketplace Jobs.
  - _TRUST, SAFETY & LEDGER_: Disputes & Escrow (with live red count badge), Moderation Queue (with amber count badge), Double-Entry Ledger.
  - _SWITCH WORKSPACE_: 1-click external links to Client Workspace and Freelancer Hub.
- **Admin Profile Footer**: Initials avatar badge, administrator name, email, and quick Sign Out button.

### 2. Sticky Glassmorphism Topbar (`AdminTopbar`)

- **Breadcrumb Telemetry**: `Console / Mission Control` (dynamically tracks active subroute).
- **Command Search Input (`⌘K`)**: Quick directory search for users, contract IDs, and ledger hashes.
- **Cluster Health Badge**: Green pulsing dot indicating live PostgreSQL connection status.
- **On-Demand Demo Sync**: `SeedDatabaseButton` triggering instant demo fixture sync with Sonner toast feedback.
- **Mobile Responsive Drawer**: Collapsible sheet providing identical navigation on mobile viewports.

### 3. Tremor-Style KPI Cards with Custom SVG Sparklines

Four primary metric cards line the top of Mission Control:

1. **Active Escrow Locked**:
   - Currency display formatted from integer cents (e.g. `$14,250.00`).
   - Custom SVG area sparkline showing 7-day deposit curve.
   - Security pill: "100% Backed in Double-Entry Trust".
2. **Total Settled GMV**:
   - Cumulative marketplace volume with upward trend delta (+18.4%).
   - Custom SVG trend sparkline.
3. **Open Disputes**:
   - High-contrast alert count badge.
   - Red highlight if claims are pending judicial action.
4. **Flagged Reports**:
   - Moderation queue size with amber highlight.

### 4. Escrow Liquidity Distribution Widget

- **Progress Distribution Bar**:
  - Purple segment: Released to Talent (`%`).
  - Emerald segment: Active Escrow Locked (`%`).
  - Amber segment: Client Refunds (`%`).
- **Audit Verification Stamp**: "Audit Verified" cryptographic badge.
- **Three-Column Summary**: Gross Inflow, Platform Take, and Client Refunds.

### 5. Priority Action Center (Split-Screen Workbench)

- **Column 1: Urgent Disputes**:
  - Displays pending dispute claims with contract title, contested amount, client/freelancer names, and opening reason.
  - Direct CTA button: **Arbitrate** opens the interactive judicial modal.
- **Column 2: Moderation Queue**:
  - Flagged user reports, violation reason, reporter email, and relative time.
  - 1-click action buttons: **Resolve** or **Dismiss** with optimistic Sonner feedback.

### 6. Interactive Judicial Arbitration Modal (`DisputeResolver`)

- **Visual Split Ratio Slider**:
  - Range input from 0% to 100% (5% step).
  - Dynamic live calculations updating as the slider moves:
    - _Freelancer Payout_: Displays gross amount minus 10% platform fee.
    - _Client Refund_: Displays exact dollar refund.
    - _Platform Fee_: Displays retained commission.
- **Arbitration Ruling Notes**: Textarea for legal and policy justification.
- **Confirmation Action**: Executes atomic resolution, updates ledger entries, and notifies parties with toast confirmation.

---

## Responsive & Loading Standards

- **Streaming Skeletons**: Handled via `src/components/ui/skeleton.tsx` with animated shimmering wave effects on initial load.
- **Mobile Compatibility**: Fully functional drawer menu toggled by hamburger button on mobile devices.
