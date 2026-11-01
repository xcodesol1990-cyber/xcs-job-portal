import { PageSkeleton } from "@/components/ui/skeleton";

export default function ClientLoading() {
  return <PageSkeleton title={true} cards={3} table={true} />;
}
