import { describe, expect, it } from "vitest";
import { formatMinorUnits, splitFee } from "@/server/lib/money";

describe("splitFee", () => {
  it("uses integer math and places remainder on the platform fee", () => {
    expect(splitFee(100n, 1000)).toEqual({ netCents: 90n, feeCents: 10n });
    expect(splitFee(1n, 1000)).toEqual({ netCents: 1n, feeCents: 0n });
    expect(splitFee(5n, 1000)).toEqual({ netCents: 4n, feeCents: 1n });
  });

  it("rejects invalid fee basis points", () => {
    expect(() => splitFee(100n, 5001)).toThrow(/feeBps/);
  });
});

describe("formatMinorUnits", () => {
  it("formats cents without floating point", () => {
    expect(formatMinorUnits(12345n, "usd")).toBe("123.45 USD");
    expect(formatMinorUnits(-50n, "USD")).toBe("-0.50 USD");
  });
});
