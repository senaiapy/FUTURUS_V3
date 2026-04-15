import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from './blockchain.service';
import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import * as crypto from 'crypto';

@Injectable()
export class SolanaWalletService {
  private readonly logger = new Logger(SolanaWalletService.name);
  private readonly encryptionKey: Buffer;

  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
  ) {
    // Encryption key for custodial wallets (32 bytes for AES-256)
    const key = process.env.WALLET_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.encryptionKey = Buffer.from(key, 'hex');
  }

  // Encrypt private key for storage
  private encryptPrivateKey(secretKey: Uint8Array): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(secretKey)),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  // Decrypt private key
  private decryptPrivateKey(encryptedKey: string): Uint8Array {
    const data = Buffer.from(encryptedKey, 'base64');
    const iv = data.subarray(0, 16);
    const authTag = data.subarray(16, 32);
    const encrypted = data.subarray(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return new Uint8Array(decrypted);
  }

  // Create custodial wallet
  async createCustodialWallet(userId: number): Promise<{
    publicKey: string;
    isCustodial: boolean;
  }> {
    // Check if user already has a wallet
    const existingWallet = await this.prisma.solanaWallet.findUnique({
      where: { userId },
    });

    if (existingWallet) {
      throw new BadRequestException('User already has a Solana wallet');
    }

    // Generate new keypair
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const encryptedKey = this.encryptPrivateKey(keypair.secretKey);

    // Store in database
    await this.prisma.solanaWallet.create({
      data: {
        userId,
        publicKey,
        encryptedKey,
        isCustodial: true,
        futBalance: 0,
        solBalance: 0,
      },
    });

    this.logger.log(`Created custodial wallet for user ${userId}: ${publicKey}`);

    return {
      publicKey,
      isCustodial: true,
    };
  }

  // Link external wallet (non-custodial)
  async linkExternalWallet(userId: number, publicKey: string): Promise<{
    publicKey: string;
    isCustodial: boolean;
  }> {
    // Validate public key
    try {
      new PublicKey(publicKey);
    } catch {
      throw new BadRequestException('Invalid Solana public key');
    }

    // Check if user already has a wallet
    const existingWallet = await this.prisma.solanaWallet.findUnique({
      where: { userId },
    });

    if (existingWallet) {
      throw new BadRequestException('User already has a Solana wallet');
    }

    // Check if public key is already linked to another user
    const walletExists = await this.prisma.solanaWallet.findUnique({
      where: { publicKey },
    });

    if (walletExists) {
      throw new BadRequestException('This wallet is already linked to another account');
    }

    // Store in database
    await this.prisma.solanaWallet.create({
      data: {
        userId,
        publicKey,
        encryptedKey: null, // No private key for external wallets
        isCustodial: false,
        futBalance: 0,
        solBalance: 0,
      },
    });

    this.logger.log(`Linked external wallet for user ${userId}: ${publicKey}`);

    return {
      publicKey,
      isCustodial: false,
    };
  }

  // Get wallet info
  async getWallet(userId: number): Promise<{
    publicKey: string;
    isCustodial: boolean;
    solBalance: number;
    futBalance: number;
    lastSyncAt: Date | null;
  } | null> {
    const wallet = await this.prisma.solanaWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return null;
    }

    return {
      publicKey: wallet.publicKey,
      isCustodial: wallet.isCustodial,
      solBalance: Number(wallet.solBalance),
      futBalance: Number(wallet.futBalance),
      lastSyncAt: wallet.lastSyncAt,
    };
  }

  // Sync balances from blockchain
  async syncBalances(userId: number): Promise<{
    solBalance: number;
    futBalance: number;
  }> {
    const wallet = await this.prisma.solanaWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const publicKey = new PublicKey(wallet.publicKey);

    // Fetch on-chain balances
    const [solBalance, futBalance] = await Promise.all([
      this.blockchainService.getSolBalance(publicKey),
      this.blockchainService.getFutBalance(publicKey),
    ]);

    // Update database
    await this.prisma.solanaWallet.update({
      where: { userId },
      data: {
        solBalance,
        futBalance,
        lastSyncAt: new Date(),
      },
    });

    return { solBalance, futBalance };
  }

  // Get keypair for custodial wallet (for server-side signing)
  async getKeypair(userId: number): Promise<Keypair> {
    const wallet = await this.prisma.solanaWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (!wallet.isCustodial || !wallet.encryptedKey) {
      throw new BadRequestException('Cannot get keypair for non-custodial wallet');
    }

    const secretKey = this.decryptPrivateKey(wallet.encryptedKey);
    return Keypair.fromSecretKey(secretKey);
  }

  // Record blockchain transaction
  async recordTransaction(
    userId: number,
    data: {
      txHash: string;
      txType: string;
      amount: number;
      token: string;
      marketId?: number;
      status?: number;
    },
  ): Promise<void> {
    const wallet = await this.prisma.solanaWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    await this.prisma.blockchainTransaction.create({
      data: {
        userId,
        solanaWalletId: wallet.id,
        txHash: data.txHash,
        txType: data.txType,
        amount: data.amount,
        token: data.token,
        marketId: data.marketId,
        status: data.status ?? 0,
      },
    });
  }

  // Update transaction status
  async updateTransactionStatus(txHash: string, status: number, errorMessage?: string): Promise<void> {
    await this.prisma.blockchainTransaction.update({
      where: { txHash },
      data: {
        status,
        errorMessage,
        confirmedAt: status === 1 ? new Date() : undefined,
      },
    });
  }

  // Get user transactions
  async getTransactions(
    userId: number,
    params: { page: number; limit: number; txType?: string },
  ): Promise<{
    data: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (params.page - 1) * params.limit;
    const where: any = { userId };

    if (params.txType) {
      where.txType = params.txType;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.blockchainTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit,
      }),
      this.prisma.blockchainTransaction.count({ where }),
    ]);

    return {
      data: transactions.map((t) => ({
        id: t.id,
        txHash: t.txHash,
        txType: t.txType,
        amount: Number(t.amount),
        token: t.token,
        status: t.status === 0 ? 'PENDING' : t.status === 1 ? 'CONFIRMED' : 'FAILED',
        createdAt: t.createdAt.toISOString(),
        confirmedAt: t.confirmedAt?.toISOString(),
      })),
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
