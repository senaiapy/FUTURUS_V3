import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async getUserTickets(userId: number) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { lastReply: 'desc' },
    });
  }

  async createTicket(
    userId: number,
    data: { subject: string; message: string; priority?: number },
  ) {
    const ticket = 'TKT' + crypto.randomBytes(6).toString('hex').toUpperCase();

    return this.prisma.$transaction(async (tx) => {
      const supportTicket = await tx.supportTicket.create({
        data: {
          userId,
          ticket,
          subject: data.subject,
          status: 0, // Open
          priority: data.priority || 1,
        },
      });

      await tx.supportMessage.create({
        data: {
          ticketId: supportTicket.id,
          message: data.message,
        },
      });

      return supportTicket;
    });
  }

  async viewTicket(ticketNumber: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { ticket: ticketNumber },
      include: {
        conversations: {
          orderBy: { createdAt: 'asc' },
          include: { supportAttachments: true },
        },
        user: {
          select: { id: true, username: true, email: true, image: true },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async replyTicket(
    ticketId: number,
    data: { message: string; adminId?: number },
  ) {
    await this.prisma.supportMessage.create({
      data: {
        ticketId,
        adminId: data.adminId || null,
        message: data.message,
      },
    });

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: data.adminId ? 1 : 2, // 1=Answered, 2=Replied
        lastReply: new Date(),
      },
    });
  }

  async closeTicket(id: number) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: 3 },
    });
  }

  // Admin
  async getAllTickets(filters?: { status?: number }) {
    const where: any = {};
    if (filters?.status !== undefined) where.status = filters.status;

    return this.prisma.supportTicket.findMany({
      where,
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { lastReply: 'desc' },
    });
  }

  async deleteTicket(id: number) {
    await this.prisma.supportMessage.deleteMany({ where: { ticketId: id } });
    return this.prisma.supportTicket.delete({ where: { id } });
  }
}
