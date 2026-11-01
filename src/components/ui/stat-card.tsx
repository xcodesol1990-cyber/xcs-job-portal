import * as React from "react";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  delta?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  badge?: {
    text: string;
    color?: string;
  };
  children?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-purple-600 dark:text-purple-400",
  iconBg = "bg-purple-50 dark:bg-purple-950/40",
  delta,
  badge,
  children,
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor} shadow-xs`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {value}
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-bold ${
              delta.isPositive !== false
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {delta.isPositive !== false ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span>{delta.value}</span>
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      )}

      {badge && (
        <div className="mt-3">
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
              badge.color ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {badge.text}
          </span>
        </div>
      )}

      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
