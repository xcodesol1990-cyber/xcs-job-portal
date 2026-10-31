import { prisma } from "@/server/db/prisma";
import { ProposalStatus } from "@prisma/client";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { sanitizeHtml } from "@/server/lib/sanitize";

export interface SubmitProposalInput {
  jobId: string;
  coverLetter: string;
  bidCents: number;
  estimatedDays?: number;
}

export class ProposalService {
  /**
   * Submits a new proposal for a job.
   */
  static async submitProposal(freelancerId: string, input: SubmitProposalInput) {
    const coverLetter = sanitizeHtml(input.coverLetter);

    if (coverLetter.length < 20) {
      throw new AppError(
        "INVALID_COVER_LETTER",
        "Cover letter must be at least 20 characters.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    if (!input.bidCents || input.bidCents <= 0) {
      throw new AppError(
        "INVALID_BID",
        "Bid amount must be greater than zero.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    const job = await prisma.job.findFirst({
      where: { id: input.jobId, deletedAt: null, status: "OPEN" },
      select: { id: true, clientId: true, title: true },
    });

    if (!job) {
      throw new AppError("JOB_NOT_FOUND", "Job posting is not open for proposals.", HTTP_STATUS.NOT_FOUND);
    }

    // Clients cannot propose on their own jobs
    if (job.clientId === freelancerId) {
      throw new AppError(
        "CANNOT_PROPOSE_OWN_JOB",
        "You cannot submit a proposal to your own job posting.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    // Check for existing proposal
    const existing = await prisma.proposal.findUnique({
      where: {
        jobId_freelancerId: {
          jobId: input.jobId,
          freelancerId,
        },
      },
    });

    if (existing) {
      throw new AppError(
        "PROPOSAL_EXISTS",
        "You have already submitted a proposal for this opportunity.",
        HTTP_STATUS.CONFLICT,
      );
    }

    return prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.create({
        data: {
          jobId: input.jobId,
          freelancerId,
          coverLetter,
          bidCents: input.bidCents,
          estimatedDays: input.estimatedDays,
          status: ProposalStatus.SUBMITTED,
        },
        include: {
          freelancer: { select: { name: true } },
        },
      });

      // Increment proposal counter on the job
      await tx.job.update({
        where: { id: input.jobId },
        data: { proposalsCount: { increment: 1 } },
      });

      // Create notification for the client
      await tx.notification.create({
        data: {
          userId: job.clientId,
          type: "PROPOSAL_RECEIVED",
          payload: {
            jobId: job.id,
            jobTitle: job.title,
            freelancerName: proposal.freelancer.name,
            bidCents: input.bidCents,
          },
        },
      });

      return proposal;
    });
  }

  /**
   * Retrieves all proposals for a job (client only).
   */
  static async getJobProposals(clientId: string, jobId: string) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, clientId },
      select: { id: true, title: true },
    });

    if (!job) {
      throw new AppError("JOB_NOT_FOUND", "Job not found or unauthorized.", HTTP_STATUS.NOT_FOUND);
    }

    return prisma.proposal.findMany({
      where: { jobId },
      orderBy: { createdAt: "desc" },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            freelancerProfile: {
              include: {
                skills: { include: { skill: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Updates proposal status (e.g. SHORTLISTED, REJECTED).
   */
  static async updateStatus(
    clientId: string,
    proposalId: string,
    status: "SHORTLISTED" | "REJECTED",
  ) {
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        job: { select: { clientId: true, title: true } },
      },
    });

    if (!proposal || proposal.job.clientId !== clientId) {
      throw new AppError("UNAUTHORIZED", "Proposal not found or unauthorized.", HTTP_STATUS.FORBIDDEN);
    }

    const updated = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: status === "SHORTLISTED" ? ProposalStatus.SHORTLISTED : ProposalStatus.REJECTED,
      },
    });

    // Notify freelancer
    await prisma.notification.create({
      data: {
        userId: proposal.freelancerId,
        type: `PROPOSAL_${status}`,
        payload: {
          jobTitle: proposal.job.title,
          status,
        },
      },
    });

    return updated;
  }

  /**
   * Freelancer withdraws their proposal.
   */
  static async withdrawProposal(freelancerId: string, proposalId: string) {
    const proposal = await prisma.proposal.findFirst({
      where: { id: proposalId, freelancerId, status: "SUBMITTED" },
    });

    if (!proposal) {
      throw new AppError("PROPOSAL_NOT_FOUND", "Active proposal not found.", HTTP_STATUS.NOT_FOUND);
    }

    return prisma.$transaction([
      prisma.proposal.update({
        where: { id: proposalId },
        data: { status: ProposalStatus.WITHDRAWN },
      }),
      prisma.job.update({
        where: { id: proposal.jobId },
        data: { proposalsCount: { decrement: 1 } },
      }),
    ]);
  }

  /**
   * Lists all proposals submitted by a freelancer.
   */
  static async getFreelancerProposals(freelancerId: string) {
    return prisma.proposal.findMany({
      where: { freelancerId },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            budgetType: true,
            currency: true,
            status: true,
            client: { select: { name: true } },
          },
        },
      },
    });
  }
}

