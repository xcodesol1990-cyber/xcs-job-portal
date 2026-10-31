import { NextRequest, NextResponse } from "next/server";
import { env } from "@/server/lib/env";
import { prisma } from "@/server/db/prisma";

export function verifyCronAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.replace("Bearer ", "").trim();
  return token === env().CRON_SECRET;
}

export function cronUnauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized: Invalid cron secret" }, { status: 401 });
}

/**
 * Runs a cron task with PostgreSQL advisory lock protection to avoid overlapping executions.
 */
export async function withCronAdvisoryLock<T>(
  lockKey: number,
  task: () => Promise<T>,
): Promise<{ executed: boolean; result?: T; error?: string }> {
  let lockAcquired = false;

  try {
    const lockResult = await prisma.$queryRaw<[{ locked: boolean }]>`
      SELECT pg_try_advisory_lock(${lockKey}) as locked
    `;
    lockAcquired = lockResult[0]?.locked ?? false;
  } catch {
    // In environments where advisory locks fail (e.g. pgBouncer transaction mode), proceed safely
    lockAcquired = true;
  }

  if (!lockAcquired) {
    return { executed: false, error: "Task skipped: lock already held by another runner." };
  }

  try {
    const result = await task();
    return { executed: true, result };
  } finally {
    try {
      await prisma.$queryRaw`SELECT pg_advisory_unlock(${lockKey})`;
    } catch {
      // ignore unlock error if connection reset
    }
  }
}
