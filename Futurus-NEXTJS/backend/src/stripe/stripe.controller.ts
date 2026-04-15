import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeDepositDto } from './dto/stripe-deposit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('methods')
  @UseGuards(JwtAuthGuard)
  async getMethods() {
    const config = await this.stripeService.getConfig();
    return {
      success: true,
      data: {
        name: 'Stripe',
        code: 202,
        available: !!config.publishableKey && !!config.secretKey,
        publishableKey: config.publishableKey, // Needed for frontend
      },
    };
  }

  @Post('deposit/create-session')
  @UseGuards(JwtAuthGuard)
  async createSession(@Req() req: any, @Body() dto: StripeDepositDto) {
    const userId = req.user.id;
    return this.stripeService.processDeposit(userId, dto);
  }

  @Get('deposit/status/:trx')
  @UseGuards(JwtAuthGuard)
  async getDepositStatus(@Param('trx') trx: string) {
    return this.stripeService.getDepositStatus(trx);
  }

  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    // Stripe requires raw body for signature verification
    const body = req.rawBody || req.body;
    return this.stripeService.handleWebhook(body, signature);
  }
}
