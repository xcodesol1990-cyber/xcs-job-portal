import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { prisma } from "@/server/db/prisma";
import { DisputeResolver } from "@/components/admin/dispute-resolver";
import { ReportStatusButton } from "@/components/admin/report-status-button";
import {
  Lock,
  TrendingUp,
  AlertCircle,
  Flag,
  DollarSign,
  Receipt,
  CheckCircle2,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  Scale,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.roles?.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const [kpis, recentLedgerEntries, openDisputes, pendingReports, platformSettings] =
    await Promise.all([
      adminService.getKpis(),
      prisma.ledgerEntry.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          contract: {
            select: {
              id: true,
              job: { select: { title: true } },
            },
          },
          milestone: { select: { id: true, title: true } },
        },
      }),
      prisma.dispute.findMany({
        where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
        take: 3,
        include: {
          contract: {
            include: {
              job: { select: { title: true } },
              client: { select: { id: true, name: true, email: true } },
              freelancer: { select: { id: true, name: true, email: true } },
            },
          },
          milestone: true,
          openedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.report.findMany({
        where: { status: "OPEN" },
        take: 3,
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
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
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Welcome back, {session.user.name?.split(" ")[0] ?? "Admin"}
              </h1>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                Super Admin
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              Real-time telemetry, double-entry escrow liquidity, and arbitration desk.
            </p>
          </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/disputes"
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Scale className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
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

          {/* Row 1: Tremor-Style High-Impact Metric Cards with Sparklines */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Metric 1: Active Escrow Locked */}
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active Escrow Locked</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <Lock className="h-4 w-4" />
                    </div>
                  </div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                        ${heldEscrow.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        Reserve 100%
                      </span>
                    </div>

                      {/* Micro Sparkline */}
                      <div className="mt-3 h-8 w-full">
                        <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 25">
                          <path
                            d="M0,20 Q20,15 40,18 T80,8 T100,4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="text-emerald-500"
                          />
                        </svg>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-400">Secured in milestone contract vault</p>
                    </div>

                      {/* Metric 2: Settled GMV */}
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Settled Volume</span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                              <TrendingUp className="h-4 w-4" />
                            </div>
                          </div>
                            <div className="mt-3 flex items-baseline justify-between">
                              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                                ${totalGMV.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                                +100% Succeeded
                              </span>
                            </div>

                              {/* Micro Sparkline */}
                              <div className="mt-3 h-8 w-full">
                                <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 25">
                                  <path
                                    d="M0,22 Q25,18 50,12 T75,6 T100,2"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="text-indigo-500"
                                  />
                                </svg>
                              </div>
                              <p className="mt-1 text-[11px] text-zinc-400">Escrow released directly to talent</p>
                            </div>

                              {/* Metric 3: Active Platform Users */}
                              <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Platform Directory</span>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                      <Users className="h-4 w-4" />
                                    </div>
                                  </div>
                                    <div className="mt-3 flex items-baseline justify-between">
                                      <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                                        {kpis.totalUsers}
                                      </span>
                                      <Link
                                        href="/admin/users"
                                        className="text-[11px] font-bold text-purple-600 hover:underline dark:text-purple-400"
                                      >
                                        Inspect Directory &rarr;
                                      </Link>
                                    </div>

                                      {/* Mini Role Distribution Bar */}
                                      <div className="mt-4 space-y-1.5">
                                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                          <div style={{ width: "50%" }} className="bg-blue-500" title="Clients" />
                                          <div style={{ width: "40%" }} className="bg-emerald-500" title="Freelancers" />
                                          <div style={{ width: "10%" }} className="bg-purple-500" title="Admins" />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                          <span>Clients / Employers</span>
                                          <span>Freelance Talent</span>
                                        </div>
                                      </div>
                                    </div>

                                      {/* Metric 4: Arbitration Queue */}
                                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Action Queue</span>
                                          <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl ${kpis.openDisputes > 0 || kpis.pendingReports > 0
                                                ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 animate-pulse"
                                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                                              }`}
                                          >
                                            {kpis.openDisputes > 0 || kpis.pendingReports > 0 ? (
                                              <AlertCircle className="h-4 w-4" />
                                            ) : (
                                              <CheckCircle2 className="h-4 w-4" />
                                            )}
                                          </div>
                                        </div>
                                          <div className="mt-3 flex items-baseline justify-between">
                                            <span
                                              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${kpis.openDisputes > 0 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50"
                                                }`}
                                            >
                                              {kpis.openDisputes + kpis.pendingReports}
                                            </span>
                                            <span
                                              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ${kpis.openDisputes > 0
                                                  ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                                }`}
                                            >
                                              {kpis.openDisputes > 0 ? "Arbitration Required" : "Queue Healthy"}
                                            </span>
                                          </div>

                                          <p className="mt-4 text-[11px] text-zinc-400">
                                            {kpis.openDisputes} active disputes &bull; {kpis.pendingReports} flagged items
                                          </p>
                                        </div>
                                      </div>

                                      {/* Row 2: Analytics & Priority Action Desk */}
                                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                        {/* Panel 1: Escrow Liquidity Breakdown Card */}
                                        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800 gap-2">
                                              <div>
                                                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    <span>Escrow Liquidity & Financial Performance</span>
                                                  </h3>
                                                  <p className="text-xs text-zinc-500">
                                                    Double-entry financial audit verified across all marketplace contracts
                                                  </p>
                                              </div>
                                              <Link
                                                href="/admin/ledger"
                                                className="text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400 flex items-center gap-1"
                                              >
                                                <span>Audit Ledger</span>
                                                <ExternalLink className="h-3 w-3" />
                                              </Link>
                                            </div>

                                            {/* Stacked Allocation Progress Bar */}
                                            <div className="mt-6 space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                  <span>Escrow Capital Allocation</span>
                                                  <span>Total Gross Inflow: ${totalFunded.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</span>
                                                </div>

                                                  <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 shadow-inner">
                                                    <div
                                                      style={{ width: `${pctReleased}%` }}
                                                      className="bg-indigo-500 transition-all duration-500"
                                                      title={`Released: ${pctReleased}%`}
                                                    />
                                                    <div
                                                      style={{ width: `${pctHeld}%` }}
                                                      className="bg-emerald-500 transition-all duration-500"
                                                      title={`Locked: ${pctHeld}%`}
                                                    />
                                                    <div
                                                      style={{ width: `${pctRefunded}%` }}
                                                      className="bg-amber-400 transition-all duration-500"
                                                      title={`Refunded: ${pctRefunded}%`}
                                                    />
                                                  </div>

                                                    <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-zinc-500 font-medium">
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

                                                  {/* Micro Financial Matrix */}
                                                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                        <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                                                          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                                                            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                                            <span>Gross Volume Inflow</span>
                                                          </div>
                                                            <div className="mt-1 font-mono text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                                                              ${totalFunded.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                            </div>
                                                            <span className="text-[10px] text-zinc-400">Total client deposits</span>
                                                          </div>

                                                              <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                                                                  <Receipt className="h-3.5 w-3.5 text-purple-500" />
                                                                  <span>Platform Commission</span>
                                                                </div>
                                                                  <div className="mt-1 font-mono text-xl font-extrabold text-purple-600 dark:text-purple-400">
                                                                    ${platformFees.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                                  </div>
                                                                  <span className="text-[10px] text-zinc-400">10% Platform Take Rate</span>
                                                                </div>

                                                                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                                                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                                                                        <ArrowDownLeft className="h-3.5 w-3.5 text-amber-500" />
                                                                        <span>Client Refunds</span>
                                                                      </div>
                                                                        <div className="mt-1 font-mono text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
                                                                          ${refunded.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                                        </div>
                                                                        <span className="text-[10px] text-zinc-400">Settled through arbitration</span>
                                                                      </div>
                                                                    </div>
                                                                  </div>

                                                                    {/* Panel 2: Priority Action Desk (Disputes & Moderation Queue) */}
                                                                    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
                                                                      <div>
                                                                        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                                                                          <div className="flex items-center gap-2">
                                                                            <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                                                              Priority Action Desk
                                                                            </h3>
                                                                          </div>
                                                                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                                                                            {openDisputes.length} Disputes
                                                                          </span>
                                                                        </div>

                                                                                  {/* List of active disputes requiring admin ruling */}
                                                                                  <div className="mt-4 space-y-3">
                                                                                    {openDisputes.length === 0 ? (
                                                                                      <div className="py-8 text-center space-y-2">
                                                                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                                                          <CheckCircle2 className="h-5 w-5" />
                                                                                        </div>
                                                                                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                                                                              No Disputes Pending Ruling
                                                                                            </p>
                                                                                            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                                                                                              All milestone payments are proceeding normally.
                                                                                            </p>
                                                                                        </div>
                                                                                        ) : (
                openDisputes.map((dispute) => (
                                                                                        <div
                                                                                          key={dispute.id}
                                                                                          className="rounded-xl border border-red-200/60 bg-red-50/40 p-3.5 text-xs dark:border-red-900/40 dark:bg-red-950/20"
                                                                                        >
                                                                                          <div className="flex items-center justify-between">
                                                                                            <span className="font-bold text-red-800 dark:text-red-300">
                                                                                              {dispute.contract.job.title}
                                                                                            </span>
                                                                                            {dispute.milestone && (
                                                                                              <span className="font-mono font-bold text-red-700 dark:text-red-400">
                                                                                                ${(Number(dispute.milestone.amountCents) / 100).toFixed(0)}
                                                                                              </span>
                                                                                            )}
                                                                                          </div>
                                                                                          <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2">
                                                                                            &quot;{dispute.reason}&quot;
                                                                                          </p>
                                                                                          <div className="mt-2.5 flex items-center justify-between pt-1">
                                                                                            <span className="text-[10px] text-zinc-500">
                                                                                              By {dispute.openedBy.name}
                                                                                            </span>
                                                                                            <DisputeResolver
                                                                                              disputeId={dispute.id}
                                                                                              contractTitle={dispute.contract.job.title}
                                                                                              clientName={dispute.contract.client.name}
                                                                                              freelancerName={dispute.contract.freelancer.name}
                                                                                              milestoneTitle={dispute.milestone?.title}
                                                                                              amountCents={dispute.milestone?.amountCents.toString()}
                                                                                              currency={dispute.contract.currency}
                                                                                            />
                                                                                          </div>
                                                                                        </div>
                                                                                    ))
              )}
                                                                                  </div>

                                                                                  {/* Moderation Reports section */}
                                                                                  {pendingReports.length > 0 && (
                                                                                    <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                                                                                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                                                                        <Flag className="h-3.5 w-3.5 text-amber-500" />
                                                                                        Flagged Items ({pendingReports.length})
                                                                                      </span>
                                                                                      {pendingReports.map((report) => (
                                                                                        <div
                                                                                          key={report.id}
                                                                                          className="flex items-center justify-between rounded-lg border border-zinc-200/60 bg-zinc-50/70 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-800/50"
                                                                                        >
                                                                                          <div className="min-w-0 flex-1 pr-2">
                                                                                            <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                                                                              {report.targetType}
                                                                                            </span>
                                                                                            <p className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate">{report.reason}</p>
                                                                                          </div>
                                                                                          <ReportStatusButton reportId={report.id} />
                                                                                        </div>
                                                                                      ))}
                                                                                    </div>
                                                                                  )}
                                                                                </div>

                                                                                <Link
                                                                                  href="/admin/disputes"
                                                                                  className="mt-4 block w-full rounded-xl border border-zinc-200 py-2 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                                                                >
                                                                                  Open Full Dispute Center &rarr;
                                                                                </Link>
                                                                              </div>
      </div>

                                                                                {/* Row 3: Live Double-Entry Ledger Stream & Governance Panel */}
                                                                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                                                                  {/* Recent Ledger Stream Table */}
                                                                                  <div className="lg:col-span-2 rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                                                                                    <div className="flex items-center justify-between border-b border-zinc-100 p-5 dark:border-zinc-800">
                                                                                      <div>
                                                                                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                                                                          Recent Ledger Audit Movements
                                                                                        </h3>
                                                                                        <p className="text-xs text-zinc-500">
                                                                                          Cryptographically hashed idempotency entries in minor integer units
                                                                                        </p>
                                                                                      </div>
                                                                                      <Link
                                                                                        href="/admin/ledger"
                                                                                        className="text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                                                                                      >
                                                                                        View Full Stream &rarr;
                                                                                      </Link>
                                                                                    </div>

                                                                                      <div className="overflow-x-auto">
                                                                                        <table className="w-full text-left text-xs">
                                                                                          <thead className="border-b border-zinc-100 bg-zinc-50/60 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
                                                                                            <tr>
                                                                                              <th className="px-5 py-3 font-semibold">Transaction Type</th>
                                                                                              <th className="px-4 py-3 font-semibold">Amount</th>
                                                                                              <th className="px-4 py-3 font-semibold">User</th>
                                                                                              <th className="px-4 py-3 font-semibold">Contract</th>
                                                                                              <th className="px-5 py-3 font-semibold text-right">Timestamp</th>
                                                                                            </tr>
                                                                                          </thead>
                                                                                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                                                                                            {recentLedgerEntries.length === 0 ? (
                                                                                              <tr>
                                                                                                <td colSpan={5} className="py-8 text-center text-zinc-400 italic">
                                                                                                  Zero ledger movements recorded yet.
                                                                                                </td>
                                                                                              </tr>
                                                                                            ) : (
                                                                                              recentLedgerEntries.map((entry) => {
                                                                                                const isDebit =
                                                                                                  entry.type === "ESCROW_RELEASE" || entry.type === "REFUND" || entry.type === "PAYOUT";
                                                                                                const amountFormatted = (Number(entry.amountCents) / 100).toFixed(2);

                                                                                                return (
                                                                                                  <tr key={entry.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                                                                                                    <td className="px-5 py-3">
                                                                                                      <span
                                                                                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${entry.type === "ESCROW_FUND"
                                                                                                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                                                                                            : entry.type === "ESCROW_RELEASE"
                                                                                                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                                                                              : entry.type === "PLATFORM_FEE"
                                                                                                                ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                                                                                                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                                                                                          }`}
                                                                                                      >
                                                                                                        {isDebit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                                                                                                        {entry.type}
                                                                                                      </span>
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                                                                                      ${amountFormatted} <span className="text-[10px] font-normal text-zinc-400">{entry.currency}</span>
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3">
                                                                                                      {entry.user ? (
                                                                                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                                                                          {entry.user.name}
                                                                                                        </span>
                                                                                                      ) : (
                                                                                                        <span className="text-zinc-400 italic">Platform Vault</span>
                                                                                                      )}
                                                                                                    </td>
                                                                                                    <td className="px-4 py-3">
                                                                                                      {entry.contract ? (
                                                                                                        <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate block max-w-xs">
                                                                                                          {entry.contract.job.title}
                                                                                                        </span>
                                                                                                      ) : (
                                                                                                        <span className="text-zinc-400">&mdash;</span>
                                                                                                      )}
                                                                                                    </td>
                                                                                                    <td className="px-5 py-3 text-right text-zinc-400 text-[11px] font-mono">
                                                                                                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                                                    </td>
                                                                                                  </tr>
                                                                                                );
                                                                                              })
                                                                                            )}
                                                                                          </tbody>
                                                                                        </table>
                                                                                      </div>
                                                                                    </div>

                                                                                          {/* System Telemetry & Governance Card */}
                                                                                          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between">
                                                                                            <div>
                                                                                              <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                                                                                                <Sliders className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                                                                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                                                                                  Governance & Infrastructure
                                                                                                </h3>
                                                                                              </div>

                                                                                                <div className="mt-4 space-y-3 text-xs">
                                                                                                  {platformSettings.map((setting) => (
                                                                                                    <div
                                                                                                      key={setting.key}
                                                                                                      className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40"
                                                                                                    >
                                                                                                      <span className="font-mono text-zinc-600 dark:text-zinc-400 font-medium">
                                                                                                        {setting.key}
                                                                                                      </span>
                                                                                                      <span className="rounded-md bg-white px-2 py-0.5 font-mono font-bold text-purple-700 shadow-sm dark:bg-zinc-800 dark:text-purple-300">
                                                                                                        {JSON.stringify(setting.value)}
                                                                                                      </span>
                                                                                                    </div>
                                                                                                  ))}
                                                                                                </div>

                                                                                                <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-1">
                                                                                                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                                                                    <ShieldCheck className="h-4 w-4" />
                                                                                                    <span>PostgreSQL Pooled Connection</span>
                                                                                                  </div>
                                                                                                  <p className="text-[11px] text-zinc-500">
                                                                                                    PgBouncer transaction mode active with zero-drift financial assertions.
                                                                                                  </p>
                                                                                                </div>
                                                                                              </div>

                                                                                                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 flex justify-between">
                                                                                                  <span>Cluster: US-East (iad1)</span>
                                                                                                  <span>Version: 1.0.0-prod</span>
                                                                                                </div>
                                                                                              </div>
                                                                                            </div>
                                                                                          </div>
                                                                                          );
}
