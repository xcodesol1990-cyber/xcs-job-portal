"use client";

import { useState, useTransition } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  createSkillAction,
  deleteSkillAction,
} from "@/server/actions/admin.actions";
import {
  FolderTree,
  Tags,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
} from "lucide-react";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parent?: { id: number; name: string; slug: string } | null;
  children?: Array<{ id: number; name: string; slug: string }>;
  _count?: { jobs: number };
}

interface SkillItem {
  id: number;
  name: string;
  slug: string;
  _count?: { jobSkills: number; freelancerSkills: number };
}

interface TaxonomyManagerProps {
  categories: CategoryItem[];
  skills: SkillItem[];
}

export function TaxonomyManager({ categories, skills }: TaxonomyManagerProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "skills">("categories");
  const [categorySearch, setCategorySearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  // Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatParentId, setNewCatParentId] = useState<string>("");

  // Skill Form State
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillSlug, setNewSkillSlug] = useState("");

  const parentCategories = categories.filter((c) => c.parentId === null);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setFeedback(null);
    const formData = new FormData();
    formData.append("name", newCatName);
    if (newCatSlug.trim()) formData.append("slug", newCatSlug);
    if (newCatParentId) formData.append("parentId", newCatParentId);

    startTransition(async () => {
      const res = await createCategoryAction(null, formData);
      if (res.success) {
        setFeedback({ type: "success", message: `Category "${newCatName}" created successfully.` });
        setNewCatName("");
        setNewCatSlug("");
        setNewCatParentId("");
      } else {
        setFeedback({ type: "error", message: res.error ?? "Failed to create category." });
      }
    });
  };

  const handleDeleteCategory = (catId: number, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await deleteCategoryAction(catId);
      if (res.success) {
        setFeedback({ type: "success", message: `Category "${catName}" deleted successfully.` });
      } else {
        setFeedback({ type: "error", message: res.error ?? "Failed to delete category." });
      }
    });
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setFeedback(null);
    const formData = new FormData();
    formData.append("name", newSkillName);
    if (newSkillSlug.trim()) formData.append("slug", newSkillSlug);

    startTransition(async () => {
      const res = await createSkillAction(null, formData);
      if (res.success) {
        setFeedback({ type: "success", message: `Skill "${newSkillName}" created successfully.` });
        setNewSkillName("");
        setNewSkillSlug("");
      } else {
        setFeedback({ type: "error", message: res.error ?? "Failed to create skill." });
      }
    });
  };

  const handleDeleteSkill = (skillId: number, skillName: string) => {
    if (!confirm(`Are you sure you want to delete skill "${skillName}"?`)) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await deleteSkillAction(skillId);
      if (res.success) {
        setFeedback({ type: "success", message: `Skill "${skillName}" deleted successfully.` });
      } else {
        setFeedback({ type: "error", message: res.error ?? "Failed to delete skill." });
      }
    });
  };

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    const query = categorySearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      c.parent?.name.toLowerCase().includes(query)
    );
  });

  // Filter Skills
  const filteredSkills = skills.filter((s) => {
    const query = skillSearch.toLowerCase();
    return s.name.toLowerCase().includes(query) || s.slug.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-xs font-semibold animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === "categories"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <FolderTree className="h-4 w-4" />
          <span>Categories & Subcategories ({categories.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("skills")}
          className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition ${
            activeTab === "skills"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Tags className="h-4 w-4" />
          <span>Skills & Keywords ({skills.length})</span>
        </button>
      </div>

      {/* TAB 1: CATEGORIES */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Add Category Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
              <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Add New Category</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Create a top-level parent category or nest a specialized subcategory under an existing
              parent.
            </p>

            <form
              onSubmit={handleCreateCategory}
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4"
            >
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase text-zinc-500">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. AI & Machine Learning"
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500">
                  Parent Category
                </label>
                <select
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="">None (Top-Level Parent)</option>
                  {parentCategories.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="ai-machine-learning"
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending || !newCatName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search categories by name, slug, or parent..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs text-zinc-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Categories Table */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <tr>
                    <th className="px-5 py-3">Category Hierarchy</th>
                    <th className="px-5 py-3">Slug</th>
                    <th className="px-5 py-3">Tier</th>
                    <th className="px-5 py-3">Linked Jobs</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">
                        No categories found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => {
                      const isParent = !cat.parentId;
                      return (
                        <tr
                          key={cat.id}
                          className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {isParent ? (
                                <FolderTree className="h-4 w-4 text-indigo-500" />
                              ) : (
                                <>
                                  <span className="text-zinc-400">└─</span>
                                  <Layers className="h-3.5 w-3.5 text-zinc-400" />
                                </>
                              )}
                              <span
                                className={`font-semibold ${isParent ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"}`}
                              >
                                {cat.name}
                              </span>
                              {cat.parent && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
                                  <span>under</span>
                                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                    {cat.parent.name}
                                  </span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-500">
                            {cat.slug}
                          </td>
                          <td className="px-5 py-3.5">
                            {isParent ? (
                              <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Parent
                              </span>
                            ) : (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                Subcategory
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-zinc-700 dark:text-zinc-300">
                            {cat._count?.jobs ?? 0} jobs
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              disabled={isPending || (cat._count?.jobs ?? 0) > 0}
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              title={
                                (cat._count?.jobs ?? 0) > 0
                                  ? "Cannot delete category with active job postings"
                                  : "Delete Category"
                              }
                              className="inline-flex items-center gap-1 rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 disabled:opacity-40 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          {/* Add Skill Card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Add New Skill / Keyword</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Create a recognized skill tag that freelancers can add to profiles and clients can
              require on contracts.
            </p>

            <form
              onSubmit={handleCreateSkill}
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Next.js 15"
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-500">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  value={newSkillSlug}
                  onChange={(e) => setNewSkillSlug(e.target.value)}
                  placeholder="nextjs-15"
                  className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isPending || !newSkillName.trim()}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-500 disabled:opacity-50 transition"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>Create Skill</span>
                </button>
              </div>
            </form>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="Search skills by name or slug..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs text-zinc-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredSkills.map((s) => {
              const usageCount = (s._count?.jobSkills ?? 0) + (s._count?.freelancerSkills ?? 0);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-2.5 text-xs shadow-xs hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 transition"
                >
                  <div className="min-w-0 pr-1">
                    <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                      {s.name}
                    </p>
                    <span className="text-[10px] text-zinc-400">
                      {usageCount} {usageCount === 1 ? "usage" : "usages"}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDeleteSkill(s.id, s.name)}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition"
                    title={`Delete skill ${s.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
