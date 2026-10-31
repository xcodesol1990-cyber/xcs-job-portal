"use server";

import { auth } from "@/server/lib/auth";
import { PaymentService } from "@/server/services/payment.service";

export interface PaymentActionResult {
  success: boolean;
  url?: string;
  clientSecret?: string;
  error?: string;
}

export async function startStripeOnboardingAction(): Promise<PaymentActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const returnUrl = `${appUrl}/freelancer/payouts?onboarding=complete`;
  const refreshUrl = `${appUrl}/freelancer/payouts?onboarding=refresh`;

  try {
    const onboardingUrl = await PaymentService.startFreelancerOnboarding(
      session.user.id,
      returnUrl,
      refreshUrl,
    );

    return { success: true, url: onboardingUrl };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to initiate Stripe onboarding." };
  }
}

export async function createMilestonePaymentAction(milestoneId: string): Promise<PaymentActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const { clientSecret } = await PaymentService.createMilestonePaymentIntent(
      session.user.id,
      milestoneId,
    );

    return { success: true, clientSecret };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to create payment intent." };
  }
}

