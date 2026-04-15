import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import type { User } from '@prisma/client';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Post()
  async placeTrade(
    @GetUser() user: User,
    @Body()
    body: {
      marketId?: number;
      optionId: number;
      type: 'yes' | 'no';
      shares?: number;
      amount?: number;
    },
  ) {
    return this.purchasesService.placeTrade(user.id, body);
  }

  @Get('history')
  async getHistory(
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

  @Get('positions')
  async getPositions(
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
