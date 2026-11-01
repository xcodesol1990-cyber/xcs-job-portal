"use server";

import { auth } from "@/server/lib/auth";
import { adminService } from "@/server/services/admin.service";
import { prisma } from "@/server/db/prisma";
import { UserStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateUserStatusAction(
  userId: string,
  newStatus: UserStatus,
  reason?: string,
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.roles?.includes("ADMIN")) {
    return { success: false, error: "Forbidden: Admin access required." };
  }

  try {
    await adminService.updateUserStatus(session.user.id, userId, newStatus, reason);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update user status.",
    };
  }
}

export async function verifyUserKycAction(userId: string, profileType: "client" | "freelancer") {
  const session = await auth();
  if (!session?.user?.id || !session.user.roles?.includes("ADMIN")) {
    return { success: false, error: "Forbidden: Admin access required." };
  }

  try {
    await adminService.verifyKyc(session.user.id, userId, profileType);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to verify KYC.",
    };
  }
}

export async function moderateReportAction(reportId: string, status: "RESOLVED" | "DISMISSED") {
  const session = await auth();
  if (!session?.user?.id || !session.user.roles?.includes("ADMIN")) {
    return { success: false, error: "Forbidden: Admin access required." };
  }

  try {
    await adminService.resolveReport(session.user.id, reportId, status);
    revalidatePath("/admin/reports");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to moderate report.",
    };
  }
}

export async function createReportAction(input: {
  targetType: "JOB" | "USER" | "MESSAGE";
  targetId: string;
  reason: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason.trim(),
        status: "OPEN",
      },
    });

    return { success: true, reportId: report.id };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit report.",
    };
  }
}

export async function updatePlatformSettingAction(key: string, value: Prisma.InputJsonValue) {
  const session = await auth();
  if (!session?.user?.id || !session.user.roles?.includes("ADMIN")) {
    return { success: false, error: "Forbidden: Admin access required." };
  }

  try {
    await adminService.updatePlatformSetting(session.user.id, key, value);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update platform setting.",
    };
  }
}
