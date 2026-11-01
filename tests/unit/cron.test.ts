import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyCronAuth, withCronAdvisoryLock } from "@/server/lib/cron-guard";
import { cronService } from "@/server/services/cron.service";
import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    contract: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    milestone: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    idempotencyKey: {
      deleteMany: vi.fn(),
    },
    verificationToken: {
      deleteMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb(prisma)),
    $queryRaw: vi.fn().mockResolvedValue([{ locked: true }]),
  },
}));

describe("CronGuard", () => {
  it("rejects requests missing the Authorization header", () => {
    const req = new NextRequest("http://localhost:3000/api/cron/cleanup");
    expect(verifyCronAuth(req)).toBe(false);
  });

  it("rejects requests with an incorrect bearer token", () => {
    const req = new NextRequest("http://localhost:3000/api/cron/cleanup", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    expect(verifyCronAuth(req)).toBe(false);
  });

  it("acquires advisory lock successfully when lock is available", async () => {
    const res = await withCronAdvisoryLock(1234, async () => "task completed");
    expect(res.executed).toBe(true);
    expect(res.result).toBe("task completed");
  });
});

describe("CronService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cleans up expired idempotency keys and tokens", async () => {
    vi.mocked(prisma.idempotencyKey.deleteMany).mockResolvedValue({ count: 5 });
    vi.mocked(prisma.verificationToken.deleteMany).mockResolvedValue({ count: 2 });

    const result = await cronService.cleanupExpiredData();
    expect(result.deletedIdempotencyKeys).toBe(5);
    expect(result.deletedVerificationTokens).toBe(2);
  });

  it("audits ledger reconciliation and returns healthy if no discrepancies exist", async () => {
    (vi.mocked(prisma.contract.findMany) as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "contract-1",
        currency: "USD",
        ledgerEntries: [
          { type: "ESCROW_FUND", amountCents: 10000n },
          { type: "ESCROW_RELEASE", amountCents: 9000n },
          { type: "PLATFORM_FEE", amountCents: 1000n },
        ],
      },
    ]);

    const audit = await cronService.reconcileLedger();
    expect(audit.healthy).toBe(true);
    expect(audit.anomaliesCount).toBe(0);
  });

  it("detects anomalies if released escrow exceeds funded escrow", async () => {
    (vi.mocked(prisma.contract.findMany) as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "contract-bad",
        currency: "USD",
        ledgerEntries: [
          { type: "ESCROW_FUND", amountCents: 5000n },
          { type: "ESCROW_RELEASE", amountCents: 6000n },
          { type: "PLATFORM_FEE", amountCents: 1000n },
        ],
      },
    ]);

    const audit = await cronService.reconcileLedger();
    expect(audit.healthy).toBe(false);
    expect(audit.anomaliesCount).toBe(1);
    expect(audit.anomalies[0].contractId).toBe("contract-bad");
  });
});
