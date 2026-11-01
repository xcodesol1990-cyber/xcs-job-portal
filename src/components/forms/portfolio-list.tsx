"use client";

import { useState, useTransition } from "react";
import {
  addPortfolioItemAction,
  deletePortfolioItemAction,
} from "@/server/actions/profile.actions";
import { Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
}

interface PortfolioListProps {
  items: PortfolioItem[];
}

export function PortfolioList({ items }: PortfolioListProps) {
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("url", url);

    startTransition(async () => {
      await addPortfolioItemAction(null, formData);
      setTitle("");
      setDescription("");
      setUrl("");
      setShowAddForm(false);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deletePortfolioItemAction(id);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Add recent projects, GitHub repositories, or live applications you built.
        </p>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <Plus className="h-3.5 w-3.5 text-indigo-500" />
          <span>{showAddForm ? "Cancel" : "Add Project"}</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-3 dark:border-indigo-900/40 dark:bg-indigo-950/20"
        >
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js SaaS Platform"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Project Link / GitHub URL (Optional)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key accomplishments and technologies used..."
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Project"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </h4>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition"
                title="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
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
                <span>View project</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}

        {items.length === 0 && !showAddForm && (
          <div className="col-span-full rounded-xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
            No portfolio items added yet. Click &quot;Add Project&quot; above to showcase your work.
          </div>
        )}
      </div>
    </div>
  );
}
