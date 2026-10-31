"use server";

import { auth } from "@/server/lib/auth";
import { JobService } from "@/server/services/job.service";
import { revalidatePath } from "next/cache";

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

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const categoryId = Number(formData.get("categoryId"));
  const budgetType = formData.get("budgetType")?.toString() as "FIXED" | "HOURLY";
  const budgetMin = Number(formData.get("budgetMin"));
  const budgetMax = Number(formData.get("budgetMax"));
  const experienceLevel = formData.get("experienceLevel")?.toString();
  const duration = formData.get("duration")?.toString();
  const skillIds = formData.getAll("skillIds").map(Number).filter((id) => !isNaN(id));

  if (!title || !description || !budgetType) {
    return { success: false, error: "Please fill in all required job fields." };
  }

  try {
    const job = await JobService.createJob(session.user.id, {
      title,
      description,
      categoryId: !isNaN(categoryId) ? categoryId : undefined,
      budgetType,
      budgetMinCents: !isNaN(budgetMin) && budgetMin > 0 ? Math.round(budgetMin * 100) : undefined,
      budgetMaxCents: !isNaN(budgetMax) && budgetMax > 0 ? Math.round(budgetMax * 100) : undefined,
      experienceLevel,
      duration,
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

