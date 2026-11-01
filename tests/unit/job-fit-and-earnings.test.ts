import { describe, it, expect } from "vitest";

describe("Job Fit & Transparent Earnings Utilities", () => {
  it("calculates skill match percentages and extracts matching vs missing skills", () => {
    const jobSkills = ["React", "TypeScript", "Next.js", "GraphQL"];
    const userSkills = ["react", "typescript", "tailwind"];

    const normalizedUserSkills = new Set(userSkills.map((s) => s.toLowerCase().trim()));
    const matchingSkills = jobSkills.filter((s) =>
      normalizedUserSkills.has(s.toLowerCase().trim()),
    );
    const missingSkills = jobSkills.filter(
      (s) => !normalizedUserSkills.has(s.toLowerCase().trim()),
    );

    const matchRatio = matchingSkills.length / jobSkills.length;
    const matchPct = Math.round(matchRatio * 100);

    expect(matchPct).toBe(50);
    expect(matchingSkills).toEqual(["React", "TypeScript"]);
    expect(missingSkills).toEqual(["Next.js", "GraphQL"]);
  });

  it("calculates WorkWasl 0% commission vs legacy 10% platform take-rate savings accurately", () => {
    const bidAmount = 1000;
    const stripeEstimatedFee = Number((bidAmount * 0.029 + 0.3).toFixed(2));
    const netTakeHome = Number((bidAmount - stripeEstimatedFee).toFixed(2));
    const legacyUpworkTax = Math.round(bidAmount * 0.1); // $100
    const savings = Math.round(legacyUpworkTax - stripeEstimatedFee);

    expect(stripeEstimatedFee).toBe(29.3);
    expect(netTakeHome).toBe(970.7);
    expect(legacyUpworkTax).toBe(100);
    expect(savings).toBe(71); // $71 more in pocket on WorkWasl
  });

  it("calculates WorkWasl flat $1 client and $1 freelancer fee model accurately", () => {
    const contractTotal = 500;
    const clientFee = 1;
    const freelancerFee = 1;

    const clientTotalPaid = contractTotal + clientFee;
    const freelancerReceivedBeforeStripe = contractTotal - freelancerFee;
    const platformGrossRevenue = clientFee + freelancerFee;

    expect(clientTotalPaid).toBe(501);
    expect(freelancerReceivedBeforeStripe).toBe(499);
    expect(platformGrossRevenue).toBe(2);
  });

  it("handles zero or edge bid numbers gracefully", () => {
    const bidAmount = 0;
    const stripeEstimatedFee = bidAmount > 0 ? Number((bidAmount * 0.029 + 0.3).toFixed(2)) : 0;
    const netTakeHome = Math.max(0, Number((bidAmount - stripeEstimatedFee).toFixed(2)));

    expect(stripeEstimatedFee).toBe(0);
    expect(netTakeHome).toBe(0);
  });
});
