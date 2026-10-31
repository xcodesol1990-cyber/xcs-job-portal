import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";

export class NotificationService {
  static async notify(input: { userId: string; type: string; payload: Prisma.InputJsonValue }) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        payload: input.payload,
      },
    });
  }

  static async getUserNotifications(userId: string, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  static async markRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  static async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}

export const notificationService = NotificationService;
