import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfileService } from "@/server/services/profile.service";
import {
  Star,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  ArrowLeft,
} from "lucide-react";

interface PublicFreelancerPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicFreelancerPage({ params }: PublicFreelancerPageProps) {
  const { id } = await params;

  let profile;
  try {
    profile = await ProfileService.getFreelancerProfile(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to marketplace</span>
        </Link>

        {/* Hero Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-md shadow-indigo-500/20">
                {profile.user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {profile.user.name}
                  </h1>
                  <span title="Verified Freelancer">
                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {profile.headline ?? "Independent Specialist"}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {profile.jobSuccessScore ? `${profile.jobSuccessScore}% JSS` : "100% JSS"}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{profile.user.country ?? "Remote"}</span>
                  <span>•</span>
                  <span>{profile.experienceLevel ?? "EXPERT"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between gap-4">
              <div className="text-right">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  ${profile.hourlyRateCents ? (profile.hourlyRateCents / 100).toFixed(0) : "85"}
                </span>
                <span className="text-xs text-zinc-500"> / hour</span>
              </div>
              <Link
                href={`/login?redirect=/freelancers/${id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
              >
                <Briefcase className="h-4 w-4" />
                <span>Contact & Hire</span>
              </Link>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                About & Expertise
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Core Competencies
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span
                    key={s.skill.id}
                    className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    {s.skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Portfolio Section */}
        {profile.portfolioItems.length > 0 && (
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Featured Portfolio
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
                >
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2 dark:text-zinc-400">
                      {item.description}
                    </p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <span>View Project</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
