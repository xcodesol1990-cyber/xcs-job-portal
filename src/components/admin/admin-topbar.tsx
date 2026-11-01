"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/server/actions/auth.actions";
import { SeedDatabaseButton } from "./seed-database-button";
import {
  Menu,
  X,
  Search,
  ShieldCheck,
  LayoutDashboard,
  Users,
  AlertCircle,
  Flag,
  ReceiptText,
  Briefcase,
  LogOut,
  ExternalLink,
} from "lucide-react";

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  openDisputesCount?: number;
  pendingReportsCount?: number;
}

export function AdminTopbar({
  user,
  openDisputesCount = 0,
  pendingReportsCount = 0,
}: AdminTopbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === "/admin") return "Mission Control";
    if (pathname.startsWith("/admin/users")) return "Users & KYC Directory";
    if (pathname.startsWith("/admin/disputes")) return "Disputes & Arbitration";
    if (pathname.startsWith("/admin/reports")) return "Moderation Queue";
    if (pathname.startsWith("/admin/ledger")) return "Double-Entry Ledger Audit";
    return "Administration";
  };

  const navLinks = [
    { label: "Mission Control", href: "/admin", icon: LayoutDashboard },
    { label: "Users & KYC", href: "/admin/users", icon: Users },
    {
      label: "Disputes & Escrow",
      href: "/admin/disputes",
      icon: AlertCircle,
      badge: openDisputesCount > 0 ? `${openDisputesCount}` : null,
    },
    {
      label: "Moderation Queue",
      href: "/admin/reports",
      icon: Flag,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount}` : null,
    },
    { label: "Double-Entry Ledger", href: "/admin/ledger", icon: ReceiptText },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 md:hidden dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-zinc-400">Console</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{getPageTitle()}</span>
          </div>
        </div>

        {/* Center: Search Input */}
        <div className="hidden lg:flex items-center max-w-sm w-full mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              readOnly
              placeholder="Search directory, contracts, ledger... ⌘K"
              className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/80 py-1.5 pl-9 pr-3 text-xs text-zinc-900 transition placeholder:text-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Right: Telemetry & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>PostgreSQL Active</span>
          </div>

          <SeedDatabaseButton />

          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <Link
              href="/client"
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              title="Switch to Client View"
            >
              <Briefcase className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-72 max-w-[80%] bg-zinc-950 p-6 text-zinc-300 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-white text-base">WorkNest Admin</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold ${
                        isActive
                          ? "bg-purple-600 text-white"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-zinc-800 pt-4 space-y-1 text-xs">
                <Link
                  href="/client"
                  className="flex items-center justify-between px-3 py-2 text-zinc-400 hover:text-white"
                >
                  <span>Client Workspace</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <Link
                  href="/freelancer"
                  className="flex items-center justify-between px-3 py-2 text-zinc-400 hover:text-white"
                >
                  <span>Freelancer Hub</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-3">
              <div className="px-3 py-1 text-xs">
                <p className="font-semibold text-zinc-100">{user.name ?? "Administrator"}</p>
                <p className="text-[10px] text-zinc-500 font-mono">{user.email}</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
