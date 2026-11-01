# UI & UX Design Architecture

Welcome to the **WorkNest UI/UX Design System & Workspace Documentation**.

WorkNest delivers a modern, high-trust enterprise experience tailored to three distinct personas:
1. **Enterprise Clients** (Hiring, escrow funding, milestone approvals)
2. **Independent Freelancers** (Opportunity discovery, proposal pitching, deliverable submission, payout tracking)
3. **Platform Administrators** (Financial telemetry, dispute arbitration, community moderation, double-entry audit)

---

## UI Documentation Directory

| Document | Persona / Scope | Focus Areas |
| :--- | :--- | :--- |
| **[Design System & Tokens](./design-system.md)** | Global Design System | Color tokens, typography, shimmer animations, glassmorphism, responsive grid, Sonner toasts. |
| **[Client Workspace UI](./client-ui-design.md)** | Enterprise Clients | Post-job wizard, proposal comparison matrix, contract escrow funding cards, deliverable approval drawer. |
| **[Freelancer Hub UI](./freelancer-ui-design.md)** | Freelancers | Job discovery filters, proposal pitch form with real-time fee preview, deliverable submission locker, payout cards. |
| **[Admin Console UI](./admin-ui-design.md)** | Platform Governance | Fixed dark sidebar shell, sticky topbar, Tremor-style sparklines, Escrow Liquidity distribution, judicial dispute slider modal. |

---

## Design Principles

- **Financial Clarity**: Critical numbers (escrow funds, payouts, platform fees) are highlighted using high-contrast numerals, integer-cent precision, and clear status badges.
- **Optimistic Interactions**: Every state mutation (bidding, approving, resolving) provides instant visual feedback using Sonner toasts and loading indicators.
- **Graceful Degradation**: Next.js streaming loading boundaries (`loading.tsx`) and `@keyframes shimmer` skeleton components prevent jarring layout shifts during data fetching.
- **Adaptive Ergonomics**: Dedicated sidebar shell for power admins vs top-nav marketplace shell for clients and freelancers.
