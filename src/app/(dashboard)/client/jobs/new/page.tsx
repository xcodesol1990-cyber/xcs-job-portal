import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { ProfileService } from "@/server/services/profile.service";
import { CreateJobForm } from "@/components/forms/create-job-form";
import { Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const taxonomy = await ProfileService.getTaxonomy();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/client"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to workspace</span>
      </Link>

      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Briefcase className="h-4 w-4" />
          <span>New Opportunity</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Publish a Job Brief
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Define your project scope, choose your budget model, and find qualified talent.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <CreateJobForm categories={taxonomy.categories} skills={taxonomy.skills} />
      </div>
    </div>
  );
}
