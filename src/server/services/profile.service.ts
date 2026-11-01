import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { Prisma, UserStatus } from "@prisma/client";

export interface UpdateFreelancerInput {
  name?: string;
  headline?: string;
  bio?: string;
  hourlyRateCents?: number;
  currency?: string;
  availability?: string;
  experienceLevel?: string;
  tags?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  yearsOfExperience?: number;
  englishProficiency?: string;
  skillIds?: number[];
}

export interface UpdateClientInput {
  name?: string;
  companyName?: string;
  website?: string;
  companySize?: string;
  industry?: string;
  about?: string;
  linkedinUrl?: string;
}

export interface AddPortfolioItemInput {
  title: string;
  description?: string;
  url?: string;
}

export class ProfileService {
  /**
   * Retrieves all categories (with hierarchy) and skills for taxonomy navigation, pickers, and filters.
   */
  static async getTaxonomy() {
    const [categories, skills] = await Promise.all([
      prisma.category.findMany({
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          children: { select: { id: true, name: true, slug: true } },
          _count: { select: { jobs: true } },
        },
        orderBy: [{ parentId: "asc" }, { name: "asc" }],
      }),
      prisma.skill.findMany({
        include: {
          _count: { select: { jobSkills: true, freelancerSkills: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return { categories, skills };
  }

  /**
   * Retrieves a freelancer profile by user ID.
   * If the profile record doesn't exist yet for an existing user, it auto-provisions a default profile.
   */
  static async getFreelancerProfile(userId: string) {
    let profile = await prisma.freelancerProfile.findUnique({
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
      // Check if user exists in the database
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError(
          "PROFILE_NOT_FOUND",
          "Freelancer profile not found.",
          HTTP_STATUS.NOT_FOUND,
        );
      }

      // Auto-provision default freelancer profile for existing user
      await prisma.freelancerProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          headline: "Freelance Specialist",
          bio: "",
          hourlyRateCents: 5000,
          currency: "USD",
          availability: "AVAILABLE",
          experienceLevel: "Intermediate",
          tags: [],
        },
      });

      profile = await prisma.freelancerProfile.findUnique({
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
    }

    if (!profile) {
      throw new AppError(
        "PROFILE_NOT_FOUND",
        "Freelancer profile not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return profile;
  }

  /**
   * Updates a freelancer profile including tags, links, and expertise metrics.
   */
  static async updateFreelancerProfile(userId: string, input: UpdateFreelancerInput) {
    return prisma.$transaction(async (tx) => {
      if (input.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: input.name.trim() },
        });
      }

      const cleanTags = input.tags
        ? Array.from(new Set(input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)))
        : undefined;

      const updated = await tx.freelancerProfile.upsert({
        where: { userId },
        update: {
          headline: input.headline?.trim(),
          bio: input.bio?.trim(),
          hourlyRateCents: input.hourlyRateCents,
          currency: input.currency ?? "USD",
          availability: input.availability,
          experienceLevel: input.experienceLevel,
          ...(cleanTags !== undefined && { tags: cleanTags }),
          githubUrl: input.githubUrl !== undefined ? input.githubUrl?.trim() || null : undefined,
          linkedinUrl:
            input.linkedinUrl !== undefined ? input.linkedinUrl?.trim() || null : undefined,
          websiteUrl: input.websiteUrl !== undefined ? input.websiteUrl?.trim() || null : undefined,
          yearsOfExperience:
            input.yearsOfExperience !== undefined ? input.yearsOfExperience : undefined,
          englishProficiency:
            input.englishProficiency !== undefined ? input.englishProficiency : undefined,
        },
        create: {
          userId,
          headline: input.headline?.trim(),
          bio: input.bio?.trim(),
          hourlyRateCents: input.hourlyRateCents ?? 5000,
          currency: input.currency ?? "USD",
          availability: input.availability ?? "AVAILABLE",
          experienceLevel: input.experienceLevel ?? "INTERMEDIATE",
          tags: cleanTags ?? [],
          githubUrl: input.githubUrl?.trim() || null,
          linkedinUrl: input.linkedinUrl?.trim() || null,
          websiteUrl: input.websiteUrl?.trim() || null,
          yearsOfExperience: input.yearsOfExperience ?? null,
          englishProficiency: input.englishProficiency ?? "FLUENT",
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
   * If the profile record doesn't exist yet for an existing user, it auto-provisions a default profile.
   */
  static async getClientProfile(userId: string) {
    let profile = await prisma.clientProfile.findUnique({
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
      // Check if user exists in the database
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError("PROFILE_NOT_FOUND", "Client profile not found.", HTTP_STATUS.NOT_FOUND);
      }

      // Auto-provision default client profile for existing user
      await prisma.clientProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          companyName: user.name ? `${user.name}'s Organization` : "Enterprise Client",
          website: "",
          paymentVerified: false,
        },
      });

      profile = await prisma.clientProfile.findUnique({
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
    }

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

      const updated = await tx.clientProfile.upsert({
        where: { userId },
        update: {
          companyName: input.companyName?.trim(),
          website: input.website?.trim(),
          companySize: input.companySize?.trim(),
          industry: input.industry?.trim(),
          about: input.about?.trim(),
          linkedinUrl: input.linkedinUrl?.trim(),
        },
        create: {
          userId,
          companyName: input.companyName?.trim() ?? "My Organization",
          website: input.website?.trim(),
          companySize: input.companySize?.trim(),
          industry: input.industry?.trim(),
          about: input.about?.trim(),
          linkedinUrl: input.linkedinUrl?.trim(),
        },
      });

      return updated;
    });
  }

  /**
   * Adds a portfolio project for a freelancer.
   */
  static async addPortfolioItem(freelancerId: string, input: AddPortfolioItemInput) {
    return prisma.portfolioItem.create({
      data: {
        freelancerId,
        title: input.title.trim(),
        description: input.description?.trim(),
        url: input.url?.trim(),
      },
    });
  }

  /**
   * Removes a portfolio project.
   */
  static async deletePortfolioItem(freelancerId: string, itemId: string) {
    const item = await prisma.portfolioItem.findFirst({
      where: {
        id: itemId,
        freelancerId,
      },
    });

    if (!item) {
      throw new AppError(
        "ITEM_NOT_FOUND",
        "Portfolio item not found or unauthorized.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return prisma.portfolioItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Creates a new Category (Admin functionality).
   */
  static async createCategory(name: string, slug?: string, parentId?: number | null) {
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      throw new AppError(
        "INVALID_NAME",
        "Category name must be at least 2 characters.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    const cleanSlug =
      slug?.trim() ||
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return prisma.category.create({
      data: {
        name: cleanName,
        slug: cleanSlug,
        parentId: parentId ?? null,
      },
    });
  }

  /**
   * Deletes a category (Admin functionality).
   */
  static async deleteCategory(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { jobs: true, children: true } },
      },
    });

    if (!category) {
      throw new AppError("CATEGORY_NOT_FOUND", "Category not found.", HTTP_STATUS.NOT_FOUND);
    }

    if (category._count.jobs > 0) {
      throw new AppError(
        "CATEGORY_IN_USE",
        `Cannot delete category: it is assigned to ${category._count.jobs} job postings.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    return prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Creates a new Skill (Admin functionality).
   */
  static async createSkill(name: string, slug?: string) {
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      throw new AppError(
        "INVALID_NAME",
        "Skill name must be at least 2 characters.",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    const cleanSlug =
      slug?.trim() ||
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return prisma.skill.create({
      data: {
        name: cleanName,
        slug: cleanSlug,
      },
    });
  }

  /**
   * Deletes a skill (Admin functionality).
   */
  static async deleteSkill(id: number) {
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        _count: { select: { jobSkills: true, freelancerSkills: true } },
      },
    });

    if (!skill) {
      throw new AppError("SKILL_NOT_FOUND", "Skill not found.", HTTP_STATUS.NOT_FOUND);
    }

    return prisma.skill.delete({
      where: { id },
    });
  }

  /**
   * Search and filter freelancer profiles with keyword matching, skill filtering, rate bounds, and pagination.
   */
  static async listFreelancers(params: {
    query?: string;
    skillId?: number;
    experienceLevel?: string;
    maxRateDollars?: number;
    availability?: string;
    limit?: number;
    cursor?: string;
  }) {
    const limit = params.limit ?? 12;
    const where: Prisma.FreelancerProfileWhereInput = {
      user: {
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
    };

    if (params.query) {
      const q = params.query.trim();
      where.OR = [
        { headline: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { tags: { has: q } },
      ];
    }

    if (params.skillId) {
      where.skills = {
        some: {
          skillId: params.skillId,
        },
      };
    }

    if (params.experienceLevel) {
      where.experienceLevel = params.experienceLevel;
    }

    if (params.maxRateDollars) {
      where.hourlyRateCents = {
        lte: params.maxRateDollars * 100,
      };
    }

    if (params.availability) {
      where.availability = params.availability;
    }

    const items = await prisma.freelancerProfile.findMany({
      where,
      take: limit + 1,
      cursor: params.cursor ? { userId: params.cursor } : undefined,
      orderBy: [{ totalEarnedCents: "desc" }, { createdAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            country: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            portfolioItems: true,
          },
        },
      },
    });

    let nextCursor: string | undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem?.userId;
    }

    return {
      items,
      nextCursor,
    };
  }
}
