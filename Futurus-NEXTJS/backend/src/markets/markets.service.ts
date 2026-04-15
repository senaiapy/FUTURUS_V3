import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';

@Injectable()
export class MarketsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    categoryId?: number;
    subcategoryId?: number;
    sortBy?: string;
    search?: string;
    take?: number;
    skip?: number;
  }) {
    const {
      categoryId,
      subcategoryId,
      sortBy,
      search,
      take = 24,
      skip = 0,
    } = params;

    const where: any = { status: 1 }; // Only running/active markets

    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'trending') orderBy = { isTrending: 'desc' };
    else if (sortBy === 'start_date_asc') orderBy = { startDate: 'asc' };
    else if (sortBy === 'start_date_desc') orderBy = { startDate: 'desc' };
    else if (sortBy === 'end_date_asc') orderBy = { endDate: 'asc' };
    else if (sortBy === 'volume_asc') orderBy = { volume: 'asc' };
    else if (sortBy === 'volume_desc') orderBy = { volume: 'desc' };

    const [markets, total] = await Promise.all([
      this.prisma.market.findMany({
        where,
        orderBy,
        take,
        skip,
        include: {
          category: true,
          options: {
            where: { status: 1 },
          },
          _count: {
            select: { purchases: true },
          },
        },
      }),
      this.prisma.market.count({ where }),
    ]);

    return { markets, total };
  }

  async findOneBySlug(slug: string) {
    const market = await this.prisma.market.findFirst({
      where: { slug, status: 1 },
      include: {
        category: true,
        options: {
          where: { status: 1 },
        },
        comments: {
          where: { status: 1, parentId: 0 },
          include: {
            user: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!market) throw new NotFoundException('Market not found');
    return market;
  }

  async getCalculations(
    marketOptionId: number,
    shares: number = 0,
    selectedType?: 'yes' | 'no',
  ) {
    const option = await this.prisma.marketOption.findUnique({
      where: { id: marketOptionId },
      include: { market: true },
    });

    if (
      !option ||
      option.status !== 1 ||
      option.isLock ||
      option.market.isLock
    ) {
      return this.emptyCalculations(option);
    }

    const yesPool = new Decimal(option.yesPool.toString());
    const noPool = new Decimal(option.noPool.toString());
    const commission = new Decimal(option.commission.toString());
    const totalPool = yesPool.plus(noPool);

    if (totalPool.isZero()) {
      return {
        ...this.emptyCalculations(option),
        yesSharePrice: 1.0,
        noSharePrice: 1.0,
      };
    }

    const commissionAmount = totalPool.times(commission.div(100));
    const netPool = totalPool.minus(commissionAmount);

    const yesProbability = yesPool.div(totalPool);
    const noProbability = noPool.div(totalPool);

    const yesSharePrice = Decimal.max(0.01, yesProbability);
    const noSharePrice = Decimal.max(0.01, noProbability);

    let betAmount = new Decimal(0);
    if (shares > 0 && selectedType) {
      const sharePrice = selectedType === 'yes' ? yesSharePrice : noSharePrice;
      betAmount = new Decimal(shares).times(sharePrice);
    }

    let yesPotentialPayout = new Decimal(0);
    let noPotentialPayout = new Decimal(0);

    if (betAmount.gt(0)) {
      yesPotentialPayout = yesPool.gt(0)
        ? netPool.times(betAmount.div(yesPool))
        : new Decimal(0);
      noPotentialPayout = noPool.gt(0)
        ? netPool.times(betAmount.div(noPool))
        : new Decimal(0);
    }

    return {
      yesPool,
      noPool,
      totalPool,
      commissionRate: commission,
      commissionAmount,
      netPool,
      yesSharePrice,
      noSharePrice,
      yesPayoutIfWin: yesPotentialPayout,
      noPayoutIfWin: noPotentialPayout,
      yesProfitIfWin: yesPotentialPayout.minus(betAmount),
      noProfitIfWin: noPotentialPayout.minus(betAmount),
      totalAmount: betAmount,
      option,
    };
  }

  private emptyCalculations(option: any) {
    return {
      yesPool: 0,
      noPool: 0,
      totalPool: 0,
      commissionRate: 0,
      commissionAmount: 0,
      netPool: 0,
      yesSharePrice: 0,
      noSharePrice: 0,
      yesPayoutIfWin: 0,
      noPayoutIfWin: 0,
      yesProfitIfWin: 0,
      noProfitIfWin: 0,
      totalAmount: 0,
      option,
    };
  }

  async getMarketTrends(marketId: number) {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      include: { options: true },
    });

    if (!market) {
      throw new NotFoundException('Market not found');
    }

    const trends = await this.prisma.marketTrend.findMany({
      where: { marketId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: { option: true },
    });

    return {
      marketId: market.id,
      marketSlug: market.slug,
      trends: trends.map((t: any) => ({
        id: t.id,
        timestamp: t.createdAt.toISOString(),
        optionId: t.marketOptionId,
        optionName: t.option?.question || 'Yes',
        probability: parseFloat(t.chance?.toString() || '0'),
      })),
    };
  }

  async toggleBookmark(userId: number, marketId: number) {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
    });

    if (!market) {
      throw new NotFoundException('Market not found');
    }

    const existing = await this.prisma.marketBookmark.findFirst({
      where: { userId, marketId },
    });

    if (existing) {
      await this.prisma.marketBookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false, message: 'Bookmark removed' };
    }

    await this.prisma.marketBookmark.create({ data: { userId, marketId } });
    return { bookmarked: true, message: 'Bookmark added' };
  }

  async getUserBookmarks(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      this.prisma.marketBookmark.findMany({
        where: { userId },
        include: {
          market: {
            include: {
              category: true,
              options: { where: { status: 1 } },
              _count: { select: { purchases: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.marketBookmark.count({ where: { userId } }),
    ]);

    return {
      bookmarks: bookmarks.map((b: any) => this.transformBookmark(b)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private transformBookmark(b: any) {
    return {
      id: b.id,
      createdAt: b.createdAt.toISOString(),
      market: {
        id: b.market.id.toString(),
        slug: b.market.slug || '',
        title: b.market.question || '',
        description: b.market.description || '',
        imageUrl: b.market.image || null,
        status: this.mapStatus(b.market.status),
        endDate: b.market.endDate?.toISOString() || new Date().toISOString(),
        totalVolume: b.market.volume?.toString() || '0',
        category: b.market.category?.name || 'Other',
        outcomes: (b.market.options || []).map((o: any) => ({
          id: o.id.toString(),
          title: o.question || 'Yes',
          probability: parseFloat(o.chance?.toString() || '50'),
          price: o.chance?.div(100)?.toString() || '0.50',
        })),
      },
    };
  }

  private mapStatus(status: number): string {
    switch (status) {
      case 0:
        return 'DRAFT';
      case 1:
        return 'OPEN';
      case 2:
        return 'CLOSED';
      case 3:
        return 'RESOLVED';
      case 4:
        return 'CANCELLED';
      default:
        return 'OPEN';
    }
  }
}
