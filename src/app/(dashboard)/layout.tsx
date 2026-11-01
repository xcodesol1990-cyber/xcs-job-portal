import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CommandPalette } from "@/components/layout/command-palette";
import { UserNavDropdown } from "@/components/layout/user-nav-dropdown";
import { ShieldCheck, MessageSquare, Bell, Search, PlusCircle } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const roles = user.roles ?? [];
  const isClient = roles.includes("CLIENT");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Ambient Glow Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  Work<span className="text-indigo-600 dark:text-indigo-400">Nest</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Vault
                </span>
              </div>
            </Link>

            {/* Core Header Navigation */}
            <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <Link
                href="/jobs"
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <span>Marketplace</span>
              </Link>

              <Link
                href="/messages"
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                <span>Messages</span>
              </Link>

              <Link
                href="/notifications"
                className="relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Bell className="h-3.5 w-3.5 text-zinc-400" />
                <span>Alerts</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
              </Link>
            </nav>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-3">
            <CommandPalette />

            {isClient && (
              <Link
                href="/client/jobs/new"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-purple-500 hover:to-indigo-500 transition"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Post Job</span>
              </Link>
            )}

            <div className="pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <UserNavDropdown user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">{children}</main>
    </div>
  );
}
