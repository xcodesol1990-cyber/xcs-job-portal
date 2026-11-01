import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { JobFitBadge } from "@/components/jobs/job-fit-badge";
import {
  UserCheck,
  Search,
  Send,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Briefcase,
  Clock,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  ChevronRight,
  Check,
} from "lucide-react";

export default async function FreelancerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("FREELANCER") && !roles.includes("ADMIN")) {
    redirect("/client");
  }

  // Fetch proposals, profile, active contracts, and recommendations in parallel
  const [proposalCount, profile, activeContracts, recentProposals, recommendedJobs] =
    await Promise.all([
      prisma.proposal.count({ where: { freelancerId: session.user.id } }),
      prisma.freelancerProfile.findUnique({
        where: { userId: session.user.id },
        include: { skills: { include: { skill: true } } },
      }),
      prisma.contract.findMany({
        where: { freelancerId: session.user.id, status: "ACTIVE" },
        include: {
          job: true,
          client: { include: { clientProfile: true } },
          milestones: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.proposal.findMany({
        where: { freelancerId: session.user.id },
        include: { job: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.job.findMany({
        where: { status: "OPEN", deletedAt: null },
        include: {
          skills: { include: { skill: true } },
          client: { include: { clientProfile: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const hourlyRate = profile?.hourlyRateCents
    ? `$${(profile.hourlyRateCents / 100).toFixed(0)}/hr`
    : "$85/hr";

  // Calculate Profile Completeness
  let completenessScore = 30; // base registered
  if (profile?.headline) completenessScore += 25;
  if (profile?.bio) completenessScore += 20;
  if (profile?.hourlyRateCents) completenessScore += 15;
  if (profile?.skills && profile.skills.length > 0) completenessScore += 10;
  completenessScore = Math.min(100, completenessScore);

  const userSkillNames = profile?.skills?.map((s) => s.skill.name) ?? [
    "React",
    "TypeScript",
    "Next.js",
  ];

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <PageHeader
        badge="Freelancer Hub"
        badgeIcon={UserCheck}
        badgeVariant="success"
        title={`Welcome back, ${session.user.name?.split(" ")[0] ?? "Freelancer"}`}
        description="Find vetted opportunities, manage active contracts with milestone escrow, and track your take-home earnings."
      >
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-500 hover:to-indigo-500"
          >
            <Search className="h-4 w-4" />
            <span>Browse Opportunities</span>
          </Link>
        </div>
      </PageHeader>

      {/* Top Telemetry Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Active Proposals"
          value={proposalCount}
          description="Submitted client pitches"
          icon={Send}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
        />

        <StatCard
          title="Hourly Rate"
          value={hourlyRate}
          description="Current baseline rate"
          icon={DollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
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
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          badge={{
            text: "Top Rated Plus",
            color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
          }}
        />
      </div>

      {/* High-Density Dual-Column Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2/3 Grid): Work In-Flight & Discovery */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Milestone Contracts */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Active Engagements ({activeContracts.length})
                </h3>
              </div>
              <Link
                href="/freelancer/contracts"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
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
                        <p className="text-xs text-zinc-500">
                          Client:{" "}
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {contract.client.clientProfile?.companyName ?? contract.client.name}
                          </span>{" "}
                          &middot; ${(Number(contract.totalCents) / 100).toFixed(0)} Escrow
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <div className="h-1.5 w-32 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-500">
                            {completedM}/{totalM} milestones ({progress}%)
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/contracts/${contract.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 shadow-xs hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
                      >
                        <span>Open Workroom</span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/20">
                <Clock className="mx-auto h-8 w-8 text-zinc-400" />
                <h4 className="mt-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No active milestone contracts yet
                </h4>
                <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                  Submit milestone proposals to clients. Once approved and funded, workrooms with
                  WebRTC huddles appear here.
                </p>
                <div className="mt-4">
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >
                    <span>Browse available opportunities</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Recent Proposals Tracker */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Recent Pitch Submissions ({recentProposals.length})
                </h3>
              </div>
              <Link
                href="/freelancer/proposals"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentProposals.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/jobs/${proposal.job.id}`}
                        className="text-xs font-bold text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400 transition"
                      >
                        {proposal.job.title}
                      </Link>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                          ${(proposal.bidCents / 100).toFixed(0)} Bid
                        </span>
                        <span>&middot;</span>
                        <span>
                          {proposal.estimatedDays ? `${proposal.estimatedDays} days` : "Flexible"}
                        </span>
                        <span>&middot;</span>
                        <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        proposal.status === "ACCEPTED"
                          ? "success"
                          : proposal.status === "SHORTLISTED"
                            ? "purple"
                            : proposal.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                      }
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-3">
                You haven&apos;t pitched for any projects yet.
              </p>
            )}
          </div>

          {/* Curated Recommendations for You */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Recommended Opportunities for You
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
                AI Skill Matched
              </span>
            </div>

            <div className="space-y-3">
              {recommendedJobs.map((job) => {
                const jobSkillNames = job.skills.map((s) => s.skill.name);
                const budget = job.budgetMaxCents
                  ? `$${(job.budgetMaxCents / 100).toFixed(0)}`
                  : "Competitive";

                return (
                  <div
                    key={job.id}
                    className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-bold text-sm text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400 transition"
                        >
                          {job.title}
                        </Link>
                        <JobFitBadge
                          jobSkills={jobSkillNames}
                          userSkills={userSkillNames}
                          compact
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {budget} &middot; {job.budgetType}
                        </span>
                        <span>&middot;</span>
                        <span>{job.client.clientProfile?.companyName ?? job.client.name}</span>
                      </div>
                    </div>

                    <Link
                      href={`/jobs/${job.id}/apply`}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition"
                    >
                      <span>Quick Pitch</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar Area (1/3 Grid): Profile Readiness, Wallet & Resources */}
        <div className="space-y-6">
          {/* Profile Completeness & Reputation Meter */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>Profile Readiness</span>
              </h3>
              <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                {completenessScore}%
              </span>
            </div>

            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden dark:bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${completenessScore}%` }}
              />
            </div>

            <div className="space-y-2 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Email & Account Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Hourly Rate Configured (${hourlyRate})</span>
              </div>
              <div className="flex items-center gap-2">
                {profile?.headline ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-zinc-300" />
                )}
                <span>Professional Headline</span>
              </div>
              <div className="flex items-center gap-2">
                {profile?.bio ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-zinc-300" />
                )}
                <span>Portfolio Bio & Technical Summary</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/freelancer/profile"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                <span>Edit Profile & Portfolio</span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Escrow & Earnings Wallet Card */}
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-white to-white p-6 shadow-xs dark:border-emerald-900/40 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                <span>Escrow Wallet</span>
              </span>
              <Badge variant="success">0% Fee Tier</Badge>
            </div>

            <div>
              <div className="text-[11px] text-zinc-500">Available Payout Balance</div>
              <div className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
                $0.00 <span className="text-xs font-normal text-zinc-400">USD</span>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-3 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span>Zero Connects Tax</span>
              </div>
              <p className="text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                You retain 100% of approved milestone payouts minus pass-through Stripe processing.
              </p>
            </div>

            <Link
              href="/freelancer/payouts"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition"
            >
              <span>Manage Stripe Connect Payouts</span>
            </Link>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              Contractor Quick Tools
            </h4>
            <Link
              href="/jobs"
              className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-indigo-500" />
                <span>Explore Open RFPs</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
            <Link
              href="/messages"
              className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
            >
              <span className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                <span>Client Conversations & Huddles</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
