"use client";

import { useState } from "react";
import { resolveDisputeAction } from "@/server/actions/dispute.actions";
import { DisputeStatus } from "@prisma/client";
import { Loader2, Gavel, X } from "lucide-react";

interface DisputeResolverProps {
  disputeId: string;
  contractTitle: string;
  clientName: string;
  freelancerName: string;
  milestoneTitle?: string | null;
  amountCents?: string;
  currency?: string;
}

export function DisputeResolver({
  disputeId,
  contractTitle,
  clientName,
  freelancerName,
  milestoneTitle,
  amountCents,
  currency = "USD",
}: DisputeResolverProps) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState<DisputeStatus>("RESOLVED_CLIENT");
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = amountCents ? Number(amountCents) / 100 : 0;

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await resolveDisputeAction(disputeId, {
      resolution,
      resolutionNote: note,
      splitFreelancerPercent: resolution === "RESOLVED_SPLIT" ? splitPercent : undefined,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to resolve dispute");
    } else {
      setOpen(false);
      window.location.reload();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700"
      >
        <Gavel className="h-3.5 w-3.5" />
        Arbitrate & Resolve
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Gavel className="h-5 w-5" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Arbitrate Dispute
              </h3>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Contract: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{contractTitle}</span>
              {milestoneTitle && <> &bull; Milestone: <span className="font-semibold">{milestoneTitle}</span></>}
              {parsedAmount > 0 && <> &bull; Escrow: <span className="font-semibold">${parsedAmount.toFixed(2)} {currency}</span></>}
            </p>

            <form onSubmit={handleResolve} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Ruling Decision
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setResolution("RESOLVED_CLIENT")}
                    className={`rounded-lg border p-3 text-left transition ${
                      resolution === "RESOLVED_CLIENT"
                        ? "border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
                        : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <p className="text-xs font-bold">Refund Client</p>
                    <p className="text-[10px] text-zinc-500">100% to {clientName}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolution("RESOLVED_FREELANCER")}
                    className={`rounded-lg border p-3 text-left transition ${
                      resolution === "RESOLVED_FREELANCER"
                        ? "border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
                        : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <p className="text-xs font-bold">Release Freelancer</p>
                    <p className="text-[10px] text-zinc-500">100% to {freelancerName}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolution("RESOLVED_SPLIT")}
                    className={`rounded-lg border p-3 text-left transition ${
                      resolution === "RESOLVED_SPLIT"
                        ? "border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-300"
                        : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <p className="text-xs font-bold">Split Escrow</p>
                    <p className="text-[10px] text-zinc-500">Custom ratio</p>
                  </button>
                </div>
              </div>

              {resolution === "RESOLVED_SPLIT" && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="flex justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <span>Freelancer Share: {splitPercent}% (${((parsedAmount * splitPercent) / 100).toFixed(2)})</span>
                    <span>Client Share: {100 - splitPercent}% (${((parsedAmount * (100 - splitPercent)) / 100).toFixed(2)})</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="99"
                    value={splitPercent}
                    onChange={(e) => setSplitPercent(Number(e.target.value))}
                    className="mt-2 w-full accent-purple-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Judicial Reasoning & Official Resolution Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="State the findings from deliverable inspection, communication logs, and the rationale for this ruling..."
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-purple-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Execute Ruling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

