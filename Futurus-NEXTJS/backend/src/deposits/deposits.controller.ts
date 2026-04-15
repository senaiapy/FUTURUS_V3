import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createDeposit(
    @GetUser() user: any,
    @Body() body: { amount: number; methodCode: number },
  ) {
    return this.depositsService.createDeposit(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getUserDeposits(
    @GetUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.depositsService.getUserDeposits(
      user.id,
      status ? +status : undefined,
    );
  }
}
