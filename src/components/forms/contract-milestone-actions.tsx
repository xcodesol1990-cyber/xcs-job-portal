"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  fundMilestoneAction,
  submitDeliverableAction,
  approveAndReleaseAction,
  partialReleaseAction,
  requestRevisionAction,
} from "@/server/actions/contract.actions";
import { inspectGitArtifactAction } from "@/server/actions/git.actions";
import { GitDeliverableInspection } from "@/server/services/git-verifier.service";
import {
  Loader2,
  DollarSign,
  Send,
  CheckCircle2,
  RotateCcw,
  GitBranch,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Sliders,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MilestoneActionsProps {
  contractId: string;
  milestoneId: string;
  status: string;
  isClient: boolean;
  isFreelancer: boolean;
  amountDollars?: number;
}

export function ContractMilestoneActions({
  contractId,
  milestoneId,
  status,
  isClient,
  isFreelancer,
  amountDollars = 100,
}: MilestoneActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");

  // Partial Release State
  const [partialAmount, setPartialAmount] = useState(Math.max(10, Math.floor(amountDollars * 0.7)));
  const [partialNote, setPartialNote] = useState("");

  // Git Artifact Verification State
  const [gitUrl, setGitUrl] = useState("");
  const [isVerifyingGit, setIsVerifyingGit] = useState(false);
  const [gitInspection, setGitInspection] = useState<GitDeliverableInspection | null>(null);
  const [gitError, setGitError] = useState<string | null>(null);

  const handleFund = () => {
    startTransition(async () => {
      await fundMilestoneAction(contractId, milestoneId);
      router.refresh();
    });
  };

  const handleApproveFull = () => {
    if (
      !confirm("Are you sure you want to approve this deliverable and release 100% escrow payment?")
    )
      return;
    startTransition(async () => {
      await approveAndReleaseAction(contractId, milestoneId);
      router.refresh();
    });
  };

  const handlePartialReleaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await partialReleaseAction(contractId, milestoneId, partialAmount, partialNote);
      setShowPartialModal(false);
      router.refresh();
    });
  };

  const handleVerifyGit = async () => {
    if (!gitUrl.trim()) return;
    setIsVerifyingGit(true);
    setGitError(null);

    try {
      const res = await inspectGitArtifactAction(gitUrl);
      if (!res.success || !res.data) {
        setGitError(res.error ?? "Invalid Git artifact URL.");
        setGitInspection(null);
      } else {
        setGitInspection(res.data);
      }
    } catch {
      setGitError("Failed to inspect repository artifact.");
    } finally {
      setIsVerifyingGit(false);
    }
  };

  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();

    let fullNotes = notes.trim();
    if (gitInspection) {
      const gitSummary = `\n\n---\n### 🔗 Verified Deliverable Artifact\n- **Provider:** ${gitInspection.provider.toUpperCase()} (${gitInspection.type})\n- **Artifact URL:** ${gitInspection.htmlUrl}\n- **Title:** ${gitInspection.title ?? "Pull Request"}\n- **CI Pipeline:** ${gitInspection.ciStatus}\n${gitInspection.commitHash ? `- **Commit SHA:** \`${gitInspection.commitHash}\`\n` : ""}${gitInspection.additions !== undefined ? `- **Diff:** +${gitInspection.additions} / -${gitInspection.deletions} lines across ${gitInspection.changedFiles} files\n` : ""}`;
      fullNotes += gitSummary;
    }

    startTransition(async () => {
      await submitDeliverableAction(contractId, milestoneId, fullNotes);
      setShowSubmitModal(false);
      setGitInspection(null);
      setGitUrl("");
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
            <DollarSign className="h-3.5 w-3.5" />
          )}
          <span>Deposit & Fund Escrow</span>
        </button>
      )}

      {isClient && status === "SUBMITTED" && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowRevisionModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Revision</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowPartialModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Partial Release</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleApproveFull}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            <span>Approve Full (${amountDollars})</span>
          </button>
        </div>
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

      {/* Partial Release Modal with Slider */}
      {showPartialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handlePartialReleaseSubmit}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Sliders className="h-4 w-4" />
                <span>Micro-Escrow Partial Release</span>
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-1">
                Release Partial Milestone Funds
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Release immediate payment for accepted work components while retaining the remaining
                balance in escrow.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-600 dark:text-zinc-400">Release Amount</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  ${partialAmount.toFixed(0)} of ${amountDollars.toFixed(0)}
                </span>
              </div>

              <input
                type="range"
                min="10"
                max={amountDollars}
                step="5"
                value={partialAmount}
                onChange={(e) => setPartialAmount(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="rounded-lg bg-white p-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-zinc-400">Transferred to Talent (90%)</span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    ${(partialAmount * 0.9).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-white p-2 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-zinc-400">Retained in Escrow</span>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">
                    ${(amountDollars - partialAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Note for Freelancer (Optional)
              </label>
              <textarea
                rows={2}
                value={partialNote}
                onChange={(e) => setPartialNote(e.target.value)}
                placeholder="e.g. Approved UI components, remaining balance will release after API tests pass..."
                className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPartialModal(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || partialAmount <= 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  `Disburse $${partialAmount.toFixed(0)} Now`
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submit Deliverables Modal with Git Verification */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmitDeliverable}
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Submit Milestone Deliverable
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Provide deliverable notes and optionally link a verified GitHub / GitLab Pull
                Request.
              </p>
            </div>

            {/* Git Artifact URL Input */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/50 space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <GitBranch className="h-3.5 w-3.5 text-indigo-500" />
                <span>GitHub / GitLab Pull Request or Commit (Optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/org/repo/pull/42"
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  disabled={isVerifyingGit || !gitUrl.trim()}
                  onClick={handleVerifyGit}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 transition"
                >
                  {isVerifyingGit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Inspect"}
                </button>
              </div>

              {gitError && (
                <p className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  <span>{gitError}</span>
                </p>
              )}

              {/* Verified Inspection Card */}
              {gitInspection && (
                <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-50/50 p-2.5 dark:border-emerald-500/20 dark:bg-emerald-950/20 text-xs space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      {gitInspection.title ?? "Verified Work Artifact"}
                    </span>
                    <Badge variant="success">CI {gitInspection.ciStatus}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-600 dark:text-zinc-400">
                    {gitInspection.additions !== undefined && (
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        +{gitInspection.additions} / -{gitInspection.deletions} lines
                      </span>
                    )}
                    {gitInspection.commitHash && (
                      <span className="font-mono bg-zinc-200/60 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                        sha: {gitInspection.commitHash}
                      </span>
                    )}
                    <a
                      href={gitInspection.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 underline hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Deliverable Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Deliverable Summary & Handover Notes
              </label>
              <textarea
                rows={4}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Completed initial design components, wrote unit tests, and deployed preview build..."
                className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  setGitInspection(null);
                  setGitUrl("");
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Send for Client Approval"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
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
              placeholder="e.g. Please update the API error handling and add integration tests..."
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
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Request Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
