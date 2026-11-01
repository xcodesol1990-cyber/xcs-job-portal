import { Skeleton, JobCardSkeleton } from "@/components/ui/skeleton";

export default function MarketplaceLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Search Header */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filter and Job Cards Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filter Column */}
        <div className="space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-3">
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>

        {/* Jobs List Column */}
        <div className="lg:col-span-3 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

