"use client";

import { CheckCircle2, Clock, DollarSign, ShieldCheck, AlertCircle } from "lucide-react";

export interface TimelineMilestone {
  id: string;
  title: string;
  amountCents: bigint | number;
  status: string;
  orderNumber?: number;
}

interface ContractTimelineStepperProps {
  milestones: TimelineMilestone[];
  totalCents: bigint | number;
}

export function ContractTimelineStepper({ milestones, totalCents }: ContractTimelineStepperProps) {
  const totalAmount = Number(totalCents) / 100;

  // Calculate financial states
  let releasedCents = 0;
  let inEscrowCents = 0;
  let pendingCents = 0;

  milestones.forEach((m) => {
    const amt = Number(m.amountCents);
    if (m.status === "RELEASED") {
      releasedCents += amt;
    } else if (
      m.status === "FUNDED" ||
      m.status === "SUBMITTED" ||
      m.status === "REVISION_REQUESTED"
    ) {
      inEscrowCents += amt;
    } else {
      pendingCents += amt;
    }
  });

  const releasedAmount = releasedCents / 100;
  const inEscrowAmount = inEscrowCents / 100;
  const pendingAmount = pendingCents / 100;

  const completedCount = milestones.filter((m) => m.status === "RELEASED").length;
  const progressPercent =
    milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const scrollToMilestone = (id: string) => {
    const element = document.getElementById(`milestone-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const getNodeIcon = (status: string) => {
    switch (status) {
      case "RELEASED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "SUBMITTED":
        return <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />;
      case "FUNDED":
        return <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "DISPUTED":
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <DollarSign className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />;
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case "RELEASED":
        return "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20";
      case "SUBMITTED":
        return "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30";
      case "FUNDED":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300";
      case "DISPUTED":
        return "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300";
      default:
        return "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-400";
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 space-y-6">
      {/* Capital Allocation Telemetry Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Released Payouts</span>
          </div>
          <div className="mt-1 font-mono text-xl font-black text-emerald-900 dark:text-emerald-100">
            $
            {releasedAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            {completedCount} of {milestones.length} milestones paid out
          </div>
        </div>

        <div className="rounded-xl border border-blue-200/70 bg-blue-50/50 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Locked in Escrow</span>
          </div>
          <div className="mt-1 font-mono text-xl font-black text-blue-900 dark:text-blue-100">
            $
            {inEscrowAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[11px] text-blue-700/80 dark:text-blue-400/80">
            Held in double-entry platform vaults
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Remaining Contract</span>
          </div>
          <div className="mt-1 font-mono text-xl font-black text-zinc-900 dark:text-zinc-100">
            $
            {pendingAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-[11px] text-zinc-500">
            Total Contract: $
            {totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      {/* Stepper Progress Visualizer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              Contract Lifecycle Progress
            </span>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              {progressPercent}% Complete
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">
            Click any milestone node to jump to actions
          </span>
        </div>

        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-5 left-4 right-4 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
          <div
            className="absolute top-5 left-4 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />

          {/* Milestone Checkpoint Nodes */}
          <div className="relative z-10 flex items-start justify-between gap-2 overflow-x-auto pb-2">
            {milestones.map((m, idx) => {
              const amountDollars = Number(m.amountCents) / 100;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => scrollToMilestone(m.id)}
                  className="group flex flex-col items-center text-center cursor-pointer min-w-[90px] focus:outline-none"
                  title={`Jump to Milestone: ${m.title}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-transform duration-200 group-hover:scale-110 shadow-xs ${getNodeColor(m.status)}`}
                  >
                    {getNodeIcon(m.status)}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate max-w-[100px]">
                      M{idx + 1}: {m.title}
                    </div>
                    <div className="font-mono text-[10px] font-semibold text-zinc-500">
                      ${amountDollars.toFixed(0)}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wide text-zinc-400">
                      {m.status.replace("_", " ")}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
