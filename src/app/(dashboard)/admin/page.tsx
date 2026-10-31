import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  ShieldAlert,
  Users,
  Briefcase,
  FileCheck2,
  AlertCircle,
  Flag,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.roles?.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const kpis = await adminService.getKpis();
  const heldEscrow = Number(kpis.financials.currentEscrowHeldCents) / 100;
  const totalGMV = Number(kpis.financials.totalEscrowReleasedCents) / 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          <ShieldAlert className="h-4 w-4" />
          <span>Platform Administration & Governance</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Mission Control
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Marketplace KPIs, double-entry escrow tracking, and real-time moderation.
        </p>
      </div>

      {/* Navigation Sub-bar */}
      <AdminNav />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Active Escrow Held</span>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            ${heldEscrow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Locked in contract milestones</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Settled GMV</span>
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            ${totalGMV.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Cumulative escrow payouts</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Open Disputes</span>
            <AlertCircle className={`h-5 w-5 ${kpis.openDisputes > 0 ? "text-red-500" : "text-zinc-400"}`} />
          </div>
          <div className={`mt-3 text-3xl font-extrabold ${kpis.openDisputes > 0 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"}`}>
            {kpis.openDisputes}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Requiring arbitration</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Pending Flags</span>
            <Flag className={`h-5 w-5 ${kpis.pendingReports > 0 ? "text-amber-500" : "text-zinc-400"}`} />
          </div>
          <div className={`mt-3 text-3xl font-extrabold ${kpis.pendingReports > 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-100"}`}>
            {kpis.pendingReports}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Community reports to review</div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Link
          href="/admin/users"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition hover:border-purple-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-purple-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{kpis.totalUsers}</p>
              <p className="text-xs text-zinc-500">Total Users Registered &rarr;</p>
            </div>
          </div>
        </Link>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{kpis.totalJobs}</p>
              <p className="text-xs text-zinc-500">Total Marketplace Jobs</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{kpis.totalContracts}</p>
              <p className="text-xs text-zinc-500">Total Contracts Created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
