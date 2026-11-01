import { CheckCircle2, CircleDashed, Sparkles } from "lucide-react";

interface ProfileCompletenessCardProps {
  score: number;
  missingItems?: string[];
  role: "CLIENT" | "FREELANCER";
}

export function ProfileCompletenessCard({
  score,
  missingItems = [],
  role,
}: ProfileCompletenessCardProps) {
  const isComplete = score >= 100;
  const isClient = role === "CLIENT";

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-white to-zinc-50/50 p-6 shadow-xs dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isComplete
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>{isComplete ? "100% Complete" : `${score}% Completed`}</span>
            </span>
          </div>

          <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-50">
            {isClient ? "Organization Trust & Verification" : "Profile Completeness & Rank"}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xl">
            {isClient
              ? "Comprehensive company profiles attract 3.4x more verified proposals from top engineers."
              : "Complete profiles receive priority ranking in talent search and higher client response rates."}
          </p>
        </div>

        {/* Circular / Linear Progress Indicator */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="text-right">
            <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {score}%
            </span>
          </div>
          <div className="h-2 w-36 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete ? "bg-emerald-500" : score > 60 ? "bg-indigo-600" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>
      </div>

      {missingItems.length > 0 && !isComplete && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
            Suggested additions to reach 100%:
          </p>
          <div className="flex flex-wrap gap-2">
            {missingItems.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-300"
              >
                <CircleDashed className="h-3 w-3 text-indigo-500" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
