"use server";

import { auth } from "@/server/lib/auth";
import { MessagingService } from "@/server/services/messaging.service";
import { NotificationService } from "@/server/services/notification.service";
import { revalidatePath } from "next/cache";

export interface MessageActionResult {
  success: boolean;
  conversationId?: string;
  error?: string;
}

export async function sendMessageAction(
  prevState: MessageActionResult | null,
  formData: FormData,
): Promise<MessageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const conversationId = formData.get("conversationId")?.toString();
  const body = formData.get("body")?.toString();

  if (!conversationId || !body) {
    return { success: false, error: "Message body is required." };
  }

  try {
    await MessagingService.sendMessage(session.user.id, conversationId, body);
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath("/messages");
    return { success: true, conversationId };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to send message." };
  }
}

export async function startConversationAction(
  clientId: string,
  freelancerId: string,
  jobId?: string,
): Promise<MessageActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const conv = await MessagingService.getOrCreateConversation(clientId, freelancerId, jobId);
    return { success: true, conversationId: conv.id };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "message" in error) {
      return { success: false, error: String((error as { message: string }).message) };
    }
    return { success: false, error: "Failed to open conversation." };
  }
}

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await NotificationService.markRead(session.user.id, notificationId);
  revalidatePath("/notifications");
}

