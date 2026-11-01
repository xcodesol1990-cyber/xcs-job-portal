import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { prisma } from "@/server/db/prisma";
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
  Receipt,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Sliders,
  History,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.roles?.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const [kpis, recentAuditLogs, platformSettings] = await Promise.all([
    adminService.getKpis(),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.platformSetting.findMany(),
  ]);

  const heldEscrow = Number(kpis.financials.currentEscrowHeldCents) / 100;
  const totalGMV = Number(kpis.financials.totalEscrowReleasedCents) / 100;
  const totalFunded = Number(kpis.financials.totalEscrowFundedCents) / 100;
  const platformFees = Number(kpis.financials.totalPlatformFeesCents) / 100;
  const refunded = Number(kpis.financials.totalEscrowRefundedCents) / 100;

  // Percentage calculations for liquidity visualization
  const safeTotal = totalFunded > 0 ? totalFunded : 1;
  const pctReleased = Math.min(100, Math.round((totalGMV / safeTotal) * 100));
  const pctHeld = Math.min(100, Math.round((heldEscrow / safeTotal) * 100));
  const pctRefunded = Math.min(100, Math.round((refunded / safeTotal) * 100));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <ShieldAlert className="h-4 w-4" />
            <span>Platform Governance & Escrow Oversight</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Mission Control
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            Real-time financial telemetry, cryptographic double-entry ledger, and trust moderation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/disputes"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            <span>Arbitration Desk</span>
          </Link>
          <Link
            href="/admin/ledger"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-purple-500 hover:to-indigo-500"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Ledger Audit</span>
          </Link>
        </div>
      </div>

      {/* Modern Navigation Sub-bar */}
      <AdminNav />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric Card 1: Escrow Held */}
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Active Escrow Locked</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            ${heldEscrow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% Backed in Double-Entry Trust</span>
          </div>
        </div>

        {/* Metric Card 2: Settled GMV */}
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Settled GMV</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            ${totalGMV.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
            <span>Cumulative marketplace payouts</span>
          </div>
        </div>

        {/* Metric Card 3: Open Disputes */}
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Open Disputes</span>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                kpis.openDisputes > 0
                  ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 animate-pulse"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              }`}
            >
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div
            className={`mt-3 text-3xl font-extrabold tracking-tight ${
              kpis.openDisputes > 0 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {kpis.openDisputes}
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {kpis.openDisputes === 0 ? "Zero disputes pending" : "Requires judicial arbitration"}
          </div>
        </div>

        {/* Metric Card 4: Moderation Flags */}
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Flagged Reports</span>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                kpis.pendingReports > 0
                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              }`}
            >
              <Flag className="h-5 w-5" />
            </div>
          </div>
          <div
            className={`mt-3 text-3xl font-extrabold tracking-tight ${
              kpis.pendingReports > 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {kpis.pendingReports}
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {kpis.pendingReports === 0 ? "Moderation queue is clean" : "Community reports to inspect"}
          </div>
        </div>
      </div>

      {/* Analytics & Financial Liquidity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Escrow Liquidity Breakdown Card */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Escrow Liquidity & Financial Distribution
              </h3>
              <p className="text-xs text-zinc-500">
                Live breakdown of all funds processed through double-entry ledger
              </p>
            </div>
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              Audit Verified
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Escrow Allocation</span>
              <span>Total Inflow: ${totalFunded.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                style={{ width: `${pctReleased}%` }}
                className="bg-indigo-500 transition-all duration-500"
                title={`Released to Talent: ${pctReleased}%`}
              />
              <div
                style={{ width: `${pctHeld}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Held in Escrow: ${pctHeld}%`}
              />
              <div
                style={{ width: `${pctRefunded}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Refunded to Clients: ${pctRefunded}%`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                Released to Talent ({pctReleased}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Active Locked ({pctHeld}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Refunded ({pctRefunded}%)
              </span>
            </div>
          </div>

          {/* Micro Stat Cards */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                <span>Gross Inflow</span>
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                ${totalFunded.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Receipt className="h-3.5 w-3.5 text-purple-500" />
                <span>Platform Take</span>
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                ${platformFees.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <History className="h-3.5 w-3.5 text-amber-500" />
                <span>Client Refunds</span>
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                ${refunded.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Live Security & Audit Trail */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Recent Audit Log
            </h3>
            <Link
              href="/admin/ledger"
              className="text-xs font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400"
            >
              Full Trail &rarr;
            </Link>
          </div>

          <div className="mt-4 space-y-3.5">
            {recentAuditLogs.length === 0 ? (
              <p className="text-xs text-zinc-400 italic py-6 text-center">No audit logs recorded yet.</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log.id.toString()} className="flex items-start gap-3 text-xs">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 dark:text-zinc-400 text-[10px]">
                    {log.action.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {log.action}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {log.actor?.name ?? "System Actor"} &bull; {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Secondary Metrics Navigation */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Link
          href="/admin/users"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all hover:border-purple-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-purple-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{kpis.totalUsers}</p>
                <p className="text-xs font-medium text-zinc-500">Users & KYC Directory</p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-zinc-400 group-hover:text-purple-600 transition" />
          </div>
        </Link>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{kpis.totalJobs}</p>
              <p className="text-xs font-medium text-zinc-500">Active Job Postings</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{kpis.totalContracts}</p>
              <p className="text-xs font-medium text-zinc-500">Milestone Contracts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Parameters Panel */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <Sliders className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Active Governance & System Parameters</span>
          </div>
          <span className="text-xs text-zinc-400">Stored in database</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          {platformSettings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <span className="font-mono text-zinc-600 dark:text-zinc-400 font-medium">
                {setting.key}
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 font-mono font-bold text-purple-700 shadow-sm dark:bg-zinc-800 dark:text-purple-300">
                {JSON.stringify(setting.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
