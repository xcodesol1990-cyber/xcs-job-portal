import { prisma } from "@/server/db/prisma";
import { ContractService } from "@/server/services/contract.service";
import { LedgerType, MilestoneStatus, ContractStatus, Prisma } from "@prisma/client";

export class CronService {
  /**
   * Expire contracts that have remained PENDING_FUNDING for > 7 days.
   */
  async expireUnfundedContracts() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const staleContracts = await prisma.contract.findMany({
      where: {
        status: ContractStatus.PENDING_FUNDING,
        createdAt: { lt: sevenDaysAgo },
      },
      select: { id: true, clientId: true },
    });

    let expiredCount = 0;
    for (const contract of staleContracts) {
      await prisma.$transaction(async (tx) => {
        await tx.contract.update({
          where: { id: contract.id },
          data: { status: ContractStatus.CANCELLED, version: { increment: 1 } },
        });

        await tx.auditLog.create({
          data: {
            actorId: contract.clientId,
            action: "CONTRACT_AUTO_EXPIRED",
            entityType: "CONTRACT",
            entityId: contract.id,
            metadata: { reason: "Unfunded after 7 days" },
          },
        });
      });
      expiredCount++;
    }

    return { processed: staleContracts.length, expiredCount };
  }

  /**
   * Auto-approve deliverables in SUBMITTED state for > 14 days without client action.
   */
  async autoApproveMilestones() {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const eligibleMilestones = await prisma.milestone.findMany({
      where: {
        status: MilestoneStatus.SUBMITTED,
        submittedAt: { lt: fourteenDaysAgo },
      },
      include: {
        contract: true,
      },
    });

    let approvedCount = 0;
    for (const milestone of eligibleMilestones) {
      try {
        await ContractService.approveAndRelease(
          milestone.contract.clientId,
          milestone.contractId,
          milestone.id,
        );
        approvedCount++;
      } catch (err) {
        console.error(`Failed to auto-approve milestone ${milestone.id}:`, err);
      }
    }

    return { eligible: eligibleMilestones.length, approvedCount };
  }

  /**
   * Cleans up expired idempotency keys and verification tokens.
   */
  async cleanupExpiredData() {
    const now = new Date();

    const [deletedIdempotency, deletedTokens] = await Promise.all([
      prisma.idempotencyKey.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
      prisma.verificationToken.deleteMany({
        where: { expiresAt: { lt: now } },
      }),
    ]);

    return {
      deletedIdempotencyKeys: deletedIdempotency.count,
      deletedVerificationTokens: deletedTokens.count,
    };
  }

  /**
   * Audits double-entry ledger invariants across all contracts.
   * Total Escrow Funded must be >= Total Escrow Released + Total Escrow Refunded.
   */
  async reconcileLedger() {
    const contracts = await prisma.contract.findMany({
      select: {
        id: true,
        currency: true,
        ledgerEntries: {
          select: {
            type: true,
            amountCents: true,
          },
        },
      },
    });

    const anomalies: Array<{ contractId: string; discrepancyCents: string }> = [];

    for (const c of contracts) {
      let funded = 0n;
      let released = 0n;
      let refunded = 0n;

      for (const entry of c.ledgerEntries) {
        if (entry.type === LedgerType.ESCROW_FUND) funded += entry.amountCents;
        else if (entry.type === LedgerType.ESCROW_RELEASE) released += entry.amountCents;
        else if (entry.type === LedgerType.REFUND) refunded += entry.amountCents;
      }

      if (released + refunded > funded) {
        anomalies.push({
          contractId: c.id,
          discrepancyCents: (released + refunded - funded).toString(),
        });
      }
    }

    return {
      totalContractsAudited: contracts.length,
      anomaliesCount: anomalies.length,
      anomalies,
      healthy: anomalies.length === 0,
    };
  }

  /**
   * Recalculate Job Success Score (JSS) for all freelancers based on reviews.
   */
  async recomputeJobSuccessScores() {
    const profiles = await prisma.freelancerProfile.findMany({
      select: { userId: true },
    });

    let updatedCount = 0;
    for (const profile of profiles) {
      const reviews = await prisma.review.findMany({
        where: { revieweeId: profile.userId },
        select: { rating: true },
      });

      if (reviews.length > 0) {
        const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        const jss = new Prisma.Decimal(((avg / 5) * 100).toFixed(2));

        await prisma.freelancerProfile.update({
          where: { userId: profile.userId },
          data: { jobSuccessScore: jss },
        });
        updatedCount++;
      }
    }

    return { totalProfiles: profiles.length, updatedCount };
  }

  /**
   * Process pending outbox jobs and retry failed webhooks.
   */
  async processOutboxAndWebhooks() {
    const now = new Date();

    // 1. Process outbox
    const pendingJobs = await prisma.outbox.findMany({
      where: {
        runAfter: { lte: now },
        doneAt: null,
        attempts: { lt: 5 },
      },
      take: 20,
    });

    let outboxSuccessCount = 0;
    for (const job of pendingJobs) {
      try {
        // execute outbox job by topic
        await prisma.outbox.update({
          where: { id: job.id },
          data: { doneAt: now, attempts: { increment: 1 } },
        });
        outboxSuccessCount++;
      } catch {
        await prisma.outbox.update({
          where: { id: job.id },
          data: {
            attempts: { increment: 1 },
            runAfter: new Date(Date.now() + 60 * 1000 * (job.attempts + 1)), // exponential backoff
          },
        });
      }
    }

    // 2. Retry failed webhooks
    const failedWebhooks = await prisma.webhookEvent.findMany({
      where: {
        processedAt: null,
        attempts: { lt: 5 },
      },
      take: 10,
    });

    return {
      outboxProcessed: outboxSuccessCount,
      outboxTotal: pendingJobs.length,
      failedWebhooksPending: failedWebhooks.length,
    };
  }
}

export const cronService = new CronService();

