import { describe, expect, it } from "vitest";
import { StripePaymentProvider } from "@/server/lib/stripe";

describe("payment provider (stripe connect)", () => {
  const provider = new StripePaymentProvider();

  it("creates mock customer ID when secret key is unset or in test", async () => {
    const customerId = await provider.createCustomer(
      "123e4567-e89b-12d3-a456-426614174000",
      "test@example.com",
      "Test User",
    );
    expect(customerId).toContain("cus_mock_");
  });

  it("creates mock connect account for freelancer", async () => {
    const accountId = await provider.createConnectAccount(
      "123e4567-e89b-12d3-a456-426614174000",
      "freelancer@example.com",
    );
    expect(accountId).toContain("acct_mock_");
  });

  it("creates mock escrow payment intent", async () => {
    const intent = await provider.createEscrowIntent({
      amountCents: 50000,
      currency: "USD",
      metadata: { milestoneId: "m1" },
    });
    expect(intent.paymentIntentId).toContain("pi_mock_");
    expect(intent.clientSecret).toBe("mock_secret");
  });
});
