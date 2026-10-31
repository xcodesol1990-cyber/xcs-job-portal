"use client";

import { useState } from "react";
import { updateUserStatusAction, verifyUserKycAction } from "@/server/actions/admin.actions";
import { UserStatus } from "@prisma/client";
import { Loader2, ShieldCheck, Ban, CheckCircle } from "lucide-react";

interface UserStatusButtonProps {
  userId: string;
  currentStatus: UserStatus;
  isClient: boolean;
  isFreelancer: boolean;
  paymentVerified?: boolean;
}

export function UserStatusButton({
  userId,
  currentStatus,
  isClient,
  paymentVerified,
}: UserStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(status: UserStatus) {
    if (!confirm(`Are you sure you want to change user status to ${status}?`)) return;
    setLoading(true);
    setError(null);

    const res = await updateUserStatusAction(userId, status);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to update status");
    } else {
      window.location.reload();
    }
  }

  async function handleVerifyKyc() {
    setLoading(true);
    setError(null);

    const res = await verifyUserKycAction(userId, isClient ? "client" : "freelancer");
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to verify KYC");
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {error && <span className="text-[10px] text-red-500">{error}</span>}

      {currentStatus === "ACTIVE" ? (
        <button
          onClick={() => handleStatusChange("SUSPENDED")}
          disabled={loading}
          className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
          title="Suspend User"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
          Suspend
        </button>
      ) : (
        <button
          onClick={() => handleStatusChange("ACTIVE")}
          disabled={loading}
          className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400"
          title="Activate User"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
          Activate
        </button>
      )}

      {isClient && !paymentVerified && (
        <button
          onClick={handleVerifyKyc}
          disabled={loading}
          className="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-400"
          title="Verify Payment Status"
        >
          <ShieldCheck className="h-3 w-3" />
          Verify KYC
        </button>
      )}
    </div>
  );
}
