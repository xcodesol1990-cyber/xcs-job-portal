import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewService } from "@/server/services/review.service";
import { DisputeService } from "@/server/services/dispute.service";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    contract: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    review: {
      findFirst: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    dispute: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    disputeEvidence: {
      create: vi.fn(),
    },
    clientProfile: {
      updateMany: vi.fn(),
    },
    freelancerProfile: {
      updateMany: vi.fn(),
    },
    ledgerEntry: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(prisma)),
  },
}));

vi.mock("@/server/services/notification.service", () => ({
  notificationService: {
    notify: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("ReviewService", () => {
  const reviewService = new ReviewService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid star rating (< 1 or > 5)", async () => {
    await expect(
      reviewService.createReview("user-1", {
        contractId: "contract-1",
        rating: 6,
      }),
    ).rejects.toThrow("Rating must be an integer between 1 and 5");
  });

  it("rejects review if contract is not completed", async () => {
    (
      vi.mocked(prisma.contract.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "contract-1",
      status: "ACTIVE",
      clientId: "client-1",
      freelancerId: "freelancer-1",
      client: { id: "client-1", name: "Client Corp" },
      freelancer: { id: "freelancer-1", name: "Dev Jane" },
    });

    await expect(
      reviewService.createReview("client-1", {
        contractId: "contract-1",
        rating: 5,
      }),
    ).rejects.toThrow("Reviews can only be submitted for completed contracts");
  });

  it("rejects review if reviewer is not a party to the contract", async () => {
    (
      vi.mocked(prisma.contract.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "contract-1",
      status: "COMPLETED",
      clientId: "client-1",
      freelancerId: "freelancer-1",
      client: { id: "client-1", name: "Client Corp" },
      freelancer: { id: "freelancer-1", name: "Dev Jane" },
    });

    await expect(
      reviewService.createReview("intruder-99", {
        contractId: "contract-1",
        rating: 5,
      }),
    ).rejects.toThrow("Only parties to this contract can leave a review");
  });
});

describe("DisputeService", () => {
  const disputeService = new DisputeService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects dispute if reason is too short", async () => {
    await expect(
      disputeService.openDispute("user-1", {
        contractId: "contract-1",
        reason: "bad",
      }),
    ).rejects.toThrow("Please provide a detailed reason");
  });

  it("rejects resolving a dispute that has already been resolved", async () => {
    (vi.mocked(prisma.dispute.findUnique) as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      {
        id: "dispute-1",
        status: "RESOLVED_CLIENT",
        contract: { id: "contract-1", milestones: [] },
      },
    );

    await expect(
      disputeService.resolveDispute("admin-1", "dispute-1", {
        resolution: "RESOLVED_CLIENT",
        resolutionNote: "This dispute was already closed.",
      }),
    ).rejects.toThrow("This dispute has already been resolved");
  });
});
