"use client";

import { useState } from "react";
import Link from "next/link";
import { UserNavDropdown } from "@/components/layout/user-nav-dropdown";
import { logoutAction } from "@/server/actions/auth.actions";
import {
  ShieldCheck,
  ArrowRight,
  Briefcase,
  UserCheck,
  Menu,
  X,
  Search,
  Lock,
  Building2,
  FileText,
  DollarSign,
  MessageSquare,
  LogOut,
} from "lucide-react";

interface PublicHeaderProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    roles?: string[];
    imageUrl?: string | null;
  } | null;
}

export function PublicHeader({ user }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isClient = user?.roles?.includes("CLIENT");
  const isFreelancer = user?.roles?.includes("FREELANCER");
  const dashboardLink = isClient ? "/client" : isFreelancer ? "/freelancer" : "/dashboard";
  const profileLink = isClient ? "/client/profile" : "/freelancer/profile";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80 transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Protocol Status */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Work<span className="text-indigo-600 dark:text-indigo-400">Wasl</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Escrow Protocol
              </span>
            </div>
          </Link>

          {/* Core Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-zinc-200/80 dark:border-zinc-800">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-300 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/60 transition"
            >
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <span>Browse Opportunities</span>
            </Link>

            <Link
              href="/#how-it-works"
              className="rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-300 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/60 transition"
            >
              Zero-Connects Guarantee
            </Link>

            <Link
              href="/client/jobs/new"
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/70 dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Post a Job</span>
            </Link>
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            /* Logged-In State with Dropdown Menu */
            <div className="flex items-center gap-3">
              <UserNavDropdown user={user} />

              <Link
                href={dashboardLink}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            /* Guest / Visitor State */
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <Link
              href={dashboardLink}
              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold dark:border-zinc-800"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden space-y-3 animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <Search className="h-4 w-4 text-indigo-500" />
            <span>Browse Opportunities</span>
          </Link>

          <Link
            href="/client/jobs/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            <Briefcase className="h-4 w-4 text-purple-500" />
            <span>Post a Job Opportunity</span>
          </Link>

          {user && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {isClient ? "Employer Workspace" : "Freelancer Account"}
              </div>

              <Link
                href={profileLink}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                {isClient ? (
                  <Building2 className="h-4 w-4 text-indigo-600" />
                ) : (
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                )}
                <span>{isClient ? "Company Profile & Settings" : "Profile & Portfolio"}</span>
              </Link>

              {isClient ? (
                <>
                  <Link
                    href="/client/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    <FileText className="h-4 w-4 text-zinc-400" />
                    <span>My Job Postings</span>
                  </Link>
                  <Link
                    href="/client/contracts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    <ShieldCheck className="h-4 w-4 text-zinc-400" />
                    <span>Active Contracts</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/freelancer/proposals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    <Briefcase className="h-4 w-4 text-zinc-400" />
                    <span>My Proposals</span>
                  </Link>
                  <Link
                    href="/freelancer/payouts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span>Earnings & Payouts</span>
                  </Link>
                </>
              )}

              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <span>Messages</span>
              </Link>
            </div>
          )}

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
            {!user ? (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Join as Client or Freelancer</span>
              </Link>
            ) : (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 py-2 text-xs font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
