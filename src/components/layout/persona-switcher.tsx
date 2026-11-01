"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, UserCheck } from "lucide-react";

interface PersonaSwitcherProps {
  isClient: boolean;
  isFreelancer: boolean;
}

export function PersonaSwitcher({ isClient, isFreelancer }: PersonaSwitcherProps) {
  const pathname = usePathname();

  // If user only has one role, don't show the dual switcher
  if (!isClient && !isFreelancer) return null;

  const inClientView = pathname.startsWith("/client");
  const inFreelancerView = pathname.startsWith("/freelancer");

  return (
    <div className="flex items-center rounded-xl border border-zinc-200/80 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-800/60 text-xs">
      {isClient && (
        <Link
          href="/client"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
            inClientView
              ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
          title="Switch to Client Hiring Mode"
        >
          <Briefcase className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          <span>Client</span>
        </Link>
      )}

      {isFreelancer && (
        <Link
          href="/freelancer"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition ${
            inFreelancerView
              ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
          title="Switch to Freelancer Working Mode"
        >
          <UserCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>Freelancer</span>
        </Link>
      )}
    </div>
  );
}
