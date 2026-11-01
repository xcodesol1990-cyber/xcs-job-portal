import { prisma } from "@/server/db/prisma";
import { PaymentStatus } from "@prisma/client";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { paymentProvider } from "@/server/lib/stripe";
import { ContractService } from "@/server/services/contract.service";

export class PaymentService {
  /**
   * Generates a Stripe Connect Express onboarding URL for a freelancer.
   */
  static async startFreelancerOnboarding(
    freelancerId: string,
    returnUrl: string,
    refreshUrl: string,
  ): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: freelancerId },
      select: { id: true, email: true, stripeConnectAccountId: true },
    });

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found.", HTTP_STATUS.NOT_FOUND);
    }

    let accountId = user.stripeConnectAccountId;

    if (!accountId) {
      accountId = await paymentProvider.createConnectAccount(user.id, user.email);
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    return paymentProvider.createAccountLink(accountId, returnUrl, refreshUrl);
  }

  /**
   * Prepares escrow payment intent for a milestone.
   */
  static async createMilestonePaymentIntent(clientId: string, milestoneId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          select: { id: true, clientId: true, currency: true },
        },
      },
    });

    if (!milestone || milestone.contract.clientId !== clientId) {
      throw new AppError(
        "UNAUTHORIZED",
        "Milestone not found or unauthorized.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    });

    let customerId = user?.stripeCustomerId;
    if (!customerId && user) {
      customerId = await paymentProvider.createCustomer(user.id, user.email, user.name);
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const { clientSecret, paymentIntentId } = await paymentProvider.createEscrowIntent({
      amountCents: Number(milestone.amountCents),
      currency: milestone.contract.currency,
      customerId: customerId ?? undefined,
      metadata: {
        contractId: milestone.contract.id,
        milestoneId: milestone.id,
        clientId,
      },
    });

    // Save or update pending payment record
    await prisma.payment.upsert({
      where: { providerPaymentId: paymentIntentId },
      update: {
        status: PaymentStatus.PROCESSING,
      },
      create: {
        milestoneId: milestone.id,
        payerId: clientId,
        amountCents: milestone.amountCents,
        currency: milestone.contract.currency,
        provider: "stripe",
        providerPaymentId: paymentIntentId,
        status: PaymentStatus.PROCESSING,
      },
    });

    return { clientSecret, paymentIntentId };
  }

  /**
   * Processes a successful payment intent confirmation (from webhook or client confirmation).
   */
  static async handlePaymentSucceeded(paymentIntentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { providerPaymentId: paymentIntentId },
      include: { milestone: { select: { contractId: true, id: true, status: true } } },
    });

    if (!payment) return;

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCEEDED },
      });

      if (payment.milestone.status === "PENDING") {
        await ContractService.fundMilestone(
          payment.payerId,
          payment.milestone.contractId,
          payment.milestone.id,
        );
      }
    }
  }

  /**
   * Updates connected account status when Stripe webhook notifies account completion.
   */
  static async handleAccountUpdated(accountId: string, payoutsEnabled: boolean) {
    await prisma.user.updateMany({
      where: { stripeConnectAccountId: accountId },
      data: { stripePayoutsEnabled: payoutsEnabled },
    });
  }

  /**
   * Handles payment failure webhook events.
   */
  static async handlePaymentFailed(paymentIntentId: string) {
    await prisma.payment.updateMany({
      where: { providerPaymentId: paymentIntentId },
      data: { status: PaymentStatus.FAILED },
    });
  }

  /**
   * Handles charge refunded webhook events.
   */
  static async handleChargeRefunded(paymentIntentId: string) {
    await prisma.payment.updateMany({
      where: { providerPaymentId: paymentIntentId },
      data: { status: PaymentStatus.REFUNDED },
    });
  }
}
