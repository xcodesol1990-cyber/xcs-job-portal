import { auth } from "@/server/lib/auth";
import { PublicHeader } from "@/components/layout/public-header";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <PublicHeader user={session?.user} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
