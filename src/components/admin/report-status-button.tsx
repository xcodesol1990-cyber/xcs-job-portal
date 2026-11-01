"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { moderateReportAction } from "@/server/actions/admin.actions";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ReportStatusButtonProps {
  reportId: string;
}

export function ReportStatusButton({ reportId }: ReportStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleModerate(status: "RESOLVED" | "DISMISSED") {
    setLoading(true);
    const toastId = toast.loading(status === "RESOLVED" ? "Resolving report..." : "Dismissing report...");

    try {
      const res = await moderateReportAction(reportId, status);
      if (!res.success) {
        throw new Error(res.error || "Failed to update report status.");
      }

      toast.success(status === "RESOLVED" ? "Report marked as resolved." : "Report dismissed.", {
        id: toastId,
      });
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to moderate report", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleModerate("RESOLVED")}
        disabled={loading}
        className="flex items-center gap-1 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
        <span>Resolve</span>
      </button>

      <button
        onClick={() => handleModerate("DISMISSED")}
        disabled={loading}
        className="flex items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-600 shadow-sm transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <XCircle className="h-3 w-3" />
        <span>Dismiss</span>
      </button>
    </div>
  );
}
