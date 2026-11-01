# WorkNest Platform Documentation

Welcome to the technical and operational documentation for the **WorkNest Enterprise Freelance & Job Marketplace Platform**.

This documentation is split into dedicated modular guides detailing each architectural subsystem, what has been implemented so far, key codebase references, and detailed real-world use cases.

---

## Documentation Index

| Module Document | Focus Area | Key Features Covered |
| :--- | :--- | :--- |
| [01. Architecture Overview](./01-architecture-overview.md) | Platform Architecture & Tech Stack | Next.js 15 App Router, Server Actions, Prisma ORM, Neon PostgreSQL, Tailwind v4, Stripe Escrow, Double-Entry Accounting. |
| [02. Authentication & Multi-Role RBAC](./02-auth-and-rbac.md) | Identity & Access Control | NextAuth v5, Argon2id, Role-based routing (`CLIENT`, `FREELANCER`, `ADMIN`), Auto-healing Database Seeding, Session Callbacks. |
| [03. User Profiles & KYC Verification](./03-user-profiles-and-kyc.md) | Identity & Reputation | Client Profiles, Freelancer Portfolios, Skill Tagging, KYC Verification Tiers (`PENDING`, `APPROVED`, `REJECTED`). |
| [04. Job Marketplace & Search](./04-job-marketplace.md) | Opportunity Sourcing | Fixed-price vs Hourly jobs, Multi-parameter faceted filtering, Category taxonomy, Lifecycle state machines. |
| [05. Proposals & Bidding System](./05-proposals-and-bidding.md) | Talent Sourcing & Pitching | Proposal submissions, Milestones breakdown, Cover letters, Client Review Desk, 1-Click Acceptance/Rejection. |
| [06. Contracts & Milestone Escrow](./06-contracts-and-milestone-escrow.md) | Commercial Agreements & Payments | Contract generation, Stripe Checkout Escrow funding, Work submission, Milestone approval, Integer cents currency math. |
| [07. Double-Entry Financial Ledger](./07-double-entry-ledger.md) | Financial Telemetry & Integrity | Cryptographic ledger entries, Escrow holding, Talent payable, Platform fee retention, Zero-drift balance verification. |
| [08. Disputes & Platform Moderation](./08-disputes-and-moderation.md) | Trust, Safety & Arbitration | Formal dispute filing, Evidence lockers, Admin Arbitration Desk with custom split sliders, Community moderation queues. |
| [09. Real-Time Messaging & Notifications](./09-realtime-messaging-and-notifications.md) | Communication Layer | Contract chat channels, Server-Sent Events (SSE) streaming, Unread counters, In-app system alerts. |
| [10. Admin Console & Platform Governance](./10-admin-console-and-governance.md) | Mission Control & Operations | Modern sidebar application shell, Tremor/Stripe-style metric sparklines, Priority Action Desk, Sonner toast feedback. |
| [11. Background Automation & Daily Cron](./11-cron-and-background-automation.md) | Scheduled System Jobs | Vercel Hobby-compliant single daily cron (`0 0 * * *`), Auto-release of inactive milestone reviews, Ledger reconciliation. |
| [12. Database Schema & Data Seeding](./12-database-schema-and-seeding.md) | Persistence & Demo Data | Complete Prisma schema models, Enums, Foreign key constraints, Idempotent database seeder with cross-role test accounts. |
| [UI & UX Design Architecture](./ui-design/README.md) | Frontend Design & Workspaces | Dedicated UI design guides for Client Workspace, Freelancer Hub, Admin Console, and global Design System tokens. |

---

## System Personas & Seed Credentials

For end-to-end testing across all documented use cases, the platform includes pre-configured personas:

- **Super Administrator**: `admin@worknest.dev` / `Admin@123456`
- **Enterprise Client**: `client@worknest.dev` / `Client@123456`
- **Senior Freelancer**: `freelancer@worknest.dev` / `Freelancer@123456`

