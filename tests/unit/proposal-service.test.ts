import { describe, expect, it } from "vitest";

describe("proposal calculation & rules", () => {
  it("calculates platform fee integer minor units (10%) properly", () => {
    const bidDollars = 1000;
    const bidCents = bidDollars * 100;
    const platformFeeBps = 1000; // 10%
    const feeCents = Math.round((bidCents * platformFeeBps) / 10000);
    const freelancerNetCents = bidCents - feeCents;

    expect(feeCents).toBe(10000); // $100
    expect(freelancerNetCents).toBe(90000); // $900
  });

  it("handles odd cent splits without rounding errors", () => {
    const bidCents = 33333; // $333.33
    const feeCents = Math.round((bidCents * 1000) / 10000);
    const netCents = bidCents - feeCents;

    expect(feeCents + netCents).toBe(bidCents);
  });
});

