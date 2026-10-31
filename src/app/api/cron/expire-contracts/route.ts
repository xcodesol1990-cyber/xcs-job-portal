import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth, cronUnauthorized, withCronAdvisoryLock } from "@/server/lib/cron-guard";
import { cronService } from "@/server/services/cron.service";

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return cronUnauthorized();
  }

  const { executed, result, error } = await withCronAdvisoryLock(1002, () =>
    cronService.expireUnfundedContracts(),
  );

  if (!executed) {
    return NextResponse.json({ message: error }, { status: 429 });
  }

  return NextResponse.json({ success: true, result });
}

