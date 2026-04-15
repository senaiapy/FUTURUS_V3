import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Get('methods')
  async getMethods() {
    return this.withdrawalsService.getMethods();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createWithdrawal(
    @GetUser() user: any,
    @Body() body: { methodId: number; amount: number },
  ) {
    return this.withdrawalsService.createWithdrawal(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getUserWithdrawals(@GetUser() user: any) {
    return this.withdrawalsService.getUserWithdrawals(user.id);
  }
}
