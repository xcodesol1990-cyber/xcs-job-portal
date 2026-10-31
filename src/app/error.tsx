"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        An unexpected error occurred. If this continues, share the request id with support.
      </p>
      {error.digest ? (
        <p className="font-mono text-sm text-zinc-500">Request id: {error.digest}</p>
      ) : null}
      <button
        type="button"
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
