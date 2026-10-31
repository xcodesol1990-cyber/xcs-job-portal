import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS, jsonError } from "@/server/lib/errors";
import { logger } from "@/server/lib/logger";
import { createRequestId } from "@/server/lib/request-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const requestId = createRequestId();
  const started = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        db: "up",
        requestId,
        latencyMs: Date.now() - started,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "x-request-id": requestId,
        },
      },
    );
  } catch (error) {
    logger.error({ err: error, requestId }, "health check failed");
    return jsonError(
      new AppError("DB_UNAVAILABLE", "Database unavailable.", HTTP_STATUS.SERVICE_UNAVAILABLE),
      requestId,
    );
  }
}
