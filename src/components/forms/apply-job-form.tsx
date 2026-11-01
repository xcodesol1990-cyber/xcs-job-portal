"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitProposalAction } from "@/server/actions/proposal.actions";
import { Loader2, DollarSign, Send, Clock } from "lucide-react";

interface ApplyJobFormProps {
  jobId: string;
  budgetType: "FIXED" | "HOURLY";
}

export function ApplyJobForm({ jobId, budgetType }: ApplyJobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [bid, setBid] = useState("500");
  const [estimatedDays, setEstimatedDays] = useState("14");
  const [coverLetter, setCoverLetter] = useState("");

  const bidNum = Number(bid) || 0;
  const platformFee = Math.round(bidNum * 0.1); // 10% platform fee
  const freelancerReceives = Math.max(0, bidNum - platformFee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("bid", bid);
    formData.append("estimatedDays", estimatedDays);
    formData.append("coverLetter", coverLetter);

    startTransition(async () => {
      const result = await submitProposalAction(null, formData);
      if (!result.success) {
        setError(result.error ?? "Failed to submit proposal.");
      } else {
        router.push("/freelancer/proposals");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Bid Breakdown */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              {budgetType === "HOURLY" ? "Hourly Bid Rate ($/hr)" : "Total Bid Amount ($)"}
            </label>
            <div className="relative mt-1.5">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="5"
                required
                value={bid}
                onChange={(e) => setBid(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3.5 text-sm font-semibold text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">The total amount the client will see.</p>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Estimated Delivery Time (Days)
            </label>
            <div className="relative mt-1.5">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="1"
                required
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3.5 text-sm font-semibold text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">Target completion timeframe.</p>
          </div>
        </div>

        {/* Financial Transparency */}
        <div className="border-t border-zinc-200/70 pt-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 space-y-1.5">
          <div className="flex justify-between">
            <span>WorkNest 10% Platform & Escrow Fee:</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">-${platformFee}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100 pt-1">
            <span>You&apos;ll receive (after milestone approval):</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              ${freelancerReceives}
            </span>
          </div>
        </div>
      </div>

      {/* Cover Letter */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Cover Letter & Pitch
        </label>
        <textarea
          rows={6}
          required
          minLength={20}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Explain why you are the best fit for this project, how you will approach the deliverables, and mention relevant past experience..."
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Provide actionable technical context to stand out.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Submit Proposal</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
