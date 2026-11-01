"use server";

import { auth } from "@/server/lib/auth";
import { ContractService, CreateMilestoneInput } from "@/server/services/contract.service";
import { revalidatePath } from "next/cache";

export interface ContractActionResult {
  success: boolean;
  contractId?: string;
  error?: string;
}

export async function createContractAction(
  proposalId: string,
  milestones: CreateMilestoneInput[],
): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const contract = await ContractService.createContract(session.user.id, {
      proposalId,
      milestones,
    });

    revalidatePath("/client/contracts");
    revalidatePath(`/contracts/${contract.id}`);

    return { success: true, contractId: contract.id };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to create contract offer." };
  }
}

export async function fundMilestoneAction(
  contractId: string,
  milestoneId: string,
): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await ContractService.fundMilestone(session.user.id, contractId, milestoneId);
    revalidatePath(`/contracts/${contractId}`);
    return { success: true, contractId };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to fund milestone." };
  }
}

export async function submitDeliverableAction(
  contractId: string,
  milestoneId: string,
  notes?: string,
): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await ContractService.submitDeliverable(session.user.id, contractId, milestoneId, notes);
    revalidatePath(`/contracts/${contractId}`);
    return { success: true, contractId };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to submit deliverable." };
  }
}

export async function requestRevisionAction(
  contractId: string,
  milestoneId: string,
  reason: string,
): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await ContractService.requestRevision(session.user.id, contractId, milestoneId, reason);
    revalidatePath(`/contracts/${contractId}`);
    return { success: true, contractId };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to request revision." };
  }
}

export async function approveAndReleaseAction(
  contractId: string,
  milestoneId: string,
): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await ContractService.approveAndRelease(session.user.id, contractId, milestoneId);
    revalidatePath(`/contracts/${contractId}`);
    return { success: true, contractId };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to release payment." };
  }
}
