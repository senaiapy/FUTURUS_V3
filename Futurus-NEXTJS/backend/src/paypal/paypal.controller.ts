import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { PaypalDepositDto } from './dto/paypal-deposit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Get('methods')
  @UseGuards(JwtAuthGuard)
  async getMethods() {
    const config = await this.paypalService.getConfig();
    return {
      success: true,
      data: {
        name: 'PayPal',
        code: 201,
        mode: config.mode,
        available: !!config.clientId && !!config.clientSecret,
      },
    };
  }

  @Post('deposit/create')
  @UseGuards(JwtAuthGuard)
  async createDeposit(@Req() req: any, @Body() dto: PaypalDepositDto) {
    const userId = req.user.id;
    return this.paypalService.processDeposit(userId, dto);
  }

  @Post('deposit/capture/:orderId')
  @UseGuards(JwtAuthGuard)
  async captureDeposit(@Param('orderId') orderId: string) {
    return this.paypalService.captureOrder(orderId);
  }

  @Get('deposit/status/:trx')
  @UseGuards(JwtAuthGuard)
  async getDepositStatus(@Param('trx') trx: string) {
    return this.paypalService.getDepositStatus(trx);
  }

  @Post('ipn')
  async webhook(@Body() body: any, @Headers() headers: any) {
    // In production, verify webhook signature using PayPal's webhook verification
    // For now, we'll process the webhook data
    return this.paypalService.handleWebhook(body);
  }
}
