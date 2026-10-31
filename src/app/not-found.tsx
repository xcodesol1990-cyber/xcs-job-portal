import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        The page you requested does not exist or is no longer available.
      </p>
      <Link className="text-sm font-medium underline" href="/">
        Back to home
      </Link>
    </main>
  );
}
