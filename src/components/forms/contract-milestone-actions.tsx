"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  fundMilestoneAction,
  submitDeliverableAction,
  approveAndReleaseAction,
  requestRevisionAction,
} from "@/server/actions/contract.actions";
import { Loader2, DollarSign, Send, CheckCircle2, RotateCcw } from "lucide-react";

interface MilestoneActionsProps {
  contractId: string;
  milestoneId: string;
  status: string;
  isClient: boolean;
  isFreelancer: boolean;
}

export function ContractMilestoneActions({
  contractId,
  milestoneId,
  status,
  isClient,
  isFreelancer,
}: MilestoneActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  const handleFund = () => {
    startTransition(async () => {
      await fundMilestoneAction(contractId, milestoneId);
      router.refresh();
    });
  };

  const handleApprove = () => {
    if (!confirm("Are you sure you want to approve this deliverable and release escrow payment?"))
      return;
    startTransition(async () => {
      await approveAndReleaseAction(contractId, milestoneId);
      router.refresh();
    });
  };

  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await submitDeliverableAction(contractId, milestoneId, notes);
      setShowSubmitModal(false);
      router.refresh();
    });
  };

  const handleRequestRevision = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await requestRevisionAction(contractId, milestoneId, reason);
      setShowRevisionModal(false);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* Client Actions */}
      {isClient && status === "PENDING" && (
        <button
          type="button"
          disabled={isPending}
          onClick={handleFund}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <DollarSign className="h-3.5 w-3.5" />
              <span>Deposit & Fund</span>
            </>
          )}
        </button>
      )}

      {isClient && status === "SUBMITTED" && (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve & Release</span>
              </>
            )}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowRevisionModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
            <span>Request Revision</span>
          </button>
        </>
      )}

      {/* Freelancer Actions */}
      {isFreelancer && (status === "FUNDED" || status === "REVISION_REQUESTED") && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Submit Work</span>
        </button>
      )}

      {/* Submit Deliverables Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmitDeliverable}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Submit Milestone Deliverable
            </h3>
            <p className="text-xs text-zinc-500">
              Provide project links, summaries, or notes for the client to review and approve.
            </p>
            <textarea
              rows={4}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Completed initial design components and pushed to repository branch..."
              className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send for Approval"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleRequestRevision}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Request Deliverable Revisions
            </h3>
            <p className="text-xs text-zinc-500">
              Explain clearly what changes or adjustments are required before escrow release.
            </p>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Please update mobile navigation spacing and verify form validation..."
              className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Send Revision Request"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
