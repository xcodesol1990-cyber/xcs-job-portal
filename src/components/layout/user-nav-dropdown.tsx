"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { logoutAction } from "@/server/actions/auth.actions";
import {
  User,
  Briefcase,
  UserCheck,
  ShieldCheck,
  FileText,
  FileCheck,
  Send,
  DollarSign,
  PlusCircle,
  MessageSquare,
  Bell,
  Search,
  ExternalLink,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Building2,
  FolderTree,
  Sliders,
} from "lucide-react";

export interface UserNavDropdownProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    roles?: string[];
    imageUrl?: string | null;
  };
}

export function UserNavDropdown({ user }: UserNavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roles = user.roles ?? [];
  const isClient = roles.includes("CLIENT");
  const isFreelancer = roles.includes("FREELANCER");
  const isAdmin = roles.includes("ADMIN");

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "WN";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group inline-flex items-center gap-2.5 rounded-2xl border border-zinc-200/90 bg-white/80 p-1.5 pr-3 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800/80 transition"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-xs font-bold text-white shadow-xs">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="max-w-[120px] truncate font-bold text-zinc-900 dark:text-zinc-100 leading-none">
            {user.name}
          </span>
          <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>
              {isAdmin
                ? "Admin"
                : isClient
                  ? "Client / Employer"
                  : isFreelancer
                    ? "Freelancer"
                    : "Member"}
            </span>
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Card */}
          <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-950/60 mb-2 border border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-xs font-bold text-white shadow-xs">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300">
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </span>
              )}
              {isClient && (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300">
                  <Briefcase className="h-3 w-3" />
                  Client Account
                </span>
              )}
              {isFreelancer && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  <UserCheck className="h-3 w-3" />
                  Verified Freelancer
                </span>
              )}
            </div>
          </div>

          {/* Role Specific Navigation */}
          <div className="space-y-0.5">
            {/* CLIENT SECTION */}
            {isClient && (
              <>
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Client Workspace
                </div>

                <Link
                  href="/client/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold">Company Profile & Settings</span>
                </Link>

                <Link
                  href="/client"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Client Overview</span>
                </Link>

                <Link
                  href="/client/jobs"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  <span>My Job Postings</span>
                </Link>

                <Link
                  href="/client/contracts"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Active Contracts & Escrow</span>
                </Link>

                <Link
                  href="/client/jobs/new"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 transition"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Post a New Job Brief</span>
                </Link>

                <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />
              </>
            )}

            {/* FREELANCER SECTION */}
            {isFreelancer && (
              <>
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Freelancer Hub
                </div>

                <Link
                  href="/freelancer/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">Profile & Portfolio Settings</span>
                </Link>

                <Link
                  href={`/freelancers/${user.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                    <span>View Public Marketplace Profile</span>
                  </span>
                </Link>

                <Link
                  href="/freelancer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Freelancer Dashboard</span>
                </Link>

                <Link
                  href="/freelancer/proposals"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <Send className="h-3.5 w-3.5 text-zinc-400" />
                  <span>My Submitted Proposals</span>
                </Link>

                <Link
                  href="/freelancer/contracts"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <FileCheck className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Milestone Contracts</span>
                </Link>

                <Link
                  href="/freelancer/payouts"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Stripe Payouts & Earnings</span>
                </Link>

                <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />
              </>
            )}

            {/* ADMIN SECTION */}
            {isAdmin && (
              <>
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Governance
                </div>

                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Mission Control</span>
                </Link>

                <Link
                  href="/admin/categories"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <FolderTree className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Categories & Skills Taxonomy</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
                >
                  <Sliders className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Platform Settings & Rules</span>
                </Link>

                <div className="my-1.5 border-t border-zinc-100 dark:border-zinc-800" />
              </>
            )}

            {/* SHARED CHAT & NOTIFICATIONS */}
            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
            >
              <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
              <span>Direct Messages</span>
            </Link>

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
            >
              <Bell className="h-3.5 w-3.5 text-zinc-400" />
              <span>Notifications</span>
            </Link>

            <Link
              href="/jobs"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition"
            >
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <span>Browse Job Marketplace</span>
            </Link>
          </div>

          {/* Sign Out Section */}
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
