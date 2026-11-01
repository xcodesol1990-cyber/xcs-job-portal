import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContractService } from "@/server/services/contract.service";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    contract: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    milestone: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    proposal: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    ledgerEntry: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    freelancerProfile: {
      update: vi.fn(),
    },
    clientProfile: {
      update: vi.fn(),
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(prisma)),
  },
}));

describe("WorkWasl Business Rules - Flat $1 Platform Fee Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("snapshots client and freelancer flat $1 fees and policy version on contract creation", async () => {
    (
      vi.mocked(prisma.proposal.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "proposal-1",
      freelancerId: "freelancer-1",
      job: { id: "job-1", clientId: "client-1", title: "Next.js Architecture" },
    });

    (
      vi.mocked(prisma.contract.create) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "contract-1",
      totalCents: 50000n,
      clientFeeCents: 100n,
      freelancerFeeCents: 100n,
      feePolicyVersion: "v1_flat_1_dollar",
      clientFeeCharged: false,
      freelancerFeeCharged: false,
    });

    await ContractService.createContract("client-1", {
      proposalId: "proposal-1",
      milestones: [{ title: "Milestone 1", amountCents: 50000 }],
    });

    expect(prisma.contract.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clientFeeCents: 100n,
          freelancerFeeCents: 100n,
          feePolicyVersion: "v1_flat_1_dollar",
          clientFeeCharged: false,
          freelancerFeeCharged: false,
          platformFeeBps: 0,
        }),
      }),
    );
  });

  it("charges client flat $1 fee on first milestone funding and prevents duplicate charges on second funding", async () => {
    // 1st milestone funding
    (
      vi.mocked(prisma.contract.findFirst) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "contract-1",
      clientId: "client-1",
      freelancerId: "freelancer-1",
      currency: "USD",
      status: "PENDING_FUNDING",
      clientFeeCents: 100n,
      clientFeeCharged: false, // Not yet charged
      milestones: [{ id: "m-1", title: "M1", amountCents: 25000n, status: "PENDING" }],
    });

    await ContractService.fundMilestone("client-1", "contract-1", "m-1");

    // Expect clientFeeCharged to be set to true
    expect(prisma.contract.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "contract-1" },
        data: expect.objectContaining({ clientFeeCharged: true }),
      }),
    );

    // Expect client platform fee ledger entry with contract-scoped idempotency key
    expect(prisma.ledgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "PLATFORM_FEE",
          amountCents: 100n,
          idempotencyKey: "client_fee_contract-1",
        }),
      }),
    );

    vi.clearAllMocks();

    // 2nd milestone funding on the same contract
    (
      vi.mocked(prisma.contract.findFirst) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "contract-1",
      clientId: "client-1",
      freelancerId: "freelancer-1",
      currency: "USD",
      status: "ACTIVE",
      clientFeeCents: 100n,
      clientFeeCharged: true, // Already charged!
      milestones: [{ id: "m-2", title: "M2", amountCents: 25000n, status: "PENDING" }],
    });

    await ContractService.fundMilestone("client-1", "contract-1", "m-2");

    // Expect NO duplicate PLATFORM_FEE ledger entry created
    expect(prisma.ledgerEntry.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          idempotencyKey: "client_fee_contract-1",
        }),
      }),
    );
  });

  it("charges freelancer flat $1 fee once upon milestone release and pays full 100% on subsequent milestones", async () => {
    // 1st milestone release
    (
      vi.mocked(prisma.contract.findFirst) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "contract-1",
      clientId: "client-1",
      freelancerId: "freelancer-1",
      currency: "USD",
      freelancerFeeCents: 100n,
      freelancerFeeCharged: false, // First release
      milestones: [{ id: "m-1", title: "M1", amountCents: 25000n, status: "SUBMITTED" }],
    });

    await ContractService.approveAndRelease("client-1", "contract-1", "m-1");

    // Payout should be $250.00 - $1.00 = $249.00 (24900 cents)
    expect(prisma.ledgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "ESCROW_RELEASE",
          amountCents: 24900n,
        }),
      }),
    );

    // Platform fee recorded
    expect(prisma.ledgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "PLATFORM_FEE",
          amountCents: 100n,
          idempotencyKey: "freelancer_fee_contract-1",
        }),
      }),
    );

    vi.clearAllMocks();

    // 2nd milestone release on same contract
    (
      vi.mocked(prisma.contract.findFirst) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "contract-1",
      clientId: "client-1",
      freelancerId: "freelancer-1",
      currency: "USD",
      freelancerFeeCents: 100n,
      freelancerFeeCharged: true, // Already charged!
      milestones: [{ id: "m-2", title: "M2", amountCents: 25000n, status: "SUBMITTED" }],
    });

    await ContractService.approveAndRelease("client-1", "contract-1", "m-2");

    // Payout should be 100% full amount ($250.00 / 25000 cents) with zero fee deducted!
    expect(prisma.ledgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "ESCROW_RELEASE",
          amountCents: 25000n,
        }),
      }),
    );

    // No duplicate fee
    expect(prisma.ledgerEntry.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "PLATFORM_FEE",
        }),
      }),
    );
  });
});
