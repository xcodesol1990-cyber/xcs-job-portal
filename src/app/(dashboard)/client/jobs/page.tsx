import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { JobService } from "@/server/services/job.service";
import { Briefcase, Plus, Eye } from "lucide-react";

export default async function ClientJobsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const jobs = await JobService.getClientJobs(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Briefcase className="h-4 w-4" />
            <span>Job Postings Manager</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Your Active & Past Jobs
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Review incoming candidate proposals, track ongoing milestones, and manage postings.
          </p>
        </div>

        <Link
          href="/client/jobs/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-bold text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400 transition"
                  >
                    {job.title}
                  </Link>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {job.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                  <span>{job.category?.name ?? "General"}</span>
                  <span>•</span>
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{job._count.proposals} proposals received</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <Eye className="h-3.5 w-3.5 text-zinc-500" />
                  <span>View Post</span>
                </Link>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="p-12 text-center text-xs text-zinc-500">
              You haven&apos;t posted any opportunities yet. Click &quot;Post New Job&quot; above to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
