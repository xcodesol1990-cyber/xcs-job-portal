"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  DollarSign,
  Calendar,
  Zap,
  Award,
  Check,
  X,
  MessageSquare,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ComparisonCandidate {
  id: string;
  bidCents: number;
  estimatedDays: number | null;
  coverLetter: string;
  createdAt: string | Date;
  status: string;
  freelancer: {
    id: string;
    name: string;
    freelancerProfile?: {
      headline?: string | null;
      hourlyRateCents?: number | null;
      experienceLevel?: string | null;
    } | null;
  };
}

interface ProposalComparisonMatrixProps {
  jobId: string;
  jobTitle: string;
  proposals: ComparisonCandidate[];
}

export function ProposalComparisonMatrix({
  jobId,
  jobTitle,
  proposals,
}: ProposalComparisonMatrixProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    proposals.slice(0, 3).map((p) => p.id),
  );

  if (proposals.length < 2) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const selectedProposals = proposals.filter((p) => selectedIds.includes(p.id));

  // Determine fastest delivery and lowest bid among selected
  const lowestBid = Math.min(...selectedProposals.map((p) => p.bidCents));
  const fastestDelivery = Math.min(
    ...selectedProposals.map((p) => p.estimatedDays ?? 999).filter((d) => d > 0),
  );

  return (
    <>
      <div className="flex items-center justify-between rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-white p-4 shadow-xs dark:border-purple-900/50 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Side-by-Side Proposal Comparison Matrix
            </h3>
            <p className="text-xs text-zinc-500">
              {proposals.length} candidates available &middot; Select up to 3 to benchmark bids,
              timelines, and credentials.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:bg-purple-500 transition"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Compare Candidates ({selectedIds.length})</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex w-full max-w-5xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-5 px-6 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Side-by-Side Candidate Benchmarking
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Evaluating proposals for &ldquo;{jobTitle}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Candidate Selector Pills */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {proposals.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleSelect(p.id)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          isSelected
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {isSelected && <Check className="inline h-2.5 w-2.5 mr-1" />}
                        {p.freelancer.name.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="overflow-y-auto p-6">
              <div
                className={`grid gap-4 ${
                  selectedProposals.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-3"
                }`}
              >
                {selectedProposals.map((p) => {
                  const bidDollars = p.bidCents / 100;
                  const isLowest = p.bidCents === lowestBid && selectedProposals.length > 1;
                  const isFastest =
                    p.estimatedDays === fastestDelivery && selectedProposals.length > 1;

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all"
                    >
                      <div className="space-y-4">
                        {/* Candidate Top */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                              {p.freelancer.name}
                            </span>
                            <Badge variant="purple">
                              {p.freelancer.freelancerProfile?.experienceLevel ?? "EXPERT"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500 line-clamp-1">
                            {p.freelancer.freelancerProfile?.headline ?? "Software Specialist"}
                          </p>
                        </div>

                        {/* Benchmark Indicators */}
                        <div className="flex flex-wrap gap-1.5">
                          {isLowest && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <Award className="h-3 w-3" />
                              <span>Best Bid Value</span>
                            </span>
                          )}
                          {isFastest && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                              <Zap className="h-3 w-3" />
                              <span>Fastest Turnaround</span>
                            </span>
                          )}
                        </div>

                        {/* Financials & Timeline */}
                        <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-0.5">
                              <DollarSign className="h-3 w-3" />
                              <span>Proposed Bid</span>
                            </span>
                            <div className="mt-0.5 font-mono text-base font-black text-zinc-900 dark:text-zinc-100">
                              ${bidDollars.toFixed(0)}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              <span>Est. Time</span>
                            </span>
                            <div className="mt-0.5 font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">
                              {p.estimatedDays ? `${p.estimatedDays} days` : "Flexible"}
                            </div>
                          </div>
                        </div>

                        {/* Pitch Excerpt */}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Pitch Summary
                          </span>
                          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-4 leading-relaxed bg-zinc-50/50 p-3 rounded-lg dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
                            {p.coverLetter}
                          </p>
                        </div>
                      </div>

                      {/* Direct CTA */}
                      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                        <Link
                          href={`/client/contracts/new?jobId=${jobId}&freelancerId=${p.freelancer.id}&bid=${bidDollars}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:from-purple-500 hover:to-indigo-500 transition"
                        >
                          <span>Hire Candidate</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                        <Link
                          href="/messages"
                          className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition"
                          title="Message Freelancer"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
