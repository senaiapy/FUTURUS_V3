import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketsService } from '../markets/markets.service';
import { Decimal } from 'decimal.js';
import * as crypto from 'crypto';

import { MarketsGateway } from '../markets/markets.gateway';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private marketsService: MarketsService,
    private marketsGateway: MarketsGateway,
  ) {}

  async placeTrade(
    userId: number,
    data: {
      marketId?: number;
      optionId: number;
      type: 'yes' | 'no';
      shares?: number;
      amount?: number;
    },
  ) {
    let { optionId, type, shares, amount } = data;

    // If shares not provided but amount is, calculate shares from current price
    if (!shares && amount) {
      const option = await this.prisma.marketOption.findUnique({
        where: { id: optionId },
      });

      if (option) {
        const totalPool = new Decimal(option.yesPool.toString()).plus(
          new Decimal(option.noPool.toString()),
        );
        const prob = totalPool.gt(0)
          ? type === 'yes'
            ? new Decimal(option.yesPool.toString()).div(totalPool)
            : new Decimal(option.noPool.toString()).div(totalPool)
          : new Decimal(0.5);

        const price = prob.lt(0.01) ? new Decimal(0.01) : prob;
        shares = new Decimal(amount.toString()).div(price).toNumber();
      } else {
        throw new BadRequestException('Option not found');
      }
    }

    if (!shares) {
      throw new BadRequestException('Shares or amount must be provided');
    }

    // 1. Get calculations
    const calcs = await this.marketsService.getCalculations(
      optionId,
      shares,
      type,
    );
    const calculatedAmount = new Decimal(calcs.totalAmount.toString());

    if (calculatedAmount.isZero()) {
      throw new BadRequestException('Invalid trade amount');
    }

    // 2. Validate amount if provided
    if (amount) {
      const providedAmount = new Decimal(amount.toString());
      const diff = providedAmount.minus(calculatedAmount).abs();

      if (diff.gt(0.01)) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid amount. Please refresh and try again.',
          expected: calculatedAmount.toNumber(),
        });
      }
    }

    const finalAmount = calculatedAmount;

    // 3. Atomic Transaction
    const purchase = await this.prisma.$transaction(async (tx) => {
      // Re-fetch user
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || new Decimal(user.balance.toString()).lt(finalAmount)) {
        throw new BadRequestException('Insufficient balance');
      }

      // Re-fetch option
      const option = await tx.marketOption.findUnique({
        where: { id: optionId },
        include: { market: true },
      });

      if (
        !option ||
        option.status !== 1 ||
        option.isLock ||
        option.market.isLock
      ) {
        throw new ForbiddenException('Market or option is currently locked');
      }

      const trx = 'TX' + crypto.randomBytes(8).toString('hex').toUpperCase();

      const sharePrice = new Decimal(
        (type === 'yes' ? calcs.yesSharePrice : calcs.noSharePrice).toString(),
      );
      const totalShare = finalAmount.div(sharePrice);
      const profit = new Decimal(
        (type === 'yes'
          ? calcs.yesProfitIfWin
          : calcs.noProfitIfWin
        ).toString(),
      );
      const winAmount = new Decimal(
        (type === 'yes'
          ? calcs.yesPayoutIfWin
          : calcs.noPayoutIfWin
        ).toString(),
      );

      // 1. Create Purchase
      const newPurchase = await tx.purchase.create({
        data: {
          userId,
          marketId: option.marketId,
          marketOptionId: option.id,
          type: type,
          totalShare: totalShare,
          pricePerShare: sharePrice,
          amount: finalAmount,
          profit: profit,
          winAmount: winAmount,
          status: 0, // WAITING
          trx: trx,
        },
      });

      // 2. Update User Balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: finalAmount },
          totalSharesBought: { increment: totalShare },
        },
      });

      // 3. Update Option Pool
      const updatedOption = await tx.marketOption.update({
        where: { id: optionId },
        data: {
          yesPool: type === 'yes' ? { increment: finalAmount } : undefined,
          noPool: type === 'no' ? { increment: finalAmount } : undefined,
        },
      });

      const yesP = new Decimal(updatedOption.yesPool.toString());
      const noP = new Decimal(updatedOption.noPool.toString());
      const totalPool = yesP.plus(noP);
      const newChance = totalPool.gt(0)
        ? yesP.div(totalPool).times(100)
        : new Decimal(50);

      await tx.marketOption.update({
        where: { id: optionId },
        data: { chance: newChance },
      });

      // 4. Create Trend record
      await tx.marketTrend.create({
        data: {
          marketId: option.marketId,
          marketOptionId: option.id,
          chance: newChance,
        },
      });

      // 5. Update Market volume (if single)
      if (option.market.type === 1) {
        await tx.market.update({
          where: { id: option.marketId },
          data: {
            volume: totalPool,
            yesShare: newChance,
            noShare: new Decimal(100).minus(newChance),
          },
        });
      }

      // 6. Create Transaction Log
      await tx.transaction.create({
        data: {
          userId,
          amount: finalAmount,
          postBalance: new Decimal(user.balance.toString()).minus(finalAmount),
          charge: 0,
          trxType: '-',
          details: `Purchase ${type} share in ${option.market.question}`,
          remark: 'purchase_share',
          trx: trx,
        },
      });

      return newPurchase;
    });

    // 7. Success! Emit update via WebSocket
    try {
      const market = await this.prisma.market.findUnique({
        where: { id: purchase.marketId },
        include: {
          category: true,
          options: true,
          _count: { select: { purchases: true } },
        },
      });
      if (market) {
        this.marketsGateway.emitMarketUpdate(market);
      }
    } catch (e) {
      console.error('Failed to emit market update', e);
    }

    return purchase;
  }

  async getHistory(userId: number, params?: any) {
    const page = parseInt(params?.page || '1');
    const limit = parseInt(params?.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = { userId };

    // Apply status filter if provided
    if (params?.status) {
      const statusMap: any = {
        PENDING: [0, 1], // WAITING, PENDING
        CONFIRMED: [2], // CONFIRMED
        WON: [3], // WIN
        LOST: [4], // LOST
        CANCELLED: [5], // CANCELLED
      };

      if (statusMap[params.status]) {
        where.status = { in: statusMap[params.status] };
      }
    }

    // Apply market filter if provided
    if (params?.market_id) {
      where.marketId = parseInt(params.market_id);
    }

    const [data, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        include: {
          market: true,
          marketOption: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.purchase.count({ where }),
    ]);

    const purchases = data.map((purchase) => ({
      id: String(purchase.id),
      market: {
        id: String(purchase.market.id),
        title: purchase.market.question,
        slug: purchase.market.slug,
      },
      outcome: purchase.marketOption
        ? {
            id: String(purchase.marketOption.id),
            title: purchase.marketOption.question,
            market: {
              id: String(purchase.market.id),
              title: purchase.market.question,
              slug: purchase.market.slug,
            },
          }
        : null,
      type: purchase.type.toUpperCase(),
      shares: String(purchase.totalShare),
      price: String(purchase.pricePerShare),
      amount: String(purchase.amount),
      profit: String(purchase.profit),
      winAmount: String(purchase.winAmount),
      status: this.getPurchaseStatus(purchase.status),
      trx: purchase.trx,
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt.toISOString(),
    }));

    return {
      success: true,
      message: 'Success',
      data: {
        data: purchases,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getPositions(userId: number, params?: any) {
    const page = parseInt(params?.page || '1');
    const limit = parseInt(params?.limit || '20');
    const skip = (page - 1) * limit;

    const where = {
      userId,
      status: { in: [0, 1] }, // WAITING, PENDING
    };

    const [data, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        include: {
          market: true,
          marketOption: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.purchase.count({ where }),
    ]);

    const positions = data.map((purchase) => {
      let optionPrice = 0.5; // default
      if (purchase.marketOption) {
        const yesPool = new Decimal(purchase.marketOption.yesPool.toString());
        const noPool = new Decimal(purchase.marketOption.noPool.toString());
        const totalPool = yesPool.plus(noPool);

        if (totalPool.gt(0)) {
          optionPrice =
            purchase.type === 'yes'
              ? yesPool.div(totalPool).toNumber()
              : noPool.div(totalPool).toNumber();
        }
      }

      return {
        id: String(purchase.id),
        shares: String(purchase.totalShare),
        price: String(purchase.pricePerShare),
        amount: String(purchase.amount),
        outcome: purchase.marketOption
          ? {
              id: String(purchase.marketOption.id),
              title: purchase.marketOption.question,
              probability: Number(purchase.marketOption.chance || 0) / 100,
              price: String(optionPrice),
            }
          : null,
        market: {
          id: String(purchase.market.id),
          title: purchase.market.question,
          slug: purchase.market.slug,
          endDate: purchase.market.endDate?.toISOString(),
        },
      };
    });

    return {
      success: true,
      message: 'Success',
      data: {
        data: positions,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  private getPurchaseStatus(status: number): string {
    const statusMap: any = {
      0: 'PENDING', // WAITING
      1: 'PENDING',
      2: 'CONFIRMED',
      3: 'WON',
      4: 'LOST',
      5: 'CANCELLED',
    };
    return statusMap[status] || 'UNKNOWN';
  }
}
