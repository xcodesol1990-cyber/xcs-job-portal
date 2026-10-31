"use server";

import { auth } from "@/server/lib/auth";
import { reviewService } from "@/server/services/review.service";
import { revalidatePath } from "next/cache";

export async function submitReviewAction(input: {
  contractId: string;
  rating: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await reviewService.createReview(session.user.id, input);
    revalidatePath(`/contracts/${input.contractId}`);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit review.",
    };
  }
}

