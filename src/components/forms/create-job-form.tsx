"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJobAction } from "@/server/actions/job.actions";
import { Loader2, DollarSign, Clock, Sparkles } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface Skill {
  id: number;
  name: string;
}

interface CreateJobFormProps {
  categories: Category[];
  skills: Skill[];
}

export function CreateJobForm({ categories, skills }: CreateJobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id?.toString() ?? "");
  const [budgetType, setBudgetType] = useState<"FIXED" | "HOURLY">("FIXED");
  const [budgetMin, setBudgetMin] = useState("500");
  const [budgetMax, setBudgetMax] = useState("1500");
  const [experienceLevel, setExperienceLevel] = useState("INTERMEDIATE");
  const [duration, setDuration] = useState("1 to 3 months");
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

  const toggleSkill = (id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("categoryId", categoryId);
    formData.append("budgetType", budgetType);
    formData.append("budgetMin", budgetMin);
    formData.append("budgetMax", budgetMax);
    formData.append("experienceLevel", experienceLevel);
    formData.append("duration", duration);
    for (const sId of selectedSkills) {
      formData.append("skillIds", sId.toString());
    }

    startTransition(async () => {
      const result = await createJobAction(null, formData);
      if (!result.success) {
        setError(result.error ?? "Failed to publish job.");
      } else {
        router.push(`/jobs/${result.jobId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Job Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Build a Responsive Next.js Marketplace with Stripe Connect"
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Experience Level Desired
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="ENTRY">Entry Level (Competitive pricing)</option>
            <option value="INTERMEDIATE">Intermediate (Solid experience)</option>
            <option value="EXPERT">Expert (Deep domain mastery)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Budget Model
        </label>
        <div className="mt-1.5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setBudgetType("FIXED")}
            className={`rounded-xl border p-3.5 text-left transition ${
              budgetType === "FIXED"
                ? "border-indigo-600 bg-indigo-50/50 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/30"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Fixed Price (Escrow)</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Pay per milestone upon approved deliverable.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setBudgetType("HOURLY")}
            className={`rounded-xl border p-3.5 text-left transition ${
              budgetType === "HOURLY"
                ? "border-indigo-600 bg-indigo-50/50 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/30"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Hourly Rate</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Track hours and pay weekly.
            </p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {budgetType === "FIXED" ? "Min Budget ($)" : "Min Rate ($/hr)"}
          </label>
          <input
            type="number"
            min="10"
            required
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            {budgetType === "FIXED" ? "Max Budget ($)" : "Max Rate ($/hr)"}
          </label>
          <input
            type="number"
            min="10"
            required
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Estimated Duration
          </label>
          <input
            type="text"
            required
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 1 to 3 months"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Job Description & Deliverables
        </label>
        <textarea
          rows={6}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed project requirements, technical specifications, deadlines, and expected milestone deliveries..."
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Required Skills & Technologies
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
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Post Opportunity Now</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
