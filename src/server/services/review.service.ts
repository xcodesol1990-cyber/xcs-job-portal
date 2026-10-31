import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { notificationService } from "./notification.service";
import { Prisma } from "@prisma/client";

export interface CreateReviewInput {
  contractId: string;
  rating: number; // 1-5
  comment?: string;
}

export class ReviewService {
  async createReview(reviewerId: string, input: CreateReviewInput) {
    const { contractId, rating, comment } = input;

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new AppError("INVALID_RATING", "Rating must be an integer between 1 and 5.", HTTP_STATUS.BAD_REQUEST);
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } },
      },
    });

    if (!contract) {
      throw new AppError("CONTRACT_NOT_FOUND", "Contract not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (contract.status !== "COMPLETED") {
      throw new AppError("CONTRACT_NOT_COMPLETED", "Reviews can only be submitted for completed contracts.", HTTP_STATUS.BAD_REQUEST);
    }

    const isClient = contract.clientId === reviewerId;
    const isFreelancer = contract.freelancerId === reviewerId;

    if (!isClient && !isFreelancer) {
      throw new AppError("FORBIDDEN", "Only parties to this contract can leave a review.", HTTP_STATUS.FORBIDDEN);
    }

    const revieweeId = isClient ? contract.freelancerId : contract.clientId;

    // Check if review already exists
    const existing = await prisma.review.findUnique({
      where: {
        contractId_reviewerId: {
          contractId,
          reviewerId,
        },
      },
    });

    if (existing) {
      throw new AppError("REVIEW_ALREADY_EXISTS", "You have already reviewed this contract.", HTTP_STATUS.CONFLICT);
    }

    return await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          contractId,
          reviewerId,
          revieweeId,
          rating,
          comment: comment?.trim() ?? null,
        },
      });

      // Recalculate average rating & Job Success Score for Freelancers
      if (!isClient) {
        // Freelancer reviewed client
        // No JSS for client, but could update client feedback
      } else {
        // Client reviewed freelancer
        const allFreelancerReviews = await tx.review.findMany({
          where: { revieweeId },
          select: { rating: true },
        });

        const totalReviews = allFreelancerReviews.length;
        const avgRating = totalReviews > 0
          ? allFreelancerReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 5;

        // JSS percentage (e.g., 4.5/5 -> 90.00%)
        const jss = new Prisma.Decimal(((avgRating / 5) * 100).toFixed(2));

        await tx.freelancerProfile.updateMany({
          where: { userId: revieweeId },
          data: {
            jobSuccessScore: jss,
          },
        });
      }

      await notificationService.notify({
        userId: revieweeId,
        type: "REVIEW_RECEIVED",
        payload: {
          contractId,
          reviewerName: isClient ? contract.client.name : contract.freelancer.name,
          rating,
        },
      });

      return review;
    });
  }

  async getReviewsForUser(userId: string) {
    return prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { id: true, name: true, imageUrl: true } },
        contract: {
          select: {
            id: true,
            job: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const reviewService = new ReviewService();
