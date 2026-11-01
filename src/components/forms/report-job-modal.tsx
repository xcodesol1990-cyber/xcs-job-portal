"use client";

import { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";
import { reportJobAction } from "@/server/actions/job.actions";
import { toast } from "sonner";

interface ReportJobModalProps {
  jobId: string;
}

export function ReportJobModal({ jobId }: ReportJobModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for the report.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Submitting report to trust & safety...");

    try {
      const res = await reportJobAction(jobId, reason);
      if (res.success) {
        toast.success("Listing reported. Our moderation team will investigate.", { id: toastId });
        setIsOpen(false);
        setReason("");
      } else {
        toast.error(res.error || "Failed to submit report.", { id: toastId });
      }
    } catch {
      toast.error("An unexpected error occurred.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-600 transition dark:text-zinc-400 dark:hover:text-red-400"
      >
        <Flag className="h-3.5 w-3.5" />
        <span>Report this job</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  Report Job Listing
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                  Reason for Flagging <span className="text-red-500">*</span>
                </label>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  Help us understand why this job violates community standards (e.g. asking for
                  off-platform payment, spam, misleading scope).
                </p>
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the issue with this job listing..."
                  className="mt-2 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/50 p-3 text-xs text-zinc-900 focus:border-red-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
