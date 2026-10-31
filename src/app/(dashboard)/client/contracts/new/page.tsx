import { auth } from "@/server/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { CreateContractForm } from "@/components/forms/create-contract-form";
import { Briefcase, ArrowLeft } from "lucide-react";

interface NewContractPageProps {
  searchParams: Promise<{ proposalId?: string }>;
}

export default async function NewContractPage({ searchParams }: NewContractPageProps) {
  const { proposalId } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!proposalId) {
    redirect("/client/jobs");
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      job: { select: { id: true, title: true, clientId: true } },
      freelancer: { select: { id: true, name: true } },
    },
  });

  if (!proposal || proposal.job.clientId !== session.user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href={`/client/jobs/${proposal.job.id}/proposals`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to proposals</span>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Briefcase className="h-4 w-4" />
          <span>Hire Candidate & Milestone Setup</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Create Milestone Contract for {proposal.freelancer.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Project: {proposal.job.title} • Accepted Bid: ${(proposal.bidCents / 100).toFixed(0)}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <CreateContractForm
          proposalId={proposal.id}
          bidDollars={proposal.bidCents / 100}
        />
      </div>
    </div>
  );
}
