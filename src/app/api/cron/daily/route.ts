import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth, cronUnauthorized, withCronAdvisoryLock } from "@/server/lib/cron-guard";
import { cronService } from "@/server/services/cron.service";

/**
 * Single Unified Daily Cron Job (compatible with Vercel Hobby plan)
 * Runs once every 24 hours at 00:00 UTC.
 */
export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return cronUnauthorized();
  }

  const { executed, result, error } = await withCronAdvisoryLock(9999, async () => {
    const [outbox, autoApprove, expiredContracts, ledger, cleanup, jss] = await Promise.allSettled([
      cronService.processOutboxAndWebhooks(),
      cronService.autoApproveMilestones(),
      cronService.expireUnfundedContracts(),
      cronService.reconcileLedger(),
      cronService.cleanupExpiredData(),
      cronService.recomputeJobSuccessScores(),
    ]);

    return {
      outbox: outbox.status === "fulfilled" ? outbox.value : { error: outbox.reason },
      autoApprove:
        autoApprove.status === "fulfilled" ? autoApprove.value : { error: autoApprove.reason },
      expiredContracts:
        expiredContracts.status === "fulfilled"
          ? expiredContracts.value
          : { error: expiredContracts.reason },
      ledger: ledger.status === "fulfilled" ? ledger.value : { error: ledger.reason },
      cleanup: cleanup.status === "fulfilled" ? cleanup.value : { error: cleanup.reason },
      jss: jss.status === "fulfilled" ? jss.value : { error: jss.reason },
    };
  });

  if (!executed) {
    return NextResponse.json({ message: error }, { status: 429 });
  }

  return NextResponse.json({ success: true, result });
}
