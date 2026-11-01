import { describe, expect, it } from "vitest";
import { JobService } from "@/server/services/job.service";
import { sanitizeHtml, stripHtml } from "@/server/lib/sanitize";

describe("job service & sanitization", () => {
  describe("sanitizeHtml", () => {
    it("strips script tags and inline javascript event handlers", () => {
      const malicious =
        '<p>Good text</p><script>alert("xss")</script><img src="x" onerror="stealCookies()">';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert");
      expect(clean).not.toContain("onerror");
      expect(clean).toContain("<p>Good text</p>");
    });

    it("strips all tags in stripHtml", () => {
      const html = "<h1>Title</h1><p>Body <strong>bold</strong></p>";
      expect(stripHtml(html)).toBe("TitleBody bold");
    });
  });

  describe("computeDedupeHash", () => {
    it("produces deterministic hashes for normalized text", () => {
      const hash1 = JobService.computeDedupeHash("Next.js Developer", "Build an app");
      const hash2 = JobService.computeDedupeHash("  next.js developer  ", "  build an app  ");

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });

    it("produces different hashes for different job postings", () => {
      const hash1 = JobService.computeDedupeHash("React Developer", "Build frontend");
      const hash2 = JobService.computeDedupeHash("Python Engineer", "Build backend");

      expect(hash1).not.toBe(hash2);
    });

    it("handles long job descriptions by sampling the first 500 characters", () => {
      const longDesc1 = "A".repeat(500) + "XYZ";
      const longDesc2 = "A".repeat(500) + "123";

      const hash1 = JobService.computeDedupeHash("Engineer", longDesc1);
      const hash2 = JobService.computeDedupeHash("Engineer", longDesc2);

      expect(hash1).toBe(hash2);
    });
  });
});
