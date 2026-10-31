import { auth } from "@/server/lib/auth";
import { redirect } from "next/navigation";
import { NotificationService } from "@/server/services/notification.service";
import { Bell, CheckCircle2, MessageSquare, Briefcase } from "lucide-react";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await NotificationService.getUserNotifications(session.user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Bell className="h-4 w-4" />
          <span>Activity Stream</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Notifications & Alerts
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Updates on your bids, contract milestones, escrow releases, and messages.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {notifications.map((n) => {
            const payload = n.payload as Record<string, string | number>;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-6 transition ${
                  n.readAt ? "bg-white dark:bg-zinc-900" : "bg-indigo-50/20 dark:bg-indigo-950/20"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  {n.type === "PROPOSAL_RECEIVED" ? (
                    <Briefcase className="h-5 w-5" />
                  ) : n.type === "NEW_MESSAGE" ? (
                    <MessageSquare className="h-5 w-5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {n.type === "PROPOSAL_RECEIVED"
                        ? "New Proposal Received"
                        : n.type === "NEW_MESSAGE"
                        ? `New Message from ${payload.senderName ?? "User"}`
                        : n.type}
                    </h3>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
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
            <div className="p-12 text-center text-xs text-zinc-500">
              You are all caught up! No unread notifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
