import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  // Cryptocurrency wallet addresses - configurable via environment variables
  private readonly usdcWalletAddress = process.env.USDC_WALLET_ADDRESS || '';
  private readonly usdtWalletAddress = process.env.USDT_WALLET_ADDRESS || '';

  constructor(private prisma: PrismaService) {}

  async getBalance(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        totalSharesBought: true,
        totalProfit: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const balance = parseFloat(user.balance.toString());
    const totalInvested = parseFloat(user.totalSharesBought.toString());
    const totalWinning = parseFloat(user.totalProfit.toString());

    return {
      balance,
      balanceBonus: 0,
      balanceTotal: balance,
      totalSharesBought: totalInvested,
      totalInvested,
      totalWinning,
      referralEarnings: 0,
    };
  }

  async createDeposit(
    userId: number,
    data: { amount: number; paymentMethod: string },
  ) {
    if (!data.amount || data.amount <= 0) {
      throw new BadRequestException('Invalid deposit amount');
    }

    const trx = 'DEP' + crypto.randomBytes(8).toString('hex').toUpperCase();

    let methodCode = 1;
    if (data.paymentMethod === 'PIX') methodCode = 1;
    else if (data.paymentMethod === 'USDC') methodCode = 2;

    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        methodCode,
        amount: data.amount,
        charge: 0,
        rate: 1,
        finalAmount: data.amount,
        trx,
        status: 2,
      },
    });

    return {
      transactionId: deposit.id.toString(),
      amount: data.amount,
      status: 'PENDING',
      pixCode: data.paymentMethod === 'PIX' ? trx : undefined,
      pixQrCode: data.paymentMethod === 'PIX' ? `pix://${trx}` : undefined,
      walletAddress:
        data.paymentMethod === 'USDC' ? this.usdcWalletAddress : undefined,
    };
  }

  async createWithdrawal(
    userId: number,
    data: {
      method: string;
      amount: number;
      pixKey?: string;
      walletAddress?: string;
    },
  ) {
    if (!data.amount || data.amount <= 0) {
      throw new BadRequestException('Invalid withdrawal amount');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || new Decimal(user.balance.toString()).lt(data.amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    let methodId = 1;
    const methods = await this.prisma.withdrawMethod.findMany({
      where: { status: 1 },
    });
    if (methods.length > 0) {
      const found = methods.find(
        (m: any) => m.name?.toLowerCase() === data.method?.toLowerCase(),
      );
      methodId = found ? found.id : methods[0].id;
    }

    const method = await this.prisma.withdrawMethod.findUnique({
      where: { id: methodId },
    });

    const amount = new Decimal(data.amount);
    const charge = method
      ? new Decimal(method.fixedCharge.toString()).plus(
          amount.times(new Decimal(method.percentCharge.toString()).div(100)),
        )
      : new Decimal(0);
    const afterCharge = amount.minus(charge);
    const rate = method ? new Decimal(method.rate.toString()) : new Decimal(1);
    const finalAmount = afterCharge.times(rate);
    const trx = 'WD' + crypto.randomBytes(8).toString('hex').toUpperCase();

    const withdrawal = await this.prisma.$transaction(async (tx: any) => {
      const wd = await tx.withdrawal.create({
        data: {
          userId,
          methodId,
          amount,
          currency: method?.currency || 'USD',
          rate,
          charge,
          trx,
          finalAmount,
          afterCharge,
          withdrawInformation: JSON.stringify({
            pixKey: data.pixKey,
            walletAddress: data.walletAddress,
          }),
          status: 2,
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
          details: `Withdrawal via ${data.method}`,
          remark: 'withdraw',
        },
      });

      return wd;
    });

    return {
      id: withdrawal.id.toString(),
      amount: withdrawal.amount.toString(),
      fee: charge.toString(),
      finalAmount: finalAmount.toString(),
      pixKey: data.pixKey,
      status: 'PENDING',
      trx,
      createdAt: withdrawal.createdAt.toISOString(),
    };
  }

  async getTransactions(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions.map((t: any) => ({
        id: t.id.toString(),
        type: t.trxType === '+' ? 'CREDIT' : 'DEBIT',
        amount: t.amount.toString(),
        status: 'COMPLETED',
        description: t.details || '',
        createdAt: t.createdAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDepositMethods() {
    const methods = await this.prisma.gateway.findMany({
      where: { status: 1 },
      include: {
        currencies: {
          where: {
            name: { not: null },
            minAmount: { gt: 0 },
          },
        },
      },
    });

    return methods.map((g: any) => ({
      id: g.id,
      code: g.code,
      name: g.name || g.alias || 'Unknown',
      alias: g.alias,
      type: g.crypto === 1 ? 'CRYPTO' : 'FIAT',
      status: g.status === 1 ? 'ACTIVE' : 'INACTIVE',
      description: g.description,
      currencies: g.currencies.map((c: any) => ({
        id: c.id,
        name: c.name,
        currency: c.currency,
        symbol: c.symbol,
        minAmount: c.minAmount?.toString() || '0',
        maxAmount: c.maxAmount?.toString() || '0',
        percentCharge: c.percentCharge?.toString() || '0',
        fixedCharge: c.fixedCharge?.toString() || '0',
        rate: c.rate?.toString() || '1',
        image: c.image,
      })),
    }));
  }

  async confirmDeposit(depositId: number, status: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    if (deposit.status === 1) {
      return { success: true, message: 'Deposit already confirmed' };
    }

    const newStatus = status === 'success' ? 1 : 3;

    await this.prisma.$transaction(async (tx: any) => {
      await tx.deposit.update({
        where: { id: depositId },
        data: { status: newStatus },
      });

      if (status === 'success') {
        await tx.user.update({
          where: { id: deposit.userId },
          data: { balance: { increment: deposit.finalAmount } },
        });

        const updatedUser = await tx.user.findUnique({
          where: { id: deposit.userId },
        });
        await tx.transaction.create({
          data: {
            userId: deposit.userId,
            amount: deposit.finalAmount,
            charge: deposit.charge,
            postBalance: new Decimal(updatedUser!.balance.toString()),
            trxType: '+',
            trx: deposit.trx,
            details: 'Deposit confirmed',
            remark: 'deposit',
          },
        });
      }
    });

    return {
      success: true,
      message:
        status === 'success'
          ? 'Deposit confirmed successfully'
          : 'Deposit cancelled',
    };
  }

  async getWithdrawMethods() {
    const methods = await this.prisma.withdrawMethod.findMany({
      where: { status: 1 },
    });

    return methods.map((m: any) => ({
      id: m.id,
      name: m.name,
      minLimit: m.minLimit?.toString() || '0',
      maxLimit: m.maxLimit?.toString() || '0',
      fixedCharge: m.fixedCharge?.toString() || '0',
      percentCharge: m.percentCharge?.toString() || '0',
      rate: m.rate?.toString() || '1',
      currency: m.currency || 'USD',
      description: m.description,
      status: m.status === 1 ? 'ACTIVE' : 'INACTIVE',
    }));
  }
}
