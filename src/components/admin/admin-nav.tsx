"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, AlertCircle, Flag, ReceiptText } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users & KYC", icon: Users },
    { href: "/admin/disputes", label: "Disputes & Arbitration", icon: AlertCircle },
    { href: "/admin/reports", label: "Moderation & Flags", icon: Flag },
    { href: "/admin/ledger", label: "Ledger Audit", icon: ReceiptText },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              isActive
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

