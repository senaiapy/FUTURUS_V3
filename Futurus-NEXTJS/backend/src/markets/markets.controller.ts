import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Body,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: number,
    @Query('subcategoryId') subcategoryId?: number,
    @Query('sortBy') sortBy?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    // Mobile app sends these params:
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('isFeatured') isFeatured?: string,
  ) {
    // Support both mobile (page/limit) and existing (skip/take) params
    const effectiveTake = take ? +take : limit ? +limit : 24;
    const effectiveSkip = skip ? +skip : page ? (+page - 1) * effectiveTake : 0;

    let effectiveCategoryId = categoryId ? +categoryId : undefined;
    if (!effectiveCategoryId && category) {
      effectiveCategoryId = undefined;
    }

    let effectiveSortBy = sortBy;
    if (isFeatured === 'true' || isFeatured === '1') {
      effectiveSortBy = 'trending';
    }

    const result = await this.marketsService.findAll({
      categoryId: effectiveCategoryId,
      subcategoryId: subcategoryId ? +subcategoryId : undefined,
      sortBy: effectiveSortBy,
      search:
        search || (category && !effectiveCategoryId ? category : undefined),
      skip: effectiveSkip,
      take: effectiveTake,
    });

    const currentPage = page
      ? +page
      : Math.floor(effectiveSkip / effectiveTake) + 1;
    const transformedMarkets = result.markets.map((m) =>
      this.transformMarket(m),
    );

    return {
      data: transformedMarkets,
      markets: transformedMarkets, // Alias for web frontend
      meta: {
        total: result.total,
        page: currentPage,
        limit: effectiveTake,
        totalPages: Math.ceil(result.total / effectiveTake),
      },
    };
  }

  @Get('trending')
  async getTrending(@Query('take') take?: number) {
    const result = await this.marketsService.findAll({
      sortBy: 'trending',
      take: take ? +take : 10,
    });

    const transformedMarkets = result.markets.map((m) =>
      this.transformMarket(m),
    );
    return {
      markets: transformedMarkets,
      data: transformedMarkets,
      total: result.total,
    };
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const market = await this.marketsService.findOneBySlug(slug);
    return this.transformMarket(market);
  }

  @Get('calculations/:optionId')
  async getCalculations(
    @Param('optionId', ParseIntPipe) optionId: number,
    @Query('shares') shares?: number,
    @Query('type') type?: 'yes' | 'no',
  ) {
    return this.marketsService.getCalculations(
      optionId,
      shares ? +shares : 0,
      type,
    );
  }

  @Get(':id/trends')
  async getMarketTrends(@Param('id', ParseIntPipe) marketId: number) {
    return this.marketsService.getMarketTrends(marketId);
  }

  @Get('bookmarks/my-bookmarks')
  @UseGuards(JwtAuthGuard)
  async getUserBookmarks(
    @GetUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.marketsService.getUserBookmarks(
      user.id,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  async toggleBookmark(
    @GetUser() user: any,
    @Param('id', ParseIntPipe) marketId: number,
  ) {
    return this.marketsService.toggleBookmark(user.id, marketId);
  }

  private transformMarket(m: any) {
    return {
      // Base fields
      id: m.id.toString(),
      slug: m.slug || '',
      description: m.description || '',
      status: this.mapStatus(m.status),
      createdAt: m.createdAt.toISOString(),
      endDate: m.endDate ? m.endDate.toISOString() : new Date().toISOString(),

      // Web frontend expects these:
      question: m.question || '',
      image: m.image || null,
      yesShare: parseFloat(m.yesShare?.toString() || '50'),
      noShare: parseFloat(m.noShare?.toString() || '50'),
      volume: m.volume?.toString() || '0',
      _count: m._count,
      category: m.category,

      // Mobile app expects these:
      title: m.question || '',
      imageUrl: m.image || null,
      marketCategory: this.mapCategory(m.category?.name),
      totalVolume: m.volume?.toString() || '0',
      liquidityPool: m.volume?.toString() || '0',
      outcomes: (m.options || []).map((o: any) => ({
        id: o.id.toString(),
        title: o.question || 'Yes',
        probability: parseFloat(o.chance?.toString() || '50'),
        price: o.chance?.div(100)?.toString() || '0.50',
        totalShares: o.yesPool?.plus(o.noPool)?.toString() || '0',
        isWinner: o.isWinner,
      })),
      createdById: '',
    };
  }

  private mapCategory(name?: string): string {
    if (!name) return 'OTHER';
    const upper = name.toUpperCase();
    const validCategories = [
      'POLITICS',
      'SPORTS',
      'CRYPTO',
      'ENTERTAINMENT',
      'ECONOMY',
      'TECHNOLOGY',
      'OTHER',
    ];
    return validCategories.includes(upper) ? upper : 'OTHER';
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
