"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/server/actions/auth.actions";
import {
  LayoutDashboard,
  Users,
  AlertCircle,
  Flag,
  ReceiptText,
  Briefcase,
  FileCheck,
  ExternalLink,
  LogOut,
  ShieldCheck,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | null;
  badgeColor?: string;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  openDisputesCount?: number;
  pendingReportsCount?: number;
}

export function AdminSidebar({
  user,
  openDisputesCount = 0,
  pendingReportsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navSections: NavSection[] = [
    {
      title: "ANALYTICS & CORE",
      items: [
        {
          label: "Mission Control",
          href: "/admin",
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      title: "DIRECTORY & OPERATIONS",
      items: [
        {
          label: "Users & KYC",
          href: "/admin/users",
          icon: Users,
          badge: null,
        },
        {
          label: "Marketplace Jobs",
          href: "/jobs",
          icon: Briefcase,
          badge: "Browse",
        },
      ],
    },
    {
      title: "TRUST, SAFETY & LEDGER",
      items: [
        {
          label: "Disputes & Escrow",
          href: "/admin/disputes",
          icon: AlertCircle,
          badge: openDisputesCount > 0 ? `${openDisputesCount}` : null,
          badgeColor: "bg-red-500/20 text-red-400 border border-red-500/30",
        },
        {
          label: "Moderation Queue",
          href: "/admin/reports",
          icon: Flag,
          badge: pendingReportsCount > 0 ? `${pendingReportsCount}` : null,
          badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        },
        {
          label: "Double-Entry Ledger",
          href: "/admin/ledger",
          icon: ReceiptText,
          badge: null,
        },
      ],
    },
    {
      title: "SWITCH WORKSPACE",
      items: [
        {
          label: "Client Workspace",
          href: "/client",
          icon: Briefcase,
          external: true,
        },
        {
          label: "Freelancer Hub",
          href: "/freelancer",
          icon: FileCheck,
          external: true,
        },
      ],
    },
  ];

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300 md:flex">
      {/* Brand & Console Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">WorkNest</span>
              <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">Enterprise Console</p>
          </div>
        </Link>
      </div>

      {/* Cluster Environment Pill */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-zinc-300">Live Production</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">iad1</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              {section.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.badgeColor ?? "bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.external && (
                        <ExternalLink className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400" />
                      )}
                      {isActive && !item.badge && (
                        <ChevronRight className="h-3.5 w-3.5 text-purple-200" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Profile & Logout Card */}
      <div className="border-t border-zinc-800/80 p-3">
        <div className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 font-bold text-white text-xs shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-100 truncate">
                {user.name ?? "Administrator"}
              </p>
              <p className="text-[10px] text-zinc-500 truncate font-mono">{user.email}</p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign Out"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
