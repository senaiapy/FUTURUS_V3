import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from 'decimal.js';

export interface GatewayConfig {
  gateway: any;
  apiUrl?: string;
  [key: string]: any;
}

export interface DepositResult {
  depositId: number;
  trx: string;
  [key: string]: any;
}

export interface WebhookResult {
  success: boolean;
  message?: string;
  [key: string]: any;
}

@Injectable()
export abstract class BaseGatewayService {
  constructor(protected prisma: PrismaService) {}

  // Abstract methods that must be implemented by subclasses
  abstract getConfig(methodCode: number): Promise<GatewayConfig>;
  abstract processDeposit(userId: number, data: any): Promise<DepositResult>;
  abstract handleWebhook(data: any, ...args: any[]): Promise<WebhookResult>;

  // Shared implementation - Generate unique transaction ID
  generateTrx(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7).toUpperCase();
    return `TRX${timestamp}${random}`;
  }

  // Shared implementation - Confirm deposit and update user balance
  async confirmDeposit(depositId: number, amount: Decimal): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      // Update deposit status to success (1)
      const deposit = await tx.deposit.update({
        where: { id: depositId },
        data: { status: 1 },
      });

      // Update user balance
      await tx.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: amount } },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          amount,
          trx: deposit.trx,
          postBalance: new Decimal(0), // Will be calculated
          charge: new Decimal(0),
          trxType: '+',
          remark: 'deposit',
          details: `Deposit confirmed via ${deposit.methodCode}`,
        },
      });
    });
  }

  // Shared implementation - Cancel/reject deposit
  async cancelDeposit(depositId: number, reason?: string): Promise<void> {
    await this.prisma.deposit.update({
      where: { id: depositId },
      data: {
        status: 3, // Cancelled
        detail: reason || 'Payment cancelled or failed',
      },
    });
  }

  // Shared implementation - Get deposit by transaction ID
  async getDepositByTrx(trx: string) {
    return await this.prisma.deposit.findFirst({
      where: { trx },
    });
  }

  // Shared implementation - Find deposit by external reference
  async findDepositByReference(field: string, value: any) {
    return await this.prisma.deposit.findFirst({
      where: {
        detail: {
          contains: value,
        },
      },
    });
  }
}
