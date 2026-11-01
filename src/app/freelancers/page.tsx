import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/server/lib/auth";
import { ProfileService } from "@/server/services/profile.service";
import { PublicHeader } from "@/components/layout/public-header";
import {
  Search,
  ShieldCheck,
  Briefcase,
  MapPin,
  ArrowRight,
  Filter,
  Sparkles,
  RotateCcw,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hire Top Freelancers & Engineers · WorkWasl",
  description:
    "Discover, compare, and hire verified freelance developers, designers, and specialists with protected milestone escrow on WorkWasl.",
};

interface FreelancersPageProps {
  searchParams: Promise<{
    q?: string;
    skill?: string;
    level?: string;
    rate?: string;
    cursor?: string;
  }>;
}

export default async function FreelancersPage({ searchParams }: FreelancersPageProps) {
  const params = await searchParams;
  const skillId = params.skill ? Number(params.skill) : undefined;
  const maxRate = params.rate ? Number(params.rate) : undefined;

  const [[{ items, nextCursor }, taxonomy], session] = await Promise.all([
    Promise.all([
      ProfileService.listFreelancers({
        query: params.q,
        skillId,
        experienceLevel: params.level,
        maxRateDollars: maxRate,
        cursor: params.cursor,
        limit: 12,
      }),
      ProfileService.getTaxonomy(),
    ]),
    auth(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <PublicHeader user={session?.user ?? null} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Verified Talent Directory
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Discover World-Class Specialists
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Connect directly with vetted engineers, architects, and product experts. Contracts
              feature flat $1 platform fees and protected milestone vaults.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/client/jobs/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition"
            >
              <Briefcase className="h-4 w-4" />
              <span>Post a Job for Free</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <form method="GET" action="/freelancers" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Keyword Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Search by specialty, skill tag, or name (e.g. React, Solidity, Rust)..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                />
              </div>

              {/* Skills Dropdown */}
              <div className="sm:w-48">
                <select
                  name="skill"
                  defaultValue={params.skill ?? ""}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                >
                  <option value="">All Core Skills</option>
                  {taxonomy.skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div className="sm:w-40">
                <select
                  name="level"
                  defaultValue={params.level ?? ""}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                >
                  <option value="">Any Seniority</option>
                  <option value="EXPERT">Senior / Staff</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ENTRY">Entry Level</option>
                </select>
              </div>

              {/* Max Hourly Rate */}
              <div className="sm:w-36">
                <select
                  name="rate"
                  defaultValue={params.rate ?? ""}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100"
                >
                  <option value="">Any Hourly Rate</option>
                  <option value="50">Up to $50/hr</option>
                  <option value="100">Up to $100/hr</option>
                  <option value="150">Up to $150/hr</option>
                  <option value="200">Up to $200/hr</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </button>

                {(params.q || params.skill || params.level || params.rate) && (
                  <Link
                    href="/freelancers"
                    className="inline-flex items-center justify-center p-2 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:text-zinc-100 transition"
                    title="Reset Filters"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Freelancer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((freelancer) => {
            const hourlyRate = freelancer.hourlyRateCents
              ? Math.round(freelancer.hourlyRateCents / 100)
              : null;
            const initials =
              freelancer.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() ?? "FL";

            return (
              <div
                key={freelancer.userId}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-4">
                  {/* Header: Avatar, Name, Country, Verified Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-sm text-white shadow-sm">
                        {initials}
                      </div>
                      <div>
                        <Link
                          href={`/freelancers/${freelancer.userId}`}
                          className="font-bold text-sm sm:text-base text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400 transition"
                        >
                          {freelancer.user.name}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                          {freelancer.user.country && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {freelancer.user.country}
                            </span>
                          )}
                          <span>•</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {freelancer.availability ?? "Available"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0">
                      <ShieldCheck className="h-3 w-3" />
                      Vetted
                    </span>
                  </div>

                  {/* Headline */}
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 line-clamp-1">
                      {freelancer.headline || "Fullstack Software Engineer"}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {freelancer.bio ||
                        "Experienced contractor specializing in scalable web architectures, secure APIs, and responsive design systems."}
                    </p>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {freelancer.skills.slice(0, 4).map((s) => (
                      <span
                        key={s.skill.id}
                        className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                    {freelancer.tags?.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Rate + Portfolio & CTA */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    {hourlyRate ? (
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        <span className="text-base font-black">${hourlyRate}</span>
                        <span className="text-zinc-400 font-normal">/hr</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-zinc-500">Custom Milestone</span>
                    )}
                    <span className="text-[10px] text-zinc-400 block">
                      {freelancer._count.portfolioItems} portfolio cases
                    </span>
                  </div>

                  <Link
                    href={`/freelancers/${freelancer.userId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
              No matching specialists found
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
              We couldn&apos;t find any freelancers matching your query. Try broadening your keyword
              search or clearing the rate and seniority filters.
            </p>
            <div className="mt-6">
              <Link
                href="/freelancers"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </Link>
            </div>
          </div>
        )}

        {/* Pagination Cursor */}
        {nextCursor && (
          <div className="flex justify-center pt-4">
            <Link
              href={`/freelancers?cursor=${nextCursor}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}${params.skill ? `&skill=${params.skill}` : ""}${params.level ? `&level=${params.level}` : ""}${params.rate ? `&rate=${params.rate}` : ""}`}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition"
            >
              <span>Load Next Specialists</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
