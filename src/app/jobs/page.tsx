import Link from "next/link";
import { JobService } from "@/server/services/job.service";
import { ProfileService } from "@/server/services/profile.service";
import {
  Search,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  Filter,
} from "lucide-react";

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    level?: string;
    cursor?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;
  const budgetType = params.type === "HOURLY" || params.type === "FIXED" ? params.type : undefined;

  const [{ items, nextCursor }, taxonomy] = await Promise.all([
    JobService.listJobs({
      query: params.q,
      categoryId,
      budgetType,
      experienceLevel: params.level,
      cursor: params.cursor,
      limit: 12,
    }),
    ProfileService.getTaxonomy(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Briefcase className="h-4 w-4" />
              <span>Verified Marketplace</span>
            </div>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Find Freelance Opportunities
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Browse funded milestone contracts and submit proposals directly to verified clients.
            </p>
          </div>

          <Link
            href="/client/jobs/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
          >
            <span>Post a Job</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form method="GET" className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search job title, skills, or requirements..."
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <select
                name="category"
                defaultValue={params.category ?? ""}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 px-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">All Categories</option>
                {taxonomy.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <select
                name="type"
                defaultValue={params.type ?? ""}
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 px-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">All Budgets</option>
                <option value="FIXED">Fixed Price</option>
                <option value="HOURLY">Hourly Rate</option>
              </select>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* Jobs Feed Grid */}
        <div className="space-y-4">
          {items.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group block rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition hover:border-indigo-500/60 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-400/60"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-zinc-900 transition group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {job.title}
                    </h2>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                      {job.category?.name ?? "General"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {job.budgetType === "HOURLY" ? "Hourly Contract" : "Fixed Price"}
                    </span>
                    <span>•</span>
                    <span>Est. Time: {job.duration ?? "Ongoing"}</span>
                    <span>•</span>
                    <span className="capitalize">{job.experienceLevel ?? "Intermediate"}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{job.client.clientProfile?.companyName ?? job.client.name}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-zinc-600 line-clamp-2 dark:text-zinc-400">
                    {job.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <span
                        key={s.skill.id}
                        className="rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right sm:pl-6">
                  <div className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    {job.budgetMinCents && job.budgetMaxCents
                      ? `$${job.budgetMinCents / 100} - $${job.budgetMaxCents / 100}`
                      : job.budgetMaxCents
                      ? `$${job.budgetMaxCents / 100}`
                      : "Competitive"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {job.budgetType === "HOURLY" ? "per hour" : "milestone budget"}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <Briefcase className="mx-auto h-10 w-10 text-zinc-400" />
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                No matching opportunities found
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Try clearing your search filters or check back shortly for new client postings.
              </p>
            </div>
          )}
        </div>

        {/* Cursor Pagination */}
        {nextCursor && (
          <div className="flex justify-center pt-4">
            <Link
              href={`/jobs?cursor=${nextCursor}&q=${encodeURIComponent(params.q ?? "")}`}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <span>Load More Opportunities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
