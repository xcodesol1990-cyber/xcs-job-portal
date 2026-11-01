# 03. Actionable Feature Enhancement Blueprints

This document details five prioritized, high-leverage product feature blueprints for future WorkNest milestones, complete with schema extensions, system flows, and expected ROI.

---

## 🚀 Feature 1: AI Scope Decomposer & Milestone Estimator

### Problem It Solves

Clients often write vague, one-sentence job descriptions (e.g. _"Build an Uber for dog walkers"_), leading to mismatched expectations, scope creep, and bitter milestone disputes.

### Product Blueprint

When a client begins typing a job description in `/client/jobs/new`, an embedded **AI Architect Co-Pilot** (powered by Gemini Flash) automatically analyzes the prompt and suggests:

1. **Decomposed Milestone Plan:** Breaks the project into 3–5 logical deliverable phases (e.g. Phase 1: Database & Auth, Phase 2: Booking Core, Phase 3: Stripe Integration).
2. **Fair-Market Budget Range:** Suggests realistic min/max budgets based on industry benchmarks.
3. **Acceptance Criteria Checklist:** Generates bulleted, verifiable criteria for each milestone.

### Technical Architecture

- **Endpoint:** `/api/ai/decompose-scope`
- **Model:** `gemini-1.5-flash` with structured JSON schema output.
- **Client Component:** `ScopeBuilderAssistant.tsx` integrated into `create-job-form.tsx`.

---

## 🔗 Feature 2: Native GitHub & GitLab Deliverable Verification

### Problem It Solves

Clients non-technical or busy founders must manually download zip archives and verify whether the code works before approving escrow.

### Product Blueprint

- Freelancers link their GitHub repository or Pull Request to a milestone.
- WorkNest queries the GitHub REST & GraphQL APIs to display a **Deliverable Inspection Card** inside the Contract Room:
  - CI Status: `✅ 42/42 tests passing on GitHub Actions`
  - Diff Summary: `+1,420 lines / -340 lines across 18 files`
  - Merge State: `Ready to merge into main`
- When the client clicks "Approve Milestone", WorkNest can optionally trigger the GitHub API to automatically merge the Pull Request and release escrow simultaneously.

### Schema Extension

```prisma
model Milestone {
  // Existing fields...
  githubRepoUrl      String?   @map("github_repo_url")
  githubPrNumber     Int?      @map("github_pr_number")
  githubCommitHash   String?   @map("github_commit_hash")
  ciStatus           String?   @map("ci_status") // PENDING, PASSED, FAILED
}
```

---

## 💳 Feature 3: Micro-Escrow Streaming & Partial Release Sliders

### Problem It Solves

In fixed-price contracts, milestones are traditionally binary: either 100% approved or 0%. When a freelancer completes 85% of a milestone but hits a roadblock, both parties get trapped in deadlocks.

### Product Blueprint

- Inside `/contracts/[id]`, clients have a **"Partial Release"** slider.
- If a deliverable is 80% acceptable with minor non-blocking items, the client can release \$800 of a \$1,000 milestone with one click, carrying the remaining \$200 over to the next milestone.
- The double-entry ledger instantly writes an `ESCROW_PARTIAL_RELEASE` entry and creates a rollover balance.

### Ledger Mathematical Model

```typescript
// Double-entry record for partial milestone release
await tx.ledgerEntry.createMany({
  data: [
    {
      contractId,
      type: "ESCROW_RELEASE",
      amountCents: partialAmountCents,
      idempotencyKey: `release_${milestoneId}_${timestamp}`,
    },
    {
      contractId,
      type: "PLATFORM_FEE",
      amountCents: calculatePlatformFee(partialAmountCents),
      idempotencyKey: `fee_${milestoneId}_${timestamp}`,
    },
  ],
});
```

---

## 🏢 Feature 4: Enterprise Multi-Seat Workspaces & Automated 1099/W-8BEN Compliance

### Problem It Solves

Enterprise clients cannot adopt freelance platforms if every hiring manager has to use personal credit cards or if the legal department lacks automated contractor tax reporting.

### Product Blueprint

1. **Team Workspaces:** Add `Organization` and `OrganizationMember` models allowing companies to invite Engineering Managers, Product Leads, and Finance Admins with custom permissions:
   - `OWNER`: Full billing & contract authority.
   - `MANAGER`: Can post jobs, hire talent, and approve milestones up to \$5,000.
   - `AUDITOR`: Read-only access to ledger invoices and contract histories.
2. **Automated Tax Generation:**
   - Integration with Stripe Tax / Form W-9 / W-8BEN collection on freelancer onboarding.
   - 1-click download of end-of-year IRS Form 1099-NEC summaries.

---

## 📹 Feature 5: Real-Time Contract Workrooms with In-App WebRTC Huddles

### Problem It Solves

Clients and freelancers constantly take communication off-platform to Zoom or Slack, violating non-circumvention rules and losing audit trails for dispute protection.

### Product Blueprint

- Embedded 1-click audio/video calls directly inside `/contracts/[id]`.
- Built with standard WebRTC / LiveKit.
- Includes **AI Huddle Summaries**: Transcribes the meeting and automatically generates agreed action items that append directly to the milestone deliverable notes.
- Eliminates any excuse for parties to leave the safety of WorkNest escrow.

---

## 📊 Summary of Implementation Priorities

| Feature                        | Complexity |            Strategic Impact             | Target Release |
| :----------------------------- | :--------: | :-------------------------------------: | :------------: |
| **1. AI Scope Decomposer**     |    Low     |     High (Reduces disputes by 40%)      |  Next Sprint   |
| **2. GitHub PR Verification**  |   Medium   |       Extreme (Developer lock-in)       |  Next Sprint   |
| **3. Partial Escrow Sliders**  |    Low     |   High (Improves client satisfaction)   |  Next Sprint   |
| **4. Multi-Seat Workspaces**   |   Medium   | Extreme (Unlocks \$50k+ Enterprise ARR) |       Q2       |
| **5. WebRTC Workroom Huddles** |    High    |    High (Prevents off-platform leak)    |       Q3       |
