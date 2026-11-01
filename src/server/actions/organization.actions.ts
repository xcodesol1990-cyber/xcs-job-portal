"use server";

import { auth } from "@/server/lib/auth";
import { OrganizationService } from "@/server/services/organization.service";

export async function getOrganizationAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const org = await OrganizationService.getOrganization(session.user.id);
    return { success: true, org };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load organization settings.",
    };
  }
}

export async function inviteTeamMemberAction(email: string, role: "MANAGER" | "AUDITOR") {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const result = await OrganizationService.inviteMember(session.user.id, email, role);
    return { success: true, result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to invite team member.",
    };
  }
}

export async function getConsolidatedInvoicesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const report = await OrganizationService.getConsolidatedLedgerReport(session.user.id);
    return { success: true, report };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load consolidated invoices.",
    };
  }
}
