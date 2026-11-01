import { TableSkeleton } from "@/components/ui/skeleton";
import { AdminNav } from "@/components/admin/admin-nav";

export default function LedgerLoading() {
  return (
    <div className="space-y-6">
      <AdminNav />
      <div className="space-y-2">
        <div className="h-6 w-56 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-4 w-80 rounded bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
      </div>
      <TableSkeleton columns={6} rows={10} />
    </div>
  );
}
