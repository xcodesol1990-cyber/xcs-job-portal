import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { ProfileService } from "@/server/services/profile.service";
import { FreelancerProfileForm } from "@/components/forms/freelancer-profile-form";
import { PortfolioList } from "@/components/forms/portfolio-list";
import { UserCheck, Sparkles, FolderGit2 } from "lucide-react";

export default async function FreelancerProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [profile, taxonomy] = await Promise.all([
    ProfileService.getFreelancerProfile(session.user.id),
    ProfileService.getTaxonomy(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <UserCheck className="h-4 w-4" />
          <span>Freelancer Profile & Portfolio</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Professional Profile Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Showcase your skills, set your hourly rate, and manage your portfolio to win contracts.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>General Information & Skills</span>
        </div>
        <div className="mt-6">
          <FreelancerProfileForm profile={profile} skills={taxonomy.skills} />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
          <FolderGit2 className="h-4 w-4 text-purple-500" />
          <span>Portfolio Showcase</span>
        </div>
        <div className="mt-6">
          <PortfolioList items={profile.portfolioItems} />
        </div>
      </div>
    </div>
  );
}

