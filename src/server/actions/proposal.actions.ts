"use server";

import { auth } from "@/server/lib/auth";
import { ProposalService } from "@/server/services/proposal.service";
import { revalidatePath } from "next/cache";

export interface ProposalActionResult {
  success: boolean;
  proposalId?: string;
  error?: string;
}

export async function submitProposalAction(
  prevState: ProposalActionResult | null,
  formData: FormData,
): Promise<ProposalActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to submit a proposal." };
  }

  const jobId = formData.get("jobId")?.toString();
  const coverLetter = formData.get("coverLetter")?.toString();
  const bidDollars = Number(formData.get("bid"));
  const estimatedDays = Number(formData.get("estimatedDays"));

  if (!jobId || !coverLetter || isNaN(bidDollars) || bidDollars <= 0) {
    return { success: false, error: "Please provide a valid bid amount and cover letter." };
  }

  try {
    const proposal = await ProposalService.submitProposal(session.user.id, {
      jobId,
      coverLetter,
      bidCents: Math.round(bidDollars * 100),
      estimatedDays: !isNaN(estimatedDays) && estimatedDays > 0 ? estimatedDays : undefined,
    });

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/freelancer/proposals");

    return { success: true, proposalId: proposal.id };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to submit proposal." };
  }
}

export async function updateProposalStatusAction(
  proposalId: string,
  jobId: string,
  status: "SHORTLISTED" | "REJECTED",
): Promise<ProposalActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await ProposalService.updateStatus(session.user.id, proposalId, status);
    revalidatePath(`/client/jobs/${jobId}/proposals`);
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to update proposal status." };
  }
}

export async function withdrawProposalAction(
  proposalId: string,
  jobId: string,
): Promise<ProposalActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await ProposalService.withdrawProposal(session.user.id, proposalId);
    revalidatePath("/freelancer/proposals");
    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to withdraw proposal." };
  }
}

