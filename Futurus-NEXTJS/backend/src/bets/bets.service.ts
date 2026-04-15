import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketsService } from '../markets/markets.service';
import { Decimal } from 'decimal.js';
import * as crypto from 'crypto';

@Injectable()
export class BetsService {
  constructor(
    private prisma: PrismaService,
    private marketsService: MarketsService,
  ) {}

  async placeBet(
    userId: number,
    data: {
      market_id: number;
      option_id: number;
      buy_option: 'yes' | 'no';
      amount: number;
      shares: number;
    },
  ) {
    const { option_id, buy_option, amount } = data;
    const shares = data.shares || amount;

    // 1. Get calculations
    const calcs = await this.marketsService.getCalculations(
      option_id,
      shares,
      buy_option,
    );
    const betAmount = new Decimal(calcs.totalAmount.toString());

    if (betAmount.isZero()) {
      throw new BadRequestException('Invalid trade amount');
    }

    // 2. Atomic Transaction
    const purchase = await this.prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || new Decimal(user.balance.toString()).lt(betAmount)) {
        throw new BadRequestException('Insufficient balance');
      }

      const option = await tx.marketOption.findUnique({
        where: { id: option_id },
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
        (buy_option === 'yes'
          ? calcs.yesSharePrice
          : calcs.noSharePrice
        ).toString(),
      );
      const totalShare = betAmount.div(sharePrice);
      const profit = new Decimal(
        (buy_option === 'yes'
          ? calcs.yesProfitIfWin
          : calcs.noProfitIfWin
        ).toString(),
      );
      const winAmount = new Decimal(
        (buy_option === 'yes'
          ? calcs.yesPayoutIfWin
          : calcs.noPayoutIfWin
        ).toString(),
      );

      // Create Purchase
      const newPurchase = await tx.purchase.create({
        data: {
          userId,
          marketId: option.marketId,
          marketOptionId: option.id,
          type: buy_option,
          totalShare,
          pricePerShare: sharePrice,
          amount: betAmount,
          profit,
          winAmount,
          status: 0,
          trx,
        },
      });

      // Update User Balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: betAmount },
          totalSharesBought: { increment: totalShare },
        },
      });

      // Update Option Pool
      const updatedOption = await tx.marketOption.update({
        where: { id: option_id },
        data: {
          yesPool: buy_option === 'yes' ? { increment: betAmount } : undefined,
          noPool: buy_option === 'no' ? { increment: betAmount } : undefined,
        },
      });

      const yesP = new Decimal(updatedOption.yesPool.toString());
      const noP = new Decimal(updatedOption.noPool.toString());
      const totalPool = yesP.plus(noP);
      const newChance = totalPool.gt(0)
        ? yesP.div(totalPool).times(100)
        : new Decimal(50);

      await tx.marketOption.update({
        where: { id: option_id },
        data: { chance: newChance },
      });

      // Create Trend
      await tx.marketTrend.create({
        data: {
          marketId: option.marketId,
          marketOptionId: option.id,
          chance: newChance,
        },
      });

      // Update Market volume (if single)
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

      // Transaction Log
      await tx.transaction.create({
        data: {
          userId,
          amount: betAmount,
          postBalance: new Decimal(user.balance.toString()).minus(betAmount),
          charge: 0,
          trxType: '-',
          details: `Purchase ${buy_option} share in ${option.market.question}`,
          remark: 'purchase_share',
          trx,
        },
      });

      const updatedUser = await tx.user.findUnique({ where: { id: userId } });

      return {
        bet: {
          id: newPurchase.id.toString(),
          amount: parseFloat(betAmount.toString()),
          shares: parseFloat(totalShare.toString()),
          price: parseFloat(sharePrice.toString()),
          type: 'BUY',
          status: 'PENDING',
          txHash: trx,
          createdAt: newPurchase.createdAt.toISOString(),
          updatedAt: newPurchase.updatedAt.toISOString(),
          outcome: {
            id: option.id.toString(),
            title: option.question || '',
            price: parseFloat(sharePrice.toString()),
            probability: parseFloat(newChance.toString()),
            market: {
              id: option.market.id.toString(),
              title: option.market.question || '',
              slug: option.market.slug || '',
              status: option.market.status === 1 ? 'OPEN' : 'CLOSED',
            },
          },
        },
        shares: parseFloat(totalShare.toString()),
        price: parseFloat(sharePrice.toString()),
        fee: 0,
        newBalance: updatedUser
          ? parseFloat(updatedUser.balance.toString())
          : 0,
      };
    });

    return purchase;
  }

  async getMyBets(
    userId: number,
    params: { status?: string; limit: number; page: number },
  ) {
    const skip = (params.page - 1) * params.limit;

    const where: any = { userId };
    if (params.status) {
      const statusMap: Record<string, number> = {
        PENDING: 0,
        ACTIVE: 1,
        WON: 2,
        LOST: 3,
      };
      if (statusMap[params.status.toUpperCase()] !== undefined) {
        where.status = statusMap[params.status.toUpperCase()];
      }
    }

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        include: {
          market: true,
          marketOption: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit,
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return {
      data: purchases.map((p: any) => ({
        id: p.id.toString(),
        amount: parseFloat(p.amount.toString()),
        shares: parseFloat(p.totalShare.toString()),
        price: parseFloat(p.pricePerShare.toString()),
        type: 'BUY',
        status:
          p.status === 0
            ? 'PENDING'
            : p.status === 1
              ? 'ACTIVE'
              : p.win
                ? 'WON'
                : 'LOST',
        txHash: p.trx,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        outcome: {
          id: p.marketOption.id.toString(),
          title: p.marketOption.question || '',
          price: parseFloat(p.pricePerShare.toString()),
          probability: parseFloat(p.marketOption.chance.toString()),
          market: {
            id: p.market.id.toString(),
            title: p.market.question || '',
            slug: p.market.slug || '',
            status: p.market.status === 1 ? 'OPEN' : 'CLOSED',
          },
        },
      })),
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getMyPositions(
    userId: number,
    params: { limit: number; page: number },
  ) {
    const skip = (params.page - 1) * params.limit;

    const purchases = await this.prisma.purchase.findMany({
      where: { userId },
      include: {
        market: true,
        marketOption: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const positionMap = new Map<
      number,
      {
        shares: Decimal;
        totalCost: Decimal;
        latestDate: Date;
        firstDate: Date;
        marketOption: any;
        market: any;
      }
    >();

    for (const p of purchases) {
      const key = p.marketOptionId;
      if (!positionMap.has(key)) {
        positionMap.set(key, {
          shares: new Decimal(0),
          totalCost: new Decimal(0),
          latestDate: p.updatedAt,
          firstDate: p.createdAt,
          marketOption: p.marketOption,
          market: p.market,
        });
      }
      const pos = positionMap.get(key)!;
      pos.shares = pos.shares.plus(p.totalShare);
      pos.totalCost = pos.totalCost.plus(p.amount);
      if (p.updatedAt > pos.latestDate) pos.latestDate = p.updatedAt;
    }

    const allPositions = Array.from(positionMap.entries())
      .filter(([, v]) => v.shares.gt(0))
      .map(([key, v]) => ({
        id: key.toString(),
        shares: parseFloat(v.shares.toString()),
        avgPrice: v.shares.gt(0)
          ? parseFloat(v.totalCost.div(v.shares).toString())
          : 0,
        createdAt: v.firstDate.toISOString(),
        updatedAt: v.latestDate.toISOString(),
        outcome: {
          id: v.marketOption.id.toString(),
          title: v.marketOption.question || '',
          price: parseFloat(v.marketOption.chance.div(100).toString()),
          probability: parseFloat(v.marketOption.chance.toString()),
          isWinner: v.marketOption.isWinner,
          market: {
            id: v.market.id.toString(),
            title: v.market.question || '',
            slug: v.market.slug || '',
            status: v.market.status === 1 ? 'OPEN' : 'CLOSED',
          },
        },
      }));

    const total = allPositions.length;
    const pagedPositions = allPositions.slice(skip, skip + params.limit);

    return {
      data: pagedPositions,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
