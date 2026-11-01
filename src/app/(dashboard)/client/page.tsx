import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, PlusCircle, FileText, DollarSign, Clock, Sparkles } from "lucide-react";

export default async function ClientDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("CLIENT") && !roles.includes("ADMIN")) {
    redirect("/freelancer");
  }

  // Fetch client jobs count and contracts
  const [jobCount, contractCount] = await Promise.all([
    prisma.job.count({ where: { clientId: session.user.id, deletedAt: null } }),
    prisma.contract.count({ where: { clientId: session.user.id } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <PageHeader
        badge="Employer Workspace"
        badgeIcon={Briefcase}
        badgeVariant="info"
        title={`Welcome, ${session.user.name?.split(" ")[0] ?? "Client"}`}
        description="Post opportunities, review proposals with escrow protection, and hire vetted talent."
      >
        <Link
          href="/client/jobs/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-500 hover:to-indigo-500"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post a New Job</span>
        </Link>
      </PageHeader>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Active Job Posts"
          value={jobCount}
          description="Open for proposals"
          icon={FileText}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
        />

        <StatCard
          title="Active Contracts"
          value={contractCount}
          description="Ongoing milestone deliverables"
          icon={Clock}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
        />

        <StatCard
          title="Escrow Protection"
          value="100% Active"
          description="Milestone-based cryptographic release"
          icon={DollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          badge={{
            text: "Double-Entry Trust",
            color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
          }}
        />
      </div>

      {/* Empty State Banner if no jobs, otherwise prompt to manage */}
      {jobCount === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Ready to scale your team?"
          description="Publish your first project brief and receive verified proposals from top engineers and designers."
          action={{
            label: "Create First Job Post",
            href: "/client/jobs/new",
            icon: PlusCircle,
          }}
        />
      ) : (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              You have {jobCount} active job listings
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Review incoming candidate pitches and schedule interviews.
            </p>
          </div>
          <Link
            href="/client/jobs"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Manage Job Posts →
          </Link>
        </div>
      )}
    </div>
  );
}
