import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileService } from "@/server/services/profile.service";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    $transaction: vi.fn((callback) =>
      callback({
        user: { update: vi.fn() },
        freelancerProfile: { upsert: vi.fn() },
        freelancerSkill: { deleteMany: vi.fn(), createMany: vi.fn() },
        clientProfile: { upsert: vi.fn() },
      }),
    ),
    freelancerProfile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    clientProfile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    category: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    skill: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("ProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing freelancer profile when found", async () => {
    const mockProfile = {
      id: "f-1",
      userId: "user-1",
      headline: "Senior React Engineer",
      hourlyRateCents: 8500,
      skills: [],
      portfolioItems: [],
      user: { id: "user-1", name: "Jane Dev" },
    };

    (
      vi.mocked(prisma.freelancerProfile.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockProfile);

    const profile = await ProfileService.getFreelancerProfile("user-1");
    expect(profile.headline).toBe("Senior React Engineer");
    expect(prisma.freelancerProfile.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } }),
    );
  });

  it("auto-provisions freelancer profile if not yet created for an existing user", async () => {
    (vi.mocked(prisma.freelancerProfile.findUnique) as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "f-auto",
        userId: "user-new",
        headline: "Freelance Specialist",
        skills: [],
        portfolioItems: [],
        user: { id: "user-new", name: "New User" },
      });

    (
      vi.mocked(prisma.user.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "user-new",
      name: "New User",
    });

    const profile = await ProfileService.getFreelancerProfile("user-new");
    expect(prisma.freelancerProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-new" },
      }),
    );
    expect(profile.headline).toBe("Freelance Specialist");
  });

  it("throws PROFILE_NOT_FOUND when user does not exist in database", async () => {
    (
      vi.mocked(prisma.freelancerProfile.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(null);
    (
      vi.mocked(prisma.user.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(null);

    await expect(ProfileService.getFreelancerProfile("non-existent-user")).rejects.toThrow(
      "Freelancer profile not found.",
    );
  });

  it("auto-provisions client profile if not yet created for an existing user", async () => {
    (vi.mocked(prisma.clientProfile.findUnique) as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "c-auto",
        userId: "client-new",
        companyName: "Acme Corp",
        paymentVerified: false,
        user: { id: "client-new", name: "Acme" },
      });

    (
      vi.mocked(prisma.user.findUnique) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce({
      id: "client-new",
      name: "Acme",
    });

    const profile = await ProfileService.getClientProfile("client-new");
    expect(prisma.clientProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "client-new" },
      }),
    );
    expect(profile.companyName).toBe("Acme Corp");
  });

  it("creates a new category with generated slug", async () => {
    const mockCreated = { id: 10, name: "AI Agents", slug: "ai-agents", parentId: null };
    (
      vi.mocked(prisma.category.create) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockCreated);

    const result = await ProfileService.createCategory("AI Agents");
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        name: "AI Agents",
        slug: "ai-agents",
        parentId: null,
      },
    });
    expect(result.slug).toBe("ai-agents");
  });

  it("creates a new skill with normalized slug", async () => {
    const mockSkill = { id: 50, name: "Next.js 15", slug: "next-js-15" };
    (vi.mocked(prisma.skill.create) as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockSkill,
    );

    const result = await ProfileService.createSkill("Next.js 15");
    expect(prisma.skill.create).toHaveBeenCalledWith({
      data: {
        name: "Next.js 15",
        slug: "next-js-15",
      },
    });
    expect(result.name).toBe("Next.js 15");
  });

  it("filters and lists freelancers with search criteria", async () => {
    const mockList = [
      {
        userId: "fl-1",
        headline: "Principal DevOps Engineer",
        hourlyRateCents: 12000,
        user: { id: "fl-1", name: "DevOps Pro", country: "US" },
        skills: [{ skill: { id: 1, name: "Kubernetes" } }],
        _count: { portfolioItems: 3 },
      },
    ];

    (
      vi.mocked(prisma.freelancerProfile.findMany) as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockList);

    const result = await ProfileService.listFreelancers({
      query: "Kubernetes",
      maxRateDollars: 150,
      limit: 10,
    });

    expect(prisma.freelancerProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 11,
        where: expect.objectContaining({
          hourlyRateCents: { lte: 15000 },
        }),
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].headline).toBe("Principal DevOps Engineer");
  });
});
