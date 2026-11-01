import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { StripeConnectButton } from "@/components/forms/stripe-connect-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CreditCard,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
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
      <PageHeader
        badge="Earnings & Payout Gateway"
        badgeIcon={CreditCard}
        badgeVariant="success"
        title="Payouts & Banking"
        description="Direct bank transfers powered by Stripe Connect Express with automatic escrow payouts."
      />

      {/* Stripe Connect Status Card */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 shadow-xs">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Stripe Express Payout Account
                </h3>
                {isPayoutsEnabled ? (
                  <Badge variant="success" dot={true}>
                    Payouts Active
                  </Badge>
                ) : isConnected ? (
                  <Badge variant="warning">
                    Verification Needed
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Not Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
                {isPayoutsEnabled
                  ? "Your bank account is connected and verified. Milestone releases transfer directly to your bank account."
                  : "Connect your bank account via Stripe Express to enable automated payouts upon milestone releases."}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <StripeConnectButton isConnected={isConnected} isPayoutsEnabled={isPayoutsEnabled} />
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCard
          title="Lifetime Released Earnings"
          value={`$${totalEarnedDollars.toFixed(2)}`}
          description="Approved milestone payouts"
          icon={DollarSign}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          badge={{ text: "Direct Payouts Ready", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" }}
        />

        <StatCard
          title="Completed Transfers"
          value={user.ledgerEntries.length}
          description="Successful escrow disbursements"
          icon={Receipt}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          badge={{ text: "100% Escrow Settled", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" }}
        />
      </div>

      {/* Release Records */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="border-b border-zinc-100 p-6 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Payout Ledger History
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Immutable double-entry disbursement records
            </p>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            {user.ledgerEntries.length} transactions
          </span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
          {user.ledgerEntries.map((e) => (
            <div key={e.id} className="flex items-center justify-between p-4 px-6 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Milestone Payout Release
                  </span>
                  <Badge variant="purple">Transferred</Badge>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">{e.idempotencyKey}</div>
              </div>

              <div className="text-right">
                <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  +${(Number(e.amountCents) / 100).toFixed(2)}
                </span>
                <div className="text-[11px] text-zinc-400">
                  {new Date(e.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}

          {user.ledgerEntries.length === 0 && (
            <div className="p-8">
              <EmptyState
                icon={Receipt}
                title="No payout history yet"
                description="When clients release funds for completed milestones, your earnings will be transferred and listed here."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
