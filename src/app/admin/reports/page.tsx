import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { AdminNav } from "@/components/admin/admin-nav";
import { ReportStatusButton } from "@/components/admin/report-status-button";
import { Flag, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ReportsPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminReportsPage({ searchParams }: ReportsPageProps) {
  const session = await auth();
  if (!session?.user?.roles?.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? "1", 10) || 1;
  const statusFilter = resolvedParams.status;

  const { reports, total, totalPages } = await adminService.listReports({
    page,
    limit: 25,
    status: statusFilter,
  });

  return (
    <div className="space-y-6">
      <AdminNav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Community Moderation & Flagged Reports
          </h2>
          <p className="text-xs text-zinc-500">
            Total {total} user flags submitted for trust and safety review.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Link
            href="/admin/reports"
            className={`rounded-xl px-3 py-1.5 transition ${
              !statusFilter
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            All Reports
          </Link>
          <Link
            href="/admin/reports?status=OPEN"
            className={`rounded-xl px-3 py-1.5 transition ${
              statusFilter === "OPEN"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            Pending Flags
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {reports.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Clean Moderation Queue
            </h3>
            <p className="mt-1 text-xs text-zinc-500">No pending abuse or spam flags reported.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Target Entity</th>
                  <th className="px-4 py-3.5 font-semibold">Flagged By</th>
                  <th className="px-4 py-3.5 font-semibold">Reason</th>
                  <th className="px-4 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          report.status === "OPEN"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40"
                            : report.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60"
                        }`}
                      >
                        <Flag className="h-3 w-3" />
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {report.targetType}
                      </span>
                      <div className="text-[10px] text-zinc-400 font-mono mt-1">
                        {report.targetId}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                      <div>{report.reporter.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{report.reporter.email}</div>
                    </td>
                    <td className="px-4 py-3.5 max-w-sm text-zinc-700 dark:text-zinc-300">
                      {report.reason}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400 text-[11px]">
                      {new Date(report.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {report.status === "OPEN" && (
                        <ReportStatusButton reportId={report.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3.5 text-xs dark:border-zinc-800">
            <span className="text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/reports?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                  className="rounded-lg border border-zinc-200 px-3 py-1 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/reports?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                  className="rounded-lg border border-zinc-200 px-3 py-1 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
