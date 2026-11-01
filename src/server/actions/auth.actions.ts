"use server";

import { AuthService } from "@/server/services/auth.service";
import { signIn, signOut } from "@/server/lib/auth";
import { AuthError } from "next-auth";

export interface ActionResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
  requiresTotp?: boolean;
}

export async function loginAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const totpCode = formData.get("totpCode")?.toString()?.trim();

  if (!email || !password) {
    return { success: false, error: "Please enter both email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      totpCode,
      redirect: false,
    });

    return {
      success: true,
      redirectUrl: "/dashboard",
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "REQUIRES_TOTP") {
      return {
        success: false,
        requiresTotp: true,
        error: "Two-factor authentication code required.",
      };
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: error.message || "Failed to sign in." };
      }
    }

    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }

    return { success: false, error: "An unexpected error occurred during sign in." };
  }
}

export async function registerAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();

  if (!name || !email || !password || !role) {
    return { success: false, error: "Please fill in all required fields." };
  }

  if (role !== "CLIENT" && role !== "FREELANCER") {
    return { success: false, error: "Please choose whether you want to hire or work." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  try {
    await AuthService.register({
      name,
      email,
      password,
      role,
    });

    // Auto sign-in after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
      redirectUrl: role === "CLIENT" ? "/client" : "/freelancer",
    };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Registration failed. Please try again." };
  }
}

export async function requestPasswordResetAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email")?.toString().trim();
  if (!email) {
    return { success: false, error: "Please enter your email address." };
  }

  try {
    await AuthService.requestPasswordReset(email);
    return {
      success: true,
      error: "If an account exists for this email, password reset instructions have been sent.",
    };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Could not process request." };
  }
}

export async function resetPasswordAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const token = formData.get("token")?.toString().trim();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!token) {
    return { success: false, error: "Missing or invalid reset token." };
  }
  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  try {
    await AuthService.resetPassword(token, password);
    return {
      success: true,
      redirectUrl: "/login?reset=success",
    };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to reset password." };
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
