import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getBalance(@GetUser() user: any) {
    return this.walletService.getBalance(user.id);
  }

  @Get('deposit-methods')
  async getDepositMethods() {
    return this.walletService.getDepositMethods();
  }

  @Post('deposit')
  async deposit(
    @GetUser() user: any,
    @Body() body: { amount: number; paymentMethod: string },
  ) {
    return this.walletService.createDeposit(user.id, body);
  }

  @Post('deposit/confirm')
  async confirmDeposit(@Body() body: { depositId: number; status: string }) {
    return this.walletService.confirmDeposit(body.depositId, body.status);
  }

  @Get('withdraw-methods')
  async getWithdrawMethods() {
    return this.walletService.getWithdrawMethods();
  }

  @Post('withdraw')
  async withdraw(
    @GetUser() user: any,
    @Body()
    body: {
      method: string;
      amount: number;
      pixKey?: string;
      walletAddress?: string;
    },
  ) {
    return this.walletService.createWithdrawal(user.id, body);
  }

  @Get('transactions')
  async getTransactions(
    @GetUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getTransactions(
      user.id,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }
}
