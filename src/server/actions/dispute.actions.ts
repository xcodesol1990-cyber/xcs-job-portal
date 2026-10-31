"use server";

import { auth } from "@/server/lib/auth";
import { disputeService } from "@/server/services/dispute.service";
import { DisputeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function openDisputeAction(input: {
  contractId: string;
  milestoneId?: string;
  reason: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const dispute = await disputeService.openDispute(session.user.id, input);
    revalidatePath(`/contracts/${input.contractId}`);
    return { success: true, disputeId: dispute.id };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to open dispute.",
    };
  }
}

export async function resolveDisputeAction(
  disputeId: string,
  input: {
    resolution: DisputeStatus;
    resolutionNote: string;
    splitFreelancerPercent?: number;
  },
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.roles?.includes("ADMIN")) {
    return { success: false, error: "Forbidden: Admin access required." };
  }

  try {
    await disputeService.resolveDispute(session.user.id, disputeId, input);
    revalidatePath("/admin/disputes");
    revalidatePath(`/admin/disputes/${disputeId}`);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to resolve dispute.",
    };
  }
}

