import { Skeleton, ContractCardSkeleton } from "@/components/ui/skeleton";

export default function FreelancerContractsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ContractCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
