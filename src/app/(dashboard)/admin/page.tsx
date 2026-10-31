import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import {
  ShieldAlert,
  Users,
  CreditCard,
  Sliders,
  Activity,
  CheckCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) {
    redirect("/client");
  }

  // Fetch live stats from database
  const [userCount, clientCount, freelancerCount, platformSettings] = await Promise.all([
    prisma.user.count(),
    prisma.clientProfile.count(),
    prisma.freelancerProfile.count(),
    prisma.platformSetting.findMany(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          <ShieldAlert className="h-4 w-4" />
          <span>Platform Administration & Governance</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome back, Administrator
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Monitor system metrics, enforce role-based access, and oversee marketplace contracts.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Users</span>
            <Users className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {userCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Active registered accounts</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Clients</span>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {clientCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Companies & employers</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Freelancers</span>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {freelancerCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500">Vetted talent profiles</div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Platform Status</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Healthy
          </div>
          <div className="mt-1 text-xs text-zinc-500">PostgreSQL pooled & active</div>
        </div>
      </div>

      {/* Settings & Parameters */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <Sliders className="h-4 w-4 text-purple-500" />
          <span>Active Governance Parameters</span>
        </div>
        <div className="mt-4 divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
          {platformSettings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-3">
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {setting.key}
              </span>
              <span className="rounded-md bg-zinc-100 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                {JSON.stringify(setting.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
