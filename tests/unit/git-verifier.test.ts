import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GitVerifierService } from "@/server/services/git-verifier.service";

describe("GitVerifierService", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          title: "Fix hydration warning in layout",
          state: "open",
          merged: false,
          additions: 120,
          deletions: 15,
          changed_files: 3,
          mergeable_state: "clean",
          head: { sha: "a1b2c3d4e5f6" },
        }),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects empty or blank artifact URLs", async () => {
    const result = await GitVerifierService.inspectArtifactUrl("");
    expect(result.isValid).toBe(false);
  });

  it("inspects a GitHub Pull Request URL with extracted owner, repo, and PR number", async () => {
    const result = await GitVerifierService.inspectArtifactUrl(
      "https://github.com/facebook/react/pull/28000",
    );

    expect(result.isValid).toBe(true);
    expect(result.provider).toBe("github");
    expect(result.type).toBe("pull_request");
    expect(result.owner).toBe("facebook");
    expect(result.repo).toBe("react");
    expect(result.number).toBe(28000);
    expect(result.ciStatus).toBe("PASSED");
  });

  it("inspects a GitHub commit URL with commit hash", async () => {
    const result = await GitVerifierService.inspectArtifactUrl(
      "https://github.com/vercel/next.js/commit/7a8b9c0d1e2f",
    );

    expect(result.isValid).toBe(true);
    expect(result.provider).toBe("github");
    expect(result.type).toBe("commit");
    expect(result.commitHash).toBe("7a8b9c0");
  });

  it("inspects a GitLab merge request URL", async () => {
    const result = await GitVerifierService.inspectArtifactUrl(
      "https://gitlab.com/gitlab-org/gitlab/-/merge_requests/12345",
    );

    expect(result.isValid).toBe(true);
    expect(result.provider).toBe("gitlab");
    expect(result.type).toBe("pull_request");
    expect(result.number).toBe(12345);
  });
});
