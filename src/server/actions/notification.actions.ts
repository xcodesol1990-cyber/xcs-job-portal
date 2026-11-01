"use server";

import { auth } from "@/server/lib/auth";
import { NotificationService } from "@/server/services/notification.service";
import { revalidatePath } from "next/cache";

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await NotificationService.markRead(session.user.id, notificationId);
    revalidatePath("/notifications");
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to mark notification read." };
  }
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    await NotificationService.markAllRead(session.user.id);
    revalidatePath("/notifications");
    return { success: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to mark notifications read." };
  }
}

