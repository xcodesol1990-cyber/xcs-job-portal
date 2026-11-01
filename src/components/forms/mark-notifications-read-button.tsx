"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { markAllNotificationsReadAction } from "@/server/actions/notification.actions";
import { toast } from "sonner";

export function MarkNotificationsReadButton({ hasUnread }: { hasUnread: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleMarkAll = async () => {
    if (!hasUnread) return;
    setLoading(true);
    const toastId = toast.loading("Marking all notifications as read...");

    try {
      const res = await markAllNotificationsReadAction();
      if (res.success) {
        toast.success("All notifications marked as read.", { id: toastId });
      } else {
        toast.error(res.error || "Failed to mark as read.", { id: toastId });
      }
    } catch {
      toast.error("An unexpected error occurred.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!hasUnread) return null;

  return (
    <button
      onClick={handleMarkAll}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
    >
      <CheckCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      <span>{loading ? "Marking..." : "Mark all as read"}</span>
    </button>
  );
}

