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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Work<span className="text-indigo-600 dark:text-indigo-400">Nest</span>
              </span>
            </Link>

            {/* Role switchers / quick links */}
            <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 transition"
                >
                  <Shield className="h-3.5 w-3.5" />
                  Admin Panel
                </Link>
              )}
              {isClient && (
                <Link
                  href="/client"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 transition"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Client Workspace
                </Link>
              )}
              {isFreelancer && (
                <Link
                  href="/freelancer"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Freelancer Hub
                </Link>
              )}
              <Link
                href="/messages"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Messages
              </Link>
              <Link
                href="/notifications"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Bell className="h-3.5 w-3.5" />
                Alerts
              </Link>

              {isClient && isFreelancer && (
                <div className="ml-2">
                  <PersonaSwitcher isClient={isClient} isFreelancer={isFreelancer} />
                </div>
              )}
            </nav>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-3.5">
            <CommandPalette />
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-sm">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "WN"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="capitalize">{user.email}</span>
                </div>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <LogOut className="h-3.5 w-3.5 text-zinc-500" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
