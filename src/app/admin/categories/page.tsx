import { ProfileService } from "@/server/services/profile.service";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { FolderTree, Tags, Layers, Sparkles } from "lucide-react";

export const metadata = {
  title: "Taxonomy & Categories Management | WorkNest Admin",
};

export default async function AdminCategoriesPage() {
  const taxonomy = await ProfileService.getTaxonomy();

  const parentCategoriesCount = taxonomy.categories.filter((c) => !c.parentId).length;
  const subCategoriesCount = taxonomy.categories.filter((c) => !!c.parentId).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <FolderTree className="h-4 w-4" />
          <span>Marketplace Taxonomies</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Categories & Skills Management
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Manage parent industries, specialized subcategories, and vetted technology keywords across
          the platform.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Categories
            </span>
            <FolderTree className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {taxonomy.categories.length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Parent Sectors
            </span>
            <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {parentCategoriesCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Subcategories
            </span>
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {subCategoriesCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Skills & Tags
            </span>
            <Tags className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {taxonomy.skills.length}
          </p>
        </div>
      </div>

      {/* Main Interactive Manager Component */}
      <TaxonomyManager categories={taxonomy.categories} skills={taxonomy.skills} />
    </div>
  );
}
