"use client";

import { useTransition } from "react";
import { startStripeOnboardingAction } from "@/server/actions/payment.actions";
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";

interface StripeConnectButtonProps {
  isConnected: boolean;
  isPayoutsEnabled: boolean;
}

export function StripeConnectButton({
  isConnected,
  isPayoutsEnabled,
}: StripeConnectButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleConnect = () => {
    startTransition(async () => {
      const res = await startStripeOnboardingAction();
      if (res.url) {
        window.location.href = res.url;
      }
    });
  };

  if (isPayoutsEnabled) {
    return (
      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
        <span>Connected & Verified</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleConnect}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-60"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <span>{isConnected ? "Complete Onboarding" : "Connect Stripe Express"}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </>
      )}
    </button>
  );
}

