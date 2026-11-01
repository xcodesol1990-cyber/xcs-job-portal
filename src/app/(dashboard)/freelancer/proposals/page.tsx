import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProposalService } from "@/server/services/proposal.service";
import { FreelancerProposalItem } from "@/components/forms/freelancer-proposal-item";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { UserCheck, Search, Send } from "lucide-react";

export default async function FreelancerProposalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const proposals = await ProposalService.getFreelancerProposals(session.user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Proposals Manager"
        badgeIcon={UserCheck}
        badgeVariant="success"
        title="Submitted Pitches & Applications"
        description="Track client review status, respond to interviews, and manage your active bids."
      >
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-500 hover:to-indigo-500"
        >
          <Search className="h-4 w-4" />
          <span>Find More Jobs</span>
        </Link>
      </PageHeader>

      <div className="space-y-4">
        {proposals.map((p) => (
          <FreelancerProposalItem key={p.id} proposal={p} />
        ))}

        {proposals.length === 0 && (
          <EmptyState
            icon={Send}
            title="No proposals submitted yet"
            description="You haven't submitted any pitches yet. Browse the marketplace and apply with your custom milestone proposals."
            action={{
              label: "Browse Marketplace Opportunities",
              href: "/jobs",
              icon: Search,
            }}
          />
        )}
      </div>
    </div>
  );
}
