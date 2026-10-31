import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { StripeConnectButton } from "@/components/forms/stripe-connect-button";
import {
  CreditCard,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
} from "lucide-react";

export default async function FreelancerPayoutsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      freelancerProfile: true,
      payouts: { orderBy: { createdAt: "desc" } },
      ledgerEntries: {
        where: { type: "ESCROW_RELEASE" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const isConnected = !!user.stripeConnectAccountId;
  const isPayoutsEnabled = !!user.stripePayoutsEnabled;
  const totalEarnedDollars = Number(user.freelancerProfile?.totalEarnedCents ?? 0) / 100;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <CreditCard className="h-4 w-4" />
          <span>Earnings & Payout Gateway</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Payouts & Banking
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Direct bank transfers powered by Stripe Connect Express with automatic escrow payouts.
        </p>
      </div>

      {/* Stripe Connect Status Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Stripe Express Payout Account
                </h3>
                {isPayoutsEnabled ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Payouts Active
                  </span>
                ) : isConnected ? (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Verification Needed
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500 max-w-md">
                {isPayoutsEnabled
                  ? "Your bank account is connected. Milestone releases transfer directly to your bank account."
                  : "Connect your bank account via Stripe Express to enable automated payouts upon milestone releases."}
              </p>
            </div>
          </div>

          <StripeConnectButton isConnected={isConnected} isPayoutsEnabled={isPayoutsEnabled} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Lifetime Released Earnings</span>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-black text-zinc-900 dark:text-zinc-100">
            ${totalEarnedDollars.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Approved milestone payouts</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Completed Transfers</span>
            <Receipt className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {user.ledgerEntries.length}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Successful escrow disbursements</div>
        </div>
      </div>

      {/* Release Records */}
      {user.ledgerEntries.length > 0 && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Payout Ledger History
            </h3>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {user.ledgerEntries.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-4 px-6">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Milestone Payout Release
                  </span>
                  <div className="text-[11px] font-mono text-zinc-400">{e.idempotencyKey}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    +${(Number(e.amountCents) / 100).toFixed(2)}
                  </span>
                  <div className="text-[11px] text-zinc-400">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

