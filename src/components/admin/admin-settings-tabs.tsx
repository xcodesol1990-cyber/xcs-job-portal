"use client";

import { useState, useTransition } from "react";
import { updatePlatformSettingsBatchAction } from "@/server/actions/admin.actions";
import {
  DollarSign,
  CreditCard,
  Sliders,
  Sparkles,
  Mail,
  Cpu,
  Lock,
  History,
  Check,
  Loader2,
  AlertTriangle,
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

export type TabKey =
  | "financials"
  | "payments"
  | "governance"
  | "marketplace"
  | "emails"
  | "integrations"
  | "security"
  | "audit";

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

  // Tab 2: Payments & Stripe Rails State
  const [stripeEnvironment, setStripeEnvironment] = useState<string>(
    getSetting<string>("stripe_environment", "TEST"),
  );
  const [stripeConnectType, setStripeConnectType] = useState<string>(
    getSetting<string>("stripe_connect_type", "EXPRESS"),
  );
  const [stripePayoutSchedule, setStripePayoutSchedule] = useState<string>(
    getSetting<string>("stripe_payout_schedule", "DAILY"),
  );
  const [stripePayoutDelayDays, setStripePayoutDelayDays] = useState<number>(
    getSetting<number>("stripe_payout_delay_days", 2),
  );
  const [statementDescriptor, setStatementDescriptor] = useState<string>(
    getSetting<string>("stripe_statement_descriptor", "WORKWASL ESCROW"),
  );
  const [minPayoutThresholdDollars, setMinPayoutThresholdDollars] = useState<number>(
    getSetting<number>("min_payout_threshold_dollars", 25),
  );
  const [instantPayoutFeePercent, setInstantPayoutFeePercent] = useState<number>(
    getSetting<number>("instant_payout_fee_percent", 1.5),
  );
  const [acceptedCurrencies, setAcceptedCurrencies] = useState<string>(
    getSetting<string>("accepted_currencies", "USD, EUR, GBP, CAD, AUD"),
  );
  const [cryptoUsdcEnabled, setCryptoUsdcEnabled] = useState<boolean>(
    getSetting<boolean>("crypto_usdc_escrow_enabled", false),
  );
  const [autoRetryFailedCharges, setAutoRetryFailedCharges] = useState<boolean>(
    getSetting<boolean>("stripe_auto_retry_failed_charges", true),
  );

  // Tab 3: Governance & Dispute Lifecycle State
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

  // Tab 4: Marketplace & Matching Rules State
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

  // Tab 5: Email & Transactional Notifications State
  const [emailProvider, setEmailProvider] = useState<string>(
    getSetting<string>("email_provider", "RESEND"),
  );
  const [emailFromName, setEmailFromName] = useState<string>(
    getSetting<string>("email_from_name", "WorkWasl Notifications"),
  );
  const [emailFromAddress, setEmailFromAddress] = useState<string>(
    getSetting<string>("email_from_address", "notifications@workwasl.com"),
  );
  const [emailSupportAddress, setEmailSupportAddress] = useState<string>(
    getSetting<string>("email_support_address", "support@workwasl.com"),
  );
  const [emailBillingAddress, setEmailBillingAddress] = useState<string>(
    getSetting<string>("email_billing_address", "billing@workwasl.com"),
  );
  const [emailDigestFrequency, setEmailDigestFrequency] = useState<string>(
    getSetting<string>("email_digest_frequency", "INSTANT"),
  );
  const [smtpHost, setSmtpHost] = useState<string>(
    getSetting<string>("smtp_host", "smtp.resend.com"),
  );
  const [smtpPort, setSmtpPort] = useState<number>(getSetting<number>("smtp_port", 587));
  const [notifyOnNewProposal, setNotifyOnNewProposal] = useState<boolean>(
    getSetting<boolean>("notify_on_new_proposal", true),
  );
  const [notifyOnMilestoneSubmitted, setNotifyOnMilestoneSubmitted] = useState<boolean>(
    getSetting<boolean>("notify_on_milestone_submitted", true),
  );
  const [notifyOnEscrowFunded, setNotifyOnEscrowFunded] = useState<boolean>(
    getSetting<boolean>("notify_on_escrow_funded", true),
  );
  const [notifyOnDisputeOpened, setNotifyOnDisputeOpened] = useState<boolean>(
    getSetting<boolean>("notify_on_dispute_opened", true),
  );

  // Tab 6: Integrations, Webhooks & AI State
  const [githubAppEnabled, setGithubAppEnabled] = useState<boolean>(
    getSetting<boolean>("github_app_integration_enabled", true),
  );
  const [githubAllowedOrgs, setGithubAllowedOrgs] = useState<string>(
    getSetting<string>("github_allowed_orgs", ""),
  );
  const [aiCopilotModel, setAiCopilotModel] = useState<string>(
    getSetting<string>("ai_copilot_model", "gemini-2.5-pro"),
  );
  const [aiMilestoneCopilotEnabled, setAiMilestoneCopilotEnabled] = useState<boolean>(
    getSetting<boolean>("ai_milestone_copilot_enabled", false),
  );
  const [aiMaxTokens, setAiMaxTokens] = useState<number>(getSetting<number>("ai_max_tokens", 4096));
  const [slackWebhookUrl, setSlackWebhookUrl] = useState<string>(
    getSetting<string>("slack_webhook_url", ""),
  );
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState<string>(
    getSetting<string>("discord_webhook_url", ""),
  );
  const [webhookRetryLimit, setWebhookRetryLimit] = useState<number>(
    getSetting<number>("webhook_retry_limit", 5),
  );
  const [sentryMonitoringEnabled, setSentryMonitoringEnabled] = useState<boolean>(
    getSetting<boolean>("sentry_monitoring_enabled", true),
  );

  // Tab 7: Security & Platform Policies State
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
    getSetting<string>("support_contact_email", "governance@workwasl.com"),
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
    } else if (tab === "payments") {
      if (minPayoutThresholdDollars < 1) {
        showNotification("Minimum payout threshold must be at least $1.00.", true);
        return;
      }
      if (!statementDescriptor.trim()) {
        showNotification("Statement descriptor cannot be empty.", true);
        return;
      }

      payload = {
        stripe_environment: stripeEnvironment,
        stripe_connect_type: stripeConnectType,
        stripe_payout_schedule: stripePayoutSchedule,
        stripe_payout_delay_days: Number(stripePayoutDelayDays),
        stripe_statement_descriptor: statementDescriptor.trim().toUpperCase(),
        min_payout_threshold_dollars: Number(minPayoutThresholdDollars),
        instant_payout_fee_percent: Number(instantPayoutFeePercent),
        accepted_currencies: acceptedCurrencies.trim(),
        crypto_usdc_escrow_enabled: cryptoUsdcEnabled,
        stripe_auto_retry_failed_charges: autoRetryFailedCharges,
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
    } else if (tab === "emails") {
      if (!emailFromAddress.includes("@")) {
        showNotification("System sender email address must be a valid email.", true);
        return;
      }

      payload = {
        email_provider: emailProvider,
        email_from_name: emailFromName.trim(),
        email_from_address: emailFromAddress.trim(),
        email_support_address: emailSupportAddress.trim(),
        email_billing_address: emailBillingAddress.trim(),
        email_digest_frequency: emailDigestFrequency,
        smtp_host: smtpHost.trim(),
        smtp_port: Number(smtpPort),
        notify_on_new_proposal: notifyOnNewProposal,
        notify_on_milestone_submitted: notifyOnMilestoneSubmitted,
        notify_on_escrow_funded: notifyOnEscrowFunded,
        notify_on_dispute_opened: notifyOnDisputeOpened,
      };
    } else if (tab === "integrations") {
      payload = {
        github_app_integration_enabled: githubAppEnabled,
        github_allowed_orgs: githubAllowedOrgs.trim(),
        ai_copilot_model: aiCopilotModel,
        ai_milestone_copilot_enabled: aiMilestoneCopilotEnabled,
        ai_max_tokens: Number(aiMaxTokens),
        slack_webhook_url: slackWebhookUrl.trim(),
        discord_webhook_url: discordWebhookUrl.trim(),
        webhook_retry_limit: Number(webhookRetryLimit),
        sentry_monitoring_enabled: sentryMonitoringEnabled,
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
    { id: "payments", label: "Payments & Stripe", icon: CreditCard },
    { id: "governance", label: "Contracts & Disputes", icon: Sliders },
    { id: "marketplace", label: "Marketplace Rules", icon: Sparkles },
    { id: "emails", label: "Email & Notifications", icon: Mail },
    { id: "integrations", label: "Integrations & AI", icon: Cpu },
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
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
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
                1000 bps = 10.0%. For 0% protocol, set to 0.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Client Surcharge Fee Basis Points (bps)
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
                300 bps = 3.0% credit card processing fee charged to clients.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Minimum Escrow Deposit ($ USD)
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
                Minimum dollar amount permitted per contract milestone.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Maximum Escrow Milestone ($ USD)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="100"
                  value={maxEscrowDepositDollars}
                  onChange={(e) => setMaxEscrowDepositDollars(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Maximum single escrow milestone cap (default $100,000).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Primary Settlement Currency
              </label>
              <div className="relative mt-1.5">
                <select
                  value={settlementCurrency}
                  onChange={(e) => setSettlementCurrency(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                >
                  <option value="USD">USD ($ - United States Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Enable Instant Payouts via Stripe
                </p>
                <p className="text-[11px] text-zinc-500">
                  Allow freelancers to instantly disburse released milestone balances.
                </p>
              </div>
              <input
                type="checkbox"
                checked={instantPayoutEnabled}
                onChange={(e) => setInstantPayoutEnabled(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("financials")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Financial Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS & STRIPE RAILS */}
      {activeTab === "payments" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Payment Gateways & Stripe Connect Infrastructure
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Configure Stripe Connect merchant accounts, automated payout schedules, merchant
              statement descriptors, and settlement rails.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Stripe Gateway Operating Mode
              </label>
              <div className="relative mt-1.5">
                <select
                  value={stripeEnvironment}
                  onChange={(e) => setStripeEnvironment(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                >
                  <option value="TEST">TEST / Sandbox (Mock & Test Cards)</option>
                  <option value="LIVE">LIVE Production (Real Credit Cards & Stripe Connect)</option>
                </select>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Toggles between sandbox test cards and live banking rails.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Stripe Connect Account Type
              </label>
              <div className="relative mt-1.5">
                <select
                  value={stripeConnectType}
                  onChange={(e) => setStripeConnectType(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                >
                  <option value="EXPRESS">Express (Hosted onboarding & automatic payouts)</option>
                  <option value="STANDARD">
                    Standard (Freelancers manage full Stripe dashboard)
                  </option>
                  <option value="CUSTOM">Custom (White-labeled embedded onboarding)</option>
                </select>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Express provides the fastest contractor onboarding with zero KYC overhead.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Automated Payout Cadence
              </label>
              <div className="relative mt-1.5">
                <select
                  value={stripePayoutSchedule}
                  onChange={(e) => setStripePayoutSchedule(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                >
                  <option value="DAILY">Daily Rolling Automatic Payouts</option>
                  <option value="WEEKLY">Weekly Batch Payouts (Every Monday)</option>
                  <option value="MONTHLY">Monthly Batch Payouts (1st of month)</option>
                  <option value="MANUAL">Manual On-Demand Freelancer Withdrawals</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Payout Holding Reserve (Days)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={stripePayoutDelayDays}
                  onChange={(e) => setStripePayoutDelayDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Holding duration before milestone release becomes withdrawable to mitigate fraud.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Credit Card Statement Descriptor (Max 22 Chars)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  maxLength={22}
                  value={statementDescriptor}
                  onChange={(e) => setStatementDescriptor(e.target.value)}
                  placeholder="WORKWASL ESCROW"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono uppercase"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Text that appears on client credit card & bank statements.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Minimum Payout Withdrawal ($ USD)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="5"
                  value={minPayoutThresholdDollars}
                  onChange={(e) => setMinPayoutThresholdDollars(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Minimum contractor balance required to initiate a withdrawal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Instant Payout Processing Fee (%)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={instantPayoutFeePercent}
                  onChange={(e) => setInstantPayoutFeePercent(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Pass-through fee for Visa Direct / Mastercard Send instant transfers (typically
                1.5%).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Accepted Checkout Currencies
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={acceptedCurrencies}
                  onChange={(e) => setAcceptedCurrencies(e.target.value)}
                  placeholder="USD, EUR, GBP, CAD, AUD"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">Comma-separated ISO currency codes.</p>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  USDC / Crypto Escrow Settlement
                </p>
                <p className="text-[11px] text-zinc-500">
                  Allow institutional clients to fund milestone vaults via USDC smart contracts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={cryptoUsdcEnabled}
                onChange={(e) => setCryptoUsdcEnabled(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Auto-Retry Failed Stripe Escrow Captures
                </p>
                <p className="text-[11px] text-zinc-500">
                  Automatically retry card authorizations before flagging payment errors.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoRetryFailedCharges}
                onChange={(e) => setAutoRetryFailedCharges(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("payments")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Payment Gateway Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: GOVERNANCE & DISPUTES */}
      {activeTab === "governance" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Contract Lifecycle & Dispute Arbitration
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Set automated approval deadlines, revision thresholds, and dispute cooling-off
              windows.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Milestone Auto-Approval Grace Window (Days)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={autoApproveDays}
                  onChange={(e) => setAutoApproveDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                If the client doesn&apos;t review submitted work, escrow releases automatically
                after this time.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Unfunded Contract Auto-Cancel (Days)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={unfundedContractCancelDays}
                  onChange={(e) => setUnfundedContractCancelDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Pending draft contracts not funded into escrow are automatically purged.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Maximum Milestone Revision Requests
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxMilestoneRevisions}
                  onChange={(e) => setMaxMilestoneRevisions(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Exceeding this revision limit flags the engagement for judicial moderation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Dispute Evidence Grace Period (Hours)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="12"
                  max="168"
                  value={disputeGraceHours}
                  onChange={(e) => setDisputeGraceHours(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Window for client/freelancer to submit commit logs & work proof upon dispute.
              </p>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Allow Custom Judicial Split Ratios
                </p>
                <p className="text-[11px] text-zinc-500">
                  Permit admin arbiters to divide escrow amounts proportionally (e.g. 70% freelancer
                  / 30% client refund).
                </p>
              </div>
              <input
                type="checkbox"
                checked={splitDisputeRatios}
                onChange={(e) => setSplitDisputeRatios(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("governance")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Governance Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: MARKETPLACE RULES */}
      {activeTab === "marketplace" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Marketplace Mechanics & Quality Control
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Tune discovery algorithms, bidding caps, zero-fee protocols, and communication safety
              filters.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Require KYC Identity Verification for Bidding
                </p>
                <p className="text-[11px] text-zinc-500">
                  Block unverified freelancers from submitting proposals on high-budget briefs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireKycForBidding}
                onChange={(e) => setRequireKycForBidding(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Enforce Zero-Commission Protocol (0% Take Rate)
                </p>
                <p className="text-[11px] text-zinc-500">
                  Promote 100% contractor take-home pay, charging only direct Stripe processing
                  surcharges.
                </p>
              </div>
              <input
                type="checkbox"
                checked={zeroCommissionProtocol}
                onChange={(e) => setZeroCommissionProtocol(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Max Active Proposals Per Freelancer
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={maxOpenProposals}
                  onChange={(e) => setMaxOpenProposals(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Restricts proposal spam and encourages deliberate, high-quality bidding.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Job Auto-Close Expiry (Days)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="7"
                  max="90"
                  value={jobAutoCloseDays}
                  onChange={(e) => setJobAutoCloseDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Unfilled job listings expire automatically to keep the marketplace fresh.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Restricted Off-Platform Communication Keywords
              </label>
              <div className="relative mt-1.5">
                <textarea
                  rows={2}
                  value={restrictedKeywords}
                  onChange={(e) => setRestrictedKeywords(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Comma-separated triggers flagged in messaging to protect escrow transactions.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("marketplace")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Marketplace Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: EMAIL & TRANSACTIONAL NOTIFICATIONS */}
      {activeTab === "emails" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Email Routing & Transactional Delivery
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Configure SMTP gateway credentials, sender aliases, support inboxes, and automatic
              event triggers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Email Dispatch Provider
              </label>
              <div className="relative mt-1.5">
                <select
                  value={emailProvider}
                  onChange={(e) => setEmailProvider(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                >
                  <option value="RESEND">Resend (Modern developer transactional email API)</option>
                  <option value="SENDGRID">SendGrid by Twilio</option>
                  <option value="POSTMARK">Postmark (ActiveCampaign)</option>
                  <option value="SMTP">Custom Enterprise SMTP Server</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Default Sender Display Name
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={emailFromName}
                  onChange={(e) => setEmailFromName(e.target.value)}
                  placeholder="WorkWasl Notifications"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                System Outbound Sender Address
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  value={emailFromAddress}
                  onChange={(e) => setEmailFromAddress(e.target.value)}
                  placeholder="notifications@workwasl.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Must be an authenticated domain identity in your DNS records.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Customer Support Contact Address
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  value={emailSupportAddress}
                  onChange={(e) => setEmailSupportAddress(e.target.value)}
                  placeholder="support@workwasl.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Invoicing & Billing Inquiries Address
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  value={emailBillingAddress}
                  onChange={(e) => setEmailBillingAddress(e.target.value)}
                  placeholder="billing@workwasl.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Notification Digest Cadence
              </label>
              <div className="relative mt-1.5">
                <select
                  value={emailDigestFrequency}
                  onChange={(e) => setEmailDigestFrequency(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                >
                  <option value="INSTANT">Instant Delivery (Triggered immediately on event)</option>
                  <option value="HOURLY">Hourly Bundled Digest</option>
                  <option value="DAILY">Daily Executive Briefing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                SMTP Server Hostname
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.resend.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                SMTP Port
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  placeholder="587"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Notify On New Candidate Proposal
                  </p>
                  <p className="text-[11px] text-zinc-500">Email client when a bid is received</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnNewProposal}
                  onChange={(e) => setNotifyOnNewProposal(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Notify On Milestone Deliverable
                  </p>
                  <p className="text-[11px] text-zinc-500">Alert client when work is submitted</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnMilestoneSubmitted}
                  onChange={(e) => setNotifyOnMilestoneSubmitted(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Notify On Escrow Deposit Funded
                  </p>
                  <p className="text-[11px] text-zinc-500">Alert freelancer to start development</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnEscrowFunded}
                  onChange={(e) => setNotifyOnEscrowFunded(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Notify Admins On Dispute Escalation
                  </p>
                  <p className="text-[11px] text-zinc-500">Alert arbiter team for mediation</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnDisputeOpened}
                  onChange={(e) => setNotifyOnDisputeOpened(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("emails")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Email Configuration</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: INTEGRATIONS, WEBHOOKS & AI */}
      {activeTab === "integrations" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Third-Party Integrations, Webhooks & AI Services
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Manage GitHub pull request verification, AI Milestone Co-Pilot LLM engine toggles, and
              real-time Slack/Discord webhooks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  GitHub App Pull Request Escrow Verification
                </p>
                <p className="text-[11px] text-zinc-500">
                  Verify git commits and inspect code diffs before milestones can be approved.
                </p>
              </div>
              <input
                type="checkbox"
                checked={githubAppEnabled}
                onChange={(e) => setGithubAppEnabled(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  WorkWasl AI Milestone Co-Pilot Engine
                </p>
                <p className="text-[11px] text-zinc-500">
                  Toggle AI milestone generation & proposal fit analysis for clients & contractors.
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiMilestoneCopilotEnabled}
                onChange={(e) => setAiMilestoneCopilotEnabled(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                AI Architect Foundation Model
              </label>
              <div className="relative mt-1.5">
                <select
                  value={aiCopilotModel}
                  onChange={(e) => setAiCopilotModel(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                >
                  <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Recommended)</option>
                  <option value="gemini-2.5-flash">
                    Google Gemini 2.5 Flash (Ultra-low latency)
                  </option>
                  <option value="claude-3-7-sonnet">Anthropic Claude 3.7 Sonnet</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                AI Max Completion Tokens
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="512"
                  max="8192"
                  step="512"
                  value={aiMaxTokens}
                  onChange={(e) => setAiMaxTokens(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Slack Incoming Webhook URL (Admin Alerts)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="url"
                  value={slackWebhookUrl}
                  onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Dispatches urgent notifications for high-dollar dispute filings.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Discord Webhook URL (Ops Monitoring)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="url"
                  value={discordWebhookUrl}
                  onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Allowed GitHub Organizations (Optional)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={githubAllowedOrgs}
                  onChange={(e) => setGithubAllowedOrgs(e.target.value)}
                  placeholder="e.g. acme-corp, my-org (leave blank for all)"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Webhook Retry Limit on Failure
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={webhookRetryLimit}
                  onChange={(e) => setWebhookRetryLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Sentry Distributed Tracing & Exception Monitoring
                </p>
                <p className="text-[11px] text-zinc-500">
                  Capture unhandled exceptions and monitor API response latencies.
                </p>
              </div>
              <input
                type="checkbox"
                checked={sentryMonitoringEnabled}
                onChange={(e) => setSentryMonitoringEnabled(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("integrations")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Integrations & AI Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: SECURITY & ACCESS */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              System Security, Access & Maintenance
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Manage emergency maintenance toggles, API rate limits, and verification requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Maintenance Mode (Read-Only)
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Locks write operations (escrow deposits, proposals) while preserving browsing.
                </p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Require Email Verification
                </p>
                <p className="text-[11px] text-zinc-500">
                  New users must verify email address before posting jobs or submitting bids.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireEmailVerification}
                onChange={(e) => setRequireEmailVerification(e.target.checked)}
                className="h-4 w-4 rounded-sm border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Global API Rate Limit (Requests / Minute)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="30"
                  max="1000"
                  value={rateLimitPerMinute}
                  onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                In-memory sliding window rate limiter per client IP address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Maximum Team Seats Per Organization
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxTeamSeats}
                  onChange={(e) => setMaxTeamSeats(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Number of team members a client company can invite.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                System Governance Support Email
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-purple-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSaveTab("security")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Security Policies</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Platform Settings Audit Trail
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Immutable ledger of configuration updates, administrator actions, and timestamped
              payloads.
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
              No platform setting modifications recorded in the audit log yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                        {log.action}
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {log.actor?.name ?? log.actor?.email ?? "System Admin"}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.metadata ? (
                    <pre className="rounded-xl bg-zinc-50 p-3 font-mono text-[11px] text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
