import { notFound } from "next/navigation";
import Link from "next/link";
import { JobService } from "@/server/services/job.service";
import { auth } from "@/server/lib/auth";
import { SaveJobButton } from "@/components/forms/save-job-button";
import { ReportJobModal } from "@/components/forms/report-job-modal";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Building2,
  ArrowLeft,
  Send,
  Lock,
  Clock,
  Sparkles,
  Users,
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
  const isSaved = session?.user?.id
    ? await JobService.isJobSaved(session.user.id, id)
    : false;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all opportunities</span>
          </Link>

          <ReportJobModal jobId={job.id} />
        </div>

        {/* Job Header & Details */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="purple">{job.category?.name ?? "General"}</Badge>
                <span className="text-xs text-zinc-500">
                  Posted {new Date(job.publishedAt ?? job.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                  <Building2 className="h-4 w-4 text-zinc-400" />
                  <span>{job.client.clientProfile?.companyName ?? job.client.name}</span>
                </div>
                {job.client.clientProfile?.paymentVerified && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified Payment Client
                  </span>
                )}
              </div>
            </div>

            {/* Action CTA & Bookmark */}
            <div className="flex flex-col sm:items-end gap-3 sm:pl-6">
              <div className="text-left sm:text-right">
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {job.budgetMinCents && job.budgetMaxCents
                    ? `$${job.budgetMinCents / 100} - $${job.budgetMaxCents / 100}`
                    : job.budgetMaxCents
                    ? `$${job.budgetMaxCents / 100}`
                    : "Negotiable"}
                </div>
                <div className="text-xs text-zinc-500">
                  {job.budgetType === "HOURLY" ? "per hour (est.)" : "milestone escrow budget"}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <SaveJobButton jobId={job.id} initialSaved={isSaved} />

                {!isClientOwner ? (
                  <Link
                    href={`/jobs/${job.id}/apply`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:from-purple-500 hover:to-indigo-500"
                  >
                    <Send className="h-4 w-4" />
                    <span>Apply Now</span>
                  </Link>
                ) : (
                  <Link
                    href={`/client/jobs/${job.id}/proposals`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Review Proposals ({job.proposalsCount})</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-zinc-100 py-6 dark:border-zinc-800 sm:grid-cols-4">
            <div>
              <span className="text-xs text-zinc-500">Experience Tier</span>
              <p className="mt-1 text-sm font-semibold text-zinc-900 capitalize dark:text-zinc-100">
                {job.experienceLevel ?? "Intermediate"}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Expected Duration</span>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {job.duration ?? "1 to 3 months"}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Payment Security</span>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <Lock className="h-3.5 w-3.5" />
                <span>Escrow Funded</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Proposals Received</span>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {job.proposalsCount} submitted
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Detailed Scope of Work
            </h2>
            <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 dark:bg-zinc-950/50">
              {job.description}
            </div>
          </div>

          {/* Skills Required */}
          {job.skills.length > 0 && (
            <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Required Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <Badge key={s.skill.id} variant="secondary">
                    {s.skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
