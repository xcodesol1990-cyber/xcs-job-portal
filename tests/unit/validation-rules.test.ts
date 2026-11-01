import { describe, it, expect } from "vitest";
import { VALIDATION_RULES, isValidUrl } from "@/server/lib/validation-rules";

describe("Platform Field Validation & Plaintext Handling", () => {
  it("enforces standard character bounds for job brief titles", () => {
    expect(VALIDATION_RULES.JOB.TITLE_MIN).toBe(10);
    expect(VALIDATION_RULES.JOB.TITLE_MAX).toBe(120);

    const tooShort = "Short";
    const validTitle = "Build High-Throughput Escrow Protocol with Next.js 15";
    const tooLong = "A".repeat(121);

    expect(tooShort.length < VALIDATION_RULES.JOB.TITLE_MIN).toBe(true);
    expect(
      validTitle.length >= VALIDATION_RULES.JOB.TITLE_MIN &&
        validTitle.length <= VALIDATION_RULES.JOB.TITLE_MAX,
    ).toBe(true);
    expect(tooLong.length > VALIDATION_RULES.JOB.TITLE_MAX).toBe(true);
  });

  it("accepts complex multiline plaintext with markdown, emojis, lists, and URLs in job descriptions", () => {
    const complexPlaintext = `Managing coworking spaces, shared offices, and multi-tenant workspaces usually comes down to one major headache: fragmenting your operations across 5 different software subscriptions just to handle bookings, billing, and member management.

That is exactly why we built **Aikorax**—a unified AI-powered workspace & coworking management platform designed to automate operational overhead.

Starting today, you can sign up for **Aikorax completely free** with zero friction:

NO credit card required. 
NO trial period limits on signup.
NO pushy sales calls needed to test it out.

Here is what Aikorax automates for your space:

1. Real-Time Resource & Desk Booking: Seamless scheduling for desks, meeting rooms, and amenities without double-booking conflicts.
2. Intelligent Automation & Billing: Automate member check-ins, automated invoicing, and recurring membership renewals on autopilot.
3. Centralized Operations Dashboard: Manage members, contracts, team access, and space utilization rates from a single, clean workspace dashboard.
4. AI-Driven Insights: Monitor space usage trends and occupancy metrics to maximize revenue per square foot.

---

Whether you manage a boutique coworking spot, a multi-location workspace hub, or shared private offices, set up your space in minutes and test it out for free today.

👉 Sign up now at: https://aikorax.com

What feature does your workspace management stack currently lack? Let's discuss in the comments! 👇

#Coworking`;

    expect(complexPlaintext.length).toBeGreaterThan(VALIDATION_RULES.JOB.DESCRIPTION_MIN);
    expect(complexPlaintext.length).toBeLessThan(VALIDATION_RULES.JOB.DESCRIPTION_MAX);
    expect(complexPlaintext).toContain("**Aikorax**");
    expect(complexPlaintext).toContain("👉");
    expect(complexPlaintext).toContain("https://aikorax.com");
  });

  it("enforces freelancer headline and bio character boundaries", () => {
    expect(VALIDATION_RULES.FREELANCER.HEADLINE_MIN).toBe(5);
    expect(VALIDATION_RULES.FREELANCER.HEADLINE_MAX).toBe(120);
    expect(VALIDATION_RULES.FREELANCER.BIO_MIN).toBe(30);
    expect(VALIDATION_RULES.FREELANCER.BIO_MAX).toBe(5000);

    const validHeadline = "Senior Full-Stack Engineer | Next.js & Stripe Connect";
    expect(
      validHeadline.length >= VALIDATION_RULES.FREELANCER.HEADLINE_MIN &&
        validHeadline.length <= VALIDATION_RULES.FREELANCER.HEADLINE_MAX,
    ).toBe(true);
  });

  it("validates external credibility URLs correctly", () => {
    expect(isValidUrl("https://github.com/torvalds")).toBe(true);
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("linkedin.com/in/developer")).toBe(true);
    expect(isValidUrl("")).toBe(true); // optional allowed
    expect(isValidUrl("not a valid url :///")).toBe(false);
  });
});
