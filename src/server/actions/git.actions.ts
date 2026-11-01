"use server";

import {
  GitVerifierService,
  GitDeliverableInspection,
} from "@/server/services/git-verifier.service";

export interface InspectGitArtifactResult {
  success: boolean;
  data?: GitDeliverableInspection;
  error?: string;
}

export async function inspectGitArtifactAction(url: string): Promise<InspectGitArtifactResult> {
  try {
    if (!url || typeof url !== "string") {
      return { success: false, error: "Please provide a valid repository or pull request URL." };
    }

    const data = await GitVerifierService.inspectArtifactUrl(url);
    if (!data.isValid) {
      return {
        success: false,
        error:
          "Unrecognized Git URL. Please provide a GitHub or GitLab Pull Request / repository URL.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify Git deliverable artifact.",
    };
  }
}
