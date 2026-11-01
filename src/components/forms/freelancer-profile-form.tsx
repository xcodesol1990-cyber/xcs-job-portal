"use client";

import { useState, useTransition } from "react";
import { updateFreelancerProfileAction } from "@/server/actions/profile.actions";
import {
  Loader2,
  Check,
  DollarSign,
  Tag,
  X,
  Plus,
  Globe,
  Sparkles,
  Award,
  Search,
} from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

interface Skill {
  id: number;
  name: string;
  slug: string;
}

interface ProfileFormProps {
  profile: {
    user: { name: string; country?: string | null; timezone?: string | null };
    headline: string | null;
    bio: string | null;
    hourlyRateCents: number | null;
    currency: string;
    availability: string | null;
    experienceLevel: string | null;
    tags?: string[];
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    websiteUrl?: string | null;
    yearsOfExperience?: number | null;
    englishProficiency?: string | null;
    skills: Array<{ skill: Skill }>;
  };
  skills: Skill[];
}

const RECOMMENDED_TAGS = [
  "microservices",
  "fintech",
  "stripe-connect",
  "nextjs15",
  "design-systems",
  "high-throughput",
  "tailwind-v4",
  "realtime-websockets",
  "ai-agents",
  "soc2-compliance",
  "zero-downtime",
  "graphql-federation",
];

export function FreelancerProfileForm({ profile, skills }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core Fields
  const [name, setName] = useState(profile.user.name ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [hourlyRate, setHourlyRate] = useState(
    profile.hourlyRateCents ? (profile.hourlyRateCents / 100).toString() : "85",
  );
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel ?? "EXPERT");
  const [availability, setAvailability] = useState(profile.availability ?? "AVAILABLE");
  const [yearsOfExperience, setYearsOfExperience] = useState<string>(
    profile.yearsOfExperience?.toString() ?? "6",
  );
  const [englishProficiency, setEnglishProficiency] = useState(
    profile.englishProficiency ?? "FLUENT",
  );

  // Social & Credibility Links
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl ?? "");

  // Custom Tags Manager
  const [tags, setTags] = useState<string[]>(profile.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  // Skills Manager
  const [selectedSkills, setSelectedSkills] = useState<number[]>(
    profile.skills.map((s) => s.skill.id),
  );
  const [skillFilter, setSkillFilter] = useState("");

  const handleAddTag = (tagToAdd?: string) => {
    const val = (tagToAdd || tagInput)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "");
    if (!val) return;
    if (!tags.includes(val)) {
      setTags((prev) => [...prev, val]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const toggleSkill = (id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const handleClearSkills = () => {
    setSelectedSkills([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmedName = name.trim();
    const trimmedHeadline = headline.trim();
    const trimmedBio = bio.trim();

    if (trimmedName.length < 2) {
      setError("Full legal name must be at least 2 characters.");
      return;
    }
    if (trimmedName.length > 60) {
      setError("Full legal name cannot exceed 60 characters.");
      return;
    }

    if (trimmedHeadline.length < 5) {
      setError("Professional headline must be at least 5 characters.");
      return;
    }
    if (trimmedHeadline.length > 120) {
      setError("Professional headline cannot exceed 120 characters.");
      return;
    }

    if (trimmedBio.length < 30) {
      setError(`Biography must be at least 30 characters (currently ${trimmedBio.length}).`);
      return;
    }
    if (trimmedBio.length > 5000) {
      setError(`Biography cannot exceed 5,000 characters (currently ${trimmedBio.length}).`);
      return;
    }

    const rateNum = Number(hourlyRate);
    if (isNaN(rateNum) || rateNum < 5 || rateNum > 1000) {
      setError("Hourly rate must be between $5 and $1,000 USD.");
      return;
    }

    if (selectedSkills.length === 0) {
      setError("Please select at least 1 technology skill.");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("headline", trimmedHeadline);
    formData.append("bio", trimmedBio);
    formData.append("hourlyRate", hourlyRate);
    formData.append("experienceLevel", experienceLevel);
    formData.append("availability", availability);
    formData.append("yearsOfExperience", yearsOfExperience);
    formData.append("englishProficiency", englishProficiency);
    formData.append("githubUrl", githubUrl.trim());
    formData.append("linkedinUrl", linkedinUrl.trim());
    formData.append("websiteUrl", websiteUrl.trim());

    // Append custom tags
    for (const t of tags) {
      formData.append("tags", t);
    }

    // Append skills
    for (const id of selectedSkills) {
      formData.append("skillIds", id.toString());
    }

    startTransition(async () => {
      const res = await updateFreelancerProfileAction(null, formData);
      if (!res.success) {
        setError(res.error ?? "Failed to save profile.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      }
    });
  };

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(skillFilter.toLowerCase()),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 animate-in fade-in duration-200">
          <Check className="h-4 w-4" />
          <span>Profile changes saved successfully! Live marketplace records updated.</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      {/* SECTION 1: CORE IDENTITY & RATE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Core Identity & Compensation</span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                Full Legal Name *
              </label>
              <span className="text-[11px] font-mono text-zinc-400">{name.length} / 60</span>
            </div>
            <input
              type="text"
              required
              minLength={2}
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Hourly Billing Rate (USD) *
            </label>
            <div className="relative mt-1.5">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="10"
                max="1000"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs font-semibold text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="ENTRY">Entry Level (1-2 years)</option>
              <option value="INTERMEDIATE">Intermediate (3-5 years)</option>
              <option value="EXPERT">Expert / Lead (6-9 years)</option>
              <option value="PRINCIPAL">Principal / Staff (10+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Years in Tech
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              English Proficiency
            </label>
            <select
              value={englishProficiency}
              onChange={(e) => setEnglishProficiency(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="NATIVE">Native or Bilingual</option>
              <option value="FLUENT">Full Professional / Fluent</option>
              <option value="CONVERSATIONAL">Conversational Working</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
            Current Work Availability
          </label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="AVAILABLE">Available for Full-time & Part-time Contracts</option>
            <option value="PART_TIME">Part-time Only (&lt; 20 hrs/week)</option>
            <option value="ADVISORY">Advisory / Architectural Consulting Only</option>
            <option value="NOT_AVAILABLE">Not Looking for New Contracts Currently</option>
          </select>
        </div>
      </div>

      {/* SECTION 2: HEADLINE & BIO */}
      <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Award className="h-3.5 w-3.5 text-purple-500" />
          <span>Professional Pitch & Background</span>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Professional Headline *
            </label>
            <span
              className={`text-[11px] font-mono ${
                headline.trim().length >= 5 && headline.trim().length <= 120
                  ? "text-zinc-400"
                  : headline.trim().length > 120
                    ? "text-red-500 font-bold"
                    : "text-amber-500"
              }`}
            >
              {headline.length} / 120 chars {headline.trim().length < 5 && "(min 5)"}
            </span>
          </div>
          <input
            type="text"
            required
            minLength={5}
            maxLength={120}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Senior Full-Stack Engineer | Next.js 15, TypeScript & Distributed Escrow Systems"
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Biography & Technical Expertise *
            </label>
            <span
              className={`text-[11px] font-mono ${
                bio.trim().length >= 30 && bio.trim().length <= 5000
                  ? "text-zinc-400"
                  : bio.trim().length > 5000
                    ? "text-red-500 font-bold"
                    : "text-amber-500"
              }`}
            >
              {bio.length.toLocaleString()} / 5,000 chars {bio.trim().length < 30 && "(min 30)"}
            </span>
          </div>
          <textarea
            rows={8}
            required
            minLength={30}
            maxLength={5000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your architecture experience, past production deliverables, technical strengths, and preferred engagement models. Plaintext format with line breaks, markdown, bullet lists, emojis, and URLs are fully supported..."
            className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-sans leading-relaxed whitespace-pre-wrap"
          />
          <p className="mt-1 text-[11px] text-zinc-400">
            Plaintext format supported: multi-line paragraphs, numbered lists, markdown, links, and
            emojis are preserved.
          </p>
        </div>
      </div>

      {/* SECTION 3: SPECIALIZATION TAGS (CUSTOM KEYWORDS) */}
      <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Tag className="h-3.5 w-3.5 text-emerald-500" />
            <span>Specialization & Discovery Tags</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {tags.length} Active Tags
          </span>
        </div>

        <p className="text-xs text-zinc-500">
          Add custom specialization keywords (e.g. niche frameworks, compliance standards, domain
          concepts) to help clients find your profile in marketplace searches.
        </p>

        {/* Tag Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Type tag (e.g. stripe-connect, nextjs15, microservices) and press Enter..."
              className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddTag()}
            disabled={!tagInput.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Tag</span>
          </button>
        </div>

        {/* Selected Tags Chips */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/70 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in duration-150"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full p-0.5 hover:bg-emerald-200/50 dark:hover:bg-emerald-900/50 transition"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Recommended Tag Suggestions */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Suggested Tags (Click to add):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {RECOMMENDED_TAGS.filter((rt) => !tags.includes(rt)).map((rt) => (
              <button
                type="button"
                key={rt}
                onClick={() => handleAddTag(rt)}
                className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-500 dark:hover:text-indigo-300 transition"
              >
                <Plus className="h-2.5 w-2.5" />
                <span>{rt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: SOCIAL PROOF & PROFESSIONAL REPOSITORIES */}
      <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Globe className="h-3.5 w-3.5 text-blue-500" />
          <span>Verified Links & Portfolios</span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              GitHub Profile
            </label>
            <div className="relative mt-1.5">
              <GithubIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              LinkedIn Profile
            </label>
            <div className="relative mt-1.5">
              <LinkedinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Personal Portfolio / Website
            </label>
            <div className="relative mt-1.5">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourname.dev"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: SKILLS TAXONOMY PICKER */}
      <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Award className="h-3.5 w-3.5 text-indigo-500" />
            <span>Marketplace Skills ({skills.length} Available)</span>
          </div>
          {selectedSkills.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {selectedSkills.length} Selected
              </span>
              <button
                type="button"
                onClick={handleClearSkills}
                className="text-xs text-zinc-400 hover:text-red-500 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Skill Search Filter */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="Search skills by name (e.g. Next.js, PostgreSQL, Docker, Figma)..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        {/* Skills Tag Cloud */}
        <div className="max-h-60 overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
          <div className="flex flex-wrap gap-2">
            {filteredSkills.length === 0 ? (
              <span className="text-xs text-zinc-400">No matching skills found.</span>
            ) : (
              filteredSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.id);
                return (
                  <button
                    type="button"
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs dark:bg-indigo-500"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 transition"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Save & Publish Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
