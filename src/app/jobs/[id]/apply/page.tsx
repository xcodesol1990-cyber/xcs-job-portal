import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/lib/auth";
import { JobService } from "@/server/services/job.service";
import { ApplyJobForm } from "@/components/forms/apply-job-form";
import { Send, ArrowLeft } from "lucide-react";

interface ApplyPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/jobs/${id}/apply`);
  }

  let job;
  try {
    job = await JobService.getJobById(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to job details</span>
        </Link>

        {/* Job Summary Banner */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Send className="h-4 w-4" />
            <span>Submit a Proposal</span>
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {job.title}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
            <span>Client: {job.client.clientProfile?.companyName ?? job.client.name}</span>
            <span>•</span>
            <span>
              Budget:{" "}
              {job.budgetMinCents && job.budgetMaxCents
                ? `$${job.budgetMinCents / 100} - $${job.budgetMaxCents / 100}`
                : `$${(job.budgetMaxCents ?? 0) / 100}`}
            </span>
          </div>
        </div>

        {/* Proposal Form Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <ApplyJobForm jobId={job.id} budgetType={job.budgetType} />
        </div>
      </div>
    </div>
  );
}
