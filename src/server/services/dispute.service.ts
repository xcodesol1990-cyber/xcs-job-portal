import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { notificationService } from "./notification.service";
import { assertContractTransition, assertMilestoneTransition } from "@/server/policies/state-machines";
import { DisputeStatus, LedgerType } from "@prisma/client";

export interface OpenDisputeInput {
  contractId: string;
  milestoneId?: string;
  reason: string;
}

export interface ResolveDisputeInput {
  resolution: DisputeStatus;
  resolutionNote: string;
  splitFreelancerPercent?: number; // 1 to 99 if RESOLVED_SPLIT
}

export class DisputeService {
  async openDispute(actorId: string, input: OpenDisputeInput) {
    const { contractId, milestoneId, reason } = input;

    if (!reason || reason.trim().length < 10) {
      throw new AppError("INVALID_REASON", "Please provide a detailed reason for the dispute (at least 10 characters).", HTTP_STATUS.BAD_REQUEST);
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        job: { select: { title: true } },
        milestones: true,
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } },
      },
    });

    if (!contract) {
      throw new AppError("CONTRACT_NOT_FOUND", "Contract not found.", HTTP_STATUS.NOT_FOUND);
    }

    const isClient = contract.clientId === actorId;
    const isFreelancer = contract.freelancerId === actorId;

    if (!isClient && !isFreelancer) {
      throw new AppError("FORBIDDEN", "Only contract parties can file a dispute.", HTTP_STATUS.FORBIDDEN);
    }

    if (contract.status === "COMPLETED" || contract.status === "CANCELLED") {
      throw new AppError("INVALID_STATE", "Cannot dispute a completed or cancelled contract.", HTTP_STATUS.BAD_REQUEST);
    }

    let milestone: (typeof contract.milestones)[0] | undefined;
    if (milestoneId) {
      milestone = contract.milestones.find((m) => m.id === milestoneId);
      if (!milestone) {
        throw new AppError("MILESTONE_NOT_FOUND", "Milestone not found in this contract.", HTTP_STATUS.NOT_FOUND);
      }
      assertMilestoneTransition(milestone.status, "DISPUTED");
    }

    assertContractTransition(contract.status, "DISPUTED");

    return await prisma.$transaction(async (tx) => {
      if (milestone) {
        await tx.milestone.update({
          where: { id: milestone.id },
          data: { status: "DISPUTED", version: { increment: 1 } },
        });
      }

      await tx.contract.update({
        where: { id: contractId },
        data: { status: "DISPUTED", version: { increment: 1 } },
      });

      const dispute = await tx.dispute.create({
        data: {
          contractId,
          milestoneId: milestone?.id ?? null,
          openedById: actorId,
          reason: reason.trim(),
          status: "OPEN",
        },
      });

      const notifyRecipientId = isClient ? contract.freelancerId : contract.clientId;
      await notificationService.notify({
        userId: notifyRecipientId,
        type: "DISPUTE_OPENED",
        payload: {
          disputeId: dispute.id,
          contractId,
          contractTitle: contract.job.title,
          openedByName: isClient ? contract.client.name : contract.freelancer.name,
        },
      });

      return dispute;
    });
  }

  async resolveDispute(adminId: string, disputeId: string, input: ResolveDisputeInput) {
    const { resolution, resolutionNote, splitFreelancerPercent } = input;

    if (!["RESOLVED_CLIENT", "RESOLVED_FREELANCER", "RESOLVED_SPLIT"].includes(resolution)) {
      throw new AppError("INVALID_RESOLUTION", "Invalid dispute resolution.", HTTP_STATUS.BAD_REQUEST);
    }

    if (!resolutionNote || resolutionNote.trim().length < 10) {
      throw new AppError("INVALID_NOTE", "Admin resolution note is required.", HTTP_STATUS.BAD_REQUEST);
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        contract: {
          include: {
            job: { select: { title: true } },
            milestones: true,
            client: true,
            freelancer: true,
          },
        },
        milestone: true,
      },
    });

    if (!dispute) {
      throw new AppError("DISPUTE_NOT_FOUND", "Dispute not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (dispute.status !== "OPEN" && dispute.status !== "UNDER_REVIEW") {
      throw new AppError("ALREADY_RESOLVED", "This dispute has already been resolved.", HTTP_STATUS.CONFLICT);
    }

    const { contract, milestone } = dispute;

    return await prisma.$transaction(async (tx) => {
      const now = new Date();

      if (milestone && milestone.status === "DISPUTED") {
        const milestoneAmount = milestone.amountCents;

        if (resolution === "RESOLVED_CLIENT") {
          await tx.milestone.update({
            where: { id: milestone.id },
            data: { status: "REFUNDED", version: { increment: 1 } },
          });

          await tx.ledgerEntry.create({
            data: {
              type: LedgerType.REFUND,
              contractId: contract.id,
              milestoneId: milestone.id,
              userId: contract.clientId,
              amountCents: milestoneAmount,
              currency: contract.currency,
              idempotencyKey: `dispute_refund_${dispute.id}_${milestone.id}`,
            },
          });
        } else if (resolution === "RESOLVED_FREELANCER") {
          const feePercent = 10;
          const feeCents = (milestoneAmount * BigInt(feePercent)) / BigInt(100);
          const netFreelancerCents = milestoneAmount - feeCents;

          await tx.milestone.update({
            where: { id: milestone.id },
            data: {
              status: "RELEASED",
              releasedAt: now,
              version: { increment: 1 },
            },
          });

          await tx.ledgerEntry.create({
            data: {
              type: LedgerType.ESCROW_RELEASE,
              contractId: contract.id,
              milestoneId: milestone.id,
              userId: contract.freelancerId,
              amountCents: netFreelancerCents,
              currency: contract.currency,
              idempotencyKey: `dispute_release_${dispute.id}_${milestone.id}`,
            },
          });

          if (feeCents > 0n) {
            await tx.ledgerEntry.create({
              data: {
                type: LedgerType.PLATFORM_FEE,
                contractId: contract.id,
                milestoneId: milestone.id,
                amountCents: feeCents,
                currency: contract.currency,
                idempotencyKey: `dispute_fee_${dispute.id}_${milestone.id}`,
              },
            });
          }

          await tx.freelancerProfile.updateMany({
            where: { userId: contract.freelancerId },
            data: { totalEarnedCents: { increment: netFreelancerCents } },
          });
        } else if (resolution === "RESOLVED_SPLIT") {
          const percent = splitFreelancerPercent ?? 50;
          const freelancerPortion = (milestoneAmount * BigInt(percent)) / BigInt(100);
          const clientPortion = milestoneAmount - freelancerPortion;

          await tx.milestone.update({
            where: { id: milestone.id },
            data: {
              status: "RELEASED",
              releasedAt: now,
              version: { increment: 1 },
            },
          });

          if (freelancerPortion > 0n) {
            await tx.ledgerEntry.create({
              data: {
                type: LedgerType.ESCROW_RELEASE,
                contractId: contract.id,
                milestoneId: milestone.id,
                userId: contract.freelancerId,
                amountCents: freelancerPortion,
                currency: contract.currency,
                idempotencyKey: `dispute_split_free_${dispute.id}_${milestone.id}`,
              },
            });

            await tx.freelancerProfile.updateMany({
              where: { userId: contract.freelancerId },
              data: { totalEarnedCents: { increment: freelancerPortion } },
            });
          }

          if (clientPortion > 0n) {
            await tx.ledgerEntry.create({
              data: {
                type: LedgerType.REFUND,
                contractId: contract.id,
                milestoneId: milestone.id,
                userId: contract.clientId,
                amountCents: clientPortion,
                currency: contract.currency,
                idempotencyKey: `dispute_split_cli_${dispute.id}_${milestone.id}`,
              },
            });
          }
        }
      }

      // Check remaining milestones to decide contract status
      const updatedMilestones = await tx.milestone.findMany({
        where: { contractId: contract.id },
      });

      const allSettled = updatedMilestones.every((m) =>
        m.status === "RELEASED" || m.status === "REFUNDED"
      );

      const nextContractStatus = allSettled ? "COMPLETED" : "ACTIVE";

      await tx.contract.update({
        where: { id: contract.id },
        data: {
          status: nextContractStatus,
          version: { increment: 1 },
        },
      });

      const updatedDispute = await tx.dispute.update({
        where: { id: dispute.id },
        data: {
          status: resolution,
          resolutionNote: resolutionNote.trim(),
          resolvedById: adminId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "DISPUTE_RESOLVED",
          entityType: "DISPUTE",
          entityId: dispute.id,
          metadata: {
            resolution,
            contractId: contract.id,
            milestoneId: milestone?.id,
          },
        },
      });

      // Notify both parties
      await notificationService.notify({
        userId: contract.clientId,
        type: "DISPUTE_RESOLVED",
        payload: {
          disputeId: dispute.id,
          resolution,
          contractTitle: contract.job.title,
        },
      });

      await notificationService.notify({
        userId: contract.freelancerId,
        type: "DISPUTE_RESOLVED",
        payload: {
          disputeId: dispute.id,
          resolution,
          contractTitle: contract.job.title,
        },
      });

      return updatedDispute;
    });
  }

  async getDispute(disputeId: string) {
    return prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        contract: {
          include: {
            job: { select: { title: true } },
            client: { select: { id: true, name: true, email: true } },
            freelancer: { select: { id: true, name: true, email: true } },
            milestones: true,
          },
        },
        milestone: true,
        openedBy: { select: { id: true, name: true, email: true } },
        resolvedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

export const disputeService = new DisputeService();
