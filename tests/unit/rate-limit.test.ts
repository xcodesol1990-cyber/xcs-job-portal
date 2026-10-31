import { describe, expect, it } from "vitest";
import { checkRateLimit, assertRateLimit } from "@/server/lib/rate-limit";

describe("rate-limit service", () => {
  it("allows requests under the limit", async () => {
    const key = `test-user-${Date.now()}`;
    const result1 = await checkRateLimit(key, 3, 60_000);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = await checkRateLimit(key, 3, 60_000);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);
  });

  it("blocks requests exceeding the limit", async () => {
    const key = `test-blocked-${Date.now()}`;
    await checkRateLimit(key, 2, 60_000);
    await checkRateLimit(key, 2, 60_000);

    const blocked = await checkRateLimit(key, 2, 60_000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("throws AppError on assertRateLimit when limit exceeded", async () => {
    const key = `test-assert-${Date.now()}`;
    await assertRateLimit(key, 1, 60_000);

    await expect(assertRateLimit(key, 1, 60_000)).rejects.toThrow(/Too many attempts/);
  });
});
