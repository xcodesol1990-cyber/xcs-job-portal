"use server";

import { auth } from "@/server/lib/auth";
import { adminService } from "@/server/services/admin.service";
import { ProfileService } from "@/server/services/profile.service";
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

export async function createCategoryAction(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.roles?.includes("ADMIN")) {
    return { success: false, error: "Forbidden: Admin access required." };
  }

  const name = formData.get("name")?.toString();
  const slug = formData.get("slug")?.toString();
  const parentIdRaw = formData.get("parentId")?.toString();
  const parentId =
    parentIdRaw && !isNaN(Number(parentIdRaw)) && Number(parentIdRaw) > 0
      ? Number(parentIdRaw)
      : null;

  if (!name || name.trim().length < 2) {
    return { success: false, error: "Category name must be at least 2 characters." };
  }

  try {
    await ProfileService.createCategory(name, slug, parentId);
    revalidatePath("/admin/categories");
    revalidatePath("/jobs");
    revalidatePath("/client/jobs/new");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create category.",
    };
  }
}

export async function deleteCategoryAction(categoryId: number) {
  const session = await auth();
  if (!session?.user?.id || !session.user.roles?.includes("ADMIN")) {
    return { success: false, error: "Forbidden: Admin access required." };
  }

  try {
    await ProfileService.deleteCategory(categoryId);
    revalidatePath("/admin/categories");
    revalidatePath("/jobs");
    revalidatePath("/client/jobs/new");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete category.",
    };
  }
}

export async function createSkillAction(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.roles?.includes("ADMIN")) {
    return { success: false, error: "Forbidden: Admin access required." };
  }

  const name = formData.get("name")?.toString();
  const slug = formData.get("slug")?.toString();

  if (!name || name.trim().length < 2) {
    return { success: false, error: "Skill name must be at least 2 characters." };
  }

  try {
    await ProfileService.createSkill(name, slug);
    revalidatePath("/admin/categories");
    revalidatePath("/jobs");
    revalidatePath("/client/jobs/new");
    revalidatePath("/freelancer/profile");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create skill.",
    };
  }
}

export async function deleteSkillAction(skillId: number) {
  const session = await auth();
  if (!session?.user?.id || !session.user.roles?.includes("ADMIN")) {
    return { success: false, error: "Forbidden: Admin access required." };
  }

  try {
    await ProfileService.deleteSkill(skillId);
    revalidatePath("/admin/categories");
    revalidatePath("/jobs");
    revalidatePath("/client/jobs/new");
    revalidatePath("/freelancer/profile");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete skill.",
    };
  }
}
