import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { adminService } from "@/server/services/admin.service";
import { AdminNav } from "@/components/admin/admin-nav";
import { UserStatusButton } from "@/components/admin/user-status-button";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

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
    limit: 25,
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
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or email..."
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-purple-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Roles</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">KYC / Verification</th>
                <th className="px-4 py-3 font-semibold">Activity</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((user) => {
                const isClient = user.roles.includes("CLIENT");
                const isFreelancer = user.roles.includes("FREELANCER");
                const isPaymentVerified = user.clientProfile?.paymentVerified ?? false;

                return (
                  <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              r === "ADMIN"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                                : r === "CLIENT"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : user.status === "SUSPENDED"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isClient && (
                        <div className="flex items-center gap-1 text-[11px]">
                          {isPaymentVerified ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
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
                    <td className="px-4 py-3 text-zinc-500">
                      <div>Jobs: {user._count.jobs}</div>
                      <div>Contracts: {user._count.clientContracts + user._count.freelancerContracts}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!user.roles.includes("ADMIN") && (
                        <UserStatusButton
                          userId={user.id}
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
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-xs dark:border-zinc-800">
            <span className="text-zinc-500">
              Page {page} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
