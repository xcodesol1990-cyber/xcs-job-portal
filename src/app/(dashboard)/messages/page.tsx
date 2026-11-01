import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessagingService } from "@/server/services/messaging.service";
import { ArrowRight } from "lucide-react";

export default async function MessagesHubPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const conversations = await MessagingService.getUserConversations(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Direct Messages
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Secure, private communication with clients and freelancers.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {conversations.map((conv) => {
            const partner = conv.clientId === session.user.id ? conv.freelancer : conv.client;
            const lastMsg = conv.messages[0];

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center justify-between p-6 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white text-sm shadow-sm">
                    {partner.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {partner.name}
                      </h3>
                      {conv.job && (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {conv.job.title}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-1 max-w-md">
                      {lastMsg ? lastMsg.body : "No messages yet. Start the conversation!"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {lastMsg && (
                    <span className="text-[11px] text-zinc-400">
                      {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}

          {conversations.length === 0 && (
            <div className="p-12 text-center text-xs text-zinc-500">
              No conversations yet. When clients or freelancers reach out regarding a job or
              proposal, they will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
