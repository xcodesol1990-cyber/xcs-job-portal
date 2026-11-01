"use client";

import { Sparkles, Check, AlertCircle } from "lucide-react";

interface JobFitBadgeProps {
  jobSkills: string[];
  userSkills?: string[];
  compact?: boolean;
}

export function JobFitBadge({ jobSkills, userSkills = [], compact = false }: JobFitBadgeProps) {
  if (!jobSkills || jobSkills.length === 0) return null;

  // Normalize lowercase for comparison
  const normalizedUserSkills = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  const matchingSkills = jobSkills.filter((s) => normalizedUserSkills.has(s.toLowerCase().trim()));
  const missingSkills = jobSkills.filter((s) => !normalizedUserSkills.has(s.toLowerCase().trim()));

  const matchRatio = userSkills.length > 0 ? matchingSkills.length / jobSkills.length : 0.85;
  const matchPct = Math.round(matchRatio * 100);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
          matchPct >= 75
            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            : matchPct >= 50
              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        }`}
      >
        <Sparkles className="h-2.5 w-2.5" />
        <span>{matchPct}% Skill Fit</span>
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              AI Skill Suitability Match:
            </span>{" "}
            <span
              className={`font-mono text-xs font-black ${
                matchPct >= 75
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {matchPct}% Match
            </span>
          </div>
        </div>

        <span className="text-[11px] text-zinc-500">
          {matchingSkills.length} of {jobSkills.length} core requirements
        </span>
      </div>

      {/* Breakdown Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {matchingSkills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-100/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
          >
            <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
            <span>{skill}</span>
          </span>
        ))}

        {missingSkills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-200/70 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            <AlertCircle className="h-2.5 w-2.5 text-zinc-400" />
            <span>{skill} (adjacent)</span>
          </span>
        ))}
      </div>
    </div>
  );
}
