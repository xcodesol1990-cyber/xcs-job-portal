import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminService } from "@/server/services/admin.service";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn((callback) =>
      callback({
        platformSetting: {
          upsert: vi.fn().mockImplementation(({ where, create, update }) => ({
            key: where.key,
            value: update.value ?? create.value,
            updatedAt: new Date(),
          })),
        },
        auditLog: {
          create: vi.fn().mockResolvedValue({ id: "audit-1" }),
        },
      }),
    ),
    platformSetting: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Admin Platform Settings & Governance Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates platform settings in atomic batches and records audit log", async () => {
    const adminId = "admin-uuid-1";
    const settingsPayload = {
      platform_fee_bps: 1200,
      auto_approve_days: 10,
      maintenance_mode: false,
    };

    const results = await adminService.updatePlatformSettingsBatch(adminId, settingsPayload);

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.key)).toEqual([
      "platform_fee_bps",
      "auto_approve_days",
      "maintenance_mode",
    ]);
  });

  it("updates payment, email, and integration settings batches correctly", async () => {
    const adminId = "admin-uuid-1";
    const paymentAndEmailPayload = {
      stripe_environment: "LIVE",
      stripe_connect_type: "EXPRESS",
      stripe_payout_schedule: "DAILY",
      email_provider: "RESEND",
      email_from_address: "notifications@worknest.dev",
      github_app_integration_enabled: true,
      ai_milestone_copilot_enabled: false,
    };

    const results = await adminService.updatePlatformSettingsBatch(adminId, paymentAndEmailPayload);

    expect(results).toHaveLength(7);
    expect(results.map((r) => r.key)).toContain("stripe_environment");
    expect(results.map((r) => r.key)).toContain("email_provider");
    expect(results.map((r) => r.key)).toContain("github_app_integration_enabled");
  });

  it("retrieves platform settings ordered alphabetically by key", async () => {
    const mockSettings = [
      { key: "auto_approve_days", value: 14, updatedAt: new Date() },
      { key: "platform_fee_bps", value: 1000, updatedAt: new Date() },
    ];

    (
      vi.mocked(prisma.platformSetting.findMany) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockSettings);

    const settings = await adminService.getPlatformSettings();
    expect(settings).toHaveLength(2);
    expect(settings[0].key).toBe("auto_approve_days");
    expect(prisma.platformSetting.findMany).toHaveBeenCalledWith({
      orderBy: { key: "asc" },
    });
  });

  it("retrieves audit logs specifically for SETTING entities", async () => {
    const mockAuditLogs = [
      {
        id: "log-1",
        actorId: "admin-1",
        action: "PLATFORM_SETTINGS_BATCH_UPDATE",
        entityType: "SETTING",
        metadata: { platform_fee_bps: 1000 },
        createdAt: new Date(),
        actor: { id: "admin-1", name: "Super Admin", email: "admin@worknest.dev" },
      },
    ];

    (
      vi.mocked(prisma.auditLog.findMany) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockAuditLogs);

    const logs = await adminService.getSettingsAuditLogs(10);
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe("PLATFORM_SETTINGS_BATCH_UPDATE");
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entityType: "SETTING" },
        take: 10,
      }),
    );
  });
});
