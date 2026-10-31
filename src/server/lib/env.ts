import { z } from "zod";

function emptyToUndefined(value: unknown): unknown {
  return value === "" ? undefined : value;
}

const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY must be 64 hex characters (32 bytes)"),
    CRON_SECRET: z.string().min(16),
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1),
    AUTH_GOOGLE_ID: optionalString,
    AUTH_GOOGLE_SECRET: optionalString,
    AUTH_GITHUB_ID: optionalString,
    AUTH_GITHUB_SECRET: optionalString,
    STRIPE_SECRET_KEY: optionalString,
    STRIPE_WEBHOOK_SECRET: optionalString,
    STRIPE_CONNECT_CLIENT_ID: optionalString,
    UPSTASH_REDIS_REST_URL: optionalUrl,
    UPSTASH_REDIS_REST_TOKEN: optionalString,
    RESEND_API_KEY: optionalString,
    EMAIL_FROM: optionalString,
    BLOB_READ_WRITE_TOKEN: optionalString,
    PUSHER_APP_ID: optionalString,
    PUSHER_KEY: optionalString,
    PUSHER_SECRET: optionalString,
    PUSHER_CLUSTER: optionalString,
    NEXT_PUBLIC_PUSHER_KEY: optionalString,
    NEXT_PUBLIC_PUSHER_CLUSTER: optionalString,
    TURNSTILE_SECRET_KEY: optionalString,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
  })
  .strict();

export type Env = z.infer<typeof envSchema>;

const ENV_KEYS = [
  "NODE_ENV",
  "APP_URL",
  "AUTH_SECRET",
  "ENCRYPTION_KEY",
  "CRON_SECRET",
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_CONNECT_CLIENT_ID",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "BLOB_READ_WRITE_TOKEN",
  "PUSHER_APP_ID",
  "PUSHER_KEY",
  "PUSHER_SECRET",
  "PUSHER_CLUSTER",
  "NEXT_PUBLIC_PUSHER_KEY",
  "NEXT_PUBLIC_PUSHER_CLUSTER",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
] as const;

function pickEnv(source: Record<string, string | undefined>): Record<string, string | undefined> {
  const picked: Record<string, string | undefined> = {};
  for (const key of ENV_KEYS) {
    picked[key] = source[key];
  }
  return picked;
}

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = envSchema.safeParse(pickEnv(source));
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment variables: ${details}`);
  }
  return parsed.data;
}

let cached: Env | undefined;

export function env(): Env {
  if (!cached) {
    cached = loadEnv();
  }
  return cached;
}

export function resetEnvCache(): void {
  cached = undefined;
}
