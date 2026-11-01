import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { NotificationService } from "@/server/services/notification.service";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkNotificationsReadButton } from "@/components/forms/mark-notifications-read-button";
import { Bell, CheckCircle2, MessageSquare, Briefcase, FileCheck } from "lucide-react";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await NotificationService.getUserNotifications(session.user.id);
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        badge="Activity Stream"
        badgeIcon={Bell}
        badgeVariant="purple"
        title="Notifications & Alerts"
        description="Updates on your bids, contract milestones, escrow releases, and messages."
      >
        <MarkNotificationsReadButton hasUnread={hasUnread} />
      </PageHeader>

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {notifications.map((n) => {
            const payload = n.payload as Record<string, string | number>;
            const isUnread = !n.readAt;

            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-5 sm:p-6 transition ${
                  isUnread ? "bg-purple-50/20 dark:bg-purple-950/20" : "bg-white dark:bg-zinc-900"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                    isUnread
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {n.type === "PROPOSAL_RECEIVED" ? (
                    <Briefcase className="h-5 w-5" />
                  ) : n.type === "NEW_MESSAGE" ? (
                    <MessageSquare className="h-5 w-5" />
                  ) : n.type.includes("CONTRACT") || n.type.includes("MILESTONE") ? (
                    <FileCheck className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                      {n.type === "PROPOSAL_RECEIVED"
                        ? "New Proposal Received"
                        : n.type === "NEW_MESSAGE"
                          ? `New Message from ${payload.senderName ?? "User"}`
                          : n.type.replace(/_/g, " ")}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      {isUnread && <span className="h-2 w-2 rounded-full bg-purple-600" />}
                      <span className="text-[11px] text-zinc-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {n.type === "PROPOSAL_RECEIVED"
                      ? `${payload.freelancerName} submitted a bid on "${payload.jobTitle}".`
                      : n.type === "NEW_MESSAGE"
                        ? String(payload.preview ?? "Sent you a direct message.")
                        : JSON.stringify(payload)}
                  </p>
                </div>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="p-8">
              <EmptyState
                icon={Bell}
                title="You're all caught up!"
                description="No unread notifications. New proposals, milestone updates, and messages will appear here."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
