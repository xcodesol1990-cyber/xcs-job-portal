import { auth } from "@/server/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { MessagingService } from "@/server/services/messaging.service";
import { ChatBox } from "@/components/chat/chat-box";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      freelancer: { select: { id: true, name: true } },
      job: { select: { id: true, title: true } },
    },
  });

  if (!conv || (conv.clientId !== session.user.id && conv.freelancerId !== session.user.id)) {
    notFound();
  }

  const partner = conv.clientId === session.user.id ? conv.freelancer : conv.client;
  const messages = await MessagingService.getMessages(id, session.user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/messages"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to all conversations</span>
      </Link>

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 font-bold text-white text-xs">
              {partner.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {partner.name}
              </h2>
              {conv.job && (
                <Link
                  href={`/jobs/${conv.job.id}`}
                  className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Regarding: {conv.job.title}
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Escrow Chat</span>
          </div>
        </div>

        {/* Chat Feed & Composer */}
        <ChatBox
          conversationId={id}
          currentUserId={session.user.id}
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
