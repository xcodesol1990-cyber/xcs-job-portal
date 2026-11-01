import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfileService } from "@/server/services/profile.service";
import { Building2, Globe, ShieldCheck, ArrowLeft } from "lucide-react";

interface PublicClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicClientPage({ params }: PublicClientPageProps) {
  const { id } = await params;

  let profile;
  try {
    profile = await ProfileService.getClientProfile(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to marketplace</span>
        </Link>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {profile.companyName ?? `${profile.user.name}'s Company`}
                </h1>
                {profile.paymentVerified && (
                  <span title="Payment Verified">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-500">Primary Contact: {profile.user.name}</p>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{profile.website}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
