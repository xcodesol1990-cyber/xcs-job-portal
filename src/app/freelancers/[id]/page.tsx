import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfileService } from "@/server/services/profile.service";
import {
  Star,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  ArrowLeft,
  Globe,
  Tag,
  Clock,
  Languages,
} from "lucide-react";

function GithubIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

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

  const tags = profile.tags ?? [];

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
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>
                      {profile.jobSuccessScore ? `${profile.jobSuccessScore}% JSS` : "100% JSS"}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{profile.user.country ?? "Remote / Global"}</span>
                  <span>•</span>
                  <span>{profile.experienceLevel ?? "EXPERT"}</span>
                  {profile.yearsOfExperience && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        {profile.yearsOfExperience} yrs exp
                      </span>
                    </>
                  )}
                  {profile.englishProficiency && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Languages className="h-3 w-3 text-zinc-400" />
                        {profile.englishProficiency}
                      </span>
                    </>
                  )}
                </div>

                {/* Social & Verification Badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>GitHub</span>
                      <ExternalLink className="h-2.5 w-2.5 text-zinc-400" />
                    </a>
                  )}

                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                    >
                      <LinkedinIcon className="h-3.5 w-3.5 text-blue-600" />
                      <span>LinkedIn</span>
                      <ExternalLink className="h-2.5 w-2.5 text-zinc-400" />
                    </a>
                  )}

                  {profile.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                    >
                      <Globe className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Portfolio</span>
                      <ExternalLink className="h-2.5 w-2.5 text-zinc-400" />
                    </a>
                  )}
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
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-purple-500"
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

          {/* Custom Discovery Tags */}
          {tags.length > 0 && (
            <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <Tag className="h-3.5 w-3.5 text-emerald-500" />
                <span>Specialization Tags</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Core Technologies & Skills
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span
                    key={s.skill.id}
                    className="rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
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
