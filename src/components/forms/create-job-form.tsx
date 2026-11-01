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
  FolderTree,
  Layers,
  ShieldCheck,
  Search,
  ListChecks,
  HelpCircle,
  Briefcase,
  Plus,
  Trash2,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug?: string;
  parentId?: number | null;
  parent?: { id: number; name: string; slug: string } | null;
  children?: Array<{ id: number; name: string; slug: string }>;
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

  // Parent Categories & Child Categories separation
  const parentCategories = categories.filter((c) => !c.parentId);
  const initialParent = parentCategories[0]?.id?.toString() ?? "";
  const initialChildren = categories.filter((c) => c.parentId?.toString() === initialParent);

  // Form inputs
  const [title, setTitle] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string>(initialParent);
  const [categoryId, setCategoryId] = useState<string>(
    initialChildren[0]?.id?.toString() ?? categories[0]?.id?.toString() ?? "",
  );
  const [scope, setScope] = useState<"LARGE" | "MEDIUM" | "SMALL">("MEDIUM");
  const [timeCommitment, setTimeCommitment] = useState("Milestone-driven / Flexible");
  const [duration, setDuration] = useState("1 to 3 months");
  const [experienceLevel, setExperienceLevel] = useState("INTERMEDIATE");
  const [budgetType, setBudgetType] = useState<"FIXED" | "HOURLY">("FIXED");
  const [budgetMin, setBudgetMin] = useState("500");
  const [budgetMax, setBudgetMax] = useState("2500");
  const [description, setDescription] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>([]);
  const [newQuestionInput, setNewQuestionInput] = useState("");

  const handleAddQuestion = (textToAdd?: string) => {
    const text = (textToAdd || newQuestionInput).trim();
    if (!text) return;
    if (!screeningQuestions.includes(text)) {
      setScreeningQuestions((prev) => [...prev, text]);
    }
    setNewQuestionInput("");
  };

  const handleRemoveQuestion = (index: number) => {
    setScreeningQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Skills Filter & Selection
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [skillSearch, setSkillSearch] = useState("");

  // AI Architect State (Hidden by default per user request)
  const SHOW_AI_CO_PILOT = false;
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiDecomposing, setIsAiDecomposing] = useState(false);
  const [aiResult, setAiResult] = useState<AiScopeResult | null>(null);

  // Handle Parent Category Change
  const handleParentCategoryChange = (newParentId: string) => {
    setParentCategoryId(newParentId);
    const subcats = categories.filter((c) => c.parentId?.toString() === newParentId);
    if (subcats.length > 0) {
      setCategoryId(subcats[0].id.toString());
    } else {
      setCategoryId(newParentId);
    }
  };

  const currentSubcategories = categories.filter(
    (c) => c.parentId?.toString() === parentCategoryId,
  );

  const toggleSkill = (id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  const handleAiDecompose = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiDecomposing(true);

    try {
      const res = await decomposeScopeAction(aiPrompt);
      if (res.success && res.result) {
        setAiResult(res.result);
      } else {
        setError(res.error ?? "Failed to decompose scope.");
      }
    } catch {
      setError("An unexpected error occurred while consulting AI co-pilot.");
    } finally {
      setIsAiDecomposing(false);
    }
  };

  const handleApplyAiScope = () => {
    if (!aiResult) return;
    setTitle(aiResult.title);
    setDescription(aiResult.description);
    setBudgetMin(aiResult.suggestedBudgetMin.toString());
    setBudgetMax(aiResult.suggestedBudgetMax.toString());
    setDuration(aiResult.duration);

    if (aiResult.milestones && aiResult.milestones.length > 0) {
      const formattedDeliverables = aiResult.milestones
        .map(
          (m, idx) =>
            `Milestone ${idx + 1}: ${m.title} (${m.percentage}% - ${m.duration})\nDeliverables: ${m.description}\nAcceptance Criteria: ${m.acceptanceCriteria.join("; ")}`,
        )
        .join("\n\n");
      setDeliverables(formattedDeliverables);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (trimmedTitle.length < 10) {
      setError(`Job title must be at least 10 characters (currently ${trimmedTitle.length}).`);
      return;
    }
    if (trimmedTitle.length > 120) {
      setError(`Job title cannot exceed 120 characters (currently ${trimmedTitle.length}).`);
      return;
    }

    if (trimmedDesc.length < 30) {
      setError(`Job description must be at least 30 characters (currently ${trimmedDesc.length}).`);
      return;
    }
    if (trimmedDesc.length > 10000) {
      setError(
        `Job description cannot exceed 10,000 characters (currently ${trimmedDesc.length}).`,
      );
      return;
    }

    if (deliverables.trim().length > 5000) {
      setError("Milestone deliverables cannot exceed 5,000 characters.");
      return;
    }

    if (Number(budgetMax) < Number(budgetMin)) {
      setError("Maximum budget must be greater than or equal to minimum budget.");
      return;
    }

    if (selectedSkills.length === 0) {
      setError("Please select at least 1 required technology skill.");
      return;
    }

    const formData = new FormData();
    formData.append("title", trimmedTitle);
    formData.append("description", trimmedDesc);
    formData.append("categoryId", categoryId || parentCategoryId);
    formData.append("scope", scope);
    formData.append("timeCommitment", timeCommitment);
    formData.append("duration", duration);
    formData.append("experienceLevel", experienceLevel);
    formData.append("budgetType", budgetType);
    formData.append("budgetMin", budgetMin);
    formData.append("budgetMax", budgetMax);
    formData.append("deliverables", deliverables.trim());
    for (const q of screeningQuestions) {
      formData.append("screeningQuestions", q);
    }

    for (const id of selectedSkills) {
      formData.append("skillIds", id.toString());
    }

    startTransition(async () => {
      const result = await createJobAction(null, formData);
      if (!result.success) {
        setError(result.error ?? "Failed to publish job brief.");
      } else {
        router.push(`/jobs/${result.jobId}`);
      }
    });
  };

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* AI Scope Decomposer Card (Hidden per user preference) */}
      {SHOW_AI_CO_PILOT && (
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
            </div>
          )}
        </div>
      )}

      {/* Main Job Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {/* SECTION 1: TITLE & CASCADING CATEGORIES */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
            <span>Project Scope & Taxonomy</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Job Brief Title *
              </label>
              <span
                className={`text-[11px] font-mono ${
                  title.trim().length >= 10 && title.trim().length <= 120
                    ? "text-zinc-400"
                    : title.trim().length > 120
                      ? "text-red-500 font-bold"
                      : "text-amber-500"
                }`}
              >
                {title.length} / 120 chars {title.trim().length < 10 && "(min 10)"}
              </span>
            </div>
            <input
              type="text"
              required
              minLength={10}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build High-Throughput Escrow Protocol with Next.js 15 & Stripe Connect"
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Primary Industry Sector (Parent) *
              </label>
              <div className="relative mt-1.5">
                <FolderTree className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <select
                  value={parentCategoryId}
                  onChange={(e) => handleParentCategoryChange(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {parentCategories.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  {/* Fallback to any remaining flat categories */}
                  {categories
                    .filter(
                      (c) => c.parentId === null && !parentCategories.some((p) => p.id === c.id),
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Specialized Subcategory *
              </label>
              <div className="relative mt-1.5">
                <Layers className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {currentSubcategories.length > 0 ? (
                    currentSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))
                  ) : (
                    <option value={parentCategoryId}>General / Direct Sector</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: SCOPE, DURATION & COMMITMENT */}
        <div className="space-y-5 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-purple-500" />
            <span>Scope, Seniority & Time Commitment</span>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Project Scale & Scope
            </label>
            <div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setScope("LARGE")}
                className={`rounded-xl border p-3.5 text-left transition ${
                  scope === "LARGE"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs dark:border-indigo-400 dark:bg-indigo-950/30"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Large / Initiative
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Multi-month timeline, complex systems & multiple deliverables.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScope("MEDIUM")}
                className={`rounded-xl border p-3.5 text-left transition ${
                  scope === "MEDIUM"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs dark:border-indigo-400 dark:bg-indigo-950/30"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Medium / Well-Defined
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  1 to 3 months, 2-4 distinct milestone verification stages.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScope("SMALL")}
                className={`rounded-xl border p-3.5 text-left transition ${
                  scope === "SMALL"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs dark:border-indigo-400 dark:bg-indigo-950/30"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Small / Focused
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Quick turnaround, discrete bug fixes or focused sprint deliverables.
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Experience Desired
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="ENTRY">Entry Level (Competitive pricing)</option>
                <option value="INTERMEDIATE">Intermediate (Solid experience)</option>
                <option value="EXPERT">Expert / Staff (Domain mastery)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Estimated Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="Less than 1 month">Less than 1 month</option>
                <option value="1 to 3 months">1 to 3 months</option>
                <option value="3 to 6 months">3 to 6 months</option>
                <option value="More than 6 months">More than 6 months</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Time Commitment
              </label>
              <select
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="Milestone-driven / Flexible">Milestone-driven / Flexible</option>
                <option value="Part-time (< 30 hrs/wk)">Part-time (&lt; 30 hrs/wk)</option>
                <option value="Full-time (30+ hrs/wk)">Full-time (30+ hrs/wk)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: BUDGET MODEL & ESCROW */}
        <div className="space-y-5 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            <span>Budget Model & Escrow Protection</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setBudgetType("FIXED")}
              className={`rounded-xl border p-4 text-left transition ${
                budgetType === "FIXED"
                  ? "border-emerald-600 bg-emerald-50/50 shadow-xs dark:border-emerald-400 dark:bg-emerald-950/30"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Fixed Price (Escrow Protected)</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Deposit funds into secure milestone escrow. Payouts released upon deliverable
                approval.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setBudgetType("HOURLY")}
              className={`rounded-xl border p-4 text-left transition ${
                budgetType === "HOURLY"
                  ? "border-emerald-600 bg-emerald-50/50 shadow-xs dark:border-emerald-400 dark:bg-emerald-950/30"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-zinc-900 dark:text-zinc-100">
                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Hourly Engagement</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Track hours logged with weekly invoicing and automatic time tracking verification.
              </p>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                {budgetType === "FIXED" ? "Minimum Project Budget ($)" : "Minimum Rate ($/hr)"} *
              </label>
              <div className="relative mt-1.5">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="number"
                  min="10"
                  required
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs font-semibold text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                {budgetType === "FIXED" ? "Maximum Project Budget ($)" : "Maximum Rate ($/hr)"} *
              </label>
              <div className="relative mt-1.5">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="number"
                  min="10"
                  required
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-xs font-semibold text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Escrow Guarantee Callout */}
          <div className="flex items-center gap-2.5 rounded-xl bg-blue-500/10 p-3 text-xs text-blue-900 dark:text-blue-200 border border-blue-500/20">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              <strong>100% Escrow Guarantee:</strong> Funds remain securely held until you inspect
              git commits, code diffs, and approve the deliverables.
            </span>
          </div>
        </div>

        {/* SECTION 4: DETAILED DESCRIPTION & DELIVERABLES */}
        <div className="space-y-5 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <ListChecks className="h-3.5 w-3.5 text-indigo-500" />
            <span>Description, Milestones & Screening</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Detailed Project Description *
              </label>
              <span
                className={`text-[11px] font-mono ${
                  description.trim().length >= 30 && description.trim().length <= 10000
                    ? "text-zinc-400"
                    : description.trim().length > 10000
                      ? "text-red-500 font-bold"
                      : "text-amber-500"
                }`}
              >
                {description.length.toLocaleString()} / 10,000 chars{" "}
                {description.trim().length < 30 && "(min 30)"}
              </span>
            </div>
            <textarea
              rows={8}
              required
              minLength={30}
              maxLength={10000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline your application goals, target users, technical requirements, integrations (e.g. Stripe, AWS), and architecture constraints. Plaintext format with line breaks, markdown, bullet lists, emojis, and URLs are fully supported..."
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-sans leading-relaxed whitespace-pre-wrap"
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Plaintext format supported: multi-line paragraphs, numbered lists, markdown, links,
              and emojis are preserved.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Structured Milestone Deliverables & Acceptance Criteria
              </label>
              <span
                className={`text-[11px] font-mono ${
                  deliverables.length <= 5000 ? "text-zinc-400" : "text-red-500 font-bold"
                }`}
              >
                {deliverables.length.toLocaleString()} / 5,000 chars
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={5000}
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="e.g.&#10;Milestone 1: Database schemas & authentication routes (25%)&#10;Milestone 2: Stripe Connect escrow integration & webhook listeners (50%)&#10;Milestone 3: Production QA, load testing & Vercel deployment (25%)"
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 font-mono text-[11px] leading-relaxed whitespace-pre-wrap"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Applicant Screening Questions (Optional)
                </label>
                <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              {screeningQuestions.length > 0 && (
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {screeningQuestions.length}{" "}
                  {screeningQuestions.length === 1 ? "question" : "questions"} added
                </span>
              )}
            </div>

            {/* List of current questions */}
            {screeningQuestions.length > 0 && (
              <div className="space-y-2">
                {screeningQuestions.map((question, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900/60"
                  >
                    <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-100 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                      Q{idx + 1}
                    </span>
                    <p className="flex-1 text-zinc-800 leading-relaxed dark:text-zinc-200">
                      {question}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-zinc-400 opacity-60 hover:text-red-500 hover:opacity-100 group-hover:opacity-100 transition-opacity p-1"
                      aria-label="Remove question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input to add dynamic question */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newQuestionInput}
                onChange={(e) => setNewQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddQuestion();
                  }
                }}
                placeholder="Type a custom screening question and click Add (or press Enter)..."
                className="flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => handleAddQuestion()}
                disabled={!newQuestionInput.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Suggested quick-add questions */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-zinc-400">Suggested questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Please link 1-2 production repos or case studies demonstrating similar tech stack architectures.",
                  "What is your weekly availability and preferred working timezone?",
                  "Have you worked with milestone-based escrow contracts before?",
                ].map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddQuestion(sugg)}
                    disabled={screeningQuestions.includes(sugg)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                  >
                    <Plus className="h-3 w-3" />
                    <span className="truncate max-w-xs">{sugg}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: REQUIRED SKILLS & KEYWORDS */}
        <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>Required Technology Skills ({skills.length} available)</span>
            </div>
            {selectedSkills.length > 0 && (
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {selectedSkills.length} Selected
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search required skills (e.g. TypeScript, Next.js, Stripe, PostgreSQL)..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
            <div className="flex flex-wrap gap-2">
              {filteredSkills.map((skill) => {
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
              })}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-7 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 transition"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing Job Brief...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Publish Project Brief</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
