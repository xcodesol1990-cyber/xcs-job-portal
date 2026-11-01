"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  AlertCircle,
  Flag,
  ReceiptText,
} from "lucide-react";
import { SeedDatabaseButton } from "./seed-database-button";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Mission Control", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users & KYC", icon: Users },
    { href: "/admin/disputes", label: "Disputes & Arbitration", icon: AlertCircle },
    { href: "/admin/reports", label: "Moderation Queue", icon: Flag },
    { href: "/admin/ledger", label: "Ledger Audit", icon: ReceiptText },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200/80 pb-4 dark:border-zinc-800/80">
      <div className="flex flex-wrap items-center gap-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                  : "bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 border border-zinc-200/60 dark:border-zinc-800/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>PostgreSQL Active</span>
        </div>
        <SeedDatabaseButton />
      </div>
    </div>
  );
}
