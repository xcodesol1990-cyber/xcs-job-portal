import { auth } from "@/server/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ContractService } from "@/server/services/contract.service";
import { ContractMilestoneActions } from "@/components/forms/contract-milestone-actions";
import { ContractReviewForm } from "@/components/forms/contract-review-form";
import { OpenDisputeModal } from "@/components/forms/open-dispute-modal";
import {
  ArrowLeft,
  FileCheck,
  Receipt,
  AlertCircle,
  Star,
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

  const isAdmin = session.user.roles?.includes("ADMIN") ?? false;

  let contract;
  try {
    contract = await ContractService.getContract(id, session.user.id, isAdmin);
  } catch {
    notFound();
  }

  const isClient = contract.clientId === session.user.id;
  const isFreelancer = contract.freelancerId === session.user.id;
  const activeDispute = contract.disputes.find((d) => d.status === "OPEN" || d.status === "UNDER_REVIEW");
  const userReview = contract.reviews.find((r) => r.reviewerId === session.user.id);
  const canDispute = (isClient || isFreelancer) && contract.status !== "COMPLETED" && contract.status !== "CANCELLED";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href={isAdmin ? "/admin/disputes" : isClient ? "/client" : "/freelancer"}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to workspace</span>
        </Link>

        {canDispute && !activeDispute && (
          <OpenDisputeModal
            contractId={contract.id}
            milestones={contract.milestones.map((m) => ({
              id: m.id,
              title: m.title,
              status: m.status,
            }))}
          />
        )}
      </div>

      {/* Dispute Alert Banner */}
      {activeDispute && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-50 p-6 text-red-900 dark:bg-red-950/20 dark:text-red-200">
          <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-bold">Contract Disputed & Payouts Paused</h3>
            <p className="mt-1 text-xs text-red-800 dark:text-red-300">
              A dispute was filed by <span className="font-semibold">{activeDispute.openedBy.name}</span>: &quot;{activeDispute.reason}&quot;.
              Our platform compliance team is reviewing deliverable logs and milestone submissions.
            </p>
          </div>
        </div>
      )}

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
                    : contract.status === "DISPUTED"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
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
              className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-400">
                      #{m.position}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {m.title}
                    </h3>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        m.status === "RELEASED"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                          : m.status === "FUNDED"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : m.status === "SUBMITTED"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          : m.status === "DISPUTED"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  {m.description && (
                    <p className="mt-1 text-xs text-zinc-500">{m.description}</p>
                  )}
                  {m.dueDate && (
                    <div className="mt-2 text-[11px] text-zinc-400">
                      Due: {new Date(m.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    ${(Number(m.amountCents) / 100).toFixed(0)}
                  </span>

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

      {/* Contract Completion & Reviews */}
      {contract.status === "COMPLETED" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            <Star className="h-5 w-5 text-amber-500" />
            <span>Contract Reviews & Ratings</span>
          </div>

          {/* Review form if current user hasn't submitted yet */}
          {(isClient || isFreelancer) && !userReview && (
            <ContractReviewForm
              contractId={contract.id}
              counterpartRole={isClient ? "Freelancer" : "Client"}
            />
          )}

          {/* Display submitted reviews */}
          {contract.reviews.length > 0 && (
            <div className="space-y-3">
              {contract.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {rev.reviewer.name}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                      &quot;{rev.comment}&quot;
                    </p>
                  )}
                  <span className="mt-2 block text-[10px] text-zinc-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
