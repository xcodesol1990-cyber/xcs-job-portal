import { auth } from "@/server/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ContractService } from "@/server/services/contract.service";
import { ContractMilestoneActions } from "@/components/forms/contract-milestone-actions";
import {
  ArrowLeft,
  FileCheck,
  Receipt,
} from "lucide-react";

interface ContractPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractRoomPage({ params }: ContractPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let contract;
  try {
    contract = await ContractService.getContract(id, session.user.id);
  } catch {
    notFound();
  }

  const isClient = contract.clientId === session.user.id;
  const isFreelancer = contract.freelancerId === session.user.id;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        href={isClient ? "/client" : "/freelancer"}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to workspace</span>
      </Link>

      {/* Contract Banner */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  contract.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : contract.status === "COMPLETED"
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                }`}
              >
                {contract.status}
              </span>
              <span className="text-xs text-zinc-500">
                Created {new Date(contract.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {contract.job.title}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
              <span>Client: {contract.client.clientProfile?.companyName ?? contract.client.name}</span>
              <span>•</span>
              <span>Freelancer: {contract.freelancer.name}</span>
            </div>
          </div>

          <div className="text-right sm:pl-6">
            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
              ${(Number(contract.totalCents) / 100).toFixed(0)}
            </span>
            <div className="mt-1 text-xs text-zinc-500">Total Contract Value (USD)</div>
          </div>
        </div>
      </div>

      {/* Milestones Flow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-indigo-500" />
            <span>Escrow Milestones</span>
          </h2>
          <span className="text-xs text-zinc-500">
            {contract.milestones.filter((m) => m.status === "RELEASED").length} of{" "}
            {contract.milestones.length} completed
          </span>
        </div>

        <div className="space-y-3">
          {contract.milestones.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 font-mono text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {m.position}
                    </span>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {m.title}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        m.status === "RELEASED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : m.status === "FUNDED"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          : m.status === "SUBMITTED"
                          ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {m.description && (
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {m.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                      ${(Number(m.amountCents) / 100).toFixed(0)}
                    </span>
                    <div className="text-[11px] text-zinc-400">Escrow Value</div>
                  </div>

                  {/* Contextual Action Buttons */}
                  <ContractMilestoneActions
                    contractId={contract.id}
                    milestoneId={m.id}
                    status={m.status}
                    isClient={isClient}
                    isFreelancer={isFreelancer}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Ledger Audit */}
      {contract.ledgerEntries.length > 0 && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
            <Receipt className="h-4 w-4 text-emerald-500" />
            <span>Escrow Ledger Audit Trail</span>
          </div>

          <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {contract.ledgerEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {entry.type}
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-zinc-400">
                    {entry.idempotencyKey}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    ${(Number(entry.amountCents) / 100).toFixed(2)}
                  </span>
                  <span className="text-zinc-400">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
