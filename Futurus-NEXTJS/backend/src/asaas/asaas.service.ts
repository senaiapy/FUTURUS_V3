import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from 'decimal.js';
import { WithdrawMethod } from '@prisma/client';

interface AsaasGateway {
  id: number;
  name: string | null;
  minAmount: Decimal | string | number;
  maxAmount: Decimal | string | number;
  fixedCharge: Decimal | string | number;
  percentCharge: Decimal | string | number;
  rate: Decimal | string | number;
  gatewayParameter?: string | null;
  [key: string]: any;
}

interface AsaasConfig {
  apiKey: string;
  apiUrl: string;
  mode: string;
  gateway: AsaasGateway;
}

interface AsaasError {
  code: string;
  description: string;
}

interface AsaasResponse {
  id?: string;
  status?: string;
  encodedImage?: string;
  payload?: string;
  errors?: AsaasError[];
}

interface AsaasWebhookData {
  event: string;
  payment?: {
    id: string;
  };
}

@Injectable()
export class AsaasService {
  private readonly logger = new Logger(AsaasService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get Asaas configuration from gateway_currency
   */
  async getAsaasConfig(methodCode: number = 127): Promise<AsaasConfig | null> {
    const gateway = await this.prisma.gatewayCurrency.findFirst({
      where: { methodCode },
      include: { gateway: true },
    });

    if (!gateway || !gateway.gatewayParameter) {
      return null;
    }

    const params = JSON.parse(gateway.gatewayParameter) as Record<string, any>;
    const apiKey = (params.api_key as string) || '';
    const mode = (params.mode as string) || 'sandbox';

    const url =
      mode === 'sandbox' || mode === 'test'
        ? 'https://sandbox.asaas.com/api/v3'
        : 'https://www.asaas.com/api/v3';

    return {
      apiKey,
      apiUrl: url,
      mode,
      gateway,
    };
  }

  /**
   * Make HTTP request to Asaas API
   */
  async asaasRequest(
    url: string,
    data: Record<string, any> | null,
    apiKey: string,
    method: string = 'POST',
  ): Promise<AsaasResponse> {
    try {
      const options: RequestInit = {
        method,
        headers: {
          access_token: apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'Futurus-App',
        },
      };

      if (method === 'POST' && data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const responseData = (await response.json()) as AsaasResponse;

      this.logger.log(`Asaas API Response: ${JSON.stringify(responseData)}`);

      return responseData;
    } catch (error) {
      this.logger.error(
        `Asaas API Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        errors: [
          {
            code: 'CONNECTION_ERROR',
            description: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  /**
   * Generate transaction ID
   */
  generateTrx(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let trx = '';
    for (let i = 0; i < 12; i++) {
      trx += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return trx;
  }

  // ==================== DEPOSIT METHODS ====================

  /**
   * Get available deposit methods (PIX and Credit Card)
   */
  async getDepositMethods() {
    const methods = await this.prisma.gatewayCurrency.findMany({
      where: {
        methodCode: { in: [127, 128] },
        gateway: { status: 1 },
      },
      include: { gateway: true },
    });

    return {
      success: true,
      data: {
        methods: methods.map((m) => ({
          id: m.id,
          method_code: m.methodCode,
          name: m.name,
          currency: m.currency,
          min_amount: m.minAmount,
          max_amount: m.maxAmount,
          fixed_charge: m.fixedCharge,
          percent_charge: m.percentCharge,
          type: m.methodCode === 127 ? 'pix' : 'credit_card',
        })),
      },
    };
  }

  /**
   * Create PIX deposit
   */
  async createPixDeposit(userId: number, amount: number, cpf: string) {
    const config = await this.getAsaasConfig(127);

    if (!config || !config.apiKey) {
      throw new BadRequestException('Payment gateway not configured');
    }

    const gateway = config.gateway;

    // Validate amount limits
    if (
      amount < Number(gateway.minAmount) ||
      amount > Number(gateway.maxAmount)
    ) {
      throw new BadRequestException(
        `Amount must be between ${gateway.minAmount?.toString() || '0'} and ${gateway.maxAmount?.toString() || '0'}`,
      );
    }

    // Get user and update CPF
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cleanCpf = cpf.replace(/[^0-9]/g, '');

    // Calculate charges correctly using Decimal arithmetic
    const fixedCharge = new Decimal(gateway.fixedCharge);
    const percentCharge = new Decimal(gateway.percentCharge);
    const rate = new Decimal(gateway.rate);
    const depositAmount = new Decimal(amount);

    const charge = fixedCharge.plus(
      depositAmount.times(percentCharge).dividedBy(100),
    );
    const payable = depositAmount.plus(charge);
    const finalAmount = payable.times(rate);

    // Create deposit record
    const trx = this.generateTrx();
    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        methodCode: 127,
        methodCurrency: 'BRL',
        amount: depositAmount,
        charge: charge,
        rate: rate,
        finalAmount: finalAmount,
        btcAmount: '0',
        btcWallet: '',
        trx,
        status: 0, // Initiated
      },
    });

    // Create Asaas customer
    const customerData = {
      name:
        `${user.firstname || ''} ${user.lastname || ''}`.trim() ||
        user.username,
      email: user.email,
      cpfCnpj: cleanCpf,
      externalReference: String(user.id),
    };

    const customer = await this.asaasRequest(
      `${config.apiUrl}/customers`,
      customerData,
      config.apiKey,
    );

    if (customer.errors) {
      throw new BadRequestException(
        customer.errors[0]?.description || 'Error creating customer',
      );
    }

    // Create PIX payment
    const paymentData = {
      customer: customer.id,
      billingType: 'PIX',
      value: finalAmount.toNumber(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      externalReference: trx,
    };

    const payment = await this.asaasRequest(
      `${config.apiUrl}/payments`,
      paymentData,
      config.apiKey,
    );

    if (payment.errors) {
      throw new BadRequestException(
        payment.errors[0]?.description || 'Error creating payment',
      );
    }

    // Get PIX QR Code
    if (!payment.id) {
      throw new BadRequestException('Error creating payment: No ID returned');
    }

    const pixQr = await this.asaasRequest(
      `${config.apiUrl}/payments/${payment.id}/pixQrCode`,
      null,
      config.apiKey,
      'GET',
    );

    if (pixQr.errors) {
      throw new BadRequestException(
        pixQr.errors[0]?.description || 'Error getting QR code',
      );
    }

    // Update deposit with payment info
    await this.prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        btcWallet: payment.id,
        pixCode: pixQr.payload,
        pixQrCode: pixQr.encodedImage,
        detail: JSON.stringify({
          payment_id: payment.id,
          pix_qr_code: pixQr.encodedImage,
          pix_copy_paste: pixQr.payload,
        }),
      },
    });

    return {
      success: true,
      message: 'PIX payment created successfully',
      data: {
        deposit: {
          trx,
          amount,
          charge,
          final_amount: finalAmount,
          status: 'pending',
        },
        pix: {
          qr_code_base64: pixQr.encodedImage,
          copy_paste: pixQr.payload,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    };
  }

  /**
   * Create Credit Card deposit
   */
  async createCardDeposit(
    userId: number,
    data: {
      amount: number;
      card_number: string;
      holder_name: string;
      expiry_month: string;
      expiry_year: string;
      cvv: string;
      installments: number;
      holder_cpf: string;
      holder_email: string;
      holder_phone: string;
      holder_postal_code: string;
      holder_address: string;
      holder_address_number: string;
      holder_province: string;
    },
  ) {
    const config = await this.getAsaasConfig(128);

    if (!config || !config.apiKey) {
      throw new BadRequestException('Payment gateway not configured');
    }

    const gateway = config.gateway;

    // Validate amount limits
    if (
      data.amount < Number(gateway.minAmount) ||
      data.amount > Number(gateway.maxAmount)
    ) {
      throw new BadRequestException(
        `Amount must be between ${gateway.minAmount?.toString() || '0'} and ${gateway.maxAmount?.toString() || '0'}`,
      );
    }

    // Get user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Clean input data
    const cpf = data.holder_cpf.replace(/[^0-9]/g, '');
    const phone = data.holder_phone.replace(/[^0-9]/g, '');
    const postalCode = data.holder_postal_code.replace(/[^0-9]/g, '');
    const cardNumber = data.card_number.replace(/[^0-9]/g, '');

    // Calculate charges correctly using Decimal arithmetic
    const fixedCharge = new Decimal(gateway.fixedCharge);
    const percentCharge = new Decimal(gateway.percentCharge);
    const rate = new Decimal(gateway.rate);
    const depositAmount = new Decimal(data.amount);

    const charge = fixedCharge.plus(
      depositAmount.times(percentCharge).dividedBy(100),
    );
    const payable = depositAmount.plus(charge);
    const finalAmount = payable.times(rate);

    // Create deposit record
    const trx = this.generateTrx();
    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        methodCode: 128,
        methodCurrency: 'BRL',
        amount: depositAmount,
        charge: charge,
        rate: rate,
        finalAmount: finalAmount,
        btcAmount: '0',
        btcWallet: '',
        trx,
        status: 0, // Initiated
      },
    });

    // Create Asaas customer
    const customerData = {
      name: data.holder_name,
      email: data.holder_email,
      cpfCnpj: cpf,
      phone,
      postalCode,
      address: data.holder_address,
      addressNumber: data.holder_address_number,
      province: data.holder_province,
      externalReference: String(user.id),
    };

    const customer = await this.asaasRequest(
      `${config.apiUrl}/customers`,
      customerData,
      config.apiKey,
    );

    if (customer.errors) {
      throw new BadRequestException(
        customer.errors[0]?.description || 'Error creating customer',
      );
    }

    // Create Credit Card payment
    const installments = data.installments || 1;
    const installmentValue = finalAmount
      .dividedBy(installments)
      .toDecimalPlaces(2);

    const paymentData = {
      customer: customer.id,
      billingType: 'CREDIT_CARD',
      value: finalAmount.toNumber(),
      dueDate: new Date().toISOString().split('T')[0],
      externalReference: trx,
      installmentCount: installments,
      installmentValue: installmentValue.toNumber(),
      creditCard: {
        holderName: data.holder_name,
        number: cardNumber,
        expiryMonth: data.expiry_month,
        expiryYear: data.expiry_year,
        ccv: data.cvv,
      },
      creditCardHolderInfo: {
        name: data.holder_name,
        email: data.holder_email,
        cpfCnpj: cpf,
        postalCode,
        addressNumber: data.holder_address_number,
        phone,
      },
    };

    this.logger.log(`Asaas Card Payment Request for TRX: ${trx}`);

    const payment = await this.asaasRequest(
      `${config.apiUrl}/payments`,
      paymentData,
      config.apiKey,
    );

    if (payment.errors) {
      this.logger.error(
        `Asaas Card Payment Error: ${JSON.stringify(payment.errors)}`,
      );
      throw new BadRequestException(
        payment.errors[0]?.description || 'Payment processing error',
      );
    }

    if (!payment.id) {
      throw new BadRequestException('Payment processing error: No ID returned');
    }

    // Update deposit with payment info
    await this.prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        btcWallet: payment.id,
        detail: JSON.stringify({
          payment_id: payment.id,
          status: payment.status,
          installments,
          card_last_digits: cardNumber.slice(-4),
        }),
      },
    });

    // Check payment status
    if (payment.status && ['CONFIRMED', 'RECEIVED'].includes(payment.status)) {
      // Payment approved immediately - update user balance
      await this.confirmDeposit(deposit.id);

      return {
        success: true,
        message: 'Payment confirmed successfully!',
        data: {
          deposit: {
            trx,
            amount: data.amount,
            charge,
            final_amount: finalAmount,
            status: 'confirmed',
          },
        },
      };
    } else if (payment.status === 'PENDING') {
      return {
        success: true,
        message: 'Payment is being processed',
        data: {
          deposit: {
            trx,
            amount: data.amount,
            charge,
            final_amount: finalAmount,
            status: 'pending',
          },
        },
      };
    } else {
      await this.prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          status: 3, // Cancelled
          detail: JSON.stringify({
            payment_id: payment.id,
            status: payment.status,
            error: payment.status,
          }),
        },
      });

      throw new BadRequestException(
        `Payment was declined. Status: ${payment.status}`,
      );
    }
  }

  /**
   * Confirm deposit and update user balance
   */
  async confirmDeposit(depositId: number) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true },
    });

    if (!deposit || deposit.status === 1) {
      return; // Already processed or not found
    }

    await this.prisma.$transaction(async (tx) => {
      // Update deposit status
      await tx.deposit.update({
        where: { id: depositId },
        data: { status: 1 }, // Success
      });

      // Update user balance
      await tx.user.update({
        where: { id: deposit.userId },
        data: {
          balance: { increment: deposit.amount },
        },
      });

      // Create transaction record
      const user = await tx.user.findUnique({ where: { id: deposit.userId } });
      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          amount: deposit.amount,
          charge: deposit.charge,
          postBalance: user?.balance || new Decimal(0),
          trxType: '+',
          trx: deposit.trx || this.generateTrx(),
          details: `Deposit via ${deposit.methodCode === 127 ? 'Asaas PIX' : 'Asaas Card'}`,
          remark: 'deposit',
        },
      });
    });
  }

  /**
   * Get deposit status
   */
  async getDepositStatus(userId: number, trx: string) {
    const deposit = await this.prisma.deposit.findFirst({
      where: { trx, userId },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    const statusMap: Record<number, string> = {
      0: 'pending',
      1: 'confirmed',
      2: 'processing',
      3: 'rejected',
    };

    return {
      success: true,
      data: {
        deposit: {
          trx: deposit.trx,
          amount: deposit.amount,
          charge: deposit.charge,
          final_amount: deposit.finalAmount,
          status: statusMap[deposit.status] || 'unknown',
          method: deposit.methodCode === 127 ? 'pix' : 'credit_card',
          created_at: deposit.createdAt,
        },
      },
    };
  }

  // ==================== WITHDRAW METHODS ====================

  /**
   * Get available withdraw methods
   */
  async getWithdrawMethods() {
    const methods = await this.prisma.withdrawMethod.findMany({
      where: { status: 1 },
    });

    return {
      success: true,
      data: {
        methods: methods.map((m) => {
          let type = 'other';
          const nameLower = m.name?.toLowerCase() || '';
          if (nameLower.includes('pix')) {
            type = 'pix';
          } else if (
            nameLower.includes('transfer') ||
            nameLower.includes('bank')
          ) {
            type = 'bank_transfer';
          }

          return {
            id: m.id,
            name: m.name,
            currency: m.currency,
            min_limit: m.minLimit,
            max_limit: m.maxLimit,
            fixed_charge: m.fixedCharge,
            percent_charge: m.percentCharge,
            type,
            required_fields: this.getWithdrawRequiredFields(type),
          };
        }),
      },
    };
  }

  /**
   * Get required fields for withdraw type
   */
  private getWithdrawRequiredFields(type: string) {
    const common = [
      { name: 'cpf', label: 'CPF/CNPJ', type: 'text', required: true },
    ];

    if (type === 'pix') {
      return [
        ...common,
        {
          name: 'pix_key_type',
          label: 'PIX Key Type',
          type: 'select',
          required: true,
          options: ['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP'],
        },
        { name: 'pix_key', label: 'PIX Key', type: 'text', required: true },
      ];
    } else if (type === 'bank_transfer') {
      return [
        ...common,
        { name: 'bank_code', label: 'Bank Code', type: 'text', required: true },
        { name: 'bank_agency', label: 'Agency', type: 'text', required: true },
        {
          name: 'bank_account',
          label: 'Account',
          type: 'text',
          required: true,
        },
        {
          name: 'bank_account_type',
          label: 'Account Type',
          type: 'select',
          required: true,
          options: ['CONTA_CORRENTE', 'CONTA_POUPANCA'],
        },
        {
          name: 'bank_holder_name',
          label: 'Account Holder Name',
          type: 'text',
          required: true,
        },
      ];
    }

    return common;
  }

  /**
   * Create PIX withdraw request
   */
  async createPixWithdraw(
    userId: number,
    data: {
      amount: number;
      cpf: string;
      pix_key_type: string;
      pix_key: string;
    },
  ) {
    // Find PIX withdraw method
    const method = await this.prisma.withdrawMethod.findFirst({
      where: {
        status: 1,
        OR: [
          { name: { contains: 'pix', mode: 'insensitive' } },
          { name: { contains: 'PIX', mode: 'insensitive' } },
        ],
      },
    });

    if (!method) {
      throw new NotFoundException('PIX withdraw method not available');
    }

    const withdrawInfo = [
      {
        name: 'CPF/CNPJ',
        type: 'text',
        value: data.cpf.replace(/[^0-9]/g, ''),
      },
      { name: 'PIX Key Type', type: 'text', value: data.pix_key_type },
      { name: 'PIX Key', type: 'text', value: data.pix_key },
    ];

    return this.processWithdraw(
      userId,
      method,
      data.amount,
      data.cpf,
      withdrawInfo,
    );
  }

  /**
   * Create Bank Transfer withdraw request
   */
  async createTransferWithdraw(
    userId: number,
    data: {
      amount: number;
      cpf: string;
      bank_code: string;
      bank_agency: string;
      bank_account: string;
      bank_account_type: string;
      bank_holder_name: string;
    },
  ) {
    // Find Bank Transfer withdraw method
    const method = await this.prisma.withdrawMethod.findFirst({
      where: {
        status: 1,
        OR: [
          { name: { contains: 'transfer', mode: 'insensitive' } },
          { name: { contains: 'bank', mode: 'insensitive' } },
        ],
      },
    });

    if (!method) {
      throw new NotFoundException(
        'Bank transfer withdraw method not available',
      );
    }

    const withdrawInfo = [
      {
        name: 'CPF/CNPJ',
        type: 'text',
        value: data.cpf.replace(/[^0-9]/g, ''),
      },
      { name: 'Bank Code', type: 'text', value: data.bank_code },
      { name: 'Agency', type: 'text', value: data.bank_agency },
      { name: 'Account', type: 'text', value: data.bank_account },
      { name: 'Account Type', type: 'text', value: data.bank_account_type },
      { name: 'Account Holder', type: 'text', value: data.bank_holder_name },
    ];

    return this.processWithdraw(
      userId,
      method,
      data.amount,
      data.cpf,
      withdrawInfo,
    );
  }

  /**
   * Process withdraw request
   */
  private async processWithdraw(
    userId: number,
    method: WithdrawMethod,
    amount: number,
    cpf: string,
    withdrawInfo: Record<string, any>[],
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate charges correctly using Decimal arithmetic
    const fixedCharge = new Decimal(method.fixedCharge);
    const percentCharge = new Decimal(method.percentCharge);
    const rate = new Decimal(method.rate);
    const withdrawAmount = new Decimal(amount);

    // Validate limits using Decimal
    if (withdrawAmount.lessThan(new Decimal(method.minLimit))) {
      throw new BadRequestException(
        `Minimum withdrawal amount is ${method.minLimit.toString()}`,
      );
    }

    if (withdrawAmount.greaterThan(new Decimal(method.maxLimit))) {
      throw new BadRequestException(
        `Maximum withdrawal amount is ${method.maxLimit.toString()}`,
      );
    }

    if (withdrawAmount.greaterThan(user.balance)) {
      throw new BadRequestException('Insufficient balance');
    }

    const charge = fixedCharge.plus(
      withdrawAmount.times(percentCharge).dividedBy(100),
    );
    const afterCharge = withdrawAmount.minus(charge);

    if (afterCharge.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be greater than charges');
    }

    const finalAmount = afterCharge.times(rate);
    const trx = this.generateTrx();

    // Create withdrawal in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create withdrawal
      const withdrawal = await tx.withdrawal.create({
        data: {
          methodId: method.id,
          userId,
          amount: withdrawAmount,
          currency: method.currency,
          rate: rate,
          charge: charge,
          finalAmount: finalAmount,
          afterCharge: afterCharge,
          withdrawInformation: JSON.stringify(withdrawInfo),
          trx,
          status: 2, // Pending
        },
      });

      // Deduct from user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: amount },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          amount: new Decimal(amount),
          charge: new Decimal(charge),
          postBalance: updatedUser.balance,
          trxType: '-',
          trx,
          details: `Withdraw request via ${method.name}`,
          remark: 'withdraw',
        },
      });

      // Create admin notification
      await tx.adminNotification.create({
        data: {
          userId,
          title: `New withdraw request from ${user.username}`,
          clickUrl: `/admin/withdrawals/${withdrawal.id}`,
        },
      });

      return { withdrawal, updatedUser };
    });

    return {
      success: true,
      message: 'Withdraw request submitted successfully',
      data: {
        withdraw: {
          trx,
          amount,
          charge,
          final_amount: finalAmount,
          status: 'pending',
          method: method.name,
        },
        balance: result.updatedUser.balance,
      },
    };
  }

  /**
   * Get withdraw status
   */
  async getWithdrawStatus(userId: number, trx: string) {
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: { trx, userId },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    const statusMap: Record<number, string> = {
      0: 'initiated',
      1: 'completed',
      2: 'pending',
      3: 'rejected',
    };

    // Get method name
    const method = await this.prisma.withdrawMethod.findUnique({
      where: { id: withdrawal.methodId },
    });

    return {
      success: true,
      data: {
        withdraw: {
          trx: withdrawal.trx,
          amount: withdrawal.amount,
          charge: withdrawal.charge,
          final_amount: withdrawal.finalAmount,
          status: statusMap[withdrawal.status] || 'unknown',
          method: method?.name || 'Unknown',
          created_at: withdrawal.createdAt,
        },
      },
    };
  }

  /**
   * Get user balance
   */
  async getBalance(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get general settings for currency info
    const settings = await this.prisma.generalSetting.findFirst();

    return {
      success: true,
      data: {
        balance: user.balance,
        currency: settings?.curText || 'BRL',
        symbol: settings?.curSym || 'R$',
      },
    };
  }

  // ==================== WEBHOOK / IPN ====================

  /**
   * Handle Asaas IPN webhook
   */
  async handleWebhook(data: AsaasWebhookData) {
    this.logger.log(`Asaas Webhook received: ${JSON.stringify(data)}`);

    if (
      data.event === 'PAYMENT_CONFIRMED' ||
      data.event === 'PAYMENT_RECEIVED'
    ) {
      const paymentId = data.payment?.id;

      if (!paymentId) {
        this.logger.warn('Asaas Webhook: No payment ID in webhook data');
        return { status: 'error', message: 'No payment ID' };
      }

      // Find deposit by payment ID (stored in btcWallet)
      const deposit = await this.prisma.deposit.findFirst({
        where: {
          btcWallet: paymentId,
          status: { in: [0, 2] }, // Initiated or Pending
        },
      });

      if (deposit) {
        this.logger.log(
          `Asaas Webhook: Confirming deposit TRX: ${deposit.trx || 'Unknown'}`,
        );
        await this.confirmDeposit(deposit.id);
        return { status: 'success', message: 'Deposit confirmed' };
      } else {
        this.logger.warn(
          `Asaas Webhook: Deposit not found or already processed for Payment ID: ${paymentId}`,
        );
        return {
          status: 'not_found',
          message: 'Deposit not found or already processed',
        };
      }
    }

    return { status: 'ignored', message: 'Event not handled' };
  }
}
