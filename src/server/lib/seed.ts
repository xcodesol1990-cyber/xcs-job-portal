import { prisma } from "@/server/db/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import argon2 from "argon2";

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "WorkNestDemo!2026";

const CATEGORIES = [
  { name: "Web Development", slug: "web-development" },
  { name: "Mobile Development", slug: "mobile-development" },
  { name: "Design", slug: "design" },
  { name: "Writing", slug: "writing" },
  { name: "Marketing", slug: "marketing" },
  { name: "Data Science", slug: "data-science" },
  { name: "Admin Support", slug: "admin-support" },
];

const SKILLS = [
  { name: "TypeScript", slug: "typescript" },
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextjs" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Figma", slug: "figma" },
  { name: "Copywriting", slug: "copywriting" },
  { name: "SEO", slug: "seo" },
  { name: "Python", slug: "python" },
  { name: "Node.js", slug: "nodejs" },
  { name: "UI Design", slug: "ui-design" },
];

async function hashPassword(pwd: string) {
  return argon2.hash(pwd, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function seedDatabase() {
  // 1. Categories
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  // 2. Skills
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: { name: skill.name },
      create: skill,
    });
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  // Helper to upsert user
  async function upsertDemoUser(input: { email: string; name: string; roles: UserRole[] }) {
    return prisma.user.upsert({
      where: { email: input.email },
      update: {
        name: input.name,
        roles: input.roles,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        passwordHash,
        deletedAt: null,
      },
      create: {
        email: input.email,
        name: input.name,
        roles: input.roles,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        passwordHash,
        timezone: "UTC",
        country: "US",
      },
    });
  }

  // 3. Demo Personas
  const admin = await upsertDemoUser({
    email: "admin@worknest.dev",
    name: "WorkNest Admin",
    roles: [UserRole.ADMIN],
  });

  const client1 = await upsertDemoUser({
    email: "client@worknest.dev",
    name: "Ava Client",
    roles: [UserRole.CLIENT],
  });

  const client2 = await upsertDemoUser({
    email: "client.acme@worknest.dev",
    name: "Acme Technologies",
    roles: [UserRole.CLIENT],
  });

  const freelancer1 = await upsertDemoUser({
    email: "freelancer@worknest.dev",
    name: "Noah Freelancer",
    roles: [UserRole.FREELANCER],
  });

  const freelancer2 = await upsertDemoUser({
    email: "freelancer.alex@worknest.dev",
    name: "Alex Rivera",
    roles: [UserRole.FREELANCER],
  });

  // Client Profiles
  for (const cli of [client1, client2]) {
    await prisma.clientProfile.upsert({
      where: { userId: cli.id },
      update: { companyName: cli.name, website: "https://example.com" },
      create: {
        userId: cli.id,
        companyName: cli.name,
        website: "https://example.com",
        paymentVerified: true,
      },
    });
  }

  // Freelancer Profiles
  for (const free of [freelancer1, freelancer2]) {
    await prisma.freelancerProfile.upsert({
      where: { userId: free.id },
      update: {
        headline: "Senior Full-Stack Engineer",
        bio: "Specializing in Next.js, TypeScript, PostgreSQL, and scalable web architectures.",
        hourlyRateCents: 9500,
        currency: "USD",
        availability: "AVAILABLE",
        experienceLevel: "EXPERT",
      },
      create: {
        userId: free.id,
        headline: "Senior Full-Stack Engineer",
        bio: "Specializing in Next.js, TypeScript, PostgreSQL, and scalable web architectures.",
        hourlyRateCents: 9500,
        currency: "USD",
        availability: "AVAILABLE",
        experienceLevel: "EXPERT",
      },
    });
  }

  // Platform Settings
  await prisma.platformSetting.upsert({
    where: { key: "platform_fee_bps" },
    update: { value: 1000 },
    create: { key: "platform_fee_bps", value: 1000 },
  });

  await prisma.platformSetting.upsert({
    where: { key: "auto_approve_days" },
    update: { value: 14 },
    create: { key: "auto_approve_days", value: 14 },
  });

  await prisma.platformSetting.upsert({
    where: { key: "unfunded_contract_cancel_days" },
    update: { value: 7 },
    create: { key: "unfunded_contract_cancel_days", value: 7 },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_COMPLETED",
      entityType: "platform",
      metadata: {
        users: [admin.email, client1.email, client2.email, freelancer1.email, freelancer2.email],
      },
    },
  });

  return {
    categoriesSeeded: CATEGORIES.length,
    skillsSeeded: SKILLS.length,
    seededUsers: [admin.email, client1.email, client2.email, freelancer1.email, freelancer2.email],
  };
}
