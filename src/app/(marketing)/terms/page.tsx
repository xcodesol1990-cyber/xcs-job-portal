import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Scale, AlertCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "WorkWasl Marketplace Terms of Service and Escrow Rules.",
};

export default function TermsOfServicePage() {
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
          <Badge variant="purple">Legal Agreement</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="text-sm text-zinc-500">
            Last Updated: November 1, 2026 · Effective Immediately
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <FileText className="h-5 w-5 text-indigo-500" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, registering for, or using the WorkWasl platform
              (&quot;WorkWasl&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you
              acknowledge that you have read, understood, and agree to be bound by these Terms of
              Service (&quot;Terms&quot;) and our Privacy Policy. If you do not agree to these
              Terms, you must immediately discontinue use of the platform.
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <Shield className="h-5 w-5 text-emerald-500" />
              2. Milestone Escrow & Payment Processing
            </h2>
            <p>
              WorkWasl facilitates freelance engagements utilizing cryptographic milestone escrow.
              Clients fund milestone balances in advance through our payment partner, Stripe. Funds
              are secured in an escrow holding account until:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The Client explicitly approves the submitted milestone deliverable;</li>
              <li>The 14-day inactivity auto-approval period elapses without dispute; or</li>
              <li>
                A formal dispute resolution ruling is rendered by an authorized platform arbitrator.
              </li>
            </ul>
            <p>
              Platform service fees (10% standard take rate) are deducted directly from milestone
              payouts to maintain platform security, ledger verification, and infrastructure.
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <Scale className="h-5 w-5 text-amber-500" />
              3. Dispute Arbitration & Finality
            </h2>
            <p>
              In the event of a milestone disagreement, either party may trigger formal platform
              arbitration. Both parties are granted a structured period to submit evidence and work
              artifacts. Decisions rendered by platform administrators (refund to client, release to
              freelancer, or proportional split) are final, binding, and immediately executed by our
              double-entry ledger.
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              4. Prohibited Conduct & Community Safety
            </h2>
            <p>Users agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Circumvent platform payment systems to conduct off-platform transactions;</li>
              <li>Post fraudulent, misleading, harmful, or illegal job solicitations;</li>
              <li>Harass, threaten, or impersonate other platform participants;</li>
              <li>Attempt to scrape, reverse engineer, or degrade platform APIs and databases.</li>
            </ul>
            <p>
              Violations will result in immediate suspension, escrow freezing, and forfeiture of
              platform access.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
