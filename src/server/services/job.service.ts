import crypto from "node:crypto";
import { prisma } from "@/server/db/prisma";
import { BudgetType, JobStatus, Prisma } from "@prisma/client";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { sanitizeHtml } from "@/server/lib/sanitize";

export interface CreateJobInput {
  title: string;
  description: string;
  categoryId?: number;
  budgetType: "FIXED" | "HOURLY";
  budgetMinCents?: number;
  budgetMaxCents?: number;
  currency?: string;
  duration?: string;
  experienceLevel?: string;
  skillIds?: number[];
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  status?: "DRAFT" | "OPEN" | "CLOSED";
}

export interface JobListFilters {
  query?: string;
  categoryId?: number;
  budgetType?: BudgetType;
  experienceLevel?: string;
  cursor?: string;
  limit?: number;
}

export class JobService {
  /**
   * Computes a canonical dedupe hash from job title and description.
   */
  static computeDedupeHash(title: string, description: string): string {
    const normalized = `${title.toLowerCase().trim()}|${description.toLowerCase().trim().slice(0, 500)}`;
    return crypto.createHash("sha256").update(normalized).digest("hex");
  }

  /**
   * Creates a new job posting.
   */
  static async createJob(clientId: string, input: CreateJobInput) {
    const title = input.title.trim();
    const description = sanitizeHtml(input.description);

    if (title.length < 5) {
      throw new AppError("INVALID_TITLE", "Job title must be at least 5 characters.", HTTP_STATUS.UNPROCESSABLE);
    }
    if (description.length < 20) {
      throw new AppError("INVALID_DESCRIPTION", "Job description must be at least 20 characters.", HTTP_STATUS.UNPROCESSABLE);
    }

    if (
      input.budgetMinCents &&
      input.budgetMaxCents &&
      input.budgetMinCents > input.budgetMaxCents
    ) {
      throw new AppError(
        "INVALID_BUDGET",
        "Minimum budget cannot exceed maximum budget.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    const dedupeHash = this.computeDedupeHash(title, description);

    // Prevent duplicate spam posts within the last 10 minutes
    const duplicate = await prisma.job.findFirst({
      where: {
        clientId,
        dedupeHash,
        deletedAt: null,
        createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });

    if (duplicate) {
      throw new AppError(
        "DUPLICATE_JOB",
        "A job posting with identical title and description was recently submitted.",
        HTTP_STATUS.CONFLICT,
      );
    }

    const budgetType = input.budgetType === "HOURLY" ? BudgetType.HOURLY : BudgetType.FIXED;

    return prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          clientId,
          categoryId: input.categoryId,
          title,
          description,
          budgetType,
          budgetMinCents: input.budgetMinCents,
          budgetMaxCents: input.budgetMaxCents,
          currency: input.currency ?? "USD",
          duration: input.duration,
          experienceLevel: input.experienceLevel,
          status: JobStatus.OPEN,
          publishedAt: new Date(),
          dedupeHash,
        },
      });

      if (input.skillIds && input.skillIds.length > 0) {
        await tx.jobSkill.createMany({
          data: input.skillIds.map((skillId) => ({
            jobId: job.id,
            skillId,
          })),
        });
      }

      return job;
    });
  }

  /**
   * Retrieves a job by ID with full details.
   */
  static async getJobById(jobId: string) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            clientProfile: true,
          },
        },
        category: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!job) {
      throw new AppError("JOB_NOT_FOUND", "Job posting not found.", HTTP_STATUS.NOT_FOUND);
    }

    return job;
  }

  /**
   * Updates an existing job posting.
   */
  static async updateJob(clientId: string, jobId: string, input: UpdateJobInput) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, clientId, deletedAt: null },
    });

    if (!job) {
      throw new AppError("JOB_NOT_FOUND", "Job not found or unauthorized.", HTTP_STATUS.NOT_FOUND);
    }

    const title = input.title ? input.title.trim() : job.title;
    const description = input.description ? sanitizeHtml(input.description) : job.description;
    const dedupeHash = this.computeDedupeHash(title, description);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.job.update({
        where: { id: jobId },
        data: {
          title,
          description,
          categoryId: input.categoryId ?? job.categoryId,
          budgetType: input.budgetType
            ? input.budgetType === "HOURLY"
              ? BudgetType.HOURLY
              : BudgetType.FIXED
            : job.budgetType,
          budgetMinCents: input.budgetMinCents ?? job.budgetMinCents,
          budgetMaxCents: input.budgetMaxCents ?? job.budgetMaxCents,
          duration: input.duration ?? job.duration,
          experienceLevel: input.experienceLevel ?? job.experienceLevel,
          dedupeHash,
          version: { increment: 1 },
        },
      });

      if (input.skillIds && Array.isArray(input.skillIds)) {
        await tx.jobSkill.deleteMany({ where: { jobId } });
        if (input.skillIds.length > 0) {
          await tx.jobSkill.createMany({
            data: input.skillIds.map((skillId) => ({
              jobId,
              skillId,
            })),
          });
        }
      }

      return updated;
    });
  }

  /**
   * Soft-deletes a job posting.
   */
  static async deleteJob(clientId: string, jobId: string) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, clientId, deletedAt: null },
      include: { contracts: { where: { status: "ACTIVE" } } },
    });

    if (!job) {
      throw new AppError("JOB_NOT_FOUND", "Job not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (job.contracts.length > 0) {
      throw new AppError(
        "JOB_HAS_ACTIVE_CONTRACTS",
        "Cannot delete a job with active contracts. Close the job instead.",
        HTTP_STATUS.CONFLICT,
      );
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        deletedAt: new Date(),
        status: JobStatus.CLOSED,
      },
    });

    return true;
  }

  /**
   * Lists jobs with cursor pagination and multi-facet filtering.
   */
  static async listJobs(filters: JobListFilters = {}) {
    const limit = Math.min(Math.max(filters.limit ?? 10, 1), 50);
    const whereClause: Prisma.JobWhereInput = {
      deletedAt: null,
      status: JobStatus.OPEN,
    };

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.budgetType) {
      whereClause.budgetType = filters.budgetType;
    }

    if (filters.experienceLevel) {
      whereClause.experienceLevel = filters.experienceLevel;
    }

    if (filters.query?.trim()) {
      const q = filters.query.trim();
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.job.findMany({
      where: whereClause,
      take: limit + 1,
      cursor: filters.cursor ? { id: filters.cursor } : undefined,
      orderBy: { publishedAt: "desc" },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            clientProfile: {
              select: { companyName: true, paymentVerified: true },
            },
          },
        },
        category: true,
        skills: {
          include: { skill: true },
        },
      },
    });

    let nextCursor: string | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.id;
    }

    return {
      items,
      nextCursor,
    };
  }

  /**
   * Lists all jobs posted by a specific client.
   */
  static async getClientJobs(clientId: string) {
    return prisma.job.findMany({
      where: { clientId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        _count: {
          select: { proposals: true, contracts: true },
        },
      },
    });
  }
}
