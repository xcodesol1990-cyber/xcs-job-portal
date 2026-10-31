import pino from "pino";

const REDACT_PATHS = [
  "password",
  "passwordHash",
  "password_hash",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "totp",
  "totpSecretEnc",
  "totp_secret_enc",
  "secret",
  "card",
  "email",
  "req.headers.authorization",
  "req.headers.cookie",
  "*.password",
  "*.token",
  "*.secret",
  "*.email",
];

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const BEARER_RE = /bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;

export function redactText(value: string): string {
  return value.replace(EMAIL_RE, "[REDACTED_EMAIL]").replace(BEARER_RE, "Bearer [REDACTED]");
}

export function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return redactText(value);
  }
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, nested]) => {
      if (REDACT_PATHS.some((path) => path === key || path.endsWith(`.${key}`))) {
        return [key, "[REDACTED]"];
      }
      return [key, redactValue(nested)];
    });
    return Object.fromEntries(entries);
  }
  return value;
}

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  redact: {
    paths: REDACT_PATHS,
    censor: "[REDACTED]",
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  hooks: {
    logMethod(args, method) {
      const redacted = args.map((arg) => redactValue(arg));
      method.apply(this, redacted as Parameters<typeof method>);
    },
  },
});
