import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContractService } from "@/server/services/contract.service";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    contract: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    milestone: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    ledgerEntry: {
      create: vi.fn(),
    },
    freelancerProfile: {
      update: vi.fn(),
    },
    clientProfile: {
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(prisma)),
  },
}));

describe("ContractService - Partial Escrow Release", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects partial release with zero or negative amount", async () => {
    await expect(
      ContractService.partialRelease("client-1", "contract-1", "milestone-1", 0),
    ).rejects.toThrow("Partial release amount must be greater than zero.");
  });

  it("rejects release amount exceeding milestone funded escrow", async () => {
    (
      vi.mocked(prisma.contract.findFirst) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "contract-1",
      clientId: "client-1",
      freelancerId: "dev-1",
      currency: "USD",
      platformFeeBps: 1000,
      milestones: [
        {
          id: "milestone-1",
          status: "SUBMITTED",
          amountCents: 50000n, // $500.00
          title: "Frontend Components",
        },
      ],
    });

    await expect(
      ContractService.partialRelease("client-1", "contract-1", "milestone-1", 60000), // $600.00
    ).rejects.toThrow("exceeds available milestone escrow");
  });

  it("successfully performs partial escrow release and decrements milestone balance", async () => {
    (
      vi.mocked(prisma.contract.findFirst) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "contract-1",
      clientId: "client-1",
      freelancerId: "dev-1",
      currency: "USD",
      platformFeeBps: 1000, // 10%
      milestones: [
        {
          id: "milestone-1",
          status: "SUBMITTED",
          amountCents: 100000n, // $1,000.00
          title: "Frontend Components",
        },
      ],
    });

    (
      vi.mocked(prisma.milestone.update) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "milestone-1",
      amountCents: 30000n, // remaining $300.00
    });

    const result = await ContractService.partialRelease(
      "client-1",
      "contract-1",
      "milestone-1",
      70000, // release $700.00
      "Partial payout for approved components",
    );

    expect(result.isFullRelease).toBe(false);
    expect(result.feeCents).toBe(7000n); // 10% of 70000
    expect(result.releasedNetPayoutCents).toBe(63000n); // 90% of 70000

    expect(prisma.ledgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "ESCROW_RELEASE",
          amountCents: 63000n,
        }),
      }),
    );
  });
});
