import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import * as crypto from 'crypto';

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async getMethods() {
    return this.prisma.withdrawMethod.findMany({ where: { status: 1 } });
  }

  async createWithdrawal(
    userId: number,
    data: { methodId: number; amount: number },
  ) {
    const method = await this.prisma.withdrawMethod.findUnique({
      where: { id: data.methodId },
    });
    if (!method) throw new NotFoundException('Withdrawal method not found');

    const amount = new Decimal(data.amount);
    if (amount.lt(method.minLimit))
      throw new BadRequestException('Amount below minimum');
    if (amount.gt(method.maxLimit))
      throw new BadRequestException('Amount above maximum');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || new Decimal(user.balance.toString()).lt(amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    const charge = new Decimal(method.fixedCharge.toString()).plus(
      amount.times(new Decimal(method.percentCharge.toString()).div(100)),
    );
    const afterCharge = amount.minus(charge);
    const finalAmount = afterCharge.times(new Decimal(method.rate.toString()));
    const trx = 'WD' + crypto.randomBytes(8).toString('hex').toUpperCase();

    return this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          methodId: data.methodId,
          amount,
          currency: method.currency,
          rate: method.rate,
          charge,
          trx,
          finalAmount,
          afterCharge,
          status: 2, // Pending
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount } },
      });

      const updatedUser = await tx.user.findUnique({ where: { id: userId } });
      await tx.transaction.create({
        data: {
          userId,
          amount,
          charge,
          postBalance: new Decimal(updatedUser!.balance.toString()),
          trxType: '-',
          trx,
          details: `Withdrawal via ${method.name}`,
          remark: 'withdraw',
        },
      });

      return withdrawal;
    });
  }

  async getUserWithdrawals(userId: number) {
    return this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin
  async findAll(filters?: { status?: number; userId?: number }) {
    const where: any = {};
    if (filters?.status !== undefined) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;

    return this.prisma.withdrawal.findMany({
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
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
    });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');
    if (withdrawal.status !== 2)
      throw new BadRequestException('Already processed');

    return this.prisma.withdrawal.update({
      where: { id },
      data: { status: 1 },
    });
  }

  async reject(id: number, feedback?: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');
    if (withdrawal.status !== 2)
      throw new BadRequestException('Already processed');

    return this.prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id },
        data: { status: 3, adminFeedback: feedback },
      });
      // Refund
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: { balance: { increment: withdrawal.amount } },
      });

      const user = await tx.user.findUnique({
        where: { id: withdrawal.userId },
      });
      await tx.transaction.create({
        data: {
          userId: withdrawal.userId,
          amount: withdrawal.amount,
          charge: 0,
          postBalance: new Decimal(user!.balance.toString()),
          trxType: '+',
          trx: withdrawal.trx || '',
          details: `Withdrawal refund`,
          remark: 'withdraw_reject',
        },
      });

      return { message: 'Withdrawal rejected and refunded' };
    });
  }
}
