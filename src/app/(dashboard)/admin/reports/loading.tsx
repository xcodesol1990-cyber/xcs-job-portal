import { TableSkeleton } from "@/components/ui/skeleton";
import { AdminNav } from "@/components/admin/admin-nav";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <AdminNav />
      <div className="space-y-2">
        <div className="h-6 w-52 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-4 w-72 rounded bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
      </div>
      <TableSkeleton columns={6} rows={6} />
    </div>
  );
}
