import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { AdminNav } from "@/components/admin/admin-nav";
import { DisputeResolver } from "@/components/admin/dispute-resolver";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
    status: statusFilter,
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
            Total {total} disputes registered in the marketplace.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {disputes.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Zero Active Disputes
            </p>
            <p className="text-xs text-zinc-500">All contracts are progressing smoothly without contention.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {disputes.map((dispute) => {
              const isOpen = dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW";

              return (
                <div key={dispute.id} className="p-6 transition hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            isOpen
                              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          }`}
                        >
                          {isOpen ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                          {dispute.status}
                        </span>
                        <span className="text-xs text-zinc-400">
                          Opened {new Date(dispute.createdAt).toLocaleDateString()} by {dispute.openedBy.name}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        <Link href={`/contracts/${dispute.contractId}`} className="hover:underline">
                          {dispute.contract.job.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Client: <span className="font-semibold">{dispute.contract.client.name}</span> &bull; Freelancer: <span className="font-semibold">{dispute.contract.freelancer.name}</span>
                        {dispute.milestone && (
                          <> &bull; Contested Milestone: <span className="font-semibold">{dispute.milestone.title}</span> (${(Number(dispute.milestone.amountCents) / 100).toFixed(2)})</>
                        )}
                      </p>

                      <div className="mt-3 rounded-xl bg-zinc-50 p-3.5 text-xs text-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">Dispute Claim: </span>
                        {dispute.reason}
                      </div>

                      {dispute.resolutionNote && (
                        <div className="mt-2 rounded-xl bg-purple-50/60 p-3.5 text-xs text-purple-900 dark:bg-purple-950/30 dark:text-purple-300">
                          <span className="font-semibold">Arbitration Ruling: </span>
                          {dispute.resolutionNote}
                          {dispute.resolvedBy && (
                            <span className="block mt-1 text-[11px] text-purple-600 dark:text-purple-400">
                              Resolved by Admin {dispute.resolvedBy.name}
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
                        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
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
