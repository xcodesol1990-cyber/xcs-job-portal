import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Zap,
  CheckCircle,
  Briefcase,
  Star,
  Activity,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden flex flex-col justify-between">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-pink-500/10 blur-3xl" />

      {/* Navigation */}
      <header className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Work<span className="text-indigo-600 dark:text-indigo-400">Nest</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/jobs"
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 hidden sm:inline-block"
          >
            Browse Jobs
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto w-full max-w-7xl px-6 pt-16 pb-24 lg:px-8 lg:pt-24 flex-1">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Escrow Protected Freelance Marketplace</span>
          </div>

          <h1 className="mt-8 text-5xl font-black tracking-tight sm:text-7xl">
            Hire elite talent.{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Guaranteed escrow.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            WorkNest connects high-growth companies with world-class engineers, designers, and
            specialists. Funds are securely held in milestone escrow until you approve the
            deliverable.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 transition hover:bg-indigo-500 sm:w-auto"
            >
              <span>Join as Client or Freelancer</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 text-base font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:w-auto"
            >
              <span>Explore Demo Accounts</span>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Zero upfront risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-indigo-500" />
              <span>256-bit encryption</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Verified talent</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-8 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Milestone Escrow
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Clients deposit milestone funds into escrow before work begins. Payments are released
              only when deliverables are verified.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-8 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Instant Payouts & Stripe
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Freelancers receive automatic direct transfers to their bank accounts via Stripe
              Connect with transparent fee accounting.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-8 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Unified Dual Persona
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Seamlessly post jobs as an employer or pitch services as a freelancer from a single
              verified account with fast role switching.
            </p>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-zinc-200/80 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>&copy; {new Date().getFullYear()} WorkNest Technologies Inc.</span>
            <span>&middot;</span>
            <Link
              href="/api/health"
              target="_blank"
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <Activity className="h-3 w-3" />
              <span>System Operational</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <Link href="/jobs" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Opportunities
            </Link>
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Privacy Policy
            </Link>
            <Link href="/cookie-policy" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
