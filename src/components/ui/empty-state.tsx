import * as React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
}

export function EmptyState({
  icon: Icon,
  iconColor = "text-purple-600 dark:text-purple-400",
  iconBg = "bg-purple-50 dark:bg-purple-950/40",
  title,
  description,
  action,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-8 sm:p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
      {Icon && (
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} ${iconColor} shadow-xs`}
        >
          <Icon className="h-7 w-7" />
        </div>
      )}

      <h3 className="mt-4 text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>

      <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
        {description}
      </p>

      {action && (
        <div className="mt-6">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:from-purple-500 hover:to-indigo-500"
            >
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              <span>{action.label}</span>
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:from-purple-500 hover:to-indigo-500"
            >
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              <span>{action.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
