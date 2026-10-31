import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { AdminNav } from "@/components/admin/admin-nav";
import { ReportStatusButton } from "@/components/admin/report-status-button";
import { Flag, CheckCircle2 } from "lucide-react";

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
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {reports.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Clean Moderation Queue
            </p>
            <p className="text-xs text-zinc-500">No pending abuse or spam flags reported.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Target Entity</th>
                  <th className="px-4 py-3 font-semibold">Flagged By</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          report.status === "OPEN"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : report.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        <Flag className="h-3 w-3" />
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-bold dark:bg-zinc-800">
                        {report.targetType}
                      </span>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {report.targetId}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {report.reporter.name}
                      <div className="text-[10px] text-zinc-400">{report.reporter.email}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs text-zinc-700 dark:text-zinc-300">
                      {report.reason}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-[11px]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
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
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-xs dark:border-zinc-800">
            <span className="text-zinc-500">
              Page {page} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
