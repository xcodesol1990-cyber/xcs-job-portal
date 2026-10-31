import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-10 px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        Freelance marketplace
      </p>
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Hire specialists. Get paid for great work.
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          WorkNest helps clients post jobs, receive proposals, fund milestones in escrow, and pay
          freelancers after delivery.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          href="/login"
        >
          Sign in
        </Link>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium dark:border-zinc-700"
          href="/register"
        >
          Create an account
        </Link>
      </div>
    </main>
  );
}
