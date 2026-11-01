"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent =
        localStorage.getItem("workwasl_cookie_consent") ||
        localStorage.getItem("worknest_cookie_consent");
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      // In case localStorage is disabled or restricted
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("workwasl_cookie_consent", "accepted");
    } catch {
      // Ignore storage errors
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem("workwasl_cookie_consent", "dismissed");
    } catch {
      // Ignore storage errors
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-300 sm:left-6 sm:right-auto"
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              We value your privacy
            </p>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              We use essential cookies to maintain secure sessions and process milestone escrows.
              See our{" "}
              <Link
                href="/cookie-policy"
                className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleDismiss}
            aria-label="Dismiss cookie notice"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={handleAccept}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
