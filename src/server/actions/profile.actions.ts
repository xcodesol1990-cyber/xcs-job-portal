"use server";

import { auth } from "@/server/lib/auth";
import { ProfileService } from "@/server/services/profile.service";
import { VALIDATION_RULES, isValidUrl } from "@/server/lib/validation-rules";
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

  const name = formData.get("name")?.toString()?.trim() ?? "";
  const headline = formData.get("headline")?.toString()?.trim() ?? "";
  const bio = formData.get("bio")?.toString()?.trim() ?? "";
  const hourlyRateDollars = Number(formData.get("hourlyRate"));
  const experienceLevel = formData.get("experienceLevel")?.toString();
  const availability = formData.get("availability")?.toString();
  const githubUrl = formData.get("githubUrl")?.toString()?.trim() ?? "";
  const linkedinUrl = formData.get("linkedinUrl")?.toString()?.trim() ?? "";
  const websiteUrl = formData.get("websiteUrl")?.toString()?.trim() ?? "";
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
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  const skillIds = formData
    .getAll("skillIds")
    .map(Number)
    .filter((id) => !isNaN(id));

  // --- Strict Validation with Standard Character Limits ---
  if (!name) {
    return { success: false, error: "Full legal name is required." };
  }
  if (
    name.length < VALIDATION_RULES.FREELANCER.NAME_MIN ||
    name.length > VALIDATION_RULES.FREELANCER.NAME_MAX
  ) {
    return {
      success: false,
      error: `Name must be between ${VALIDATION_RULES.FREELANCER.NAME_MIN} and ${VALIDATION_RULES.FREELANCER.NAME_MAX} characters.`,
    };
  }

  if (!headline) {
    return { success: false, error: "Professional headline is required." };
  }
  if (
    headline.length < VALIDATION_RULES.FREELANCER.HEADLINE_MIN ||
    headline.length > VALIDATION_RULES.FREELANCER.HEADLINE_MAX
  ) {
    return {
      success: false,
      error: `Professional headline must be between ${VALIDATION_RULES.FREELANCER.HEADLINE_MIN} and ${VALIDATION_RULES.FREELANCER.HEADLINE_MAX} characters.`,
    };
  }

  if (!bio) {
    return { success: false, error: "Biography & overview is required." };
  }
  if (
    bio.length < VALIDATION_RULES.FREELANCER.BIO_MIN ||
    bio.length > VALIDATION_RULES.FREELANCER.BIO_MAX
  ) {
    return {
      success: false,
      error: `Biography must be between ${VALIDATION_RULES.FREELANCER.BIO_MIN} and ${VALIDATION_RULES.FREELANCER.BIO_MAX.toLocaleString()} characters (currently ${bio.length}).`,
    };
  }

  if (
    isNaN(hourlyRateDollars) ||
    hourlyRateDollars < VALIDATION_RULES.FREELANCER.HOURLY_RATE_MIN ||
    hourlyRateDollars > VALIDATION_RULES.FREELANCER.HOURLY_RATE_MAX
  ) {
    return {
      success: false,
      error: `Hourly rate must be between $${VALIDATION_RULES.FREELANCER.HOURLY_RATE_MIN} and $${VALIDATION_RULES.FREELANCER.HOURLY_RATE_MAX} USD.`,
    };
  }

  if (
    yearsOfExperience !== undefined &&
    (yearsOfExperience < VALIDATION_RULES.FREELANCER.YEARS_EXP_MIN ||
      yearsOfExperience > VALIDATION_RULES.FREELANCER.YEARS_EXP_MAX)
  ) {
    return {
      success: false,
      error: `Years of experience must be between ${VALIDATION_RULES.FREELANCER.YEARS_EXP_MIN} and ${VALIDATION_RULES.FREELANCER.YEARS_EXP_MAX}.`,
    };
  }

  if (skillIds.length === 0) {
    return { success: false, error: "Please select at least 1 technology skill." };
  }

  if (tags.length > VALIDATION_RULES.FREELANCER.TAGS_MAX_COUNT) {
    return {
      success: false,
      error: `You can select up to ${VALIDATION_RULES.FREELANCER.TAGS_MAX_COUNT} specialization tags.`,
    };
  }

  for (const t of tags) {
    if (
      t.length < VALIDATION_RULES.FREELANCER.TAG_MIN ||
      t.length > VALIDATION_RULES.FREELANCER.TAG_MAX
    ) {
      return {
        success: false,
        error: `Tag "${t}" must be between ${VALIDATION_RULES.FREELANCER.TAG_MIN} and ${VALIDATION_RULES.FREELANCER.TAG_MAX} characters.`,
      };
    }
  }

  if (githubUrl && !isValidUrl(githubUrl)) {
    return { success: false, error: "Please provide a valid GitHub profile URL." };
  }
  if (linkedinUrl && !isValidUrl(linkedinUrl)) {
    return { success: false, error: "Please provide a valid LinkedIn profile URL." };
  }
  if (websiteUrl && !isValidUrl(websiteUrl)) {
    return { success: false, error: "Please provide a valid portfolio or personal website URL." };
  }

  try {
    await ProfileService.updateFreelancerProfile(session.user.id, {
      name,
      headline,
      bio,
      hourlyRateCents: Math.round(hourlyRateDollars * 100),
      experienceLevel,
      availability,
      tags,
      githubUrl: githubUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
      websiteUrl: websiteUrl || undefined,
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

  const name = formData.get("name")?.toString()?.trim() ?? "";
  const companyName = formData.get("companyName")?.toString()?.trim() ?? "";
  const website = formData.get("website")?.toString()?.trim() ?? "";
  const companySize = formData.get("companySize")?.toString();
  const industry = formData.get("industry")?.toString();
  const about = formData.get("about")?.toString()?.trim() ?? "";
  const linkedinUrl = formData.get("linkedinUrl")?.toString()?.trim() ?? "";

  // Validation
  if (!name) {
    return { success: false, error: "Contact name is required." };
  }
  if (name.length < VALIDATION_RULES.CLIENT.COMPANY_NAME_MIN) {
    return { success: false, error: "Contact name must be at least 2 characters." };
  }

  if (!companyName) {
    return { success: false, error: "Company or organization name is required." };
  }
  if (
    companyName.length < VALIDATION_RULES.CLIENT.COMPANY_NAME_MIN ||
    companyName.length > VALIDATION_RULES.CLIENT.COMPANY_NAME_MAX
  ) {
    return {
      success: false,
      error: `Company name must be between ${VALIDATION_RULES.CLIENT.COMPANY_NAME_MIN} and ${VALIDATION_RULES.CLIENT.COMPANY_NAME_MAX} characters.`,
    };
  }

  if (about && about.length > VALIDATION_RULES.CLIENT.ABOUT_MAX) {
    return {
      success: false,
      error: `Company overview must not exceed ${VALIDATION_RULES.CLIENT.ABOUT_MAX.toLocaleString()} characters.`,
    };
  }

  if (website && !isValidUrl(website)) {
    return { success: false, error: "Please enter a valid website URL." };
  }
  if (linkedinUrl && !isValidUrl(linkedinUrl)) {
    return { success: false, error: "Please enter a valid LinkedIn URL." };
  }

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
