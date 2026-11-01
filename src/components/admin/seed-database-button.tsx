"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export function SeedDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSeed() {
    if (!confirm("This will ensure all demo personas, categories, and skills are populated. Continue?")) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Seeding database with demo personas & marketplace categories...");

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to seed database.");
      }

      toast.success("Database seeded successfully!", {
        id: toastId,
        description: "Admin, Client, and Freelancer accounts are ready to use.",
      });

      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to seed database", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-purple-50/80 px-3.5 py-2 text-xs font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100 hover:shadow disabled:opacity-60 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
      )}
      <span>Sync Demo Data</span>
    </button>
  );
}
