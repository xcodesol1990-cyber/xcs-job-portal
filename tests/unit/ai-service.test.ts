import { describe, it, expect } from "vitest";
import { AiService } from "@/server/services/ai.service";

describe("AiService", () => {
  it("rejects prompt that is too short", async () => {
    await expect(AiService.decomposeScope("abc")).rejects.toThrow(
      "Please provide a prompt of at least 5 characters to analyze.",
    );
  });

  it("decomposes a web development prompt with milestones and skills", async () => {
    const result = await AiService.decomposeScope(
      "Build a modern SaaS subscription portal with Next.js, Stripe, and Postgres",
      ["Web Development", "Mobile Development", "Design"],
      ["TypeScript", "React", "Next.js", "PostgreSQL"],
    );

    expect(result.suggestedCategory).toBe("Web Development");
    expect(result.suggestedSkills).toContain("Next.js");
    expect(result.suggestedSkills).toContain("PostgreSQL");
    expect(result.milestones.length).toBeGreaterThanOrEqual(3);
    expect(result.suggestedBudgetMin).toBeGreaterThanOrEqual(800);
    expect(result.budgetType).toBe("FIXED");
  });

  it("decomposes a mobile app prompt into mobile development category", async () => {
    const result = await AiService.decomposeScope(
      "Create an iOS and Android mobile app for pet tracking with React Native",
      ["Web Development", "Mobile Development", "Design"],
      ["React", "TypeScript", "Figma"],
    );

    expect(result.suggestedCategory).toBe("Mobile Development");
    expect(result.milestones.length).toBe(3);
    expect(result.milestones[0].acceptanceCriteria.length).toBeGreaterThan(0);
  });

  it("decomposes an enterprise project with elevated budget and expert tier", async () => {
    const result = await AiService.decomposeScope(
      "Enterprise fintech platform with high scale security and microservices",
      ["Web Development", "Data Science"],
      ["TypeScript", "Node.js", "PostgreSQL"],
    );

    expect(result.experienceLevel).toBe("EXPERT");
    expect(result.suggestedBudgetMin).toBeGreaterThanOrEqual(3000);
    expect(result.suggestedBudgetMax).toBeGreaterThanOrEqual(7500);
  });
});
