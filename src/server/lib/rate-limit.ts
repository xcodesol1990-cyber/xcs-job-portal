import { env } from "@/server/lib/env";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // unix ms
}

class MemoryRateLimiter {
  private hits: Map<string, number[]> = new Map();

  constructor() {
    // Periodically clean up old entries to prevent memory leaks
    if (typeof setInterval !== "undefined") {
      setInterval(() => {
        const now = Date.now();
        for (const [key, timestamps] of this.hits.entries()) {
          const fresh = timestamps.filter((t) => now - t < 60_000);
          if (fresh.length === 0) {
            this.hits.delete(key);
          } else {
            this.hits.set(key, fresh);
          }
        }
      }, 30_000).unref?.();
    }
  }

  limit(identifier: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const timestamps = (this.hits.get(identifier) ?? []).filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const resetAt = oldest + windowMs;
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetAt,
      };
    }

    timestamps.push(now);
    this.hits.set(identifier, timestamps);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - timestamps.length,
      resetAt: now + windowMs,
    };
  }
}

const memoryLimiter = new MemoryRateLimiter();

/**
 * Checks rate limit for a given key (IP, user ID, or email).
 * Defaults to 5 requests per minute for sensitive endpoints (e.g. login, reset password).
 */
export async function checkRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  const currentEnv = env();

  // If Upstash Redis is configured, we can use Upstash REST API
  if (currentEnv.UPSTASH_REDIS_REST_URL && currentEnv.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const url = `${currentEnv.UPSTASH_REDIS_REST_URL}/multi-exec`;
      const redisKey = `ratelimit:${key}`;
      const now = Date.now();
      const clearBefore = now - windowMs;

      // ZREMRANGEBYSCORE, ZADD, ZCARD, EXPIRE
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentEnv.UPSTASH_REDIS_REST_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["ZREMRANGEBYSCORE", redisKey, "0", clearBefore.toString()],
          ["ZADD", redisKey, now.toString(), `${now}-${Math.random()}`],
          ["ZCARD", redisKey],
          ["EXPIRE", redisKey, Math.ceil(windowMs / 1000).toString()],
        ]),
      });

      if (response.ok) {
        const results = (await response.json()) as Array<{ result: unknown }>;
        const count = typeof results[2]?.result === "number" ? results[2].result : 1;
        const success = count <= maxRequests;
        return {
          success,
          limit: maxRequests,
          remaining: Math.max(0, maxRequests - count),
          resetAt: now + windowMs,
        };
      }
    } catch {
      // Fallback to in-memory on Redis network error
    }
  }

  // Fallback to in-memory sliding window
  return memoryLimiter.limit(key, maxRequests, windowMs);
}

/**
 * Enforces rate limiting or throws HTTP 429 Too Many Requests.
 */
export async function assertRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  const result = await checkRateLimit(key, maxRequests, windowMs);
  if (!result.success) {
    const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new AppError(
      "RATE_LIMIT_EXCEEDED",
      `Too many attempts. Please try again in ${retryAfterSec > 0 ? retryAfterSec : 1} seconds.`,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      { retryAfterSec },
    );
  }
  return result;
}
