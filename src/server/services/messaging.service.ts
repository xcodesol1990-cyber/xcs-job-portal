import crypto from "node:crypto";
import { prisma } from "@/server/db/prisma";
import { AppError, HTTP_STATUS } from "@/server/lib/errors";
import { sanitizeHtml } from "@/server/lib/sanitize";

export class MessagingService {
  /**
   * Retrieves or creates a 1:1 conversation between a client and a freelancer.
   */
  static async getOrCreateConversation(
    clientId: string,
    freelancerId: string,
    jobId?: string,
    contractId?: string,
  ) {
    if (clientId === freelancerId) {
      throw new AppError("INVALID_CONVERSATION", "Cannot chat with yourself.", HTTP_STATUS.BAD_REQUEST);
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        clientId,
        freelancerId,
        ...(jobId ? { jobId } : {}),
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId,
          freelancerId,
          jobId,
          contractId,
        },
      });
    }

    return conversation;
  }

  /**
   * Sends a message within a conversation.
   */
  static async sendMessage(
    senderId: string,
    conversationId: string,
    bodyInput: string,
    clientMsgId?: string,
  ) {
    const body = sanitizeHtml(bodyInput);
    if (!body || body.length === 0) {
      throw new AppError("EMPTY_MESSAGE", "Message body cannot be empty.", HTTP_STATUS.UNPROCESSABLE);
    }

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } },
      },
    });

    if (!conv || (conv.clientId !== senderId && conv.freelancerId !== senderId)) {
      throw new AppError("UNAUTHORIZED", "Conversation not found or unauthorized.", HTTP_STATUS.FORBIDDEN);
    }

    const recipientId = conv.clientId === senderId ? conv.freelancerId : conv.clientId;
    const senderName = conv.clientId === senderId ? conv.client.name : conv.freelancer.name;
    const msgId = clientMsgId ?? crypto.randomUUID();

    return prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          body,
          clientMsgId: msgId,
        },
        include: {
          sender: { select: { id: true, name: true } },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      await tx.notification.create({
        data: {
          userId: recipientId,
          type: "NEW_MESSAGE",
          payload: {
            conversationId,
            senderName,
            preview: body.slice(0, 100),
          },
        },
      });

      return message;
    });
  }

  /**
   * Retrieves messages for a conversation, auto-marking incoming messages as read.
   */
  static async getMessages(conversationId: string, userId: string, limit = 50) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || (conv.clientId !== userId && conv.freelancerId !== userId)) {
      throw new AppError("UNAUTHORIZED", "Conversation not found.", HTTP_STATUS.FORBIDDEN);
    }

    // Mark unread messages sent by the other party as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      take: limit,
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Retrieves all conversations for a user.
   */
  static async getUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {
        OR: [{ clientId: userId }, { freelancerId: userId }],
      },
      orderBy: { lastMessageAt: "desc" },
      include: {
        client: { select: { id: true, name: true } },
        freelancer: { select: { id: true, name: true } },
        job: { select: { id: true, title: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { body: true, createdAt: true, senderId: true, readAt: true },
        },
      },
    });
  }
}
