"use server";

import { auth } from "@/server/lib/auth";
import { JobService } from "@/server/services/job.service";
import { VALIDATION_RULES } from "@/server/lib/validation-rules";
import { revalidatePath } from "next/cache";
import { JobStatus } from "@prisma/client";

export interface JobActionResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

export async function createJobAction(
  prevState: JobActionResult | null,
  formData: FormData,
): Promise<JobActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in to post a job." };
  }

  const rawTitle = formData.get("title")?.toString()?.trim() ?? "";
  const rawDescription = formData.get("description")?.toString()?.trim() ?? "";
  const categoryId = Number(formData.get("categoryId"));
  const budgetType = formData.get("budgetType")?.toString() as "FIXED" | "HOURLY";
  const budgetMin = Number(formData.get("budgetMin"));
  const budgetMax = Number(formData.get("budgetMax"));
  const experienceLevel = formData.get("experienceLevel")?.toString();
  const duration = formData.get("duration")?.toString();
  const scope = formData.get("scope")?.toString();
  const timeCommitment = formData.get("timeCommitment")?.toString();
  const deliverables = formData.get("deliverables")?.toString()?.trim();

  const rawQuestions = formData.getAll("screeningQuestions");
  const screeningQuestions: string[] = rawQuestions
    .flatMap((q) => q.toString().split("\n"))
    .map((q) => q.trim())
    .filter(Boolean);

  const skillIds = formData
    .getAll("skillIds")
    .map(Number)
    .filter((id) => !isNaN(id));

  // --- Strict Field Validation with Standard Character Limits ---
  if (!rawTitle) {
    return { success: false, error: "Job title is required." };
  }
  if (
    rawTitle.length < VALIDATION_RULES.JOB.TITLE_MIN ||
    rawTitle.length > VALIDATION_RULES.JOB.TITLE_MAX
  ) {
    return {
      success: false,
      error: `Job title must be between ${VALIDATION_RULES.JOB.TITLE_MIN} and ${VALIDATION_RULES.JOB.TITLE_MAX} characters (currently ${rawTitle.length}).`,
    };
  }

  if (!rawDescription) {
    return { success: false, error: "Job description is required." };
  }
  if (
    rawDescription.length < VALIDATION_RULES.JOB.DESCRIPTION_MIN ||
    rawDescription.length > VALIDATION_RULES.JOB.DESCRIPTION_MAX
  ) {
    return {
      success: false,
      error: `Job description must be between ${VALIDATION_RULES.JOB.DESCRIPTION_MIN} and ${VALIDATION_RULES.JOB.DESCRIPTION_MAX.toLocaleString()} characters (currently ${rawDescription.length}).`,
    };
  }

  if (deliverables && deliverables.length > VALIDATION_RULES.JOB.DELIVERABLES_MAX) {
    return {
      success: false,
      error: `Milestone deliverables must not exceed ${VALIDATION_RULES.JOB.DELIVERABLES_MAX.toLocaleString()} characters.`,
    };
  }

  if (!categoryId || isNaN(categoryId)) {
    return { success: false, error: "Please select a valid job industry category." };
  }

  if (budgetType !== "FIXED" && budgetType !== "HOURLY") {
    return { success: false, error: "Please choose a valid budget type (Fixed Price or Hourly)." };
  }

  if (isNaN(budgetMin) || budgetMin < VALIDATION_RULES.JOB.BUDGET_MIN) {
    return {
      success: false,
      error: `Minimum budget must be at least $${VALIDATION_RULES.JOB.BUDGET_MIN}.`,
    };
  }

  if (isNaN(budgetMax) || budgetMax < budgetMin) {
    return {
      success: false,
      error: "Maximum budget must be greater than or equal to minimum budget.",
    };
  }

  if (budgetMax > VALIDATION_RULES.JOB.BUDGET_MAX) {
    return {
      success: false,
      error: `Budget cannot exceed $${VALIDATION_RULES.JOB.BUDGET_MAX.toLocaleString()}.`,
    };
  }

  if (skillIds.length === 0) {
    return { success: false, error: "Please select at least 1 required technology skill." };
  }

  for (const [i, q] of screeningQuestions.entries()) {
    if (
      q.length < VALIDATION_RULES.JOB.SCREENING_QUESTION_MIN ||
      q.length > VALIDATION_RULES.JOB.SCREENING_QUESTION_MAX
    ) {
      return {
        success: false,
        error: `Screening question #${i + 1} must be between ${VALIDATION_RULES.JOB.SCREENING_QUESTION_MIN} and ${VALIDATION_RULES.JOB.SCREENING_QUESTION_MAX} characters.`,
      };
    }
  }

  try {
    const job = await JobService.createJob(session.user.id, {
      title: rawTitle,
      description: rawDescription,
      categoryId,
      budgetType,
      budgetMinCents: Math.round(budgetMin * 100),
      budgetMaxCents: Math.round(budgetMax * 100),
      experienceLevel,
      duration,
      scope,
      timeCommitment,
      deliverables,
      screeningQuestions,
      skillIds,
    });

    revalidatePath("/jobs");
    revalidatePath("/client");
    revalidatePath("/client/jobs");

    return { success: true, jobId: job.id };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to create job posting." };
  }
}

export async function deleteJobAction(jobId: string): Promise<JobActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await JobService.deleteJob(session.user.id, jobId);
    revalidatePath("/jobs");
    revalidatePath("/client");
    revalidatePath("/client/jobs");
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to delete job." };
  }
}

export async function updateJobStatusAction(
  jobId: string,
  status: JobStatus,
): Promise<JobActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await JobService.updateJobStatus(session.user.id, jobId, status);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/client");
    revalidatePath("/client/jobs");
    return { success: true, jobId };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to update job status." };
  }
}

export async function toggleSaveJobAction(
  jobId: string,
): Promise<{ success: boolean; saved?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to save this job." };
  }

  try {
    const res = await JobService.toggleSaveJob(session.user.id, jobId);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);
    return { success: true, saved: res.saved };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to save job." };
  }
}

export async function reportJobAction(
  jobId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to report this listing." };
  }

  try {
    await JobService.reportJob(session.user.id, jobId, reason);
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to report job." };
  }
}
