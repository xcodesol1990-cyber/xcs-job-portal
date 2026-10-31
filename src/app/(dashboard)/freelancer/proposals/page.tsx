import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProposalService } from "@/server/services/proposal.service";
import { FreelancerProposalItem } from "@/components/forms/freelancer-proposal-item";
import { UserCheck, Search } from "lucide-react";

export default async function FreelancerProposalsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const proposals = await ProposalService.getFreelancerProposals(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-4 w-4" />
            <span>Proposals Manager</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Submitted Pitches & Applications
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Track client review status, respond to interviews, and manage bids.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
        >
          <Search className="h-4 w-4" />
          <span>Find More Jobs</span>
        </Link>
      </div>

      <div className="space-y-4">
        {proposals.map((p) => (
          <FreelancerProposalItem key={p.id} proposal={p} />
        ))}

        {proposals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            You haven&apos;t submitted any proposals yet. Browse opportunities and submit your first pitch!
          </div>
        )}
      </div>
    </div>
  );
}
