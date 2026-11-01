import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { AdminNav } from "@/components/admin/admin-nav";
import { DisputeResolver } from "@/components/admin/dispute-resolver";
import Link from "next/link";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface DisputesPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminDisputesPage({ searchParams }: DisputesPageProps) {
  const session = await auth();
  if (!session?.user?.roles?.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? "1", 10) || 1;
  const statusFilter = resolvedParams.status;

  const { disputes, total, totalPages } = await adminService.listDisputes({
    page,
    limit: 25,
    status: (statusFilter as import("@prisma/client").DisputeStatus) || undefined,
  });

  return (
    <div className="space-y-6">
      <AdminNav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Contract Disputes & Escrow Arbitration
          </h2>
          <p className="text-xs text-zinc-500">
            Total {total} disputes registered for formal arbitration.
          </p>
        </div>

        {/* Quick status filter pills */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Link
            href="/admin/disputes"
            className={`rounded-xl px-3 py-1.5 transition ${
              !statusFilter
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            All Disputes
          </Link>
          <Link
            href="/admin/disputes?status=OPEN"
            className={`rounded-xl px-3 py-1.5 transition ${
              statusFilter === "OPEN"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            Active Contested
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {disputes.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Zero Active Disputes
            </h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
              All marketplace contracts and deliverables are progressing without contention.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {disputes.map((dispute) => {
              const isOpen = dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW";

              return (
                <div key={dispute.id} className="p-6 transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            isOpen
                              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-900/40"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOpen ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                            }`}
                          />
                          {dispute.status}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Filed {new Date(dispute.createdAt).toLocaleDateString()} by{" "}
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{dispute.openedBy.name}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        <Link href={`/contracts/${dispute.contractId}`} className="hover:underline flex items-center gap-1.5">
                          <span>{dispute.contract.job.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                        </Link>
                      </h3>

                      <p className="text-xs text-zinc-500">
                        Client: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{dispute.contract.client.name}</span> &bull; Freelancer: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{dispute.contract.freelancer.name}</span>
                        {dispute.milestone && (
                          <> &bull; Contested Milestone: <span className="font-semibold text-purple-600 dark:text-purple-400">{dispute.milestone.title}</span> (${(Number(dispute.milestone.amountCents) / 100).toFixed(2)})</>
                        )}
                      </p>

                      <div className="mt-3 rounded-xl border border-zinc-200/60 bg-zinc-50/70 p-3.5 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-200">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Dispute Claim: </span>
                        {dispute.reason}
                      </div>

                      {dispute.resolutionNote && (
                        <div className="mt-2 rounded-xl border border-purple-200/60 bg-purple-50/70 p-3.5 text-xs text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-300">
                          <span className="font-bold">Official Arbitration Ruling: </span>
                          {dispute.resolutionNote}
                          {dispute.resolvedBy && (
                            <span className="block mt-1 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                              Executed by Admin {dispute.resolvedBy.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end gap-2 shrink-0">
                      {isOpen && (
                        <DisputeResolver
                          disputeId={dispute.id}
                          contractTitle={dispute.contract.job.title}
                          clientName={dispute.contract.client.name}
                          freelancerName={dispute.contract.freelancer.name}
                          milestoneTitle={dispute.milestone?.title}
                          amountCents={dispute.milestone?.amountCents.toString()}
                          currency={dispute.contract.currency}
                        />
                      )}
                      <Link
                        href={`/contracts/${dispute.contractId}`}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        Inspect Contract Room
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  href={`/admin/disputes?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                  className="rounded-lg border border-zinc-200 px-3 py-1 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/disputes?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
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
