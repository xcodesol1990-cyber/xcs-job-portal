import { describe, it, expect } from "vitest";

describe("Command Palette & Unified Persona Routing", () => {
  const COMMAND_ITEMS = [
    {
      id: "nav-client",
      title: "Client Workspace",
      category: "Navigation",
      href: "/client",
      keywords: ["client", "hire", "jobs"],
    },
    {
      id: "nav-freelancer",
      title: "Freelancer Hub",
      category: "Navigation",
      href: "/freelancer",
      keywords: ["freelancer", "proposals", "earnings"],
    },
    {
      id: "action-post-job",
      title: "Post a New Job",
      category: "Actions",
      href: "/client/jobs/new",
      keywords: ["post", "new", "job"],
    },
    {
      id: "action-browse-jobs",
      title: "Browse Available Jobs",
      category: "Actions",
      href: "/jobs",
      keywords: ["browse", "find", "search"],
    },
    {
      id: "nav-messages",
      title: "Messages & Huddles",
      category: "Navigation",
      href: "/messages",
      keywords: ["messages", "chat", "inbox"],
    },
    {
      id: "action-payouts",
      title: "Earnings & Stripe Payouts",
      category: "Actions",
      href: "/freelancer/payouts",
      keywords: ["payouts", "stripe", "earnings"],
    },
  ];

  it("filters command items matching title search queries", () => {
    const query = "job";
    const filtered = COMMAND_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.keywords.some((k) => k.includes(query)),
    );

    expect(filtered.map((f) => f.id)).toContain("action-post-job");
    expect(filtered.map((f) => f.id)).toContain("action-browse-jobs");
  });

  it("matches keywords across categories for rapid navigation", () => {
    const query = "stripe";
    const filtered = COMMAND_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.keywords.some((k) => k.includes(query)),
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].href).toBe("/freelancer/payouts");
  });

  it("determines active persona mode based on route path", () => {
    const getPersona = (pathname: string) => {
      if (pathname.startsWith("/client")) return "CLIENT";
      if (pathname.startsWith("/freelancer")) return "FREELANCER";
      return "NEUTRAL";
    };

    expect(getPersona("/client/jobs/new")).toBe("CLIENT");
    expect(getPersona("/freelancer/proposals")).toBe("FREELANCER");
    expect(getPersona("/messages")).toBe("NEUTRAL");
  });
});
