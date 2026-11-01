import Link from "next/link";
import { AuthService } from "@/server/services/auth.service";
import { AuthCard } from "@/components/ui/auth-card";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;
  let success = false;
  let errorMessage: string | null = null;

  if (token) {
    try {
      await AuthService.verifyEmail(token);
      success = true;
    } catch (err: unknown) {
      errorMessage = err instanceof Error ? err.message : "Invalid or expired verification token.";
    }
  }

  return (
    <AuthCard title="Email Verification" subtitle="Verifying your WorkWasl account email">
      <div className="space-y-6 text-center">
        {success ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Email Verified Successfully!
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your email has been confirmed. You now have full verified access to WorkWasl.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <XCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Verification Failed
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {errorMessage ?? "No verification token provided or link is invalid."}
            </p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        )}
      </div>
    </AuthCard>
  );
}
