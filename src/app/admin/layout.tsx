import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles ?? [];
  if (!roles.includes("ADMIN")) {
    redirect("/dashboard");
  }

  // Fetch quick indicator badges for the sidebar
  const [openDisputes, pendingReports] = await Promise.all([
    prisma.dispute.count({
      where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
    }),
    prisma.report.count({
      where: { status: "OPEN" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased selection:bg-purple-500 selection:text-white">
      {/* Desktop Fixed Left Sidebar */}
      <AdminSidebar
        user={session.user}
        openDisputesCount={openDisputes}
        pendingReportsCount={pendingReports}
      />

      {/* Main Content Area with Sticky Topbar */}
      <div className="flex flex-col min-h-screen md:pl-64 transition-all duration-200">
        <AdminTopbar
          user={session.user}
          openDisputesCount={openDisputes}
          pendingReportsCount={pendingReports}
        />

        <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

