import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/lib/auth";
import { ProposalService } from "@/server/services/proposal.service";
import { JobService } from "@/server/services/job.service";
import { ClientProposalActions } from "@/components/forms/client-proposal-actions";
import {
  Briefcase,
  ArrowLeft,
} from "lucide-react";

interface ProposalsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientJobProposalsPage({ params }: ProposalsPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let job;
  try {
    job = await JobService.getJobById(id);
  } catch {
    notFound();
  }

  if (job.clientId !== session.user.id) {
    redirect("/client");
  }

  const proposals = await ProposalService.getJobProposals(session.user.id, id);

  return (
    <div className="space-y-8">
      <Link
        href="/client/jobs"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to my jobs</span>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Briefcase className="h-4 w-4" />
          <span>Candidate Proposals</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Proposals for: {job.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Review candidates, interview via 1:1 chat, and initiate milestone contracts.
        </p>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 font-bold text-white text-xs">
                    {proposal.freelancer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/freelancers/${proposal.freelancer.id}`}
                      className="font-bold text-base text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
                    >
                      {proposal.freelancer.name}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {proposal.freelancer.freelancerProfile?.headline ?? "Specialist"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Bid: ${(proposal.bidCents / 100).toFixed(0)}
                  </span>
                  <span>•</span>
                  <span>Est: {proposal.estimatedDays ? `${proposal.estimatedDays} days` : "Flexible"}</span>
                  <span>•</span>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {proposal.status}
                  </span>
                </div>
              </div>

              {/* Status & Actions */}
              <ClientProposalActions
                jobId={job.id}
                proposalId={proposal.id}
                freelancerId={proposal.freelancer.id}
                currentStatus={proposal.status}
              />
            </div>

            {/* Cover Letter */}
            <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Cover Letter
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700 whitespace-pre-line dark:text-zinc-300">
                {proposal.coverLetter}
              </p>
            </div>
          </div>
        ))}

        {proposals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            No proposals submitted yet for this opportunity.
          </div>
        )}
      </div>
    </div>
  );
}
