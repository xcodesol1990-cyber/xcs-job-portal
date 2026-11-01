"use client";

import { useState, useTransition } from "react";
import { updateClientProfileAction } from "@/server/actions/profile.actions";
import { Loader2, Check, Globe, Building2, User, Layers, Users } from "lucide-react";

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface ClientProfileFormProps {
  profile: {
    user: { name: string; email: string };
    companyName: string | null;
    website: string | null;
    companySize?: string | null;
    industry?: string | null;
    about?: string | null;
    linkedinUrl?: string | null;
  };
}

const INDUSTRY_OPTIONS = [
  "Fintech & Payments",
  "SaaS & Developer Tools",
  "AI & Machine Learning",
  "Healthcare & Life Sciences",
  "E-Commerce & Marketplaces",
  "Web3 & Blockchain",
  "Media & Entertainment",
  "Education & EdTech",
  "Security & Cloud Infrastructure",
  "Professional Services & Consulting",
];

const COMPANY_SIZE_OPTIONS = [
  "1-10 Employees (Startup / Seed)",
  "11-50 Employees (Series A-B)",
  "51-200 Employees (Growth / Mid-Market)",
  "201-1000 Employees (Large Enterprise)",
  "1000+ Employees (Global Enterprise)",
];

export function ClientProfileForm({ profile }: ClientProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(profile.user.name ?? "");
  const [companyName, setCompanyName] = useState(profile.companyName ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [companySize, setCompanySize] = useState(
    profile.companySize ?? "11-50 Employees (Series A-B)",
  );
  const [industry, setIndustry] = useState(profile.industry ?? "Fintech & Payments");
  const [about, setAbout] = useState(profile.about ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("companyName", companyName);
    formData.append("website", website);
    formData.append("companySize", companySize);
    formData.append("industry", industry);
    formData.append("about", about);
    formData.append("linkedinUrl", linkedinUrl);

    startTransition(async () => {
      const res = await updateClientProfileAction(null, formData);
      if (!res.success) {
        setError(res.error ?? "Failed to save company profile.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 animate-in fade-in duration-200">
          <Check className="h-4 w-4" />
          <span>Organization profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      {/* Row 1: Primary Contact & Company Name */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Primary Contact Name *
          </label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Company / Organization Legal Name *
          </label>
          <div className="relative mt-1.5">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Technologies Inc."
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Website & LinkedIn */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Company Website
          </label>
          <div className="relative mt-1.5">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://acme.com"
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Company LinkedIn Profile
          </label>
          <div className="relative mt-1.5">
            <LinkedinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/acme"
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Industry & Company Size */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Primary Industry Sector
          </label>
          <div className="relative mt-1.5">
            <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {INDUSTRY_OPTIONS.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Organization Headcount / Stage
          </label>
          <div className="relative mt-1.5">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {COMPANY_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 4: About Company Overview */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          About Organization & Technical Mission
        </label>
        <textarea
          rows={4}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Describe your organization, products, tech stack culture, and what kind of elite talent you collaborate with..."
          className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-sans leading-relaxed"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 transition"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Save Company Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
