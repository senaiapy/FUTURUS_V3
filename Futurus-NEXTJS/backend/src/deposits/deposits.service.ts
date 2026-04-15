import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import * as crypto from 'crypto';

@Injectable()
export class DepositsService {
  constructor(private prisma: PrismaService) {}

  async createDeposit(
    userId: number,
    data: { amount: number; methodCode: number },
  ) {
    const trx = 'DEP' + crypto.randomBytes(8).toString('hex').toUpperCase();

    return this.prisma.deposit.create({
      data: {
        userId,
        methodCode: data.methodCode,
        amount: data.amount,
        charge: 0,
        rate: 1,
        finalAmount: data.amount,
        trx,
        status: 2, // Pending
      },
    });
  }

  async getUserDeposits(userId: number, status?: number) {
    const where: any = { userId };
    if (status !== undefined) where.status = status;

    return this.prisma.deposit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin methods
  async findAll(filters?: { status?: number; userId?: number }) {
    const where: any = {};
    if (filters?.status !== undefined) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;

    return this.prisma.deposit.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: number) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.status === 1)
      throw new BadRequestException('Deposit already approved');

    return this.prisma.$transaction(async (tx) => {
      // Update deposit status
      await tx.deposit.update({ where: { id }, data: { status: 1 } });

      // Add to user balance
      await tx.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount } },
      });

      // Create transaction
      const user = await tx.user.findUnique({ where: { id: deposit.userId } });
      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          amount: deposit.amount,
          charge: deposit.charge,
          postBalance: new Decimal(user!.balance.toString()),
          trxType: '+',
          trx: deposit.trx || '',
          details: `Deposit via method ${deposit.methodCode}`,
          remark: 'deposit',
        },
      });

      return { message: 'Deposit approved successfully' };
    });
  }

  async reject(id: number, feedback?: string) {
    const deposit = await this.prisma.deposit.findUnique({ where: { id } });
    if (!deposit) throw new NotFoundException('Deposit not found');

    return this.prisma.deposit.update({
      where: { id },
      data: { status: 3, adminFeedback: feedback },
    });
  }
}
