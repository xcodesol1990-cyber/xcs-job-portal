"use client";

import { useState, useTransition } from "react";
import { updateFreelancerProfileAction } from "@/server/actions/profile.actions";
import { Loader2, Check, DollarSign } from "lucide-react";

interface Skill {
  id: number;
  name: string;
  slug: string;
}

interface ProfileFormProps {
  profile: {
    user: { name: string };
    headline: string | null;
    bio: string | null;
    hourlyRateCents: number | null;
    currency: string;
    availability: string | null;
    experienceLevel: string | null;
    skills: Array<{ skill: Skill }>;
  };
  skills: Skill[];
}

export function FreelancerProfileForm({ profile, skills }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(profile.user.name ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [hourlyRate, setHourlyRate] = useState(
    profile.hourlyRateCents ? (profile.hourlyRateCents / 100).toString() : "85",
  );
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel ?? "EXPERT");
  const [availability, setAvailability] = useState(profile.availability ?? "AVAILABLE");
  const [selectedSkills, setSelectedSkills] = useState<number[]>(
    profile.skills.map((s) => s.skill.id),
  );

  const toggleSkill = (id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("headline", headline);
    formData.append("bio", bio);
    formData.append("hourlyRate", hourlyRate);
    formData.append("experienceLevel", experienceLevel);
    formData.append("availability", availability);
    for (const id of selectedSkills) {
      formData.append("skillIds", id.toString());
    }

    startTransition(async () => {
      const res = await updateFreelancerProfileAction(null, formData);
      if (!res.success) {
        setError(res.error ?? "Failed to save profile.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          <Check className="h-4 w-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Hourly Rate (USD)
          </label>
          <div className="relative mt-1.5">
            <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="number"
              min="5"
              max="1000"
              required
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Professional Headline
        </label>
        <input
          type="text"
          required
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Senior Full-Stack Engineer | Next.js, Node.js & Cloud"
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Biography & Background
        </label>
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Describe your expertise, past projects, and technical strengths..."
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Experience Level
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="ENTRY">Entry Level (1-2 years)</option>
            <option value="INTERMEDIATE">Intermediate (3-5 years)</option>
            <option value="EXPERT">Expert / Principal (6+ years)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Work Availability
          </label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="AVAILABLE">Available for Full-time & Part-time</option>
            <option value="PART_TIME">Part-time Only (&lt; 20 hrs/week)</option>
            <option value="NOT_AVAILABLE">Not Looking Currently</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Skills & Technologies (Click to toggle)
        </label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {skills.map((skill) => {
            const isSelected = selectedSkills.includes(skill.id);
            return (
              <button
                type="button"
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

