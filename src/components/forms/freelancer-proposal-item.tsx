"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { withdrawProposalAction } from "@/server/actions/proposal.actions";
import { Loader2, ArrowRight } from "lucide-react";

interface FreelancerProposalItemProps {
  proposal: {
    id: string;
    coverLetter: string;
    bidCents: number;
    status: string;
    createdAt: Date;
    job: {
      id: string;
      title: string;
      currency: string;
      client: { name: string };
    };
  };
}

export function FreelancerProposalItem({ proposal }: FreelancerProposalItemProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleWithdraw = () => {
    if (!confirm("Are you sure you want to withdraw this proposal?")) return;
    startTransition(async () => {
      await withdrawProposalAction(proposal.id, proposal.job.id);
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/jobs/${proposal.job.id}`}
              className="text-base font-bold text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400 transition"
            >
              {proposal.job.title}
            </Link>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                proposal.status === "SHORTLISTED"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : proposal.status === "ACCEPTED"
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                  : proposal.status === "REJECTED"
                  ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                  : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
              }`}
            >
              {proposal.status}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
            <span>Client: {proposal.job.client.name}</span>
            <span>•</span>
            <span>Submitted {new Date(proposal.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Bid: ${(proposal.bidCents / 100).toFixed(0)} {proposal.job.currency}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {proposal.status === "SUBMITTED" && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleWithdraw}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-red-950/30"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Withdraw"}
            </button>
          )}
          <Link
            href={`/jobs/${proposal.job.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <span>View Job</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
