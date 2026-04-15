import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { BetsService } from './bets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('bets')
@UseGuards(JwtAuthGuard)
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post('buy')
  async placeBet(
    @GetUser() user: any,
    @Body()
    body: {
      market_id: number;
      option_id: number;
      buy_option: 'yes' | 'no';
      amount: number;
      shares: number;
    },
  ) {
    return this.betsService.placeBet(user.id, body);
  }

  @Get('my-bets')
  async getMyBets(
    @GetUser() user: any,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.betsService.getMyBets(user.id, {
      status,
      limit: limit ? +limit : 20,
      page: page ? +page : 1,
    });
  }

  @Get('my-positions')
  async getMyPositions(
    @GetUser() user: any,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.betsService.getMyPositions(user.id, {
      limit: limit ? +limit : 20,
      page: page ? +page : 1,
    });
  }
}
