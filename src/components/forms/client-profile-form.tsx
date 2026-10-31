"use client";

import { useState, useTransition } from "react";
import { updateClientProfileAction } from "@/server/actions/profile.actions";
import { Loader2, Check, Globe, Building2, User } from "lucide-react";

interface ClientProfileFormProps {
  profile: {
    user: { name: string; email: string };
    companyName: string | null;
    website: string | null;
  };
}

export function ClientProfileForm({ profile }: ClientProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(profile.user.name ?? "");
  const [companyName, setCompanyName] = useState(profile.companyName ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("companyName", companyName);
    formData.append("website", website);

    startTransition(async () => {
      const res = await updateClientProfileAction(null, formData);
      if (!res.success) {
        setError(res.error ?? "Failed to save company profile.");
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
          <span>Company profile updated successfully!</span>
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
            Primary Contact Name
          </label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Company / Organization Name
          </label>
          <div className="relative mt-1.5">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Labs Inc."
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>

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
            placeholder="https://example.com"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-9 pr-3.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Company Profile"}
        </button>
      </div>
    </form>
  );
}

