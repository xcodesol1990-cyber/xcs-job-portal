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

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
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
