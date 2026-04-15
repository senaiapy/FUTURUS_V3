import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import type { User } from '@prisma/client';

/**
 * Bets Controller - Alias for Purchases endpoints
 * This provides compatibility with mobile app that uses /bets/* routes
 */
@Controller('bets')
@UseGuards(JwtAuthGuard)
export class BetsController {
  constructor(private purchasesService: PurchasesService) {}

  @Post('buy')
  async buyShares(
    @GetUser() user: User,
    @Body()
    body: {
      marketId?: number;
      market_id?: number;
      outcomeId?: number;
      option_id?: number;
      buyOption?: 'yes' | 'no';
      buy_option?: 'yes' | 'no';
      shares?: number;
      amount: number;
    },
  ) {
    // Normalize field names (support both camelCase and snake_case)
    const marketId = body.marketId || body.market_id;
    const optionId = body.outcomeId || body.option_id;
    const buyOption = body.buyOption || body.buy_option;
    const shares = body.shares;
    const amount = body.amount;

    if (!optionId) {
      throw new Error('optionId or option_id is required');
    }

    return this.purchasesService.placeTrade(user.id, {
      marketId,
      optionId,
      type: buyOption as 'yes' | 'no',
      shares,
      amount,
    });
  }

  @Get('my-bets')
  async getMyBets(
    @GetUser() user: User,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.purchasesService.getHistory(user.id, {
      status,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get('my-positions')
  async getMyPositions(
    @GetUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.purchasesService.getPositions(user.id, {
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }
}
