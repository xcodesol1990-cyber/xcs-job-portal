"use server";

import { AiService, AiScopeResult } from "@/server/services/ai.service";
import { prisma } from "@/server/db/prisma";

export interface DecomposeScopeResponse {
  success: boolean;
  result?: AiScopeResult;
  error?: string;
}

export async function decomposeScopeAction(prompt: string): Promise<DecomposeScopeResponse> {
  try {
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return {
        success: false,
        error: "Please enter a project brief of at least 5 characters.",
      };
    }

    const [categories, skills] = await Promise.all([
      prisma.category.findMany({ select: { name: true } }),
      prisma.skill.findMany({ select: { name: true } }),
    ]);

    const result = await AiService.decomposeScope(
      prompt,
      categories.map((c) => c.name),
      skills.map((s) => s.name),
    );

    return {
      success: true,
      result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze project brief with AI.",
    };
  }
}
