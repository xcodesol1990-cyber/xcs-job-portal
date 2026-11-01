import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { AdminNav } from "@/components/admin/admin-nav";
import { UserStatusButton } from "@/components/admin/user-status-button";
import { ShieldCheck, CheckCircle2, Search } from "lucide-react";
import Link from "next/link";

interface UsersPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const session = await auth();
  if (!session?.user?.roles?.includes("ADMIN")) {
    redirect("/dashboard");
  }

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? "1", 10) || 1;
  const search = resolvedParams.search ?? "";

  const { users, total, totalPages } = await adminService.listUsers({
    page,
    limit: 20,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <AdminNav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            User Accounts & KYC Verification
          </h2>
          <p className="text-xs text-zinc-500">
            Total {total} accounts registered on WorkNest.
          </p>
        </div>

        <form method="GET" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name or email..."
              className="w-64 rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 shadow-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/40">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-4 py-3.5 font-semibold">Roles</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">KYC / Verification</th>
                <th className="px-4 py-3.5 font-semibold">Marketplace Activity</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {users.map((user) => {
                const isClient = user.roles.includes("CLIENT");
                const isFreelancer = user.roles.includes("FREELANCER");
                const isPaymentVerified = user.clientProfile?.paymentVerified ?? false;
                const initials = user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "U";

                return (
                  <tr key={user.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-white text-[11px] shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              r === "ADMIN"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                                : r === "CLIENT"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : user.status === "SUSPENDED"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : user.status === "SUSPENDED"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isClient && (
                        <div className="flex items-center gap-1 text-[11px]">
                          {isPaymentVerified ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Payment Verified
                            </span>
                          ) : (
                            <span className="text-zinc-400">Unverified</span>
                          )}
                        </div>
                      )}
                      {user.emailVerifiedAt && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          Email Verified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500">
                      <div>Jobs: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user._count.jobs}</span></div>
                      <div>Contracts: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user._count.clientContracts + user._count.freelancerContracts}</span></div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!user.roles.includes("ADMIN") && (
                        <UserStatusButton
                          userId={user.id}
                          userName={user.name}
                          currentStatus={user.status}
                          isClient={isClient}
                          isFreelancer={isFreelancer}
                          paymentVerified={isPaymentVerified}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200/80 px-5 py-3.5 text-xs dark:border-zinc-800">
            <span className="text-zinc-500">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ""}`}
                  className="rounded-lg border border-zinc-200 px-3 py-1 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ""}`}
                  className="rounded-lg border border-zinc-200 px-3 py-1 font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
