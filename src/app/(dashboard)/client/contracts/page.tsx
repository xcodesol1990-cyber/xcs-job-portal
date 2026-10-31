import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ContractService } from "@/server/services/contract.service";
import { Briefcase, Eye } from "lucide-react";

export default async function ClientContractsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const contracts = await ContractService.getUserContracts(session.user.id);
  const clientContracts = contracts.filter((c) => c.clientId === session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Briefcase className="h-4 w-4" />
          <span>Active & Completed Contracts</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Escrow Contracts
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage milestones, review submitted deliverables, and authorize payments.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {clientContracts.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/contracts/${c.id}`}
                    className="font-bold text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400 transition"
                  >
                    {c.job.title}
                  </Link>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      c.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : c.status === "COMPLETED"
                        ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                  <span>Freelancer: {c.freelancer.name}</span>
                  <span>•</span>
                  <span>{c.milestones.length} milestones</span>
                  <span>•</span>
                  <span>Started {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                    ${(Number(c.totalCents) / 100).toFixed(0)}
                  </span>
                  <div className="text-[11px] text-zinc-400">Total Escrow</div>
                </div>
                <Link
                  href={`/contracts/${c.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <Eye className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Open Room</span>
                </Link>
              </div>
            </div>
          ))}

          {clientContracts.length === 0 && (
            <div className="p-12 text-center text-xs text-zinc-500">
              No active contracts yet. Once you hire candidates from their proposals, active contracts will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
