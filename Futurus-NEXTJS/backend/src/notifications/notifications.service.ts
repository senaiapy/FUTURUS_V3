import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(
    userId: number,
    params: { page?: number; limit?: number; unreadOnly?: boolean },
  ) {
    const { page = 1, limit = 20, unreadOnly = false } = params;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) {
      where.userRead = 0;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notificationLog.count({ where }),
      this.prisma.notificationLog.count({ where: { userId, userRead: 0 } }),
    ]);

    return {
      data: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.notificationType,
        imageUrl: n.imageUrl,
        clickUrl: n.clickUrl,
        isRead: n.userRead === 1,
        createdAt: n.createdAt.toISOString(),
      })),
      meta: {
        total,
        unreadCount,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.prisma.notificationLog.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notificationLog.update({
      where: { id: notificationId },
      data: { userRead: 1 },
    });

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notificationLog.updateMany({
      where: { userId, userRead: 0 },
      data: { userRead: 1 },
    });

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notificationLog.count({
      where: { userId, userRead: 0 },
    });

    return { unreadCount: count };
  }

  async deleteNotification(userId: number, notificationId: number) {
    const notification = await this.prisma.notificationLog.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notificationLog.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted' };
  }
}
