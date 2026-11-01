import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { JobService } from "@/server/services/job.service";
import { auth } from "@/server/lib/auth";
import { SaveJobButton } from "@/components/forms/save-job-button";
import { ReportJobModal } from "@/components/forms/report-job-modal";
import { JobFitBadge } from "@/components/jobs/job-fit-badge";
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

export async function generateMetadata({ params }: JobDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await JobService.getJobById(id);
    const company = job.client?.clientProfile?.companyName ?? job.client?.name ?? "WorkNest Client";
    const budget = job.budgetMaxCents
      ? `$${(job.budgetMaxCents / 100).toLocaleString()}`
      : "Custom Budget";
    return {
      title: `${job.title} | ${company}`,
      description: `${job.description.slice(0, 160)}... Budget: ${budget}`,
      openGraph: {
        title: `${job.title} - ${budget}`,
        description: job.description.slice(0, 200),
        type: "article",
        url: `/jobs/${job.id}`,
      },
    };
  } catch {
    return {
      title: "Job Opportunity · WorkNest",
      description: "View details of this freelance job opportunity on WorkNest.",
    };
  }
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
  const isSaved = session?.user?.id ? await JobService.isJobSaved(session.user.id, id) : false;

  const companyName =
    job.client?.clientProfile?.companyName ?? job.client?.name ?? "Confidential Client";
  const budgetFormatted = job.budgetMaxCents
    ? (job.budgetMaxCents / 100).toLocaleString("en-US", {
        style: "currency",
        currency: job.currency ?? "USD",
        maximumFractionDigits: 0,
      })
    : "Negotiable";

  // Schema.org JobPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    validThrough: new Date(job.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
      sameAs: job.client?.clientProfile?.website ?? undefined,
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Worldwide",
    },
    baseSalary: job.budgetMaxCents
      ? {
          "@type": "MonetaryAmount",
          currency: job.currency ?? "USD",
          value: {
            "@type": "QuantitativeValue",
            value: job.budgetMaxCents / 100,
            unitText: job.budgetType === "FIXED" ? "TOTAL" : "HOUR",
          },
        }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Building2 className="h-4 w-4 text-zinc-400" />
                  {companyName}
                </span>
                {job.client?.clientProfile?.paymentVerified && (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    Payment Verified
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  {job.experienceLevel ?? "Intermediate"}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {budgetFormatted}
                </div>
                <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  {job.budgetType} Project
                </div>
              </div>

              <div className="mt-2 flex gap-2">
                {session?.user?.id && !isClientOwner && (
                  <SaveJobButton jobId={job.id} initialSaved={isSaved} />
                )}

                {isClientOwner ? (
                  <Link
                    href={`/client/jobs/${job.id}/proposals`}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition"
                  >
                    <Users className="h-4 w-4" />
                    <span>View Proposals ({job.proposalsCount})</span>
                  </Link>
                ) : session?.user ? (
                  <Link
                    href={`/jobs/${job.id}/apply`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Proposal</span>
                  </Link>
                ) : (
                  <Link
                    href={`/login?redirect=/jobs/${job.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Sign In to Apply</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-zinc-100 py-4 dark:border-zinc-800 sm:grid-cols-4">
            <div>
              <span className="text-xs text-zinc-500">Project Type</span>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {job.budgetType} Price
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Experience Tier</span>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {job.experienceLevel ?? "Intermediate"}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Escrow Security</span>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
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
            <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800 space-y-4">
              <JobFitBadge jobSkills={job.skills.map((s) => s.skill.name)} />

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
