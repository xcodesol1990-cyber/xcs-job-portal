import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";

export interface UpdateFreelancerInput {
  name?: string;
  headline?: string;
  bio?: string;
  hourlyRateCents?: number;
  currency?: string;
  availability?: string;
  experienceLevel?: string;
  skillIds?: number[];
}

export interface UpdateClientInput {
  name?: string;
  companyName?: string;
  website?: string;
}

export interface AddPortfolioItemInput {
  title: string;
  description?: string;
  url?: string;
}

export class ProfileService {
  /**
   * Retrieves all categories and skills for profile tag pickers and filters.
   */
  static async getTaxonomy() {
    const [categories, skills] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.skill.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return { categories, skills };
  }

  /**
   * Retrieves a freelancer profile by user ID.
   */
  static async getFreelancerProfile(userId: string) {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            country: true,
            timezone: true,
            createdAt: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        portfolioItems: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      throw new AppError("PROFILE_NOT_FOUND", "Freelancer profile not found.", HTTP_STATUS.NOT_FOUND);
    }

    return profile;
  }

  /**
   * Updates a freelancer profile.
   */
  static async updateFreelancerProfile(userId: string, input: UpdateFreelancerInput) {
    return prisma.$transaction(async (tx) => {
      if (input.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: input.name.trim() },
        });
      }

      const updated = await tx.freelancerProfile.upsert({
        where: { userId },
        update: {
          headline: input.headline?.trim(),
          bio: input.bio?.trim(),
          hourlyRateCents: input.hourlyRateCents,
          currency: input.currency ?? "USD",
          availability: input.availability,
          experienceLevel: input.experienceLevel,
        },
        create: {
          userId,
          headline: input.headline?.trim(),
          bio: input.bio?.trim(),
          hourlyRateCents: input.hourlyRateCents ?? 5000,
          currency: input.currency ?? "USD",
          availability: input.availability ?? "AVAILABLE",
          experienceLevel: input.experienceLevel ?? "INTERMEDIATE",
        },
      });

      if (input.skillIds && Array.isArray(input.skillIds)) {
        // Replace existing skills
        await tx.freelancerSkill.deleteMany({
          where: { freelancerId: userId },
        });

        if (input.skillIds.length > 0) {
          await tx.freelancerSkill.createMany({
            data: input.skillIds.map((skillId) => ({
              freelancerId: userId,
              skillId,
            })),
          });
        }
      }

      return updated;
    });
  }

  /**
   * Retrieves a client profile by user ID.
   */
  static async getClientProfile(userId: string) {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            country: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError("PROFILE_NOT_FOUND", "Client profile not found.", HTTP_STATUS.NOT_FOUND);
    }

    return profile;
  }

  /**
   * Updates a client profile.
   */
  static async updateClientProfile(userId: string, input: UpdateClientInput) {
    return prisma.$transaction(async (tx) => {
      if (input.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: input.name.trim() },
        });
      }

      return tx.clientProfile.upsert({
        where: { userId },
        update: {
          companyName: input.companyName?.trim(),
          website: input.website?.trim(),
        },
        create: {
          userId,
          companyName: input.companyName?.trim() ?? "My Company",
          website: input.website?.trim(),
        },
      });
    });
  }

  /**
   * Adds a portfolio item for a freelancer.
   */
  static async addPortfolioItem(userId: string, input: AddPortfolioItemInput) {
    return prisma.portfolioItem.create({
      data: {
        freelancerId: userId,
        title: input.title.trim(),
        description: input.description?.trim(),
        url: input.url?.trim(),
      },
    });
  }

  /**
   * Deletes a portfolio item.
   */
  static async deletePortfolioItem(userId: string, itemId: string) {
    const item = await prisma.portfolioItem.findFirst({
      where: { id: itemId, freelancerId: userId },
    });

    if (!item) {
      throw new AppError("ITEM_NOT_FOUND", "Portfolio item not found.", HTTP_STATUS.NOT_FOUND);
    }

    await prisma.portfolioItem.delete({
      where: { id: itemId },
    });

    return true;
  }
}

