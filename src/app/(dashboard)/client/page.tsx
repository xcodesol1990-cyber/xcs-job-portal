import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  PlusCircle,
  FileText,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  ChevronRight,
  Lock,
  User,
} from "lucide-react";

export default async function ClientDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("CLIENT") && !roles.includes("ADMIN")) {
    redirect("/freelancer");
  }

  // Fetch client counts, recent listings, and active contracts
  const [jobCount, contractCount, activeJobs, activeContracts] = await Promise.all([
    prisma.job.count({ where: { clientId: session.user.id, deletedAt: null } }),
    prisma.contract.count({ where: { clientId: session.user.id } }),
    prisma.job.findMany({
      where: { clientId: session.user.id, deletedAt: null },
      include: {
        _count: { select: { proposals: true } },
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.contract.findMany({
      where: { clientId: session.user.id, status: "ACTIVE" },
      include: {
        freelancer: true,
        job: true,
        milestones: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);

  // Compute total funds actively locked in escrow
  let escrowLockedCents = 0;
  activeContracts.forEach((c) => {
    c.milestones.forEach((m) => {
      if (m.status === "FUNDED" || m.status === "SUBMITTED" || m.status === "REVISION_REQUESTED") {
        escrowLockedCents += Number(m.amountCents);
      }
    });
  });

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <PageHeader
        badge="Employer Workspace"
        badgeIcon={Briefcase}
        badgeVariant="info"
        title={`Welcome, ${session.user.name?.split(" ")[0] ?? "Client"}`}
        description="Publish project scopes, review incoming candidate proposals, and release milestone escrow upon verification."
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
          description="Double-entry ledger vault"
          icon={DollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          badge={{
            text: "Zero Fraud Risk",
            color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
          }}
        />
      </div>

      {/* High-Density Dual-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2/3 Grid): Hiring Pipeline & Contracts */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Job Requisitions */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Active Job Requisitions ({activeJobs.length})
                </h3>
              </div>
              <Link
                href="/client/jobs"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                <span>View all listings</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {activeJobs.length > 0 ? (
              <div className="space-y-3">
                {activeJobs.map((job) => {
                  const proposalCount = job._count.proposals;
                  return (
                    <div
                      key={job.id}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-sm font-bold text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400 transition"
                          >
                            {job.title}
                          </Link>
                          <Badge variant="purple">{job.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {job.budgetType} &middot;{" "}
                            {job.budgetMaxCents ? `$${job.budgetMaxCents / 100}` : "Custom"}
                          </span>
                          <span>&middot;</span>
                          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/client/jobs/${job.id}/proposals`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-500 transition"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>
                            {proposalCount} {proposalCount === 1 ? "Proposal" : "Proposals"}
                          </span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20">
                <Sparkles className="mx-auto h-8 w-8 text-indigo-500" />
                <h4 className="mt-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Ready to scale your engineering team?
                </h4>
                <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                  Post your first job opening with our built-in AI Scope Decomposer to attract
                  vetted candidates within hours.
                </p>
                <div className="mt-4">
                  <Link
                    href="/client/jobs/new"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Create First Job Post</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Ongoing Milestone Contracts */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Ongoing Milestone Contracts ({activeContracts.length})
                </h3>
              </div>
              <Link
                href="/client/contracts"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {activeContracts.length > 0 ? (
              <div className="space-y-3">
                {activeContracts.map((contract) => {
                  const completedM = contract.milestones.filter(
                    (m) => m.status === "RELEASED",
                  ).length;
                  const totalM = contract.milestones.length;
                  const progress = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;

                  return (
                    <div
                      key={contract.id}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {contract.job.title}
                          </h4>
                          <Badge variant="purple">ACTIVE</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Specialist: {contract.freelancer.name}</span>
                          <span>&middot;</span>
                          <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                            ${(Number(contract.totalCents) / 100).toFixed(0)} Escrow
                          </span>
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <div className="h-1.5 w-32 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-500">
                            {completedM}/{totalM} milestones approved ({progress}%)
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/contracts/${contract.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 shadow-xs hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                      >
                        <span>Open Contract Room</span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-3">
                No active contractor engagements currently in progress.
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar Area (1/3 Grid): Capital Telemetry & Tools */}
        <div className="space-y-6">
          {/* Capital Allocation & Escrow Vault Card */}
          <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-white to-white p-6 shadow-xs dark:border-blue-900/40 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <Lock className="h-4 w-4" />
                <span>Capital Protection</span>
              </span>
              <Badge variant="purple">Double-Entry Vault</Badge>
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">Active Escrow Capital</div>
              <div className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
                $
                {(escrowLockedCents / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-xs font-normal text-zinc-400">USD</span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-500/10 p-3 text-[11px] text-blue-900 dark:text-blue-200 space-y-1">
              <div className="font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>100% Release Control</span>
              </div>
              <p className="text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                Funds are held in secure escrow. You inspect code diffs and approve deliverables
                before any funds are released.
              </p>
            </div>
          </div>

          {/* Quick AI Post Card */}
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-white p-6 shadow-xs dark:border-indigo-900/40 dark:bg-zinc-900 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                AI Scope Decomposer
              </h4>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Create comprehensive project briefs with AI-generated milestones, budget benchmarks,
              and technical requirements in under 30 seconds.
            </p>
            <Link
              href="/client/jobs/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Launch New Job Brief</span>
            </Link>
          </div>

          {/* Enterprise Team & Multi-Seat Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Team & Organization
            </h4>
            <Link
              href="/client/profile"
              className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              <span className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-purple-500" />
                <span>Multi-Seat Team Workspace</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
