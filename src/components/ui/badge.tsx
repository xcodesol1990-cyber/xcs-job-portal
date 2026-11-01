import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "purple"
    | "outline"
    | "info";
  dot?: boolean;
}

export function Badge({
  className = "",
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900",
    secondary: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60",
    warning: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60",
    destructive: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200/80 dark:border-red-800/60",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60",
    info: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60",
    outline: "text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700",
  };

  const dotColors = {
    default: "bg-zinc-400",
    secondary: "bg-zinc-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    destructive: "bg-red-500",
    purple: "bg-purple-500",
    info: "bg-sky-500",
    outline: "bg-zinc-400",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      )}
      <span>{children}</span>
    </div>
  );
}

