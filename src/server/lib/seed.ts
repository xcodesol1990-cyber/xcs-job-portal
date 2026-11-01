import { prisma } from "@/server/db/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import argon2 from "argon2";

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "WorkNestDemo!2026";

interface CategorySeedDef {
  name: string;
  slug: string;
  children?: Array<{ name: string; slug: string }>;
}

const CATEGORY_TAXONOMY: CategorySeedDef[] = [
  {
    name: "Engineering & Architecture",
    slug: "engineering-architecture",
    children: [
      { name: "Full-Stack Web Development", slug: "full-stack-web-development" },
      { name: "Frontend Development", slug: "frontend-development" },
      { name: "Backend Development & APIs", slug: "backend-development-apis" },
      { name: "Mobile Development (iOS & Android)", slug: "mobile-development" },
      { name: "Cloud Infrastructure & DevOps", slug: "cloud-devops" },
      { name: "AI, Machine Learning & LLMs", slug: "ai-ml-llms" },
      { name: "Database Engineering & Architecture", slug: "database-engineering" },
      { name: "Cybersecurity & SecOps", slug: "cybersecurity-secops" },
      { name: "Blockchain & Smart Contracts", slug: "blockchain-smart-contracts" },
      { name: "QA Automation & Testing", slug: "qa-automation-testing" },
      { name: "Embedded Systems & IoT", slug: "embedded-systems-iot" },
    ],
  },
  {
    name: "Design & Creative Direction",
    slug: "design-creative",
    children: [
      { name: "UI/UX & Product Design", slug: "ui-ux-product-design" },
      { name: "Design Systems & Component Libraries", slug: "design-systems" },
      { name: "Brand Identity & Visual Design", slug: "brand-identity" },
      { name: "3D Modeling & Motion Graphics", slug: "3d-motion-graphics" },
      { name: "User Research & Usability Testing", slug: "user-research" },
      { name: "Mobile App UI/UX", slug: "mobile-app-design" },
      { name: "Web & Landing Page Design", slug: "web-landing-page-design" },
      { name: "Illustration & Graphic Arts", slug: "illustration-graphic-arts" },
    ],
  },
  {
    name: "Product & Project Management",
    slug: "product-management",
    children: [
      { name: "Technical Product Management (TPM)", slug: "technical-product-management" },
      { name: "Agile Scrum & Delivery Coaching", slug: "agile-scrum-coaching" },
      { name: "Fractional CTO & Tech Advisory", slug: "fractional-cto" },
      { name: "Product Discovery & Strategy", slug: "product-strategy" },
      { name: "Product Operations & Metrics", slug: "product-operations" },
    ],
  },
  {
    name: "Data Science & AI Analytics",
    slug: "data-science-ai",
    children: [
      { name: "Machine Learning Engineering", slug: "machine-learning-engineering" },
      { name: "Data Engineering & ETL Pipelines", slug: "data-engineering-etl" },
      { name: "Business Intelligence & Dashboards", slug: "business-intelligence" },
      { name: "NLP & Conversational AI", slug: "nlp-conversational-ai" },
      { name: "Computer Vision & Image Processing", slug: "computer-vision" },
      { name: "Predictive Analytics & Statistics", slug: "predictive-analytics" },
    ],
  },
  {
    name: "Growth, Marketing & SEO",
    slug: "growth-marketing-seo",
    children: [
      { name: "Technical SEO & Web Performance", slug: "technical-seo" },
      { name: "Performance Marketing & Paid Media", slug: "performance-marketing" },
      { name: "Content Strategy & Technical Copywriting", slug: "content-strategy" },
      { name: "Developer Relations (DevRel)", slug: "devrel" },
      { name: "Conversion Rate Optimization (CRO)", slug: "conversion-rate-optimization" },
      { name: "Email Automation & Lifecycle", slug: "email-lifecycle-automation" },
    ],
  },
  {
    name: "Writing & Technical Documentation",
    slug: "writing-translation",
    children: [
      { name: "API Documentation & Developer Guides", slug: "api-documentation" },
      { name: "Technical Whitepapers & Reports", slug: "technical-whitepapers" },
      { name: "UX Writing & Microcopy", slug: "ux-writing" },
      { name: "Localization & Technical Translation", slug: "localization-translation" },
    ],
  },
  {
    name: "Finance, Legal & Operations",
    slug: "finance-operations",
    children: [
      { name: "FinTech Compliance & Regulatory", slug: "fintech-compliance" },
      { name: "Financial Modeling & Valuation", slug: "financial-modeling" },
      { name: "Contract Engineering & IP Protection", slug: "contract-engineering" },
      { name: "Workflow Automation & No-Code Ops", slug: "workflow-automation" },
    ],
  },
  {
    name: "Support & Customer Experience",
    slug: "support-customer-experience",
    children: [
      { name: "Technical Customer Support (L2/L3)", slug: "technical-customer-support" },
      { name: "Customer Success & Onboarding", slug: "customer-success-onboarding" },
    ],
  },
];

// Flat fallback/legacy categories for backwards compatibility
const LEGACY_CATEGORIES = [
  { name: "Web Development", slug: "web-development" },
  { name: "Design", slug: "design" },
  { name: "Writing", slug: "writing" },
  { name: "Marketing", slug: "marketing" },
  { name: "Data Science", slug: "data-science" },
  { name: "Admin Support", slug: "admin-support" },
];

const SKILLS = [
  // Languages & Core Runtimes
  { name: "TypeScript", slug: "typescript" },
  { name: "JavaScript", slug: "javascript" },
  { name: "Python", slug: "python" },
  { name: "Go (Golang)", slug: "golang" },
  { name: "Rust", slug: "rust" },
  { name: "Java", slug: "java" },
  { name: "Kotlin", slug: "kotlin" },
  { name: "Swift", slug: "swift" },
  { name: "C++", slug: "cpp" },
  { name: "C#", slug: "csharp" },
  { name: "PHP", slug: "php" },
  { name: "Ruby", slug: "ruby" },
  { name: "SQL", slug: "sql" },
  { name: "Solidity", slug: "solidity" },
  { name: "HTML5", slug: "html5" },
  { name: "CSS3", slug: "css3" },

  // Frontend Frameworks & Libraries
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextjs" },
  { name: "Vue.js", slug: "vuejs" },
  { name: "Nuxt.js", slug: "nuxtjs" },
  { name: "Svelte", slug: "svelte" },
  { name: "SvelteKit", slug: "sveltekit" },
  { name: "Angular", slug: "angular" },
  { name: "Remix", slug: "remix" },
  { name: "Astro", slug: "astro" },
  { name: "Tailwind CSS", slug: "tailwindcss" },
  { name: "Radix UI", slug: "radix-ui" },
  { name: "Shadcn UI", slug: "shadcn-ui" },
  { name: "Framer Motion", slug: "framer-motion" },
  { name: "Three.js", slug: "threejs" },
  { name: "Redux Toolkit", slug: "redux-toolkit" },
  { name: "Zustand", slug: "zustand" },
  { name: "TanStack Query", slug: "tanstack-query" },
  { name: "TanStack Table", slug: "tanstack-table" },
  { name: "WebSockets", slug: "websockets" },
  { name: "WebRTC", slug: "webrtc" },
  { name: "PWA (Progressive Web Apps)", slug: "pwa" },

  // Backend, Frameworks & APIs
  { name: "Node.js", slug: "nodejs" },
  { name: "Express", slug: "express" },
  { name: "NestJS", slug: "nestjs" },
  { name: "FastAPI", slug: "fastapi" },
  { name: "Django", slug: "django" },
  { name: "Flask", slug: "flask" },
  { name: "Ruby on Rails", slug: "rails" },
  { name: "Spring Boot", slug: "spring-boot" },
  { name: "ASP.NET Core", slug: "aspnet-core" },
  { name: "Laravel", slug: "laravel" },
  { name: "GraphQL", slug: "graphql" },
  { name: "REST APIs", slug: "rest-apis" },
  { name: "gRPC", slug: "grpc" },
  { name: "Microservices", slug: "microservices" },
  { name: "Apache Kafka", slug: "apache-kafka" },
  { name: "RabbitMQ", slug: "rabbitmq" },
  { name: "Redis", slug: "redis" },
  { name: "Celery", slug: "celery" },
  { name: "BullMQ", slug: "bullmq" },
  { name: "Stripe API", slug: "stripe-api" },
  { name: "Stripe Connect", slug: "stripe-connect" },
  { name: "Payment Gateways", slug: "payment-gateways" },

  // Databases & ORMs
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "MySQL", slug: "mysql" },
  { name: "MongoDB", slug: "mongodb" },
  { name: "SQLite", slug: "sqlite" },
  { name: "Supabase", slug: "supabase" },
  { name: "Prisma", slug: "prisma" },
  { name: "Drizzle ORM", slug: "drizzle-orm" },
  { name: "TypeORM", slug: "typeorm" },
  { name: "Elasticsearch", slug: "elasticsearch" },
  { name: "DynamoDB", slug: "dynamodb" },
  { name: "ClickHouse", slug: "clickhouse" },
  { name: "Neo4j", slug: "neo4j" },
  { name: "CockroachDB", slug: "cockroachdb" },

  // Cloud, DevOps & Infrastructure
  { name: "AWS (Amazon Web Services)", slug: "aws" },
  { name: "Google Cloud Platform (GCP)", slug: "gcp" },
  { name: "Microsoft Azure", slug: "azure" },
  { name: "Docker", slug: "docker" },
  { name: "Kubernetes", slug: "kubernetes" },
  { name: "Terraform", slug: "terraform" },
  { name: "GitHub Actions", slug: "github-actions" },
  { name: "GitLab CI", slug: "gitlab-ci" },
  { name: "Vercel", slug: "vercel" },
  { name: "Cloudflare Workers", slug: "cloudflare-workers" },
  { name: "Linux Server Admin", slug: "linux-admin" },
  { name: "Nginx", slug: "nginx" },
  { name: "Prometheus", slug: "prometheus" },
  { name: "Grafana", slug: "grafana" },
  { name: "Datadog", slug: "datadog" },
  { name: "CI/CD Pipelines", slug: "ci-cd-pipelines" },

  // Mobile Engineering
  { name: "React Native", slug: "react-native" },
  { name: "Flutter", slug: "flutter" },
  { name: "iOS Development", slug: "ios-development" },
  { name: "Android Development", slug: "android-development" },
  { name: "SwiftUI", slug: "swiftui" },
  { name: "Jetpack Compose", slug: "jetpack-compose" },
  { name: "Expo", slug: "expo" },

  // AI, ML & LLMs
  { name: "PyTorch", slug: "pytorch" },
  { name: "TensorFlow", slug: "tensorflow" },
  { name: "OpenAI API", slug: "openai-api" },
  { name: "Anthropic Claude API", slug: "claude-api" },
  { name: "Google Gemini API", slug: "gemini-api" },
  { name: "LangChain", slug: "langchain" },
  { name: "LlamaIndex", slug: "llamaindex" },
  { name: "Hugging Face", slug: "hugging-face" },
  { name: "RAG Architecture", slug: "rag-architecture" },
  { name: "Vector Databases", slug: "vector-databases" },
  { name: "Pinecone", slug: "pinecone" },
  { name: "Prompt Engineering", slug: "prompt-engineering" },
  { name: "Pandas", slug: "pandas" },
  { name: "Scikit-Learn", slug: "scikit-learn" },
  { name: "Snowflake", slug: "snowflake" },
  { name: "Databricks", slug: "databricks" },
  { name: "BigQuery", slug: "bigquery" },

  // UI/UX & Design
  { name: "Figma", slug: "figma" },
  { name: "UI Design", slug: "ui-design" },
  { name: "UX Research", slug: "ux-research" },
  { name: "Design Systems", slug: "design-systems-skill" },
  { name: "Interactive Prototyping", slug: "interactive-prototyping" },
  { name: "Adobe Illustrator", slug: "adobe-illustrator" },
  { name: "Adobe Photoshop", slug: "adobe-photoshop" },
  { name: "Blender 3D", slug: "blender-3d" },
  { name: "Motion Graphics", slug: "motion-graphics" },
  { name: "Accessibility (WCAG 2.1)", slug: "accessibility-wcag" },
  { name: "Responsive Web Design", slug: "responsive-web-design" },

  // QA, Testing & Security
  { name: "Vitest", slug: "vitest" },
  { name: "Jest", slug: "jest" },
  { name: "Playwright", slug: "playwright" },
  { name: "Cypress", slug: "cypress" },
  { name: "Unit Testing", slug: "unit-testing" },
  { name: "Integration Testing", slug: "integration-testing" },
  { name: "End-to-End (E2E) Testing", slug: "e2e-testing" },
  { name: "Penetration Testing", slug: "penetration-testing" },
  { name: "SOC 2 Compliance", slug: "soc-2" },
  { name: "OAuth 2.0 & OIDC", slug: "oauth2" },

  // Product, Growth & Marketing
  { name: "Agile Scrum", slug: "agile-scrum" },
  { name: "Kanban", slug: "kanban" },
  { name: "Jira", slug: "jira" },
  { name: "Linear", slug: "linear" },
  { name: "Technical Writing", slug: "technical-writing" },
  { name: "Copywriting", slug: "copywriting" },
  { name: "SEO (Search Engine Optimization)", slug: "seo" },
  { name: "Core Web Vitals", slug: "core-web-vitals" },
  { name: "Conversion Rate Optimization (CRO)", slug: "cro" },
  { name: "PostHog", slug: "posthog" },
  { name: "Mixpanel", slug: "mixpanel" },
  { name: "Google Analytics 4", slug: "ga4" },
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
  let categoriesCount = 0;

  // 1. Seed Parent Categories & Child Subcategories
  for (const parentDef of CATEGORY_TAXONOMY) {
    const parent = await prisma.category.upsert({
      where: { slug: parentDef.slug },
      update: { name: parentDef.name, parentId: null },
      create: { name: parentDef.name, slug: parentDef.slug, parentId: null },
    });
    categoriesCount++;

    if (parentDef.children && parentDef.children.length > 0) {
      for (const childDef of parentDef.children) {
        await prisma.category.upsert({
          where: { slug: childDef.slug },
          update: { name: childDef.name, parentId: parent.id },
          create: { name: childDef.name, slug: childDef.slug, parentId: parent.id },
        });
        categoriesCount++;
      }
    }
  }

  // 1b. Upsert legacy categories
  for (const legacy of LEGACY_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: legacy.slug },
      update: { name: legacy.name },
      create: { name: legacy.name, slug: legacy.slug },
    });
    categoriesCount++;
  }

  // 2. Seed Skills
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

  // Client Profiles with Enhanced Fields
  await prisma.clientProfile.upsert({
    where: { userId: client1.id },
    update: {
      companyName: "Vanguard Digital Lab",
      website: "https://vanguarddigital.io",
      companySize: "11-50 (Series A)",
      industry: "Fintech & Payments",
      about: "Engineering verifiable escrow contracts and dual-persona talent marketplaces.",
      linkedinUrl: "https://linkedin.com/company/vanguarddigital",
    },
    create: {
      userId: client1.id,
      companyName: "Vanguard Digital Lab",
      website: "https://vanguarddigital.io",
      companySize: "11-50 (Series A)",
      industry: "Fintech & Payments",
      about: "Engineering verifiable escrow contracts and dual-persona talent marketplaces.",
      linkedinUrl: "https://linkedin.com/company/vanguarddigital",
      paymentVerified: true,
    },
  });

  await prisma.clientProfile.upsert({
    where: { userId: client2.id },
    update: {
      companyName: "Acme Cloud Technologies",
      website: "https://acmecloud.dev",
      companySize: "51-200 (Series B)",
      industry: "SaaS & Developer Tools",
      about: "Next-generation developer productivity platforms and real-time infrastructure.",
      linkedinUrl: "https://linkedin.com/company/acmecloud",
    },
    create: {
      userId: client2.id,
      companyName: "Acme Cloud Technologies",
      website: "https://acmecloud.dev",
      companySize: "51-200 (Series B)",
      industry: "SaaS & Developer Tools",
      about: "Next-generation developer productivity platforms and real-time infrastructure.",
      linkedinUrl: "https://linkedin.com/company/acmecloud",
      paymentVerified: true,
    },
  });

  // Freelancer Profiles with Enhanced Fields and Custom Tags
  await prisma.freelancerProfile.upsert({
    where: { userId: freelancer1.id },
    update: {
      headline: "Senior Full-Stack & Escrow Architect",
      bio: "10+ years architecting high-throughput distributed applications with Next.js 15, TypeScript, PostgreSQL, and Stripe Connect.",
      hourlyRateCents: 9500,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
      yearsOfExperience: 8,
      englishProficiency: "NATIVE",
      tags: [
        "microservices",
        "fintech",
        "stripe-connect",
        "nextjs15",
        "escrow-protocol",
        "high-throughput",
      ],
      githubUrl: "https://github.com/noah-freelancer",
      linkedinUrl: "https://linkedin.com/in/noah-freelancer",
      websiteUrl: "https://noah-engineer.dev",
    },
    create: {
      userId: freelancer1.id,
      headline: "Senior Full-Stack & Escrow Architect",
      bio: "10+ years architecting high-throughput distributed applications with Next.js 15, TypeScript, PostgreSQL, and Stripe Connect.",
      hourlyRateCents: 9500,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
      yearsOfExperience: 8,
      englishProficiency: "NATIVE",
      tags: [
        "microservices",
        "fintech",
        "stripe-connect",
        "nextjs15",
        "escrow-protocol",
        "high-throughput",
      ],
      githubUrl: "https://github.com/noah-freelancer",
      linkedinUrl: "https://linkedin.com/in/noah-freelancer",
      websiteUrl: "https://noah-engineer.dev",
    },
  });

  await prisma.freelancerProfile.upsert({
    where: { userId: freelancer2.id },
    update: {
      headline: "Staff UI/UX & Design Systems Engineer",
      bio: "Specializing in design systems, accessible Figma tokens, Tailwind CSS v4, and web animation with Framer Motion.",
      hourlyRateCents: 11000,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
      yearsOfExperience: 7,
      englishProficiency: "FLUENT",
      tags: [
        "design-systems",
        "figma-tokens",
        "tailwind-v4",
        "framer-motion",
        "wcag-accessibility",
      ],
      githubUrl: "https://github.com/alex-rivera-design",
      linkedinUrl: "https://linkedin.com/in/alexrivera-ux",
      websiteUrl: "https://alexrivera.design",
    },
    create: {
      userId: freelancer2.id,
      headline: "Staff UI/UX & Design Systems Engineer",
      bio: "Specializing in design systems, accessible Figma tokens, Tailwind CSS v4, and web animation with Framer Motion.",
      hourlyRateCents: 11000,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
      yearsOfExperience: 7,
      englishProficiency: "FLUENT",
      tags: [
        "design-systems",
        "figma-tokens",
        "tailwind-v4",
        "framer-motion",
        "wcag-accessibility",
      ],
      githubUrl: "https://github.com/alex-rivera-design",
      linkedinUrl: "https://linkedin.com/in/alexrivera-ux",
      websiteUrl: "https://alexrivera.design",
    },
  });

  // Attach key skills to freelancers
  const seededSkills = await prisma.skill.findMany();
  const skillMap = new Map(seededSkills.map((s) => [s.slug, s.id]));

  const freelancer1Skills = [
    "typescript",
    "nextjs",
    "react",
    "postgresql",
    "nodejs",
    "microservices",
  ];
  for (const sSlug of freelancer1Skills) {
    const sId = skillMap.get(sSlug);
    if (sId) {
      await prisma.freelancerSkill.upsert({
        where: { freelancerId_skillId: { freelancerId: freelancer1.id, skillId: sId } },
        update: {},
        create: { freelancerId: freelancer1.id, skillId: sId },
      });
    }
  }

  const freelancer2Skills = ["figma", "ui-design", "ux-research", "tailwindcss", "react"];
  for (const sSlug of freelancer2Skills) {
    const sId = skillMap.get(sSlug);
    if (sId) {
      await prisma.freelancerSkill.upsert({
        where: { freelancerId_skillId: { freelancerId: freelancer2.id, skillId: sId } },
        update: {},
        create: { freelancerId: freelancer2.id, skillId: sId },
      });
    }
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
        categoriesCount,
        skillsCount: SKILLS.length,
      },
    },
  });

  return {
    categoriesSeeded: categoriesCount,
    skillsSeeded: SKILLS.length,
    seededUsers: [admin.email, client1.email, client2.email, freelancer1.email, freelancer2.email],
  };
}
