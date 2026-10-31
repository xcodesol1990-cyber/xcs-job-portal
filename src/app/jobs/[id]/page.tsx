import { notFound } from "next/navigation";
import Link from "next/link";
import { JobService } from "@/server/services/job.service";
import { auth } from "@/server/lib/auth";
import {
  ShieldCheck,
  Building2,
  ArrowLeft,
  Send,
} from "lucide-react";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  const session = await auth();

  let job;
  try {
    job = await JobService.getJobById(id);
  } catch {
    notFound();
  }

  const isClientOwner = session?.user?.id === job.clientId;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all jobs</span>
        </Link>

        {/* Job Header & Details */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                  {job.category?.name ?? "General"}
                </span>
                <span className="text-xs text-zinc-500">
                  Posted {new Date(job.publishedAt ?? job.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                {job.title}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                <Building2 className="h-4 w-4 text-zinc-400" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {job.client.clientProfile?.companyName ?? job.client.name}
                </span>
                {job.client.clientProfile?.paymentVerified && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Client
                  </span>
                )}
              </div>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col items-end gap-3 sm:pl-6">
              <div className="text-right">
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {job.budgetMinCents && job.budgetMaxCents
                    ? `$${job.budgetMinCents / 100} - $${job.budgetMaxCents / 100}`
                    : job.budgetMaxCents
                    ? `$${job.budgetMaxCents / 100}`
                    : "Negotiable"}
                </div>
                <div className="text-xs text-zinc-500">
                  {job.budgetType === "HOURLY" ? "per hour" : "escrow budget"}
                </div>
              </div>

              {!isClientOwner ? (
                <Link
                  href={`/jobs/${job.id}/apply`}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit a Proposal</span>
                </Link>
              ) : (
                <div className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  Your Job Posting
                </div>
              )}
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-zinc-100 py-6 dark:border-zinc-800 sm:grid-cols-4">
            <div>
              <span className="text-xs text-zinc-500">Experience Level</span>
              <p className="mt-1 text-sm font-semibold text-zinc-900 capitalize dark:text-zinc-100">
                {job.experienceLevel ?? "Intermediate"}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Duration</span>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {job.duration ?? "1 to 3 months"}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Payment Escrow</span>
              <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                100% Protected
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Proposals Count</span>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {job.proposalsCount} submitted
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Detailed Scope of Work
            </h2>
            <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {job.description}
            </div>
          </div>

          {/* Skills Required */}
          {job.skills.length > 0 && (
            <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Required Skills
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span
                    key={s.skill.id}
                    className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    {s.skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
