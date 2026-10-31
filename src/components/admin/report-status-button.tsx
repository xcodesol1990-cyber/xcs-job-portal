"use client";

import { useState } from "react";
import { moderateReportAction } from "@/server/actions/admin.actions";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ReportStatusButtonProps {
  reportId: string;
}

export function ReportStatusButton({ reportId }: ReportStatusButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleModerate(status: "RESOLVED" | "DISMISSED") {
    setLoading(true);
    await moderateReportAction(reportId, status);
    setLoading(false);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => handleModerate("RESOLVED")}
        disabled={loading}
        className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
        Resolve
      </button>

      <button
        onClick={() => handleModerate("DISMISSED")}
        disabled={loading}
        className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
      >
        <XCircle className="h-3 w-3" />
        Dismiss
      </button>
    </div>
  );
}
