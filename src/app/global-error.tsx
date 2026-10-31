"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-950">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 px-6">
          <h1 className="text-2xl font-semibold">Application error</h1>
          <p>WorkNest could not render this page. Please try again.</p>
          {error.digest ? <p className="font-mono text-sm">Request id: {error.digest}</p> : null}
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
