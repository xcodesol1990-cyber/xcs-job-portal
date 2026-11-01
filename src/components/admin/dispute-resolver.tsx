"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveDisputeAction } from "@/server/actions/dispute.actions";
import { DisputeStatus } from "@prisma/client";
import { toast } from "sonner";
import { Loader2, Gavel, X, Scale } from "lucide-react";

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
  const router = useRouter();

  const parsedAmount = amountCents ? Number(amountCents) / 100 : 0;

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const toastId = toast.loading("Executing arbitration ruling and updating ledger...");

    try {
      const res = await resolveDisputeAction(disputeId, {
        resolution,
        resolutionNote: note,
        splitFreelancerPercent: resolution === "RESOLVED_SPLIT" ? splitPercent : undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to resolve dispute.");
      }

      const resolutionLabel =
        resolution === "RESOLVED_CLIENT"
          ? `Full refund issued to ${clientName}`
          : resolution === "RESOLVED_FREELANCER"
          ? `Full release awarded to ${freelancerName}`
          : `Split: ${splitPercent}% Freelancer / ${100 - splitPercent}% Client`;

      toast.success("Dispute successfully arbitrated!", {
        id: toastId,
        description: resolutionLabel,
      });

      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resolve dispute";
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-purple-500 hover:to-indigo-500 hover:shadow"
      >
        <Gavel className="h-3.5 w-3.5" />
        <span>Arbitrate & Resolve</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Judicial Arbitration Desk
                </h3>
                <p className="text-xs text-zinc-500">
                  Binding dispute resolution & escrow distribution
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-xs dark:border-zinc-800/80 dark:bg-zinc-800/50">
              <div className="flex justify-between">
                <span className="text-zinc-500">Contract:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{contractTitle}</span>
              </div>
              {milestoneTitle && (
                <div className="flex justify-between mt-1">
                  <span className="text-zinc-500">Contested Milestone:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{milestoneTitle}</span>
                </div>
              )}
              {parsedAmount > 0 && (
                <div className="flex justify-between mt-1 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60 font-semibold">
                  <span className="text-zinc-500">Escrow Value:</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    ${parsedAmount.toFixed(2)} {currency}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleResolve} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Ruling Decision
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => setResolution("RESOLVED_CLIENT")}
                    className={`rounded-xl border p-3 text-left transition ${
                      resolution === "RESOLVED_CLIENT"
                        ? "border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-300"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <p className="text-xs font-bold">Refund Client</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">100% to {clientName}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolution("RESOLVED_FREELANCER")}
                    className={`rounded-xl border p-3 text-left transition ${
                      resolution === "RESOLVED_FREELANCER"
                        ? "border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-300"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <p className="text-xs font-bold">Release Talent</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">100% to {freelancerName}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolution("RESOLVED_SPLIT")}
                    className={`rounded-xl border p-3 text-left transition ${
                      resolution === "RESOLVED_SPLIT"
                        ? "border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-300"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <p className="text-xs font-bold">Split Escrow</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">Proportional split</p>
                  </button>
                </div>
              </div>

              {resolution === "RESOLVED_SPLIT" && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>Talent: {splitPercent}% (${((parsedAmount * splitPercent) / 100).toFixed(2)})</span>
                    <span>Client: {100 - splitPercent}% (${((parsedAmount * (100 - splitPercent)) / 100).toFixed(2)})</span>
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
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Judicial Reasoning & Official Resolution Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Detail findings from deliverable inspection, communication records, and the rationale for this ruling..."
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-900 focus:border-purple-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Execute Ruling</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
