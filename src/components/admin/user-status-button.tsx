"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserStatusAction, verifyUserKycAction } from "@/server/actions/admin.actions";
import { UserStatus } from "@prisma/client";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Ban, CheckCircle } from "lucide-react";

interface UserStatusButtonProps {
  userId: string;
  userName?: string;
  currentStatus: UserStatus;
  isClient: boolean;
  isFreelancer: boolean;
  paymentVerified?: boolean;
}

export function UserStatusButton({
  userId,
  userName = "User",
  currentStatus,
  isClient,
  paymentVerified,
}: UserStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleStatusChange(status: UserStatus) {
    const actionLabel = status === "SUSPENDED" ? "suspend" : "activate";
    if (!confirm(`Are you sure you want to ${actionLabel} ${userName}?`)) return;

    setLoading(true);
    const toastId = toast.loading(`Updating status for ${userName}...`);

    try {
      const res = await updateUserStatusAction(userId, status);
      if (!res.success) {
        throw new Error(res.error || "Failed to update user status.");
      }

      toast.success(
        status === "SUSPENDED" ? `${userName} has been suspended.` : `${userName} is now active.`,
        { id: toastId },
      );
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyKyc() {
    setLoading(true);
    const toastId = toast.loading(`Verifying KYC for ${userName}...`);

    try {
      const res = await verifyUserKycAction(userId, isClient ? "client" : "freelancer");
      if (!res.success) {
        throw new Error(res.error || "Failed to verify KYC.");
      }

      toast.success(`KYC status verified for ${userName}!`, {
        id: toastId,
        description: "Payment verification badge enabled for marketplace transactions.",
      });
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to verify KYC", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentStatus === "ACTIVE" ? (
        <button
          onClick={() => handleStatusChange("SUSPENDED")}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg border border-red-200/80 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/40"
          title="Suspend User"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
          <span>Suspend</span>
        </button>
      ) : (
        <button
          onClick={() => handleStatusChange("ACTIVE")}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
          title="Activate User"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
          <span>Activate</span>
        </button>
      )}

      {isClient && !paymentVerified && (
        <button
          onClick={handleVerifyKyc}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg border border-blue-200/80 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 disabled:opacity-50 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
          title="Verify Payment Status"
        >
          <ShieldCheck className="h-3 w-3" />
          <span>Verify KYC</span>
        </button>
      )}
    </div>
  );
}
