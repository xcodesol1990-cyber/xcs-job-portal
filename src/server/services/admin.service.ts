import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { Prisma, UserRole, UserStatus, DisputeStatus } from "@prisma/client";

export class AdminService {
  async getKpis() {
    const [
      totalUsers,
      usersByStatus,
      totalJobs,
      jobsByStatus,
      totalContracts,
      contractsByStatus,
      openDisputes,
      pendingReports,
      ledgerTotals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.job.count(),
      prisma.job.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.contract.count(),
      prisma.contract.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.dispute.count({
        where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
      }),
      prisma.report.count({
        where: { status: "OPEN" },
      }),
      prisma.ledgerEntry.groupBy({
        by: ["type"],
        _sum: { amountCents: true },
      }),
    ]);

    // Calculate escrow held: ESCROW_FUND - (ESCROW_RELEASE + REFUND)
    let totalEscrowFunded = 0n;
    let totalEscrowReleased = 0n;
    let totalEscrowRefunded = 0n;
    let totalPlatformFees = 0n;

    for (const entry of ledgerTotals) {
      const sum = entry._sum.amountCents ?? 0n;
      if (entry.type === "ESCROW_FUND") totalEscrowFunded += sum;
      else if (entry.type === "ESCROW_RELEASE") totalEscrowReleased += sum;
      else if (entry.type === "REFUND") totalEscrowRefunded += sum;
      else if (entry.type === "PLATFORM_FEE") totalPlatformFees += sum;
    }

    const currentEscrowHeld = totalEscrowFunded - (totalEscrowReleased + totalEscrowRefunded);

    return {
      totalUsers,
      usersByStatus: Object.fromEntries(usersByStatus.map((u) => [u.status, u._count._all])),
      totalJobs,
      jobsByStatus: Object.fromEntries(jobsByStatus.map((j) => [j.status, j._count._all])),
      totalContracts,
      contractsByStatus: Object.fromEntries(
        contractsByStatus.map((c) => [c.status, c._count._all]),
      ),
      openDisputes,
      pendingReports,
      financials: {
        totalEscrowFundedCents: totalEscrowFunded.toString(),
        totalEscrowReleasedCents: totalEscrowReleased.toString(),
        totalEscrowRefundedCents: totalEscrowRefunded.toString(),
        totalPlatformFeesCents: totalPlatformFees.toString(),
        currentEscrowHeldCents: (currentEscrowHeld > 0n ? currentEscrowHeld : 0n).toString(),
      },
    };
  }

  async listUsers(params: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (params.status) where.status = params.status;
    if (params.role) where.roles = { has: params.role };
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          clientProfile: true,
          freelancerProfile: true,
          _count: {
            select: {
              jobs: true,
              clientContracts: true,
              freelancerContracts: true,
              disputesOpened: true,
              reports: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserStatus(adminId: string, userId: string, newStatus: UserStatus, reason?: string) {
    if (adminId === userId) {
      throw new AppError(
        "CANNOT_MODIFY_SELF",
        "Admins cannot modify their own status.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new AppError("USER_NOT_FOUND", "User not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (targetUser.roles.includes("ADMIN")) {
      throw new AppError(
        "CANNOT_SUSPEND_ADMIN",
        "Cannot modify another admin's account.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: { status: newStatus },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "USER_STATUS_UPDATE",
          entityType: "USER",
          entityId: userId,
          metadata: {
            previousStatus: targetUser.status,
            newStatus,
            reason,
          },
        },
      });

      return updated;
    });
  }

  async verifyKyc(adminId: string, userId: string, profileType: "client" | "freelancer") {
    return await prisma.$transaction(async (tx) => {
      if (profileType === "client") {
        await tx.clientProfile.upsert({
          where: { userId },
          create: { userId, paymentVerified: true },
          update: { paymentVerified: true },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "KYC_VERIFIED",
          entityType: "USER",
          entityId: userId,
          metadata: { profileType },
        },
      });
    });
  }

  async listDisputes(params: { page?: number; limit?: number; status?: DisputeStatus }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.DisputeWhereInput = {};
    if (params.status) where.status = params.status;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          contract: {
            include: {
              job: { select: { title: true } },
              client: { select: { id: true, name: true, email: true } },
              freelancer: { select: { id: true, name: true, email: true } },
            },
          },
          milestone: true,
          openedBy: { select: { id: true, name: true, email: true } },
          resolvedBy: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.dispute.count({ where }),
    ]);

    return { disputes, total, page, totalPages: Math.ceil(total / limit) };
  }

  async listReports(params: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};
    if (params.status) where.status = params.status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total, page, totalPages: Math.ceil(total / limit) };
  }

  async resolveReport(adminId: string, reportId: string, status: "RESOLVED" | "DISMISSED") {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new AppError("REPORT_NOT_FOUND", "Report not found.", HTTP_STATUS.NOT_FOUND);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id: reportId },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "REPORT_MODERATED",
          entityType: "REPORT",
          entityId: reportId,
          metadata: { status, targetType: report.targetType, targetId: report.targetId },
        },
      });

      return updated;
    });
  }

  async listLedgerEntries(params: { page?: number; limit?: number; contractId?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.LedgerEntryWhereInput = {};
    if (params.contractId) where.contractId = params.contractId;

    const [entries, total] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          contract: {
            select: {
              id: true,
              job: { select: { title: true } },
            },
          },
          milestone: { select: { id: true, title: true } },
        },
      }),
      prisma.ledgerEntry.count({ where }),
    ]);

    return { entries, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updatePlatformSetting(adminId: string, key: string, value: Prisma.InputJsonValue) {
    return await prisma.$transaction(async (tx) => {
      const setting = await tx.platformSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "PLATFORM_SETTING_UPDATE",
          entityType: "SETTING",
          metadata: { key, value },
        },
      });

      return setting;
    });
  }

  async getPlatformSettings() {
    return prisma.platformSetting.findMany({
      orderBy: { key: "asc" },
    });
  }
}

export const adminService = new AdminService();
