"use client";

import { useState, useTransition } from "react";
import { updatePlatformSettingsBatchAction } from "@/server/actions/admin.actions";
import {
  DollarSign,
  ShieldAlert,
  Sliders,
  Lock,
  History,
  Check,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export interface PlatformSettingItem {
  key: string;
  value: unknown;
  updatedAt: Date | string;
}

export interface AuditLogItem {
  id: string;
  actor: { name: string | null; email: string | null } | null;
  action: string;
  metadata: unknown;
  createdAt: Date | string;
}

interface AdminSettingsTabsProps {
  initialSettings: PlatformSettingItem[];
  auditLogs: AuditLogItem[];
}

type TabKey = "financials" | "governance" | "marketplace" | "security" | "audit";

export function AdminSettingsTabs({ initialSettings, auditLogs }: AdminSettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("financials");
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to read initial setting value with typed fallback
  const getSetting = <T,>(key: string, fallback: T): T => {
    const found = initialSettings.find((s) => s.key === key);
    return found && found.value !== undefined && found.value !== null
      ? (found.value as T)
      : fallback;
  };

  // Tab 1: Financials & Escrow State
  const [platformFeeBps, setPlatformFeeBps] = useState<number>(
    getSetting<number>("platform_fee_bps", 1000),
  );
  const [clientFeeBps, setClientFeeBps] = useState<number>(
    getSetting<number>("client_fee_bps", 300),
  );
  const [minEscrowDepositDollars, setMinEscrowDepositDollars] = useState<number>(
    Math.round(getSetting<number>("min_escrow_deposit_cents", 500) / 100),
  );
  const [maxEscrowDepositDollars, setMaxEscrowDepositDollars] = useState<number>(
    Math.round(getSetting<number>("max_escrow_deposit_cents", 10000000) / 100),
  );
  const [instantPayoutEnabled, setInstantPayoutEnabled] = useState<boolean>(
    getSetting<boolean>("instant_payout_enabled", true),
  );
  const [settlementCurrency, setSettlementCurrency] = useState<string>(
    getSetting<string>("settlement_currency", "USD"),
  );

  // Tab 2: Governance & Dispute Lifecycle State
  const [autoApproveDays, setAutoApproveDays] = useState<number>(
    getSetting<number>("auto_approve_days", 14),
  );
  const [unfundedContractCancelDays, setUnfundedContractCancelDays] = useState<number>(
    getSetting<number>("unfunded_contract_cancel_days", 7),
  );
  const [maxMilestoneRevisions, setMaxMilestoneRevisions] = useState<number>(
    getSetting<number>("max_milestone_revisions", 3),
  );
  const [disputeGraceHours, setDisputeGraceHours] = useState<number>(
    getSetting<number>("dispute_arbitration_grace_hours", 48),
  );
  const [splitDisputeRatios, setSplitDisputeRatios] = useState<boolean>(
    getSetting<boolean>("split_dispute_custom_ratios", true),
  );

  // Tab 3: Marketplace & Matching Rules State
  const [requireKycForBidding, setRequireKycForBidding] = useState<boolean>(
    getSetting<boolean>("require_freelancer_kyc_for_bidding", false),
  );
  const [maxOpenProposals, setMaxOpenProposals] = useState<number>(
    getSetting<number>("max_open_proposals_per_freelancer", 25),
  );
  const [jobAutoCloseDays, setJobAutoCloseDays] = useState<number>(
    getSetting<number>("job_auto_close_days", 30),
  );
  const [zeroCommissionProtocol, setZeroCommissionProtocol] = useState<boolean>(
    getSetting<boolean>("zero_commission_protocol", true),
  );
  const [restrictedKeywords, setRestrictedKeywords] = useState<string>(
    getSetting<string>(
      "restricted_communication_keywords",
      "telegram, whatsapp, wire transfer, pay outside, off-platform, btc transfer",
    ),
  );

  // Tab 4: Security & Platform Policies State
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(
    getSetting<boolean>("maintenance_mode", false),
  );
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState<number>(
    getSetting<number>("rate_limit_requests_per_minute", 120),
  );
  const [requireEmailVerification, setRequireEmailVerification] = useState<boolean>(
    getSetting<boolean>("require_email_verification", true),
  );
  const [supportEmail, setSupportEmail] = useState<string>(
    getSetting<string>("support_contact_email", "governance@worknest.dev"),
  );
  const [maxTeamSeats, setMaxTeamSeats] = useState<number>(
    getSetting<number>("max_team_seats_per_org", 10),
  );

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg(null);
    } else {
      setSuccessMsg(msg);
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleSaveTab = (tab: TabKey) => {
    setErrorMsg(null);
    let payload: Record<string, string | number | boolean> = {};

    if (tab === "financials") {
      if (minEscrowDepositDollars <= 0) {
        showNotification("Minimum escrow deposit must be greater than $0.", true);
        return;
      }
      if (maxEscrowDepositDollars < minEscrowDepositDollars) {
        showNotification("Maximum deposit cannot be less than minimum deposit.", true);
        return;
      }

      payload = {
        platform_fee_bps: Number(platformFeeBps),
        client_fee_bps: Number(clientFeeBps),
        min_escrow_deposit_cents: minEscrowDepositDollars * 100,
        max_escrow_deposit_cents: maxEscrowDepositDollars * 100,
        instant_payout_enabled: instantPayoutEnabled,
        settlement_currency: settlementCurrency,
      };
    } else if (tab === "governance") {
      if (autoApproveDays < 1) {
        showNotification("Auto-approve window must be at least 1 day.", true);
        return;
      }
      if (unfundedContractCancelDays < 1) {
        showNotification("Unfunded contract cancellation must be at least 1 day.", true);
        return;
      }

      payload = {
        auto_approve_days: Number(autoApproveDays),
        unfunded_contract_cancel_days: Number(unfundedContractCancelDays),
        max_milestone_revisions: Number(maxMilestoneRevisions),
        dispute_arbitration_grace_hours: Number(disputeGraceHours),
        split_dispute_custom_ratios: splitDisputeRatios,
      };
    } else if (tab === "marketplace") {
      if (maxOpenProposals < 1) {
        showNotification("Max open proposals must be at least 1.", true);
        return;
      }
      if (jobAutoCloseDays < 7) {
        showNotification("Job auto-close window must be at least 7 days.", true);
        return;
      }

      payload = {
        require_freelancer_kyc_for_bidding: requireKycForBidding,
        max_open_proposals_per_freelancer: Number(maxOpenProposals),
        job_auto_close_days: Number(jobAutoCloseDays),
        zero_commission_protocol: zeroCommissionProtocol,
        restricted_communication_keywords: restrictedKeywords.trim(),
      };
    } else if (tab === "security") {
      if (rateLimitPerMinute < 30) {
        showNotification("Rate limit must be at least 30 requests/min.", true);
        return;
      }

      payload = {
        maintenance_mode: maintenanceMode,
        rate_limit_requests_per_minute: Number(rateLimitPerMinute),
        require_email_verification: requireEmailVerification,
        support_contact_email: supportEmail.trim(),
        max_team_seats_per_org: Number(maxTeamSeats),
      };
    }

    startTransition(async () => {
      const res = await updatePlatformSettingsBatchAction(payload);
      if (!res.success) {
        showNotification(res.error ?? "Failed to save settings.", true);
      } else {
        showNotification("Settings updated successfully! Changes applied to live DB records.");
      }
    });
  };

  const tabs: Array<{ id: TabKey; label: string; icon: typeof DollarSign }> = [
    { id: "financials", label: "Escrow & Fees", icon: DollarSign },
    { id: "governance", label: "Contracts & Disputes", icon: Sliders },
    { id: "marketplace", label: "Marketplace Rules", icon: Sparkles },
    { id: "security", label: "Security & Access", icon: Lock },
    { id: "audit", label: "Audit Trail", icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation Pill Bar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-zinc-100/70 p-1.5 dark:border-zinc-800 dark:bg-zinc-900/60">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-white/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${
                  isActive ? "text-purple-600 dark:text-purple-400" : "text-zinc-400"
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Toast Alert */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 animate-in fade-in duration-150">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20 animate-in fade-in duration-150">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: FINANCIALS & ESCROW */}
      {activeTab === "financials" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Escrow Economics & Fee Configuration
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Control the platform commission schedules, client processing surcharges, and deposit
              thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Platform Commission Basis Points (bps)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="0"
                  max="3000"
                  value={platformFeeBps}
                  onChange={(e) => setPlatformFeeBps(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                1000 bps = 10.0%. Enter 0 for zero-fee community promotions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Employer Escrow Surcharge (bps)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={clientFeeBps}
                  onChange={(e) => setClientFeeBps(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                300 bps = 3.0% employer funding fee to offset payment gateways.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Minimum Milestone Escrow ($ USD)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="5"
                  value={minEscrowDepositDollars}
                  onChange={(e) => setMinEscrowDepositDollars(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Minimum acceptable funded milestone tranche amount.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Maximum Single Escrow Deposit ($ USD)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="1000"
                  value={maxEscrowDepositDollars}
                  onChange={(e) => setMaxEscrowDepositDollars(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Triggers compliance anti-money laundering checks if exceeded.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Primary Settlement Currency
              </label>
              <select
                value={settlementCurrency}
                onChange={(e) => setSettlementCurrency(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Eurozone</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Stripe Instant Payouts
                </p>
                <p className="text-[11px] text-zinc-500">
                  Allow verified freelancers to draw down earnings immediately.
                </p>
              </div>
              <input
                type="checkbox"
                checked={instantPayoutEnabled}
                onChange={(e) => setInstantPayoutEnabled(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("financials")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-500 disabled:opacity-60 transition"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>Save Financial Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: GOVERNANCE & CONTRACTS */}
      {activeTab === "governance" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Contract Lifecycle & Dispute Arbitration
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Automated escrow release windows, revision limitations, and judicial mediation rules.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Milestone Inactivity Auto-Release (Days)
              </label>
              <input
                type="number"
                min="3"
                max="60"
                value={autoApproveDays}
                onChange={(e) => setAutoApproveDays(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                If the client takes no action after deliverable submission, escrow automatically
                releases to talent.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Unfunded Contract Auto-Cancellation (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={unfundedContractCancelDays}
                onChange={(e) => setUnfundedContractCancelDays(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Draft or accepted contracts without escrow deposit are purged after this window.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Maximum Revision Rounds Per Milestone
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxMilestoneRevisions}
                onChange={(e) => setMaxMilestoneRevisions(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Limits scope-creep; exceeding this threshold allows the freelancer to escalate to a
                formal dispute.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Arbitration Ruling Grace Period (Hours)
              </label>
              <input
                type="number"
                min="0"
                max="168"
                value={disputeGraceHours}
                onChange={(e) => setDisputeGraceHours(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Notice period before admin dispute ledger transfers become irreversible.
              </p>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Proportional Split Rulings
                </p>
                <p className="text-[11px] text-zinc-500">
                  Allow admins to divide milestone escrow proportionally (e.g. 50/50, 70/30) in
                  partial completion disputes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={splitDisputeRatios}
                onChange={(e) => setSplitDisputeRatios(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("governance")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-500 disabled:opacity-60 transition"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>Save Governance Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: MARKETPLACE & MATCHING */}
      {activeTab === "marketplace" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Marketplace Integrity & Proposal Guidelines
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Enforce qualification standards, bid rate limits, and automated moderation keyword
              filters.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Mandatory KYC for Bidding
                </p>
                <p className="text-[11px] text-zinc-500">
                  Require verified identity before freelancers can submit milestone proposals.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireKycForBidding}
                onChange={(e) => setRequireKycForBidding(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  0% Freelancer Fee Protocol Banner
                </p>
                <p className="text-[11px] text-zinc-500">
                  Display the zero-connects and 0% take-rate badge across marketing pages.
                </p>
              </div>
              <input
                type="checkbox"
                checked={zeroCommissionProtocol}
                onChange={(e) => setZeroCommissionProtocol(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Max Concurrent Open Proposals Per Talent
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={maxOpenProposals}
                onChange={(e) => setMaxOpenProposals(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Prevents proposal spam by bounding pending applications.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Unfilled Job Auto-Expiration (Days)
              </label>
              <input
                type="number"
                min="7"
                max="90"
                value={jobAutoCloseDays}
                onChange={(e) => setJobAutoCloseDays(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Stale listings without active contracts are archived automatically.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Restricted Communication & Anti-Circumvention Filter (Comma-Separated)
              </label>
              <textarea
                rows={3}
                value={restrictedKeywords}
                onChange={(e) => setRestrictedKeywords(e.target.value)}
                placeholder="telegram, whatsapp, wire transfer, pay outside, off-platform..."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono whitespace-pre-wrap"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Flags messages or proposal text matching these keywords for priority moderation.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("marketplace")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-500 disabled:opacity-60 transition"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>Save Marketplace Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & ACCESS */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Platform Security, Rate Limiting & Access Controls
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Global maintenance toggle, DDoS rate limiting guards, and organization seat limits.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Emergency Maintenance Mode
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    When active, new job briefs and escrow deposits are paused across the platform.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 rounded-sm border-amber-300 text-amber-600 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Rate Limit Threshold (Requests Per Minute)
              </label>
              <input
                type="number"
                min="30"
                max="600"
                value={rateLimitPerMinute}
                onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                In-memory token bucket capacity protecting auth routes and API actions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Official Governance & Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Contact address listed in transactional notices and dispute rulings.
              </p>
            </div>

            <div>
              <label className="block text-xs font-normal capitalize text-zinc-700 dark:text-zinc-300">
                Max Team Seats Per Client Organization
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxTeamSeats}
                onChange={(e) => setMaxTeamSeats(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Number of seats allowed before prompting for an Enterprise plan upgrade.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Enforce Email Verification
                </p>
                <p className="text-[11px] text-zinc-500">
                  Require verified email before activating employer contracts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireEmailVerification}
                onChange={(e) => setRequireEmailVerification(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("security")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-500 disabled:opacity-60 transition"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span>Save Security Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Platform Settings Audit Trail
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Immutable record of administrative configuration updates and policy adjustments.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <History className="h-4 w-4 text-purple-600" />
              <span>{auditLogs.length} Events Logged</span>
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
              No platform setting update events recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-purple-100 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        {log.action}
                      </span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        By {log.actor?.name ?? log.actor?.email ?? "System Administrator"}
                      </span>
                    </div>
                    <pre className="max-w-xl overflow-x-auto rounded-lg bg-zinc-50 p-2 text-[11px] font-mono text-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-400">
                      {typeof log.metadata === "string"
                        ? log.metadata
                        : JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                  <span className="shrink-0 text-[11px] text-zinc-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
