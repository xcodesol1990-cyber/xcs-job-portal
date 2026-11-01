export interface AiScopeResult {
  title: string;
  description: string;
  suggestedCategory: string;
  suggestedBudgetMin: number;
  suggestedBudgetMax: number;
  budgetType: "FIXED" | "HOURLY";
  experienceLevel: "ENTRY" | "INTERMEDIATE" | "EXPERT";
  duration: string;
  suggestedSkills: string[];
  milestones: Array<{
    title: string;
    description: string;
    percentage: number;
    duration: string;
    acceptanceCriteria: string[];
  }>;
}

export class AiService {
  /**
   * Intelligently decomposes a high-level project prompt into a structured scope,
   * realistic budget range, taxonomy tags, and actionable milestone deliverables.
   */
  static async decomposeScope(
    rawPrompt: string,
    availableCategories: string[] = [],
    availableSkills: string[] = [],
  ): Promise<AiScopeResult> {
    const prompt = rawPrompt.trim();
    if (!prompt || prompt.length < 5) {
      throw new Error("Please provide a prompt of at least 5 characters to analyze.");
    }

    // Check if an external Gemini API key is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const result = await this.callGeminiApi(
          prompt,
          availableCategories,
          availableSkills,
          geminiKey,
        );
        if (result) return result;
      } catch (err) {
        // Fallback to domain engine
        console.warn("Gemini API call failed, falling back to built-in AI Scoping Engine:", err);
      }
    }

    return this.generateHeuristicScope(prompt, availableCategories, availableSkills);
  }

  /**
   * Calls Google Gemini Generative AI API with structured schema output
   */
  private static async callGeminiApi(
    prompt: string,
    categories: string[],
    skills: string[],
    apiKey: string,
  ): Promise<AiScopeResult | null> {
    const systemPrompt = `You are an elite enterprise software architect and technical project manager on WorkNest.
Analyze the user's project requirements and decompose them into an industry-grade freelance contract scope with concrete milestone deliverables.
Available Categories: ${categories.join(", ") || "Web Development, Mobile Development, Design, Writing, Marketing, Data Science"}
Available Skills: ${skills.join(", ") || "TypeScript, React, Next.js, PostgreSQL, Node.js, Python, Figma, UI Design, SEO"}

Return pure JSON matching this exact structure:
{
  "title": "Clear, compelling job title",
  "description": "Comprehensive markdown description including Overview, Objectives, Technical Requirements, and Deliverable Standards",
  "suggestedCategory": "Exact match from available categories or best fit",
  "suggestedBudgetMin": 500,
  "suggestedBudgetMax": 2500,
  "budgetType": "FIXED",
  "experienceLevel": "INTERMEDIATE",
  "duration": "1 to 3 months",
  "suggestedSkills": ["TypeScript", "Next.js"],
  "milestones": [
    {
      "title": "Milestone 1 Name",
      "description": "Detailed deliverables and scope",
      "percentage": 30,
      "duration": "2 weeks",
      "acceptanceCriteria": ["Criteria 1", "Criteria 2"]
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nClient Project Brief:\n${prompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return JSON.parse(text) as AiScopeResult;
  }

  /**
   * Built-in Deterministic AI Scoping Engine:
   * Extracts keywords, identifies domain archetypes, calculates market budgets, and decomposes milestones.
   */
  static generateHeuristicScope(
    prompt: string,
    categories: string[],
    availableSkills: string[] = [],
  ): AiScopeResult {
    const lower = prompt.toLowerCase();

    // 1. Identify Domain Archetype using boundary-safe regex
    const hasWord = (word: string) => new RegExp(`\\b${word}\\b`, "i").test(lower);
    const isMobile =
      hasWord("mobile") ||
      hasWord("ios") ||
      hasWord("android") ||
      lower.includes("react native") ||
      hasWord("flutter");
    const isDesign =
      hasWord("design") ||
      hasWord("figma") ||
      hasWord("ui") ||
      hasWord("ux") ||
      hasWord("brand") ||
      hasWord("wireframe");
    const isData =
      hasWord("data") ||
      hasWord("ai") ||
      lower.includes("machine learning") ||
      hasWord("python") ||
      hasWord("analytics");

    // 2. Determine Category
    let category = "Web Development";
    if (isMobile) category = "Mobile Development";
    else if (isDesign) category = "Design";
    else if (isData) category = "Data Science";

    const matchedCat =
      categories.find((c) => c.toLowerCase() === category.toLowerCase()) ??
      categories[0] ??
      category;

    // 3. Matched Skills
    const detectedSkills: string[] = [];
    const skillKeywords: Record<string, string[]> = {
      "Next.js": ["next", "next.js", "nextjs", "app router", "server actions"],
      React: ["react", "react.js", "frontend", "spa"],
      TypeScript: ["typescript", "ts", "typed"],
      PostgreSQL: ["postgres", "postgresql", "sql", "database", "prisma"],
      "Node.js": ["node", "nodejs", "backend", "express", "api"],
      Python: ["python", "django", "fastapi", "flask"],
      Figma: ["figma", "prototype", "wireframe", "mockup"],
      "UI Design": ["ui", "ux", "design system", "interface", "tailwind"],
    };

    for (const [skillName, kws] of Object.entries(skillKeywords)) {
      if (kws.some((k) => lower.includes(k))) {
        detectedSkills.push(skillName);
      }
    }

    if (detectedSkills.length === 0) {
      if (isDesign) detectedSkills.push("Figma", "UI Design");
      else if (isMobile) detectedSkills.push("React", "TypeScript");
      else detectedSkills.push("TypeScript", "React", "Next.js", "PostgreSQL");
    }

    const finalSkills =
      availableSkills.length > 0
        ? detectedSkills.filter((ds) =>
            availableSkills.some((as) => as.toLowerCase() === ds.toLowerCase()),
          )
        : detectedSkills;

    // 4. Generate Professional Title
    let title = prompt;
    if (prompt.length < 40) {
      if (isDesign) title = `UI/UX Design & Figma System for ${prompt}`;
      else if (isMobile) title = `Cross-Platform Mobile Application: ${prompt}`;
      else title = `Production Engineering: ${prompt}`;
    }

    // 5. Calculate Budget & Complexity
    let budgetMin = 800;
    let budgetMax = 2500;
    let duration = "2 to 4 weeks";
    let level: "ENTRY" | "INTERMEDIATE" | "EXPERT" = "INTERMEDIATE";

    if (
      lower.includes("enterprise") ||
      lower.includes("scale") ||
      lower.includes("complex") ||
      lower.includes("saas")
    ) {
      budgetMin = 3000;
      budgetMax = 7500;
      duration = "1 to 3 months";
      level = "EXPERT";
    } else if (lower.includes("mvp") || lower.includes("prototype") || lower.includes("simple")) {
      budgetMin = 600;
      budgetMax = 1800;
      duration = "2 to 3 weeks";
      level = "INTERMEDIATE";
    }

    // 6. Generate Milestone Decompositions
    const milestones = [
      {
        title: "Phase 1: Architecture, Data Modeling & Foundation",
        description:
          "Configure repository structure, schema models, authentication flow, and core design tokens.",
        percentage: 30,
        duration: "1 week",
        acceptanceCriteria: [
          "Complete architectural setup and schema migration deployment",
          "Environment configuration and security checks passing",
          "Initial responsive scaffolding preview accessible",
        ],
      },
      {
        title: "Phase 2: Core Domain Logic & Interactive Workflows",
        description:
          "Implement primary user journeys, state machines, API integrations, and validation logic.",
        percentage: 45,
        duration: "2 weeks",
        acceptanceCriteria: [
          "All primary screens fully wired with backend services",
          "Zero critical edge-case errors across key user journeys",
          "Clean automated tests passing on GitHub Actions",
        ],
      },
      {
        title: "Phase 3: QA Polish, Performance Audit & Launch Sign-Off",
        description:
          "End-to-end stress testing, responsive fine-tuning, security review, and production deployment.",
        percentage: 25,
        duration: "1 week",
        acceptanceCriteria: [
          "Zero console errors and Lighthouse accessibility score > 90",
          "Complete documentation and deployment runbook delivered",
          "Production smoke test verified and accepted by client",
        ],
      },
    ];

    const description = `### 🎯 Project Overview & Objective
${prompt}

### 📋 Technical Scope of Work
- **Domain Focus:** ${category} with production-grade reliability and security.
- **Key Deliverables:** Milestone-based implementation adhering to verifiable acceptance criteria.
- **Architectural Standards:** Clean modular code, strict typing, responsive UI, and automated tests.

### 🛡️ Quality & Verification Requirements
1. Clean commit history and documentation.
2. Verified unit test passes prior to each milestone escrow release.
3. Zero tolerance for unhandled exceptions or data integrity drift.`;

    return {
      title,
      description,
      suggestedCategory: matchedCat,
      suggestedBudgetMin: budgetMin,
      suggestedBudgetMax: budgetMax,
      budgetType: "FIXED",
      experienceLevel: level,
      duration,
      suggestedSkills: finalSkills,
      milestones,
    };
  }
}
