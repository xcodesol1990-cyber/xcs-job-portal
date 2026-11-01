import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Search, Send, CheckCircle, Sparkles, ArrowRight } from "lucide-react";

export default async function FreelancerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("FREELANCER") && !roles.includes("ADMIN")) {
    redirect("/client");
  }

  // Fetch proposals count and profile
  const [proposalCount, profile] = await Promise.all([
    prisma.proposal.count({ where: { freelancerId: session.user.id } }),
    prisma.freelancerProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  const hourlyRate = profile?.hourlyRateCents
    ? `$${(profile.hourlyRateCents / 100).toFixed(0)}/hr`
    : "$85/hr";

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <PageHeader
        badge="Freelancer Hub"
        badgeIcon={UserCheck}
        badgeVariant="success"
        title={`Welcome back, ${session.user.name?.split(" ")[0] ?? "Freelancer"}`}
        description="Find vetted projects, submit milestone proposals, and track your escrow earnings."
      >
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-500 hover:to-indigo-500"
        >
          <Search className="h-4 w-4" />
          <span>Browse Available Jobs</span>
        </Link>
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Proposals Submitted"
          value={proposalCount}
          description="Active pitches under review"
          icon={Send}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
        />

        <StatCard
          title="Hourly Rate"
          value={hourlyRate}
          description="Current baseline rate"
          badge={{
            text: profile?.currency ?? "USD",
            color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
          }}
        />

        <StatCard
          title="Job Success Score"
          value="100%"
          description="Top-rated contractor standing"
          icon={CheckCircle}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          badge={{
            text: "Top Rated Plus",
            color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
          }}
        />
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Freelancer Profile Snapshot
            </h3>
          </div>
          <Badge variant="purple">{profile?.experienceLevel ?? "EXPERT"}</Badge>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {profile?.headline ?? "Full-stack engineer for high-growth product teams."}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <span className="text-xs text-zinc-500">
            {profile?.availability ?? "Available for new projects"}
          </span>
          <Link
            href="/freelancer/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            <span>Edit Profile & Portfolio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
