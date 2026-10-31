import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import {
  Briefcase,
  PlusCircle,
  FileText,
  DollarSign,
  Clock,
  Sparkles,
} from "lucide-react";

export default async function ClientDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("CLIENT") && !roles.includes("ADMIN")) {
    redirect("/dashboard/freelancer");
  }

  // Fetch client jobs count and contracts
  const [jobCount, contractCount] = await Promise.all([
    prisma.job.count({ where: { clientId: session.user.id } }),
    prisma.contract.count({ where: { clientId: session.user.id } }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Briefcase className="h-4 w-4" />
            <span>Employer Workspace</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome, {session.user.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Post opportunities, review proposals with escrow protection, and hire vetted talent.
          </p>
        </div>

        <Link
          href="/dashboard/client/jobs/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post a New Job</span>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Active Job Posts</span>
            <FileText className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {jobCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Open for proposals</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Active Contracts</span>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {contractCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Ongoing milestone deliverables</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Escrow Protection</span>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Active
          </div>
          <div className="mt-1 text-xs text-zinc-500">Milestone-based release</div>
        </div>
      </div>

      {/* Empty State Banner */}
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Ready to scale your team?
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Publish your first project brief and receive verified proposals from top engineers and designers.
        </p>
      </div>
    </div>
  );
}
