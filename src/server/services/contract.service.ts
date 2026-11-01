import { prisma } from "@/server/db/prisma";
import {
  ContractStatus,
  LedgerType,
  MilestoneStatus,
  ProposalStatus,
  Prisma,
} from "@prisma/client";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import {
  assertContractTransition,
  assertMilestoneTransition,
} from "@/server/policies/state-machines";
import { sanitizeHtml } from "@/server/lib/sanitize";

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  amountCents: number;
}

export interface CreateContractInput {
  proposalId: string;
  milestones: CreateMilestoneInput[];
}

export class ContractService {
  /**
   * Client creates a new contract from an accepted proposal.
   */
  static async createContract(clientId: string, input: CreateContractInput) {
    if (!input.milestones || input.milestones.length === 0) {
      throw new AppError(
        "INVALID_MILESTONES",
        "A contract must have at least one milestone.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: input.proposalId },
      include: {
        job: { select: { id: true, clientId: true, title: true } },
        freelancer: { select: { id: true, name: true } },
      },
    });

    if (!proposal || proposal.job.clientId !== clientId) {
      throw new AppError(
        "UNAUTHORIZED",
        "Proposal not found or unauthorized.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const existingContract = await prisma.contract.findUnique({
      where: { proposalId: input.proposalId },
    });

    if (existingContract) {
      throw new AppError(
        "CONTRACT_EXISTS",
        "A contract for this proposal has already been created.",
        HTTP_STATUS.CONFLICT,
      );
    }

    const totalCents = input.milestones.reduce((sum, m) => sum + BigInt(m.amountCents), BigInt(0));

    return prisma.$transaction(async (tx) => {
      // Mark proposal accepted
      await tx.proposal.update({
        where: { id: input.proposalId },
        data: { status: ProposalStatus.ACCEPTED },
      });

      // Create contract in PENDING_FUNDING
      const contract = await tx.contract.create({
        data: {
          jobId: proposal.job.id,
          proposalId: proposal.id,
          clientId,
          freelancerId: proposal.freelancerId,
          totalCents,
          currency: "USD",
          platformFeeBps: 1000, // 10%
          status: ContractStatus.PENDING_FUNDING,
        },
      });

      // Create milestones
      for (let i = 0; i < input.milestones.length; i++) {
        const m = input.milestones[i];
        await tx.milestone.create({
          data: {
            contractId: contract.id,
            position: i + 1,
            title: m.title.trim(),
            description: m.description ? sanitizeHtml(m.description) : null,
            amountCents: BigInt(m.amountCents),
            status: MilestoneStatus.PENDING,
          },
        });
      }

      // Notify freelancer
      await tx.notification.create({
        data: {
          userId: proposal.freelancerId,
          type: "CONTRACT_OFFERED",
          payload: {
            contractId: contract.id,
            jobTitle: proposal.job.title,
            totalCents: Number(totalCents),
          },
        },
      });

      return contract;
    });
  }

  /**
   * Funds a milestone into escrow, activating the contract.
   */
  static async fundMilestone(clientId: string, contractId: string, milestoneId: string) {
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, clientId },
      include: {
        milestones: { where: { id: milestoneId } },
      },
    });

    if (!contract || contract.milestones.length === 0) {
      throw new AppError(
        "MILESTONE_NOT_FOUND",
        "Milestone not found or unauthorized.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const milestone = contract.milestones[0];
    assertMilestoneTransition(milestone.status, "FUNDED");

    return prisma.$transaction(async (tx) => {
      const updatedMilestone = await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          status: MilestoneStatus.FUNDED,
          version: { increment: 1 },
        },
      });

      // Activate contract if pending funding
      if (contract.status === ContractStatus.PENDING_FUNDING) {
        assertContractTransition(contract.status, "ACTIVE");
        await tx.contract.update({
          where: { id: contractId },
          data: {
            status: ContractStatus.ACTIVE,
            startedAt: new Date(),
            version: { increment: 1 },
          },
        });
      }

      // Record escrow ledger deposit
      await tx.ledgerEntry.create({
        data: {
          type: LedgerType.ESCROW_FUND,
          contractId,
          milestoneId,
          amountCents: milestone.amountCents,
          currency: contract.currency,
          userId: clientId,
          idempotencyKey: `fund_${milestoneId}_${Date.now()}`,
        },
      });

      // Notify freelancer
      await tx.notification.create({
        data: {
          userId: contract.freelancerId,
          type: "MILESTONE_FUNDED",
          payload: {
            contractId,
            milestoneTitle: milestone.title,
            amountCents: Number(milestone.amountCents),
          },
        },
      });

      return updatedMilestone;
    });
  }

  /**
   * Freelancer submits deliverable for review.
   */
  static async submitDeliverable(
    freelancerId: string,
    contractId: string,
    milestoneId: string,
    notes?: string,
  ) {
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, freelancerId },
      include: {
        milestones: { where: { id: milestoneId } },
      },
    });

    if (!contract || contract.milestones.length === 0) {
      throw new AppError("MILESTONE_NOT_FOUND", "Milestone not found.", HTTP_STATUS.NOT_FOUND);
    }

    const milestone = contract.milestones[0];
    assertMilestoneTransition(milestone.status, "SUBMITTED");

    return prisma.$transaction(async (tx) => {
      const updated = await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          status: MilestoneStatus.SUBMITTED,
          submittedAt: new Date(),
          version: { increment: 1 },
        },
      });

      await tx.notification.create({
        data: {
          userId: contract.clientId,
          type: "DELIVERABLE_SUBMITTED",
          payload: {
            contractId,
            milestoneTitle: milestone.title,
            notes: notes ? sanitizeHtml(notes) : undefined,
          },
        },
      });

      return updated;
    });
  }

  /**
   * Client requests revisions on deliverable.
   */
  static async requestRevision(
    clientId: string,
    contractId: string,
    milestoneId: string,
    reason: string,
  ) {
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, clientId },
      include: { milestones: { where: { id: milestoneId } } },
    });

    if (!contract || contract.milestones.length === 0) {
      throw new AppError("MILESTONE_NOT_FOUND", "Milestone not found.", HTTP_STATUS.NOT_FOUND);
    }

    const milestone = contract.milestones[0];
    assertMilestoneTransition(milestone.status, "REVISION_REQUESTED");

    return prisma.$transaction(async (tx) => {
      const updated = await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          status: MilestoneStatus.REVISION_REQUESTED,
          version: { increment: 1 },
        },
      });

      await tx.notification.create({
        data: {
          userId: contract.freelancerId,
          type: "REVISION_REQUESTED",
          payload: {
            contractId,
            milestoneTitle: milestone.title,
            reason: sanitizeHtml(reason),
          },
        },
      });

      return updated;
    });
  }

  /**
   * Client approves milestone deliverables and releases escrow funds.
   */
  static async approveAndRelease(clientId: string, contractId: string, milestoneId: string) {
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, clientId },
      include: {
        milestones: true,
      },
    });

    if (!contract) {
      throw new AppError("CONTRACT_NOT_FOUND", "Contract not found.", HTTP_STATUS.NOT_FOUND);
    }

    const milestone = contract.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new AppError("MILESTONE_NOT_FOUND", "Milestone not found.", HTTP_STATUS.NOT_FOUND);
    }

    assertMilestoneTransition(milestone.status, "APPROVED");
    assertMilestoneTransition("APPROVED", "RELEASED");

    const platformFeeBps = BigInt(contract.platformFeeBps);
    const feeCents = (milestone.amountCents * platformFeeBps) / BigInt(10000);
    const netPayoutCents = milestone.amountCents - feeCents;

    return prisma.$transaction(async (tx) => {
      // Mark milestone approved & released
      const updatedMilestone = await tx.milestone.update({
        where: { id: milestoneId },
        data: {
          status: MilestoneStatus.RELEASED,
          approvedAt: new Date(),
          releasedAt: new Date(),
          version: { increment: 1 },
        },
      });

      // Ledger: Escrow release to freelancer
      await tx.ledgerEntry.create({
        data: {
          type: LedgerType.ESCROW_RELEASE,
          contractId,
          milestoneId,
          amountCents: netPayoutCents,
          currency: contract.currency,
          userId: contract.freelancerId,
          idempotencyKey: `release_${milestoneId}_${Date.now()}`,
        },
      });

      // Ledger: Platform fee
      await tx.ledgerEntry.create({
        data: {
          type: LedgerType.PLATFORM_FEE,
          contractId,
          milestoneId,
          amountCents: feeCents,
          currency: contract.currency,
          userId: null,
          idempotencyKey: `fee_${milestoneId}_${Date.now()}`,
        },
      });

      // Update financial totals on profiles
      await tx.freelancerProfile.update({
        where: { userId: contract.freelancerId },
        data: { totalEarnedCents: { increment: netPayoutCents } },
      });

      await tx.clientProfile.update({
        where: { userId: clientId },
        data: { totalSpentCents: { increment: BigInt(milestone.amountCents) } },
      });

      // Check if all milestones are released -> Complete contract!
      const allMilestones = await tx.milestone.findMany({ where: { contractId } });
      const allReleased = allMilestones.every((m) => m.status === MilestoneStatus.RELEASED);

      if (allReleased) {
        assertContractTransition(contract.status, "COMPLETED");
        await tx.contract.update({
          where: { id: contractId },
          data: {
            status: ContractStatus.COMPLETED,
            completedAt: new Date(),
            version: { increment: 1 },
          },
        });
      }

      // Notify freelancer
      await tx.notification.create({
        data: {
          userId: contract.freelancerId,
          type: "MILESTONE_RELEASED",
          payload: {
            contractId,
            milestoneTitle: milestone.title,
            netPayoutDollars: Number(netPayoutCents) / 100,
          },
        },
      });

      return updatedMilestone;
    });
  }

  /**
   * Retrieves a contract by ID.
   */
  /**
   * Client performs a partial escrow release on a milestone, transferring approved funds immediately
   * and retaining the remaining balance in escrow for subsequent deliverables.
   */
  static async partialRelease(
    clientId: string,
    contractId: string,
    milestoneId: string,
    releaseCentsInput: bigint | number,
    note?: string,
  ) {
    const releaseCents = BigInt(Math.floor(Number(releaseCentsInput)));
    if (releaseCents <= 0n) {
      throw new AppError(
        "INVALID_AMOUNT",
        "Partial release amount must be greater than zero.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const contract = await prisma.contract.findFirst({
      where: { id: contractId, clientId },
      include: { milestones: true },
    });

    if (!contract) {
      throw new AppError("CONTRACT_NOT_FOUND", "Contract not found.", HTTP_STATUS.NOT_FOUND);
    }

    const milestone = contract.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new AppError("MILESTONE_NOT_FOUND", "Milestone not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (
      milestone.status !== MilestoneStatus.SUBMITTED &&
      milestone.status !== MilestoneStatus.FUNDED &&
      milestone.status !== MilestoneStatus.REVISION_REQUESTED
    ) {
      throw new AppError(
        "INVALID_MILESTONE_STATUS",
        `Cannot release funds from milestone in ${milestone.status} status.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (releaseCents > milestone.amountCents) {
      throw new AppError(
        "AMOUNT_EXCEEDS_ESCROW",
        `Partial release amount ($${(Number(releaseCents) / 100).toFixed(2)}) exceeds available milestone escrow ($${(Number(milestone.amountCents) / 100).toFixed(2)}).`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const platformFeeBps = BigInt(contract.platformFeeBps);
    const feeCents = (releaseCents * platformFeeBps) / 10000n;
    const netPayoutCents = releaseCents - feeCents;
    const isFullRelease = releaseCents === milestone.amountCents;

    return prisma.$transaction(async (tx) => {
      let updatedMilestone;
      if (isFullRelease) {
        updatedMilestone = await tx.milestone.update({
          where: { id: milestoneId },
          data: {
            status: MilestoneStatus.RELEASED,
            approvedAt: new Date(),
            releasedAt: new Date(),
            version: { increment: 1 },
          },
        });
      } else {
        const remainingCents = milestone.amountCents - releaseCents;
        updatedMilestone = await tx.milestone.update({
          where: { id: milestoneId },
          data: {
            amountCents: remainingCents,
            version: { increment: 1 },
          },
        });
      }

      // Ledger: Escrow release to freelancer
      await tx.ledgerEntry.create({
        data: {
          type: LedgerType.ESCROW_RELEASE,
          contractId,
          milestoneId,
          amountCents: netPayoutCents,
          currency: contract.currency,
          userId: contract.freelancerId,
          idempotencyKey: `partial_release_${milestoneId}_${Date.now()}`,
        },
      });

      // Ledger: Platform fee
      await tx.ledgerEntry.create({
        data: {
          type: LedgerType.PLATFORM_FEE,
          contractId,
          milestoneId,
          amountCents: feeCents,
          currency: contract.currency,
          userId: null,
          idempotencyKey: `partial_fee_${milestoneId}_${Date.now()}`,
        },
      });

      // Update financial totals on profiles
      await tx.freelancerProfile.update({
        where: { userId: contract.freelancerId },
        data: { totalEarnedCents: { increment: netPayoutCents } },
      });

      await tx.clientProfile.update({
        where: { userId: clientId },
        data: { totalSpentCents: { increment: releaseCents } },
      });

      if (isFullRelease) {
        const allMilestones = await tx.milestone.findMany({ where: { contractId } });
        const allReleased = allMilestones.every((m) => m.status === MilestoneStatus.RELEASED);
        if (allReleased) {
          await tx.contract.update({
            where: { id: contractId },
            data: {
              status: ContractStatus.COMPLETED,
              completedAt: new Date(),
              version: { increment: 1 },
            },
          });
        }
      }

      // Notify freelancer
      await tx.notification.create({
        data: {
          userId: contract.freelancerId,
          type: "MILESTONE_RELEASED",
          payload: {
            contractId,
            milestoneTitle: milestone.title,
            netPayoutDollars: Number(netPayoutCents) / 100,
            isPartial: !isFullRelease,
            remainingDollars: isFullRelease
              ? 0
              : Number(milestone.amountCents - releaseCents) / 100,
            note: note ? sanitizeHtml(note) : undefined,
          },
        },
      });

      return {
        updatedMilestone,
        releasedNetPayoutCents: netPayoutCents,
        feeCents,
        isFullRelease,
      };
    });
  }

  static async getContract(contractId: string, userId: string, isAdmin = false) {
    const where: Prisma.ContractWhereInput = { id: contractId };
    if (!isAdmin) {
      where.OR = [{ clientId: userId }, { freelancerId: userId }];
    }

    const contract = await prisma.contract.findFirst({
      where,
      include: {
        client: { select: { id: true, name: true, clientProfile: true } },
        freelancer: { select: { id: true, name: true, freelancerProfile: true } },
        job: { select: { id: true, title: true } },
        milestones: { orderBy: { position: "asc" } },
        ledgerEntries: { orderBy: { createdAt: "desc" } },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true } },
          },
        },
        disputes: {
          include: {
            openedBy: { select: { id: true, name: true } },
            resolvedBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!contract) {
      throw new AppError("CONTRACT_NOT_FOUND", "Contract not found.", HTTP_STATUS.NOT_FOUND);
    }

    return contract;
  }

  /**
   * Retrieves all contracts for a user (either client or freelancer).
   */
  static async getUserContracts(userId: string) {
    return prisma.contract.findMany({
      where: {
        OR: [{ clientId: userId }, { freelancerId: userId }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } },
        job: { select: { title: true } },
        milestones: true,
      },
    });
  }
}
