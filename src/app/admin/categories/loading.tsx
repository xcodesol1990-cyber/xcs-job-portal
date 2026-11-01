export default function AdminCategoriesLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-64 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
