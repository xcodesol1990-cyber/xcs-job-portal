import crypto from "node:crypto";
import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";

export async function withIdempotency<T>(
  key: string,
  userId: string,
  endpoint: string,
  payload: unknown,
  handler: () => Promise<{ status: number; body: T }>,
): Promise<{ status: number; body: T }> {
  const requestHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload ?? {}))
    .digest("hex");

  const existing = await prisma.idempotencyKey.findUnique({
    where: {
      userId_endpoint_key: {
        userId,
        endpoint,
        key,
      },
    },
  });

  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new AppError(
        "IDEMPOTENCY_MISMATCH",
        "Idempotency key was previously used with a different request payload.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    if (existing.responseStatus && existing.responseBody) {
      return {
        status: existing.responseStatus,
        body: existing.responseBody as T,
      };
    }

    // Locked / concurrent request in progress
    throw new AppError(
      "REQUEST_IN_PROGRESS",
      "A request with this idempotency key is currently processing. Please wait.",
      HTTP_STATUS.CONFLICT,
    );
  }

  // Create lock
  const record = await prisma.idempotencyKey.create({
    data: {
      userId,
      endpoint,
      key,
      requestHash,
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h retention
    },
  });

  try {
    const result = await handler();

    await prisma.idempotencyKey.update({
      where: { id: record.id },
      data: {
        responseStatus: result.status,
        responseBody: result.body as object,
        lockedAt: null,
      },
    });

    return result;
  } catch (error) {
    // Release key on unhandled failure
    await prisma.idempotencyKey.delete({ where: { id: record.id } }).catch(() => {});
    throw error;
  }
}

