"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/server/actions/auth.actions";
import {
  Lock,
  Mail,
  Shield,
  ArrowRight,
  Loader2,
  Sparkles,
  UserCheck,
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");

  const handleDemoSelect = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("WorkNestDemo!2026");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    if (totpCode) formData.append("totpCode", totpCode);

    startTransition(async () => {
      const result = await loginAction(null, formData);
      if (!result.success) {
        if (result.requiresTotp) {
          setRequiresTotp(true);
        }
        setError(result.error ?? "Failed to sign in.");
      } else {
        router.push(result.redirectUrl ?? "/dashboard");
        router.refresh();
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Quick Demo Login selector */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 dark:border-indigo-400/20 dark:bg-indigo-950/20">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-4 w-4" />
          <span>Quick Demo Access (1-Click Fill)</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoSelect("admin@worknest.dev")}
            className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-xs font-medium text-zinc-800 shadow-sm transition hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:bg-indigo-950/40"
          >
            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="mt-1 font-semibold">Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect("client@worknest.dev")}
            className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-xs font-medium text-zinc-800 shadow-sm transition hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:bg-indigo-950/40"
          >
            <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="mt-1 font-semibold">Client</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoSelect("freelancer@worknest.dev")}
            className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-xs font-medium text-zinc-800 shadow-sm transition hover:border-indigo-500 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:bg-indigo-950/40"
          >
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="mt-1 font-semibold">Freelancer</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
          >
            Email Address
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 transition placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-10 text-sm text-zinc-900 transition placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {requiresTotp && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <KeyRound className="h-4 w-4" />
              <span>Two-Factor Authentication Code</span>
            </div>
            <input
              id="totpCode"
              name="totpCode"
              type="text"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.trim())}
              placeholder="000000"
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-center text-lg font-mono tracking-widest text-zinc-900 focus:border-indigo-500 focus:outline-none dark:border-amber-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Sign In to WorkNest</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Create one now
        </Link>
      </div>
    </div>
  );
}
