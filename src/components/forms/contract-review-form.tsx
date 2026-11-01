"use client";

import { useState } from "react";
import { submitReviewAction } from "@/server/actions/review.actions";
import { Star, Loader2, CheckCircle2 } from "lucide-react";

interface ContractReviewFormProps {
  contractId: string;
  counterpartRole: "Client" | "Freelancer";
}

export function ContractReviewForm({ contractId, counterpartRole }: ContractReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await submitReviewAction({
      contractId,
      rating,
      comment,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to submit review.");
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-5 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="font-semibold">Review submitted!</p>
          <p className="text-xs">Thank you for rating your experience on this contract.</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Leave a Review for {counterpartRole}
        </h4>
        <p className="text-xs text-zinc-500">
          Your feedback helps build trust in the WorkWasl community.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Star Selector */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 focus:outline-none"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                (hoverRating || rating) >= star
                  ? "fill-amber-400 text-amber-400"
                  : "text-zinc-300 dark:text-zinc-700"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {rating} of 5 Stars
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
          Public Feedback (Optional)
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about communication, deliverables, and quality..."
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 p-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Submit Review
      </button>
    </form>
  );
}
