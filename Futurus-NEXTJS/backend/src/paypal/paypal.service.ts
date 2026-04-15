import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseGatewayService } from '../common/gateway/base-gateway.service';
import { Decimal } from 'decimal.js';

interface PaypalConfig {
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live';
  apiUrl: string;
  gateway: any;
}

@Injectable()
export class PaypalService extends BaseGatewayService {
  private readonly logger = new Logger(PaypalService.name);

  async getConfig(methodCode = 201): Promise<PaypalConfig> {
    const gateway = await this.prisma.gatewayCurrency.findFirst({
      where: { methodCode },
      include: { gateway: true },
    });

    if (!gateway) {
      throw new BadRequestException('PayPal gateway not configured');
    }

    const params = JSON.parse(gateway.gatewayParameter || '{}');

    return {
      clientId: params.client_id || process.env.PAYPAL_CLIENT_ID,
      clientSecret: params.client_secret || process.env.PAYPAL_CLIENT_SECRET,
      mode: params.mode || 'sandbox',
      apiUrl:
        params.mode === 'live'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com',
      gateway,
    };
  }

  async processDeposit(userId: number, data: { amount: number }) {
    const config = await this.getConfig();
    const trx = this.generateTrx();

    try {
      // Get PayPal access token
      const authResponse = await fetch(`${config.apiUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!authResponse.ok) {
        throw new Error('Failed to authenticate with PayPal');
      }

      const authData = await authResponse.json();
      const accessToken = authData.access_token;

      // Create PayPal order
      const orderResponse = await fetch(`${config.apiUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: trx,
              amount: {
                currency_code: 'USD',
                value: data.amount.toFixed(2),
              },
              description: 'Account Deposit - Futurus Platform',
            },
          ],
          application_context: {
            brand_name: 'Futurus',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: `${process.env.FRONTEND_URL}/dashboard/deposit/success?trx=${trx}`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/deposit/cancel`,
          },
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        this.logger.error('PayPal order creation failed:', errorData);
        throw new Error('Failed to create PayPal order');
      }

      const order = await orderResponse.json();

      // Save deposit record
      const deposit = await this.prisma.deposit.create({
        data: {
          userId,
          methodCode: 201,
          amount: new Decimal(data.amount),
          trx,
          status: 0, // Initiated
          detail: JSON.stringify({
            orderId: order.id,
            paypalOrderData: order,
          }),
        },
      });

      // Get approval URL
      const approvalUrl = order.links.find(
        (link: any) => link.rel === 'approve',
      )?.href;

      return {
        depositId: deposit.id,
        trx,
        success: true,
        message: 'PayPal order created successfully',
        orderId: order.id,
        approvalUrl,
      };
    } catch (error) {
      this.logger.error('PayPal deposit error:', error);
      throw new BadRequestException(
        error.message || 'Failed to process PayPal deposit',
      );
    }
  }

  async captureOrder(orderId: string) {
    const config = await this.getConfig();

    try {
      // Get access token
      const authResponse = await fetch(`${config.apiUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });

      const authData = await authResponse.json();
      const accessToken = authData.access_token;

      // Capture the order
      const captureResponse = await fetch(
        `${config.apiUrl}/v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const result = await captureResponse.json();

      if (result.status === 'COMPLETED') {
        // Find deposit by orderId
        const deposit = await this.prisma.deposit.findFirst({
          where: {
            detail: {
              contains: orderId,
            },
          },
        });

        if (deposit) {
          await this.confirmDeposit(deposit.id, deposit.amount);
          this.logger.log(
            `PayPal order ${orderId} captured successfully for deposit ${deposit.id}`,
          );
        }

        return {
          success: true,
          message: 'Payment captured successfully',
          data: result,
        };
      }

      return {
        success: false,
        message: 'Payment not completed',
        data: result,
      };
    } catch (error) {
      this.logger.error('PayPal capture error:', error);
      throw new BadRequestException('Failed to capture PayPal payment');
    }
  }

  async handleWebhook(data: any) {
    try {
      this.logger.log('PayPal webhook received:', data.event_type);

      // Handle different webhook events
      if (data.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const captureId = data.resource.id;
        const orderId = data.resource.supplementary_data?.related_ids?.order_id;

        if (orderId) {
          await this.captureOrder(orderId);
        }

        return {
          success: true,
          message: 'Webhook processed successfully',
        };
      }

      if (data.event_type === 'PAYMENT.CAPTURE.DENIED') {
        const orderId = data.resource.supplementary_data?.related_ids?.order_id;

        if (orderId) {
          const deposit = await this.prisma.deposit.findFirst({
            where: { detail: { contains: orderId } },
          });

          if (deposit) {
            await this.cancelDeposit(deposit.id, 'Payment denied by PayPal');
          }
        }
      }

      return {
        success: true,
        message: 'Webhook acknowledged',
      };
    } catch (error) {
      this.logger.error('PayPal webhook error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getDepositStatus(trx: string) {
    const deposit = await this.getDepositByTrx(trx);

    if (!deposit) {
      throw new BadRequestException('Deposit not found');
    }

    const detail = JSON.parse(deposit.detail || '{}');

    return {
      success: true,
      data: {
        depositId: deposit.id,
        trx: deposit.trx,
        amount: deposit.amount,
        status: deposit.status,
        statusText:
          deposit.status === 0
            ? 'Pending'
            : deposit.status === 1
              ? 'Completed'
              : 'Cancelled',
        orderId: detail.orderId,
        createdAt: deposit.createdAt,
      },
    };
  }
}
