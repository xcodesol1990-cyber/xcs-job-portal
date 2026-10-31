import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyCronAuth } from "@/server/lib/cron-guard";
import { CronService } from "@/server/services/cron.service";
import { prisma } from "@/server/db/prisma";
import { NextRequest } from "next/server";

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
    $transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => cb(prisma)),
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

  it("accepts requests matching CRON_SECRET", () => {
    const req = new NextRequest("http://localhost:3000/api/cron/cleanup", {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });
    expect(verifyCronAuth(req)).toBe(true);
  });
});

describe("CronService", () => {
  const cronService = new CronService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cleans up expired idempotency keys and tokens", async () => {
    (prisma.idempotencyKey.deleteMany as any).mockResolvedValue({ count: 5 });
    (prisma.verificationToken.deleteMany as any).mockResolvedValue({ count: 2 });

    const result = await cronService.cleanupExpiredData();
    expect(result.deletedIdempotencyKeys).toBe(5);
    expect(result.deletedVerificationTokens).toBe(2);
  });

  it("audits ledger reconciliation and returns healthy if no discrepancies exist", async () => {
    (prisma.contract.findMany as any).mockResolvedValue([
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
    (prisma.contract.findMany as any).mockResolvedValue([
      {
        id: "contract-bad",
        currency: "USD",
        ledgerEntries: [
          { type: "ESCROW_FUND", amountCents: 5000n },
          { type: "ESCROW_RELEASE", amountCents: 8000n },
        ],
      },
    ]);

    const audit = await cronService.reconcileLedger();
    expect(audit.healthy).toBe(false);
    expect(audit.anomaliesCount).toBe(1);
    expect(audit.anomalies[0].contractId).toBe("contract-bad");
  });
});
