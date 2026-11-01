"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJobAction } from "@/server/actions/job.actions";
import { decomposeScopeAction } from "@/server/actions/ai.actions";
import { AiScopeResult } from "@/server/services/ai.service";
import {
  Loader2,
  DollarSign,
  Clock,
  Sparkles,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  // Form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id?.toString() ?? "");
  const [budgetType, setBudgetType] = useState<"FIXED" | "HOURLY">("FIXED");
  const [budgetMin, setBudgetMin] = useState("500");
  const [budgetMax, setBudgetMax] = useState("1500");
  const [experienceLevel, setExperienceLevel] = useState("INTERMEDIATE");
  const [duration, setDuration] = useState("1 to 3 months");
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

  // AI Architect State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiDecomposing, setIsAiDecomposing] = useState(false);
  const [aiResult, setAiResult] = useState<AiScopeResult | null>(null);
  const [showAiBreakdown, setShowAiBreakdown] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const toggleSkill = (id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const handleAiDecompose = async () => {
    if (!aiPrompt.trim() || aiPrompt.trim().length < 5) {
      setError("Please provide a project brief of at least 5 characters for AI analysis.");
      return;
    }
    setError(null);
    setIsAiDecomposing(true);

    try {
      const response = await decomposeScopeAction(aiPrompt);
      if (!response.success || !response.result) {
        setError(response.error ?? "AI scoping failed.");
      } else {
        setAiResult(response.result);
        setShowAiBreakdown(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI Scoping service unavailable.");
    } finally {
      setIsAiDecomposing(false);
    }
  };

  const handleApplyAiScope = () => {
    if (!aiResult) return;

    setTitle(aiResult.title);
    setDescription(aiResult.description);
    setBudgetType(aiResult.budgetType);
    setBudgetMin(aiResult.suggestedBudgetMin.toString());
    setBudgetMax(aiResult.suggestedBudgetMax.toString());
    setExperienceLevel(aiResult.experienceLevel);
    setDuration(aiResult.duration);

    // Match category
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === aiResult.suggestedCategory.toLowerCase(),
    );
    if (matchedCategory) {
      setCategoryId(matchedCategory.id.toString());
    }

    // Match skills
    const matchingSkillIds = skills
      .filter((s) =>
        aiResult.suggestedSkills.some((sk) => sk.toLowerCase() === s.name.toLowerCase()),
      )
      .map((s) => s.id);

    if (matchingSkillIds.length > 0) {
      setSelectedSkills(matchingSkillIds);
    }

    setAiSuccessMessage(
      `Applied AI Scope: "${aiResult.title}" with ${aiResult.milestones.length} structured milestones!`,
    );
    setTimeout(() => setAiSuccessMessage(null), 6000);
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
    <div className="space-y-8">
      {/* AI Scope Decomposer Card */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/60 p-6 shadow-sm dark:border-indigo-500/30 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-purple-950/20">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Bot className="h-4 w-4" />
          <span>WorkNest AI Architect & Milestone Co-Pilot</span>
        </div>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Describe your idea in plain English. Our AI analyzes market rates, recommends technical
          stacks, and decomposes your project into actionable escrow milestones.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAiDecompose();
              }
            }}
            placeholder="e.g. Build a Next.js real-time analytics portal with Stripe billing and Tailwind..."
            className="flex-1 rounded-xl border border-zinc-200 bg-white/90 px-4 py-2.5 text-xs text-zinc-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            disabled={isAiDecomposing}
            onClick={handleAiDecompose}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 transition"
          >
            {isAiDecomposing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Decomposing Scope...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Decompose with AI</span>
              </>
            )}
          </button>
        </div>

        {/* AI Decomposed Result Preview */}
        {aiResult && (
          <div className="mt-5 space-y-4 rounded-xl border border-indigo-200/80 bg-white/90 p-5 dark:border-indigo-900/60 dark:bg-zinc-900/90 shadow-sm animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  AI Recommended Architecture
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {aiResult.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={handleApplyAiScope}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Apply to Form Fields</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                <span className="text-zinc-400">Estimated Budget</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${aiResult.suggestedBudgetMin.toLocaleString()} – $
                  {aiResult.suggestedBudgetMax.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                <span className="text-zinc-400">Duration</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {aiResult.duration}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                <span className="text-zinc-400">Target Level</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {aiResult.experienceLevel}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
                <span className="text-zinc-400">Milestone Phases</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {aiResult.milestones.length} Escrow Stages
                </p>
              </div>
            </div>

            {/* Collapsible Milestones Breakdown */}
            <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAiBreakdown(!showAiBreakdown)}
                className="flex w-full items-center justify-between text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <span>View {aiResult.milestones.length} Decomposed Escrow Milestones</span>
                {showAiBreakdown ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showAiBreakdown && (
                <div className="mt-3 space-y-2.5">
                  {aiResult.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {m.title}
                        </span>
                        <Badge variant="purple">
                          {m.percentage}% · {m.duration}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">{m.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.acceptanceCriteria.map((ac, acIdx) => (
                          <span
                            key={acIdx}
                            className="inline-flex items-center gap-1 rounded bg-zinc-200/60 px-2 py-0.5 text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                            {ac}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {aiSuccessMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 animate-in fade-in duration-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{aiSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Main Job Creation Form */}
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
              <p className="mt-1 text-xs text-zinc-500">Track hours and pay weekly.</p>
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
            rows={7}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed project requirements, technical specifications, deadlines, and expected milestone deliveries..."
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 font-sans leading-relaxed"
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
    </div>
  );
}
