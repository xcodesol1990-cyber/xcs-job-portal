import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

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

async function upsertUser(input: { email: string; name: string; roles: UserRole[] }) {
  const passwordHash = await argon2.hash(DEMO_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

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

async function main() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }

  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: { name: skill.name },
      create: skill,
    });
  }

  const admin = await upsertUser({
    email: "admin@worknest.dev",
    name: "WorkNest Admin",
    roles: [UserRole.ADMIN],
  });

  const client = await upsertUser({
    email: "client@worknest.dev",
    name: "Ava Client",
    roles: [UserRole.CLIENT],
  });

  const freelancer = await upsertUser({
    email: "freelancer@worknest.dev",
    name: "Noah Freelancer",
    roles: [UserRole.FREELANCER],
  });

  await prisma.clientProfile.upsert({
    where: { userId: client.id },
    update: { companyName: "Northwind Labs", website: "https://example.com" },
    create: {
      userId: client.id,
      companyName: "Northwind Labs",
      website: "https://example.com",
      paymentVerified: false,
    },
  });

  await prisma.freelancerProfile.upsert({
    where: { userId: freelancer.id },
    update: {
      headline: "Full-stack engineer for product teams",
      bio: "I build reliable web applications with TypeScript, Next.js, and PostgreSQL.",
      hourlyRateCents: 8500,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
    },
    create: {
      userId: freelancer.id,
      headline: "Full-stack engineer for product teams",
      bio: "I build reliable web applications with TypeScript, Next.js, and PostgreSQL.",
      hourlyRateCents: 8500,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
    },
  });

  await prisma.platformSetting.upsert({
    where: { key: "platform_fee_bps" },
    update: { value: 1000 },
    create: { key: "platform_fee_bps", value: 1000 },
  });

  await prisma.platformSetting.upsert({
    where: { key: "auto_approve_days" },
    update: { value: 7 },
    create: { key: "auto_approve_days", value: 7 },
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
      metadata: { users: [admin.email, client.email, freelancer.email] },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
