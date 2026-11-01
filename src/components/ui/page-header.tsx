import * as React from "react";
import { type LucideIcon } from "lucide-react";

export interface PageHeaderProps {
  badge?: string;
  badgeIcon?: LucideIcon;
  badgeVariant?: "default" | "success" | "warning" | "destructive" | "purple" | "info";
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  badge,
  badgeIcon: BadgeIcon,
  badgeVariant = "purple",
  title,
  description,
  children,
}: PageHeaderProps) {
  const badgeColors = {
    default: "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800",
    success: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    warning: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
    destructive: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
    purple: "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50",
    info: "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50",
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {badge && (
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeColors[badgeVariant]}`}
          >
            {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
            <span>{badge}</span>
          </div>
        )}
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {children && <div className="flex items-center gap-2.5 shrink-0">{children}</div>}
    </div>
  );
}
