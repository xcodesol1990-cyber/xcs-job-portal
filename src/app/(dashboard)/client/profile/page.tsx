import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { ProfileService } from "@/server/services/profile.service";
import { ClientProfileForm } from "@/components/forms/client-profile-form";
import { Briefcase, Building, ShieldCheck } from "lucide-react";

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await ProfileService.getClientProfile(session.user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Briefcase className="h-4 w-4" />
          <span>Employer & Company Settings</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Company Profile
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your organization details, hiring identity, and payment verification status.
        </p>
      </div>

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
    </div>
  );
}

