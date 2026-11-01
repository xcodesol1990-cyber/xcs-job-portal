"use client";

import { useState } from "react";
import { openDisputeAction } from "@/server/actions/dispute.actions";
import { AlertCircle, Loader2, X } from "lucide-react";

interface OpenDisputeModalProps {
  contractId: string;
  milestones: { id: string; title: string; status: string }[];
}

export function OpenDisputeModal({ contractId, milestones }: OpenDisputeModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string>("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await openDisputeAction({
      contractId,
      milestoneId: selectedMilestone || undefined,
      reason,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to submit dispute.");
    } else {
      setOpen(false);
      window.location.reload();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
      >
        <AlertCircle className="h-3.5 w-3.5" />
        File a Dispute
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

            <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Initiate Contract Dispute
              </h3>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Filing a dispute pauses milestone escrow payouts and alerts platform moderators to
              arbitrate.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </div>
              )}

              {milestones.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                    Disputed Milestone (Optional)
                  </label>
                  <select
                    value={selectedMilestone}
                    onChange={(e) => setSelectedMilestone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="">Entire Contract / General Issue</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                  Statement of Dispute & Evidence <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why the deliverables or contract terms are contested in detail..."
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
