"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createContractAction } from "@/server/actions/contract.actions";
import { Plus, Trash2, DollarSign, Loader2, ShieldCheck } from "lucide-react";

interface MilestoneDraft {
  title: string;
  amount: string;
}

interface CreateContractFormProps {
  proposalId: string;
  bidDollars: number;
}

export function CreateContractForm({ proposalId, bidDollars }: CreateContractFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { title: "Initial Prototype & Core Architecture", amount: (bidDollars * 0.5).toFixed(0) },
    { title: "Final Deliverable, Testing & Handover", amount: (bidDollars * 0.5).toFixed(0) },
  ]);

  const addMilestone = () => {
    setMilestones((prev) => [...prev, { title: "", amount: "100" }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: "title" | "amount", val: string) => {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: val } : m)));
  };

  const totalAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formatted = milestones.map((m) => ({
      title: m.title.trim() || "Milestone",
      amountCents: Math.round((Number(m.amount) || 0) * 100),
    }));

    startTransition(async () => {
      const res = await createContractAction(proposalId, formatted);
      if (!res.success) {
        setError(res.error ?? "Failed to create contract.");
      } else {
        router.push(`/contracts/${res.contractId}`);
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Contract Milestones
          </label>
          <button
            type="button"
            onClick={addMilestone}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>

        {milestones.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-950/30"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 font-mono text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {i + 1}
            </span>
            <input
              type="text"
              required
              placeholder="Milestone description"
              value={m.title}
              onChange={(e) => updateMilestone(i, "title", e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <div className="relative w-32 shrink-0">
              <DollarSign className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="number"
                min="5"
                required
                value={m.amount}
                onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pl-7 pr-2.5 text-xs font-semibold text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            {milestones.length > 1 && (
              <button
                type="button"
                onClick={() => removeMilestone(i)}
                className="text-zinc-400 hover:text-red-500 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs dark:border-indigo-950 dark:bg-indigo-950/20 space-y-2">
        <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100">
          <span>Total Contract Budget:</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400">${totalAmount}</span>
        </div>
        <p className="text-[11px] text-zinc-500">
          You will only be billed when you explicitly fund each milestone into escrow. Funds are
          released upon your approval of deliverables.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Create Contract & Offer</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
