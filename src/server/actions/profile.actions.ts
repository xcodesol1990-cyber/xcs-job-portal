"use server";

import { auth } from "@/server/lib/auth";
import { ProfileService } from "@/server/services/profile.service";
import { revalidatePath } from "next/cache";

export interface ProfileActionResult {
  success: boolean;
  error?: string;
}

export async function updateFreelancerProfileAction(
  prevState: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const name = formData.get("name")?.toString();
  const headline = formData.get("headline")?.toString();
  const bio = formData.get("bio")?.toString();
  const hourlyRateDollars = Number(formData.get("hourlyRate"));
  const experienceLevel = formData.get("experienceLevel")?.toString();
  const availability = formData.get("availability")?.toString();
  const githubUrl = formData.get("githubUrl")?.toString();
  const linkedinUrl = formData.get("linkedinUrl")?.toString();
  const websiteUrl = formData.get("websiteUrl")?.toString();
  const yearsOfExperienceRaw = formData.get("yearsOfExperience")?.toString();
  const yearsOfExperience =
    yearsOfExperienceRaw && !isNaN(Number(yearsOfExperienceRaw))
      ? Number(yearsOfExperienceRaw)
      : undefined;
  const englishProficiency = formData.get("englishProficiency")?.toString();

  // Extract tags from form data (supports multiple fields or comma-separated string)
  const rawTags = formData.getAll("tags");
  let tags: string[] = [];
  if (rawTags.length > 0) {
    tags = rawTags
      .flatMap((t) => t.toString().split(","))
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const skillIds = formData
    .getAll("skillIds")
    .map(Number)
    .filter((id) => !isNaN(id));

  try {
    await ProfileService.updateFreelancerProfile(session.user.id, {
      name,
      headline,
      bio,
      hourlyRateCents: !isNaN(hourlyRateDollars) ? Math.round(hourlyRateDollars * 100) : undefined,
      experienceLevel,
      availability,
      tags,
      githubUrl,
      linkedinUrl,
      websiteUrl,
      yearsOfExperience,
      englishProficiency,
      skillIds,
    });

    revalidatePath("/freelancer/profile");
    revalidatePath("/freelancer");
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to update profile." };
  }
}

export async function updateClientProfileAction(
  prevState: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const name = formData.get("name")?.toString();
  const companyName = formData.get("companyName")?.toString();
  const website = formData.get("website")?.toString();
  const companySize = formData.get("companySize")?.toString();
  const industry = formData.get("industry")?.toString();
  const about = formData.get("about")?.toString();
  const linkedinUrl = formData.get("linkedinUrl")?.toString();

  try {
    await ProfileService.updateClientProfile(session.user.id, {
      name,
      companyName,
      website,
      companySize,
      industry,
      about,
      linkedinUrl,
    });

    revalidatePath("/client/profile");
    revalidatePath("/client");
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to update company profile." };
  }
}

export async function addPortfolioItemAction(
  prevState: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const url = formData.get("url")?.toString();

  if (!title) {
    return { success: false, error: "Title is required." };
  }

  try {
    await ProfileService.addPortfolioItem(session.user.id, {
      title,
      description,
      url,
    });

    revalidatePath("/freelancer/profile");
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to add portfolio item." };
  }
}

export async function deletePortfolioItemAction(itemId: string): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await ProfileService.deletePortfolioItem(session.user.id, itemId);
    revalidatePath("/freelancer/profile");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete item." };
  }
}
