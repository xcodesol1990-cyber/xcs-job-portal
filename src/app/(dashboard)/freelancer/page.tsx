import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import {
  UserCheck,
  Search,
  Send,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default async function FreelancerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("FREELANCER") && !roles.includes("ADMIN")) {
    redirect("/dashboard/client");
  }

  // Fetch proposals count and profile
  const [proposalCount, profile] = await Promise.all([
    prisma.proposal.count({ where: { freelancerId: session.user.id } }),
    prisma.freelancerProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-4 w-4" />
            <span>Freelancer Hub</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {session.user.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Find vetted projects, submit milestone proposals, and track your escrow earnings.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
        >
          <Search className="h-4 w-4" />
          <span>Browse Available Jobs</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Proposals Submitted</span>
            <Send className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {proposalCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Active pitches under review</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Hourly Rate</span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {profile?.currency ?? "USD"}
            </span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            ${profile?.hourlyRateCents ? (profile.hourlyRateCents / 100).toFixed(0) : "85"}
            <span className="text-sm font-normal text-zinc-500">/hr</span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">Current baseline rate</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Job Success Score</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            100%
          </div>
          <div className="mt-1 text-xs text-zinc-500">Top-rated contractor standing</div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Freelancer Profile Snapshot
            </h3>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            {profile?.experienceLevel ?? "EXPERT"}
          </span>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {profile?.headline ?? "Full-stack engineer for product teams"}
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          {profile?.bio ??
            "I build reliable web applications with TypeScript, Next.js, and PostgreSQL."}
        </p>
      </div>
    </div>
  );
}
