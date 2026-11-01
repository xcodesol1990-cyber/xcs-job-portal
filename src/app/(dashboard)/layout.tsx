import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/server/actions/auth.actions";
import { PersonaSwitcher } from "@/components/layout/persona-switcher";
import { CommandPalette } from "@/components/layout/command-palette";
import {
  ShieldCheck,
  LogOut,
  Briefcase,
  UserCheck,
  Shield,
  MessageSquare,
  Bell,
  Search,
  PlusCircle,
} from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const roles = user.roles ?? [];
  const isAdmin = roles.includes("ADMIN");
  const isClient = roles.includes("CLIENT");
  const isFreelancer = roles.includes("FREELANCER");

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

            {/* Quick links & Persona Switcher */}
            <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 transition"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              {isClient && isFreelancer ? (
                <PersonaSwitcher isClient={isClient} isFreelancer={isFreelancer} />
              ) : isClient ? (
                <Link
                  href="/client"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Employer Hub</span>
                </Link>
              ) : (
                <Link
                  href="/freelancer"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Freelancer Hub</span>
                </Link>
              )}

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

            <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-xs font-bold text-white shadow-xs ring-2 ring-white dark:ring-zinc-900">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "WN"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                  {user.name}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{isClient ? "Employer" : "Specialist"}</span>
                </div>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out of WorkNest"
                className="flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2 text-xs font-medium text-zinc-600 shadow-2xs hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">{children}</main>
    </div>
  );
}
