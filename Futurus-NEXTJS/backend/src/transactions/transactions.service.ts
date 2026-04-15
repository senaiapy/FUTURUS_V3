import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getUserTransactions(userId: number, remark?: string) {
    const where: any = { userId };
    if (remark) where.remark = remark;

    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin
  async findAll(filters?: {
    userId?: number;
    trxType?: string;
    remark?: string;
  }) {
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.trxType) where.trxType = filters.trxType;
    if (filters?.remark) where.remark = filters.remark;

    return this.prisma.transaction.findMany({
      where,
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
