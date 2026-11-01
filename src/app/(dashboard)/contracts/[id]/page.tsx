import { auth } from "@/server/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ContractService } from "@/server/services/contract.service";
import { ContractMilestoneActions } from "@/components/forms/contract-milestone-actions";
import { ContractReviewForm } from "@/components/forms/contract-review-form";
import { OpenDisputeModal } from "@/components/forms/open-dispute-modal";
import { ContractHuddleModal } from "@/components/chat/contract-huddle-modal";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileCheck,
  Receipt,
  AlertCircle,
  Star,
  MessageSquare,
  Lock,
  Building2,
  User,
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
  const activeDispute = contract.disputes.find(
    (d) => d.status === "OPEN" || d.status === "UNDER_REVIEW",
  );
  const userReview = contract.reviews.find((r) => r.reviewerId === session.user.id);
  const canDispute =
    (isClient || isFreelancer) &&
    contract.status !== "COMPLETED" &&
    contract.status !== "CANCELLED";

  const completedMilestones = contract.milestones.filter((m) => m.status === "RELEASED").length;
  const progressPct =
    contract.milestones.length > 0
      ? Math.round((completedMilestones / contract.milestones.length) * 100)
      : 0;

  const getContractStatusVariant = (status: string) => {
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

  const getMilestoneStatusVariant = (status: string) => {
    switch (status) {
      case "RELEASED":
        return "purple";
      case "FUNDED":
        return "success";
      case "SUBMITTED":
        return "info";
      case "DISPUTED":
        return "destructive";
      case "REVISION_REQUESTED":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href={
            isAdmin ? "/admin/disputes" : isClient ? "/client/contracts" : "/freelancer/contracts"
          }
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to contracts</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <ContractHuddleModal
            contractId={contract.id}
            counterpartName={
              isClient
                ? contract.freelancer.name
                : (contract.client.clientProfile?.companyName ?? contract.client.name)
            }
            counterpartRole={isClient ? "Freelancer" : "Client"}
          />

          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <MessageSquare className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span>Messages</span>
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
      </div>

      {/* Dispute Alert Banner */}
      {activeDispute && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-50 p-6 text-red-900 dark:bg-red-950/20 dark:text-red-200">
          <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-bold">Contract Disputed & Payouts Paused</h3>
            <p className="mt-1 text-xs text-red-800 dark:text-red-300">
              A dispute was filed by{" "}
              <span className="font-semibold">{activeDispute.openedBy.name}</span>: &quot;
              {activeDispute.reason}&quot;. Our platform compliance team is reviewing deliverable
              logs and milestone submissions.
            </p>
          </div>
        </div>
      )}

      {/* Contract Banner */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Badge
                variant={getContractStatusVariant(contract.status)}
                dot={contract.status === "ACTIVE"}
              >
                {contract.status}
              </Badge>
              <span className="text-xs text-zinc-500">
                Created {new Date(contract.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {contract.job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                <Building2 className="h-4 w-4 text-zinc-400" />
                <span>
                  Client: {contract.client.clientProfile?.companyName ?? contract.client.name}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                <User className="h-4 w-4 text-zinc-400" />
                <span>Freelancer: {contract.freelancer.name}</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="font-mono text-3xl font-black text-zinc-900 dark:text-zinc-100">
              ${(Number(contract.totalCents) / 100).toFixed(0)}
            </span>
            <div className="mt-1 text-xs text-zinc-500">Total Contract Escrow (USD)</div>
          </div>
        </div>

        {/* Milestone Progress Indicator */}
        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Escrow Progress</span>
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {completedMilestones} of {contract.milestones.length} milestones released (
              {progressPct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestones Flow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span>Milestone Schedule & Deliverables</span>
          </h2>
        </div>

        <div className="space-y-3">
          {contract.milestones.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-zinc-400">#{m.position}</span>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {m.title}
                    </h3>
                    <Badge variant={getMilestoneStatusVariant(m.status)}>{m.status}</Badge>
                  </div>
                  {m.description && (
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                      {m.description}
                    </p>
                  )}
                  {m.submittedAt && (
                    <div className="text-[11px] text-zinc-400 pt-1">
                      Submitted on: {new Date(m.submittedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <span className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    ${(Number(m.amountCents) / 100).toFixed(0)}
                  </span>

                  <ContractMilestoneActions
                    contractId={contract.id}
                    milestoneId={m.id}
                    status={m.status}
                    isClient={isClient}
                    isFreelancer={isFreelancer}
                    amountDollars={Math.round(Number(m.amountCents) / 100)}
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
            <span>Contract Completed & Verified</span>
          </div>

          {!userReview ? (
            <ContractReviewForm
              contractId={contract.id}
              counterpartRole={isClient ? "Freelancer" : "Client"}
            />
          ) : (
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Feedback Submitted ({userReview.rating}/5 Stars)
              </span>
              {userReview.comment && (
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  &quot;{userReview.comment}&quot;
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Financial Ledger Audit Trail */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-sm font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
          <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span>Cryptographic Escrow Ledger Trail</span>
        </div>
        <div className="mt-4 divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
          {contract.ledgerEntries.map((l) => (
            <div key={l.id} className="flex items-center justify-between py-3">
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{l.type}</span>
                <span className="ml-2 text-zinc-400">
                  {new Date(l.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                ${(Number(l.amountCents) / 100).toFixed(2)}
              </span>
            </div>
          ))}

          {contract.ledgerEntries.length === 0 && (
            <div className="py-4 text-zinc-500 text-center">
              No financial escrow entries recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
