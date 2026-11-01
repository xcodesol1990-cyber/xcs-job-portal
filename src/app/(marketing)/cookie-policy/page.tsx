import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Cookie, CheckCircle2, Sliders } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "WorkWasl Cookie Usage and Tracking Disclosure.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to WorkWasl</span>
        </Link>

        <div className="space-y-4">
          <Badge variant="purple">Browser Storage & Cookies</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Cookie Policy</h1>
          <p className="text-sm text-zinc-500">
            Last Updated: November 1, 2026 · Transparent & Minimal Tracking
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <Cookie className="h-5 w-5 text-amber-500" />
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text fragments sent to your web browser by a website you visit. They
              help the website remember information about your visit, such as your authentication
              state and preferred interface settings.
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              2. Strictly Necessary Cookies
            </h2>
            <p>
              WorkWasl uses strictly necessary cookies to ensure basic platform operations and
              security:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Session Token (`authjs.session-token`):</strong> Maintains your
                authenticated session securely via encrypted HttpOnly cookies.
              </li>
              <li>
                <strong>CSRF Token:</strong> Protects form submissions and Server Actions against
                Cross-Site Request Forgery attacks.
              </li>
              <li>
                <strong>Cookie Consent Preference:</strong> Stores whether you have acknowledged our
                privacy banner.
              </li>
            </ul>
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <Sliders className="h-5 w-5 text-indigo-500" />
              3. Managing Your Preferences
            </h2>
            <p>
              You can configure your browser to block or alert you about cookies, but some parts of
              the site (specifically login, escrow payments, and messaging) will not function
              without essential cookies. We do NOT sell user data or use third-party invasive
              behavioral tracking cookies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
