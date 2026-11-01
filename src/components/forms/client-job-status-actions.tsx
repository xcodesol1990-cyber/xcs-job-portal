"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateJobStatusAction, deleteJobAction } from "@/server/actions/job.actions";
import { JobStatus } from "@prisma/client";
import { PauseCircle, PlayCircle, Trash2, Loader2 } from "lucide-react";

interface ClientJobStatusActionsProps {
  jobId: string;
  status: JobStatus;
}

export function ClientJobStatusActions({ jobId, status }: ClientJobStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleTogglePause = () => {
    const nextStatus: JobStatus = status === JobStatus.OPEN ? JobStatus.CLOSED : JobStatus.OPEN;
    const confirmMessage =
      status === JobStatus.OPEN
        ? "Pause this job listing? It will no longer receive new incoming candidate proposals."
        : "Reopen this job listing to begin accepting proposals again?";

    if (!confirm(confirmMessage)) return;

    startTransition(async () => {
      await updateJobStatusAction(jobId, nextStatus);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (
      !confirm("Are you sure you want to delete this job posting? This action cannot be undone.")
    ) {
      return;
    }

    startTransition(async () => {
      await deleteJobAction(jobId);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      {status === JobStatus.OPEN ? (
        <button
          type="button"
          disabled={isPending}
          onClick={handleTogglePause}
          title="Pause Job Listing"
          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 transition disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span>Pause</span>
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={handleTogglePause}
          title="Reopen Job Listing"
          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <PlayCircle className="h-3.5 w-3.5 text-emerald-500" />
          )}
          <span>Reopen</span>
        </button>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        title="Delete Job"
        className="rounded-xl border border-zinc-200/90 bg-white p-2 text-zinc-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
