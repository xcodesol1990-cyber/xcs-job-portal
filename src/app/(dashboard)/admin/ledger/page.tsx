import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { AdminNav } from "@/components/admin/admin-nav";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

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
    limit: 30,
    contractId: contractId || undefined,
  });

  return (
    <div className="space-y-6">
      <AdminNav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Immutable Double-Entry Ledger Audit Trail
          </h2>
          <p className="text-xs text-zinc-500">
            Total {total} financial ledger entries recorded with cryptographic idempotency keys.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Contract / Milestone</th>
                <th className="px-4 py-3 font-semibold font-mono">Idempotency Key</th>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {entries.map((entry) => {
                const isDebit = entry.type === "ESCROW_RELEASE" || entry.type === "REFUND" || entry.type === "PAYOUT";
                const amountFormatted = (Number(entry.amountCents) / 100).toFixed(2);

                return (
                  <tr key={entry.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
                          entry.type === "ESCROW_FUND"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                            : entry.type === "ESCROW_RELEASE"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : entry.type === "REFUND"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : entry.type === "PLATFORM_FEE"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {isDebit ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ${amountFormatted} {entry.currency}
                    </td>
                    <td className="px-4 py-3">
                      {entry.user ? (
                        <div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{entry.user.name}</span>
                          <span className="block text-[10px] text-zinc-400">{entry.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Platform Account</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {entry.contract ? (
                        <div>
                          <Link href={`/contracts/${entry.contractId}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                            {entry.contract.job.title}
                          </Link>
                          {entry.milestone && (
                            <span className="block text-[10px] text-zinc-400">
                              Milestone: {entry.milestone.title}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-400">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-zinc-400">
                      {entry.idempotencyKey}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-[11px]">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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
