import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrganizationService } from "@/server/services/organization.service";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    contract: {
      findMany: vi.fn(),
    },
  },
}));

describe("OrganizationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves organization details and team seats for valid client", async () => {
    (
      vi.mocked(prisma.user.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "client-1",
      name: "Acme Boss",
      email: "boss@acme.corp",
      createdAt: new Date(),
      clientProfile: {
        companyName: "Acme Enterprises Inc.",
      },
    });

    const org = await OrganizationService.getOrganization("client-1");
    expect(org.organizationName).toBe("Acme Enterprises Inc.");
    expect(org.seatsLimit).toBe(10);
    expect(org.members.length).toBeGreaterThanOrEqual(1);
    expect(org.members[0].role).toBe("OWNER");
  });

  it("invites new member with valid role", async () => {
    (
      vi.mocked(prisma.user.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "client-1",
      name: "Acme Boss",
      email: "boss@acme.corp",
      createdAt: new Date(),
      clientProfile: { companyName: "Acme Corp" },
    });

    const invite = await OrganizationService.inviteMember(
      "client-1",
      "auditor.dan@acme.corp",
      "AUDITOR",
    );

    expect(invite.success).toBe(true);
    expect(invite.invitedEmail).toBe("auditor.dan@acme.corp");
    expect(invite.role).toBe("AUDITOR");
  });

  it("generates consolidated corporate invoice report with line items", async () => {
    (
      vi.mocked(prisma.contract.findMany) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce([
      {
        id: "contract-1",
        title: "Mobile App MVP",
        currency: "USD",
        freelancer: { id: "dev-1", name: "Alex Rivera", email: "alex@dev.io" },
        job: { id: "job-1", title: "Mobile App" },
        milestones: [{ id: "m-1", title: "Sprint 1 Deliverables" }],
        ledgerEntries: [
          {
            id: "entry-1",
            type: "ESCROW_RELEASE",
            amountCents: 150000n, // $1,500.00
            currency: "USD",
            createdAt: new Date(),
            idempotencyKey: "rel_123",
            milestoneId: "m-1",
          },
        ],
      },
    ]);

    const report = await OrganizationService.getConsolidatedLedgerReport("client-1");
    expect(report.totalGrossDollars).toBe(1500);
    expect(report.totalTransactions).toBe(1);
    expect(report.items[0].freelancerName).toBe("Alex Rivera");
  });
});
