import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ContractService } from "@/server/services/contract.service";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Briefcase, Eye } from "lucide-react";

export default async function ClientContractsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const contracts = await ContractService.getUserContracts(session.user.id);
  const clientContracts = contracts.filter((c) => c.clientId === session.user.id);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "COMPLETED":
        return "purple";
      case "DISPUTED":
        return "destructive";
      default:
        return "warning";
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Escrow Contracts"
        badgeIcon={Briefcase}
        badgeVariant="info"
        title="Your Active & Completed Engagements"
        description="Monitor milestone execution, inspect submitted deliverables, and authorize cryptographic escrow releases."
      />

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {clientContracts.map((c) => {
            const completedMilestones = c.milestones.filter((m) => m.status === "RELEASED").length;
            const progressPct =
              c.milestones.length > 0
                ? Math.round((completedMilestones / c.milestones.length) * 100)
                : 0;

            return (
              <div
                key={c.id}
                className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/contracts/${c.id}`}
                      className="font-bold text-zinc-900 hover:text-purple-600 dark:text-zinc-100 dark:hover:text-purple-400 transition"
                    >
                      {c.job.title}
                    </Link>
                    <Badge variant={getStatusVariant(c.status)} dot={c.status === "ACTIVE"}>
                      {c.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Freelancer: {c.freelancer.name}
                    </span>
                    <span>•</span>
                    <span>{c.milestones.length} milestones</span>
                    <span>•</span>
                    <span>Started {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 pt-1 max-w-xs">
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 whitespace-nowrap">
                      {completedMilestones}/{c.milestones.length} ({progressPct}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="font-mono text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                      ${(Number(c.totalCents) / 100).toFixed(0)}
                    </span>
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Total Escrow
                    </div>
                  </div>

                  <Link
                    href={`/contracts/${c.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-700 shadow-xs transition hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/60"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Open Contract Room</span>
                  </Link>
                </div>
              </div>
            );
          })}

          {clientContracts.length === 0 && (
            <div className="p-8">
              <EmptyState
                icon={Briefcase}
                title="No active contracts yet"
                description="Once you accept candidate proposals from your job listings, escrow-backed contracts will appear here."
                action={{
                  label: "View Posted Jobs",
                  href: "/client/jobs",
                  icon: Briefcase,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
