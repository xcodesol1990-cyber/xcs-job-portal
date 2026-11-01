import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Zap,
  CheckCircle,
  Star,
  Activity,
  Check,
  X,
  Code2,
  Palette,
  Cpu,
  Cloud,
  Video,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-between">
      {/* Background glow and ambient light */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[650px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-pink-500/10 blur-3xl" />

      {/* Hero Section */}
      <main className="mx-auto w-full max-w-7xl px-6 pt-12 pb-24 lg:px-8 lg:pt-16 flex-1 space-y-24">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl leading-tight">
            Hire elite talent.{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Guaranteed escrow.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            WorkWasl connects ambitious companies with vetted engineers and designers. Funds are
            locked in audited milestone escrow vaults until deliverables and code diffs are
            verified.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-2">
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

          {/* Social Proof Badges */}
          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>Zero Upfront Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-indigo-500" />
              <span>Double-Entry Escrow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>100% Retained Freelancer Payouts</span>
            </div>
          </div>
        </div>

        {/* Interactive Simulated Product Showcase */}
        <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200/90 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-xs font-bold text-zinc-400">
                WorkWasl Contract Room #c42ca63
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle className="h-3 w-3" />
                <span>Escrow Verified</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                <Video className="h-3 w-3" />
                <span>WebRTC Ready</span>
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  Distributed Double-Entry Ledger System
                </h3>
                <p className="text-xs text-zinc-500">
                  Enterprise Client &middot; Lead Backend Systems Engineer
                </p>
              </div>
              <div className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                $8,500.00 <span className="text-xs font-normal text-zinc-400">USD</span>
              </div>
            </div>

            {/* Stepper Showcase */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    Milestone 1: Database Architecture
                  </span>
                  <span className="font-bold text-emerald-600">RELEASED</span>
                </div>
                <div className="font-mono text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  $3,500.00 &middot; 100% Released
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  Prisma schemas & migration scripts approved.
                </p>
              </div>

              <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">
                    Milestone 2: GitHub PR Verification
                  </span>
                  <span className="font-bold text-indigo-600">IN ESCROW</span>
                </div>
                <div className="font-mono text-sm font-semibold text-indigo-800 dark:text-indigo-300">
                  $5,000.00 &middot; PR #42 (+640 / -18 lines)
                </div>
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80">
                  Passing CI check badge verified by platform engine.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Benchmark Comparison Matrix */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Why High-Growth Teams Choose WorkWasl Over Upwork
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              We eliminated bidding taxes, arbitrary dispute arbitration, and platform lock-in.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="p-4 px-6">Capability & Protocol</th>
                  <th className="p-4 px-6 text-indigo-600 dark:text-indigo-400">WorkWasl</th>
                  <th className="p-4 px-6 text-zinc-400">Upwork</th>
                  <th className="p-4 px-6 text-zinc-400">Fiverr Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs sm:text-sm">
                <tr>
                  <td className="p-4 px-6 font-semibold">Freelancer Commission Tax</td>
                  <td className="p-4 px-6 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> 0% Protocol Fee
                  </td>
                  <td className="p-4 px-6 text-zinc-500">10% Flat Take-Rate</td>
                  <td className="p-4 px-6 text-zinc-500">20% Flat Cut</td>
                </tr>
                <tr>
                  <td className="p-4 px-6 font-semibold">Proposal Bidding Fee (Connects)</td>
                  <td className="p-4 px-6 font-bold text-emerald-600 dark:text-emerald-400">
                    Free (Zero-Connects Quality)
                  </td>
                  <td className="p-4 px-6 text-zinc-500">Paid ($0.15-$2.50 / bid)</td>
                  <td className="p-4 px-6 text-zinc-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 px-6 font-semibold">Code & PR Verification</td>
                  <td className="p-4 px-6 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Native GitHub / GitLab Diff Audit
                  </td>
                  <td className="p-4 px-6 text-zinc-400">
                    <X className="h-4 w-4 text-zinc-300" />
                  </td>
                  <td className="p-4 px-6 text-zinc-400">
                    <X className="h-4 w-4 text-zinc-300" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 px-6 font-semibold">Live Workroom Collaboration</td>
                  <td className="p-4 px-6 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> WebRTC Video Huddle & Screen Share
                  </td>
                  <td className="p-4 px-6 text-zinc-500">External Zoom links</td>
                  <td className="p-4 px-6 text-zinc-400">
                    <X className="h-4 w-4 text-zinc-300" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4 px-6 font-semibold">Milestone Escrow Mechanism</td>
                  <td className="p-4 px-6 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Partial Micro-Escrow Streaming
                  </td>
                  <td className="p-4 px-6 text-zinc-500">Binary 100% or Nothing</td>
                  <td className="p-4 px-6 text-zinc-500">Full Gig Escrow</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Core Discipline Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Vetted Engineering & Design Talent
            </h2>
            <p className="text-sm text-zinc-500 max-w-xl mx-auto">
              Explore specialized technical disciplines ready for immediate milestone engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/jobs?q=fullstack"
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 transition space-y-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Full-Stack Systems
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Next.js, React, Node.js, TypeScript, PostgreSQL, and distributed architectures.
              </p>
            </Link>

            <Link
              href="/jobs?q=ai"
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:border-purple-500 dark:border-zinc-800 dark:bg-zinc-900 transition space-y-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                AI & Autonomous Agents
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                LLM orchestration, RAG pipelines, OpenAI, LangChain, and Python machine learning.
              </p>
            </Link>

            <Link
              href="/jobs?q=design"
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:border-pink-500 dark:border-zinc-800 dark:bg-zinc-900 transition space-y-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Product & UX Design
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Figma design systems, mobile ergonomics, micro-interactions, and conversion design.
              </p>
            </Link>

            <Link
              href="/jobs?q=cloud"
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 transition space-y-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Cloud className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                DevOps & Infrastructure
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Kubernetes, AWS, Terraform, Docker, CI/CD automated test pipelines, and security.
              </p>
            </Link>

            <Link
              href="/jobs?q=mobile"
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 transition space-y-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Mobile Applications
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                React Native, Expo, Flutter, iOS Swift, and Android native high-performance apps.
              </p>
            </Link>

            <Link
              href="/jobs?q=security"
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:border-amber-500 dark:border-zinc-800 dark:bg-zinc-900 transition space-y-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Security & Smart Contracts
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Penetration testing, Solidity audits, cryptographic proofs, and compliance.
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-zinc-200/80 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>&copy; {new Date().getFullYear()} WorkWasl Technologies Inc.</span>
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
