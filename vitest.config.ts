import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      APP_URL: "http://localhost:3000",
      AUTH_SECRET: "abcdefghijklmnopqrstuvwxyz012345",
      ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      CRON_SECRET: "test-cron-secret-value",
      DATABASE_URL:
        "postgresql://user:pass@localhost:5432/worknest?pgbouncer=true&connection_limit=1",
      DIRECT_URL: "postgresql://user:pass@localhost:5432/worknest",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
