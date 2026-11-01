import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, Database, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "WorkNest Privacy Policy, GDPR Compliance, and Data Protection.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to WorkNest</span>
        </Link>

        <div className="space-y-4">
          <Badge variant="purple">Data Protection & Privacy</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-zinc-500">
            Last Updated: November 1, 2026 · Compliant with GDPR & CCPA
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <Lock className="h-5 w-5 text-indigo-500" />
              1. Information We Collect
            </h2>
            <p>
              We collect information required to deliver a verifiable, secure freelance escrow
              experience:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account Credentials:</strong> Name, verified email address, and
                cryptographically hashed passwords (`argon2id`).
              </li>
              <li>
                <strong>Profile Information:</strong> Bio, title, professional skills, hourly rate,
                and portfolio artifacts.
              </li>
              <li>
                <strong>Financial & Payment Data:</strong> Stripe Customer IDs and connected Stripe
                Express account tokens (we never store raw card numbers or bank account numbers
                directly on our servers).
              </li>
              <li>
                <strong>Communications:</strong> Messages exchanged in contract workrooms and
                support inquiries.
              </li>
            </ul>
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <Database className="h-5 w-5 text-emerald-500" />
              2. How We Secure Your Data
            </h2>
            <p>WorkNest implements defense-in-depth security:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                All sensitive columns (such as 2FA TOTP backup seeds) are encrypted at rest using
                AES-256-GCM.
              </li>
              <li>
                Database queries run through connection pooling with strict parameterized statements
                preventing SQL injection.
              </li>
              <li>Transport-layer security (TLS 1.3) encrypts all data in transit.</li>
              <li>
                Double-entry financial ledger records are append-only and cryptographically
                protected.
              </li>
            </ul>
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <Eye className="h-5 w-5 text-amber-500" />
              3. GDPR & CCPA Rights
            </h2>
            <p>
              Regardless of your geographic location, WorkNest affords all users fundamental digital
              privacy rights:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Right to Access:</strong> You may request an export of your profile,
                contract histories, and ledger receipts.
              </li>
              <li>
                <strong>Right to Rectification:</strong> You can edit and update your personal and
                professional profile at any time.
              </li>
              <li>
                <strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Subject to
                mandatory financial and tax record retention laws (typically 7 years for settled
                ledger transactions), you may request permanent deletion of your account.
              </li>
            </ul>
          </section>

          <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              <Trash2 className="h-5 w-5 text-rose-500" />
              4. Data Inquiries & Contact
            </h2>
            <p>
              To exercise your GDPR data export or deletion rights, or for any privacy-related
              inquiries, contact our Data Protection Officer at:
            </p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">privacy@worknest.dev</p>
          </section>
        </div>
      </div>
    </div>
  );
}
