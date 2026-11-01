import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { AdminNav } from "@/components/admin/admin-nav";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, ShieldCheck, ExternalLink } from "lucide-react";

interface LedgerPageProps {
  searchParams: Promise<{ page?: string; contractId?: string }>;
}

export default async function AdminLedgerPage({ searchParams }: LedgerPageProps) {
  const session = await auth();
  if (!session?.user?.roles?.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? "1", 10) || 1;
  const contractId = resolvedParams.contractId;

  const { entries, total, totalPages } = await adminService.listLedgerEntries({
    page,
    limit: 25,
    contractId: contractId || undefined,
  });

  return (
    <div className="space-y-6">
      <AdminNav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Cryptographic Idempotency & Balance Invariants</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Double-Entry Ledger Audit Trail
          </h2>
          <p className="text-xs text-zinc-500">
            Total {total} financial movements recorded in minor units (integer cents).
          </p>
        </div>

        {contractId && (
          <Link
            href="/admin/ledger"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            Clear Contract Filter &times;
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-4 py-3.5 font-semibold">Amount</th>
                <th className="px-4 py-3.5 font-semibold">User</th>
                <th className="px-4 py-3.5 font-semibold">Contract Context</th>
                <th className="px-4 py-3.5 font-semibold font-mono">Idempotency Key</th>
                <th className="px-5 py-3.5 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {entries.map((entry) => {
                const isDebit =
                  entry.type === "ESCROW_RELEASE" ||
                  entry.type === "REFUND" ||
                  entry.type === "PAYOUT";
                const amountFormatted = (Number(entry.amountCents) / 100).toFixed(2);

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${
                          entry.type === "ESCROW_FUND"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40"
                            : entry.type === "ESCROW_RELEASE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40"
                              : entry.type === "REFUND"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40"
                                : entry.type === "PLATFORM_FEE"
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40"
                                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {isDebit ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        )}
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-900 dark:text-zinc-100 text-[13px]">
                      ${amountFormatted}{" "}
                      <span className="text-[11px] font-normal text-zinc-400">
                        {entry.currency}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {entry.user ? (
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {entry.user.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {entry.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Marketplace Vault</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {entry.contract ? (
                        <div>
                          <Link
                            href={`/contracts/${entry.contractId}`}
                            className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100 flex items-center gap-1"
                          >
                            <span>{entry.contract.job.title}</span>
                            <ExternalLink className="h-3 w-3 text-zinc-400" />
                          </Link>
                          {entry.milestone && (
                            <div className="text-[10px] text-zinc-400">
                              Milestone: {entry.milestone.title}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-400">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[10px] text-zinc-400 max-w-xs truncate">
                      {entry.idempotencyKey}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400 text-[11px] text-right font-mono">
                      {new Date(entry.createdAt).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200/80 px-5 py-3.5 text-xs dark:border-zinc-800">
            <span className="text-zinc-500">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/ledger?page=${page - 1}${contractId ? `&contractId=${contractId}` : ""}`}
                  className="rounded-lg border border-zinc-200 px-3 py-1 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/ledger?page=${page + 1}${contractId ? `&contractId=${contractId}` : ""}`}
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
