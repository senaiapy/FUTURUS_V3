import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BaseGatewayService,
  GatewayConfig,
  DepositResult,
  WebhookResult,
} from '../common/gateway/base-gateway.service';
import { Decimal } from 'decimal.js';

// Stripe SDK types
interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_status: string;
  metadata?: any;
}

interface StripeEvent {
  type: string;
  data: {
    object: any;
  };
}

@Injectable()
export class StripeService extends BaseGatewayService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: any; // Will be initialized in getConfig

  async getConfig(methodCode = 202): Promise<GatewayConfig> {
    const gateway = await this.prisma.gatewayCurrency.findFirst({
      where: { methodCode },
      include: { gateway: true },
    });

    if (!gateway || !gateway.gatewayParameter) {
      throw new Error('Stripe gateway not configured');
    }

    const params = JSON.parse(gateway.gatewayParameter);

    // Dynamically import Stripe
    if (!this.stripe) {
      const Stripe = (await import('stripe')).default;
      this.stripe = new Stripe(params.secret_key, {
        apiVersion: '2024-12-18.acacia' as any,
      });
    }

    return {
      publishableKey: params.publishable_key,
      secretKey: params.secret_key,
      gateway,
    };
  }

  async processDeposit(
    userId: number,
    dto: { amount: number },
  ): Promise<DepositResult> {
    try {
      const config = await this.getConfig();
      const trx = this.generateTrx();

      // Create Stripe Checkout Session
      const session: StripeCheckoutSession =
        await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Account Deposit',
                  description: `Deposit to wallet - ${trx}`,
                },
                unit_amount: Math.round(dto.amount * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/deposit/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/deposit/cancel`,
          metadata: {
            userId: userId.toString(),
            trx,
          },
        });

      // Save deposit record
      const deposit = await this.prisma.deposit.create({
        data: {
          userId,
          methodCode: 202,
          amount: new Decimal(dto.amount),
          trx,
          status: 0, // Initiated
          detail: JSON.stringify({ sessionId: session.id }),
        },
      });

      this.logger.log(
        `Stripe session created: ${session.id} for user ${userId}`,
      );

      return {
        depositId: deposit.id,
        trx,
        success: true,
        message: 'Stripe checkout session created',
        sessionId: session.id,
        sessionUrl: session.url,
      };
    } catch (error) {
      this.logger.error(`Stripe deposit error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleWebhook(body: any, signature: string): Promise<WebhookResult> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      // Verify webhook signature
      const event: StripeEvent = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );

      this.logger.log(`Stripe webhook received: ${event.type}`);

      // Handle checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as StripeCheckoutSession;

        if (session.payment_status === 'paid') {
          // Find deposit by sessionId
          const deposit = await this.prisma.deposit.findFirst({
            where: {
              detail: {
                contains: session.id,
              },
            },
          });

          if (!deposit) {
            this.logger.warn(`Deposit not found for session: ${session.id}`);
            return {
              success: false,
              message: 'Deposit not found',
            };
          }

          // Confirm deposit
          await this.confirmDeposit(deposit.id, deposit.amount);

          this.logger.log(
            `Deposit confirmed: ${deposit.trx} for $${deposit.amount}`,
          );
        }
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error(`Stripe webhook error: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Webhook processing failed',
      };
    }
  }

  async getDepositStatus(trx: string) {
    try {
      const deposit = await this.prisma.deposit.findFirst({
        where: { trx },
      });

      if (!deposit) {
        return {
          success: false,
          message: 'Deposit not found',
        };
      }

      return {
        success: true,
        data: {
          trx: deposit.trx,
          amount: deposit.amount,
          status: deposit.status,
          createdAt: deposit.createdAt,
        },
      };
    } catch (error) {
      this.logger.error(`Get deposit status error: ${error.message}`);
      return {
        success: false,
        message: 'Failed to get deposit status',
      };
    }
  }
}
