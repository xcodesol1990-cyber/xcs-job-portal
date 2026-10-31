import { describe, expect, it } from "vitest";
import { loadEnv } from "@/server/lib/env";

const validEnv = {
  NODE_ENV: "test",
  APP_URL: "http://localhost:3000",
  AUTH_SECRET: "abcdefghijklmnopqrstuvwxyz012345",
  ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  CRON_SECRET: "cron-secret-value",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/worknest?pgbouncer=true&connection_limit=1",
  DIRECT_URL: "postgresql://user:pass@localhost:5432/worknest",
};

describe("loadEnv", () => {
  it("accepts a complete valid environment", () => {
    const parsed = loadEnv(validEnv);
    expect(parsed.APP_URL).toBe("http://localhost:3000");
  });

  it("treats empty optional strings as undefined", () => {
    const parsed = loadEnv({ ...validEnv, AUTH_GOOGLE_ID: "" });
    expect(parsed.AUTH_GOOGLE_ID).toBeUndefined();
  });

  it("rejects a short AUTH_SECRET", () => {
    expect(() => loadEnv({ ...validEnv, AUTH_SECRET: "too-short" })).toThrow(
      /Invalid environment variables/,
    );
  });

  it("ignores unrelated process env keys", () => {
    const parsed = loadEnv({ ...validEnv, PATH: "/usr/bin", EXTRA_SECRET: "nope" });
    expect(parsed.APP_URL).toBe("http://localhost:3000");
  });
});
