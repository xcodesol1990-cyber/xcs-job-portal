import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { ProfileService } from "@/server/services/profile.service";
import { OrganizationService } from "@/server/services/organization.service";
import { ClientProfileForm } from "@/components/forms/client-profile-form";
import { OrganizationTeamCard } from "@/components/forms/organization-team-card";
import { ProfileCompletenessCard } from "@/components/ui/profile-completeness-card";
import { Building, ShieldCheck, Users } from "lucide-react";

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, org] = await Promise.all([
    ProfileService.getClientProfile(session.user.id),
    OrganizationService.getOrganization(session.user.id),
  ]);

  let score = 0;
  const missingItems: string[] = [];
  if (profile.companyName) score += 20;
  else missingItems.push("Company Name");

  if (profile.website) score += 15;
  else missingItems.push("Website URL");

  if (profile.industry) score += 15;
  else missingItems.push("Primary Industry");

  if (profile.about && profile.about.length >= 30) score += 20;
  else missingItems.push("About Brief (min 30 chars)");

  if (profile.companySize) score += 15;
  else missingItems.push("Company Size");

  if (profile.paymentVerified) score += 15;
  else missingItems.push("Payment Method Verification");

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Company Profile & Team Workspace
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your organization details, corporate team seats, hiring identity, and payment
          verification status.
        </p>
      </div>

      {/* Profile Completeness Score Card */}
      <ProfileCompletenessCard score={score} missingItems={missingItems} role="CLIENT" />

      {/* Organization Details Form */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <Building className="h-4 w-4 text-blue-500" />
            <span>Organization Details</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{profile.paymentVerified ? "Verified Employer" : "Standard Account"}</span>
          </div>
        </div>

        <div className="mt-6">
          <ClientProfileForm profile={profile} />
        </div>
      </div>

      {/* Enterprise Multi-Seat Team Workspace Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
          <Users className="h-4 w-4 text-indigo-500" />
          <span>Multi-Seat Team Workspace & Compliance</span>
        </div>
        <div className="mt-6">
          <OrganizationTeamCard
            organizationName={org.organizationName}
            seatsUsed={org.seatsUsed}
            seatsLimit={org.seatsLimit}
            taxId={org.taxId}
            initialMembers={org.members}
          />
        </div>
      </div>
    </div>
  );
}
