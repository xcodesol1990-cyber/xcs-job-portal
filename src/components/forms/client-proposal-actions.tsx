"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateProposalStatusAction } from "@/server/actions/proposal.actions";
import { startConversationAction } from "@/server/actions/messaging.actions";
import { MessageSquare, Check, X, ArrowRight } from "lucide-react";

interface ClientProposalActionsProps {
  jobId: string;
  proposalId: string;
  freelancerId: string;
  currentStatus: string;
}

export function ClientProposalActions({
  jobId,
  proposalId,
  freelancerId,
  currentStatus,
}: ClientProposalActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "SHORTLISTED" | "REJECTED") => {
    startTransition(async () => {
      await updateProposalStatusAction(proposalId, jobId, status);
      router.refresh();
    });
  };

  const handleMessage = () => {
    startTransition(async () => {
      // In Client context, session user is the client
      const res = await startConversationAction(
        "", // Server action resolves session user ID as client
        freelancerId,
        jobId,
      );
      if (res.conversationId) {
        router.push(`/messages/${res.conversationId}`);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/client/contracts/new?proposalId=${proposalId}`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
      >
        <span>Hire & Fund</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      <button
        type="button"
        disabled={isPending}
        onClick={handleMessage}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
      >
        <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
        <span>Chat</span>
      </button>

      {currentStatus !== "SHORTLISTED" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("SHORTLISTED")}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-emerald-400"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Shortlist</span>
        </button>
      )}

      {currentStatus !== "REJECTED" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleStatusChange("REJECTED")}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-red-50 hover:text-red-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
        >
          <X className="h-3.5 w-3.5" />
          <span>Decline</span>
        </button>
      )}
    </div>
  );
}
