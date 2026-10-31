import { seedDatabase } from "../src/server/lib/seed";
import { prisma } from "../src/server/db/prisma";

async function main() {
  console.log("Starting WorkNest database seed...");
  const result = await seedDatabase();
  console.log("Database seeded successfully:", result);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Seed error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
