import Stripe from "stripe";
import { env } from "@/server/lib/env";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";

export interface PaymentProvider {
  createCustomer(userId: string, email: string, name: string): Promise<string>;
  createConnectAccount(userId: string, email: string): Promise<string>;
  createAccountLink(accountId: string, returnUrl: string, refreshUrl: string): Promise<string>;
  createEscrowIntent(params: {
    amountCents: number;
    currency: string;
    customerId?: string;
    metadata: Record<string, string>;
  }): Promise<{ clientSecret: string; paymentIntentId: string }>;
  transferToConnectedAccount(params: {
    destinationAccountId: string;
    amountCents: number;
    currency: string;
    transferGroup: string;
  }): Promise<{ transferId: string }>;
  refund(paymentIntentId: string, amountCents?: number): Promise<{ refundId: string }>;
}

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = env().STRIPE_SECRET_KEY || "sk_test_placeholder_key_for_build";
    stripeInstance = new Stripe(key, {
      apiVersion: "2026-03-31.acacia" as unknown as Stripe.LatestApiVersion,
    });
  }
  return stripeInstance;
}

export class StripePaymentProvider implements PaymentProvider {
  async createCustomer(userId: string, email: string, name: string): Promise<string> {
    if (!env().STRIPE_SECRET_KEY) {
      return `cus_mock_${userId.slice(0, 8)}`;
    }

    const stripe = getStripe();
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });
    return customer.id;
  }

  async createConnectAccount(userId: string, email: string): Promise<string> {
    if (!env().STRIPE_SECRET_KEY) {
      return `acct_mock_${userId.slice(0, 8)}`;
    }

    const stripe = getStripe();
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        transfers: { requested: true },
      },
      metadata: { userId },
    });
    return account.id;
  }

  async createAccountLink(accountId: string, returnUrl: string, refreshUrl: string): Promise<string> {
    if (!env().STRIPE_SECRET_KEY) {
      return returnUrl;
    }

    const stripe = getStripe();
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });
    return link.url;
  }

  async createEscrowIntent(params: {
    amountCents: number;
    currency: string;
    customerId?: string;
    metadata: Record<string, string>;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    if (!env().STRIPE_SECRET_KEY) {
      return {
        clientSecret: "mock_secret",
        paymentIntentId: `pi_mock_${Date.now()}`,
      };
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: params.currency.toLowerCase(),
      customer: params.customerId,
      metadata: params.metadata,
      capture_method: "automatic",
    });

    if (!paymentIntent.client_secret) {
      throw new AppError("PAYMENT_INTENT_ERROR", "Could not generate client secret.", HTTP_STATUS.INTERNAL);
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async transferToConnectedAccount(params: {
    destinationAccountId: string;
    amountCents: number;
    currency: string;
    transferGroup: string;
  }): Promise<{ transferId: string }> {
    if (!env().STRIPE_SECRET_KEY) {
      return { transferId: `tr_mock_${Date.now()}` };
    }

    const stripe = getStripe();
    const transfer = await stripe.transfers.create({
      amount: params.amountCents,
      currency: params.currency.toLowerCase(),
      destination: params.destinationAccountId,
      transfer_group: params.transferGroup,
    });

    return { transferId: transfer.id };
  }

  async refund(paymentIntentId: string, amountCents?: number): Promise<{ refundId: string }> {
    if (!env().STRIPE_SECRET_KEY) {
      return { refundId: `re_mock_${Date.now()}` };
    }

    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents,
    });

    return { refundId: refund.id };
  }
}

export const paymentProvider: PaymentProvider = new StripePaymentProvider();

