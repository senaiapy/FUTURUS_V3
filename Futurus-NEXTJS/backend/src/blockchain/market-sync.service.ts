import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainService } from './blockchain.service';
import { SolanaWalletService } from './solana-wallet.service';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  PREDICTION_ID,
  FUT_MINT,
  FEE_AUTHORITY,
  TOKEN_METADATA_PROGRAM_ID,
  DEFAULT_MARKET_CONFIG,
  MARKET_SEED,
  MINT_SEED_A,
  MINT_SEED_B,
  METADATA_SEED,
  LAMPORTS_PER_FUT,
} from './sdk/constants';
import * as anchor from '@coral-xyz/anchor';
import BN from 'bn.js';

@Injectable()
export class MarketSyncService {
  private readonly logger = new Logger(MarketSyncService.name);

  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private walletService: SolanaWalletService,
  ) {}

  // Deploy centralized market to blockchain
  async deployMarketToBlockchain(
    marketId: number,
    creatorUserId: number,
    feedPubkey?: string,
  ): Promise<{
    onChainMarketId: string;
    tokenMintA: string;
    tokenMintB: string;
    txHash: string;
  }> {
    // Get market from centralized database
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      include: { options: true },
    });

    if (!market) {
      throw new NotFoundException('Market not found');
    }

    // Check if already deployed
    const existingBlockchainMarket = await this.prisma.blockchainMarket.findUnique({
      where: { marketId },
    });

    if (existingBlockchainMarket) {
      throw new BadRequestException('Market already deployed to blockchain');
    }

    // Get creator's wallet
    const creatorWallet = await this.prisma.solanaWallet.findUnique({
      where: { userId: creatorUserId },
    });

    if (!creatorWallet || !creatorWallet.isCustodial) {
      throw new BadRequestException('Creator must have a custodial wallet to deploy markets');
    }

    const creatorKeypair = await this.walletService.getKeypair(creatorUserId);
    const feeAuthorityKeypair = this.blockchainService.getFeeAuthorityKeypair();

    if (!feeAuthorityKeypair) {
      throw new BadRequestException('Fee authority keypair not configured');
    }

    // Generate unique market ID for blockchain (use centralized market ID)
    const onChainMarketId = `market_${marketId}`;

    // Derive PDAs
    const marketPDA = this.blockchainService.deriveMarketPDA(onChainMarketId);
    const { tokenA, tokenB } = this.blockchainService.deriveTokenMints(marketPDA);

    // Derive metadata PDAs
    const metadataA = PublicKey.findProgramAddressSync(
      [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenA.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID,
    )[0];
    const metadataB = PublicKey.findProgramAddressSync(
      [Buffer.from(METADATA_SEED), TOKEN_METADATA_PROGRAM_ID.toBuffer(), tokenB.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID,
    )[0];

    // Market end date
    const resolutionDate = market.endDate
      ? Math.floor(new Date(market.endDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000) + 86400 * 7; // Default 7 days

    // Get feed pubkey (use provided or default)
    const feed = feedPubkey
      ? new PublicKey(feedPubkey)
      : new PublicKey('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR'); // Default feed

    const program = this.blockchainService.getProgram();
    const globalPDA = this.blockchainService.getGlobalPDA();

    // Build init_market instruction
    const initMarketIx = await program.methods
      .initMarket({
        value: 0.5, // 50% initial probability
        marketId: onChainMarketId,
        range: DEFAULT_MARKET_CONFIG.range,
        tokenAmount: new BN(DEFAULT_MARKET_CONFIG.tokenAmount),
        tokenPrice: new BN(DEFAULT_MARKET_CONFIG.tokenPrice),
        nameA: DEFAULT_MARKET_CONFIG.nameA,
        nameB: DEFAULT_MARKET_CONFIG.nameB,
        symbolA: DEFAULT_MARKET_CONFIG.symbolA,
        symbolB: DEFAULT_MARKET_CONFIG.symbolB,
        urlA: DEFAULT_MARKET_CONFIG.urlA,
        urlB: DEFAULT_MARKET_CONFIG.urlB,
        date: new BN(resolutionDate),
      })
      .accounts({
        user: creatorKeypair.publicKey,
        feeAuthority: FEE_AUTHORITY,
        market: marketPDA,
        globalPda: globalPDA,
        feed,
        metadataA,
        metadataB,
        tokenMintA: tokenA,
        tokenMintB: tokenB,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    // Build mint_token instruction
    const pdaTokenAAccount = await this.blockchainService.getAssociatedTokenAccount(marketPDA, tokenA);
    const pdaTokenBAccount = await this.blockchainService.getAssociatedTokenAccount(marketPDA, tokenB);

    const mintTokenIx = await program.methods
      .mintToken(onChainMarketId)
      .accounts({
        pdaTokenAAccount,
        pdaTokenBAccount,
        user: creatorKeypair.publicKey,
        feeAuthority: FEE_AUTHORITY,
        market: marketPDA,
        global: globalPDA,
        metadataA,
        metadataB,
        tokenMintA: tokenA,
        tokenMintB: tokenB,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    // Build and send transaction
    const vtx = await this.blockchainService.buildVersionedTransaction(creatorKeypair.publicKey, [
      initMarketIx,
      mintTokenIx,
    ]);

    // Simulate first
    const sim = await this.blockchainService.simulateTransaction(vtx);
    if (!sim.success) {
      this.logger.error(`Market deployment simulation failed: ${sim.error}`);
      throw new BadRequestException(`Transaction simulation failed: ${sim.error}`);
    }

    // Send transaction
    const txHash = await this.blockchainService.sendAndConfirmTx(vtx, [creatorKeypair]);

    // Store blockchain market in database
    await this.prisma.blockchainMarket.create({
      data: {
        marketId,
        onChainMarketId: marketPDA.toBase58(),
        tokenMintA: tokenA.toBase58(),
        tokenMintB: tokenB.toBase58(),
        feedPubkey: feed.toBase58(),
        status: 1, // Active
        deployTxHash: txHash,
      },
    });

    this.logger.log(`Deployed market ${marketId} to blockchain: ${marketPDA.toBase58()}`);

    return {
      onChainMarketId: marketPDA.toBase58(),
      tokenMintA: tokenA.toBase58(),
      tokenMintB: tokenB.toBase58(),
      txHash,
    };
  }

  // Sync blockchain market state to database
  async syncMarketFromBlockchain(marketId: number): Promise<void> {
    const blockchainMarket = await this.prisma.blockchainMarket.findUnique({
      where: { marketId },
    });

    if (!blockchainMarket) {
      throw new NotFoundException('Blockchain market not found');
    }

    const marketPDA = new PublicKey(blockchainMarket.onChainMarketId);
    const onChainData = await this.blockchainService.fetchMarketInfo(marketPDA);

    if (!onChainData) {
      this.logger.warn(`Could not fetch on-chain data for market ${marketId}`);
      return;
    }

    // Update database with on-chain state
    await this.prisma.blockchainMarket.update({
      where: { marketId },
      data: {
        tokenAAmount: Number(onChainData.tokenAAmount) / LAMPORTS_PER_FUT,
        tokenBAmount: Number(onChainData.tokenBAmount) / LAMPORTS_PER_FUT,
        tokenPriceA: Number(onChainData.tokenPriceA) / LAMPORTS_PER_FUT,
        tokenPriceB: Number(onChainData.tokenPriceB) / LAMPORTS_PER_FUT,
        totalFutDeposited: Number(onChainData.totalFutDeposited) / LAMPORTS_PER_FUT,
        status: this.mapMarketStatus(onChainData.marketStatus),
        result: onChainData.marketStatus?.finished ? onChainData.result : null,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Synced blockchain market ${marketId}`);
  }

  // Map on-chain market status to database status
  private mapMarketStatus(onChainStatus: any): number {
    if (onChainStatus?.prepare) return 0;
    if (onChainStatus?.active) return 1;
    if (onChainStatus?.finished) return 2;
    return 0;
  }

  // Get blockchain market info
  async getBlockchainMarket(marketId: number): Promise<any> {
    const blockchainMarket = await this.prisma.blockchainMarket.findUnique({
      where: { marketId },
      include: { market: true },
    });

    if (!blockchainMarket) {
      return null;
    }

    return {
      id: blockchainMarket.id,
      marketId: blockchainMarket.marketId,
      onChainMarketId: blockchainMarket.onChainMarketId,
      tokenMintA: blockchainMarket.tokenMintA,
      tokenMintB: blockchainMarket.tokenMintB,
      feedPubkey: blockchainMarket.feedPubkey,
      totalFutDeposited: Number(blockchainMarket.totalFutDeposited),
      tokenAAmount: Number(blockchainMarket.tokenAAmount),
      tokenBAmount: Number(blockchainMarket.tokenBAmount),
      tokenPriceA: Number(blockchainMarket.tokenPriceA),
      tokenPriceB: Number(blockchainMarket.tokenPriceB),
      status: blockchainMarket.status === 0 ? 'PENDING' : blockchainMarket.status === 1 ? 'ACTIVE' : 'RESOLVED',
      result: blockchainMarket.result,
      deployTxHash: blockchainMarket.deployTxHash,
      resolveTxHash: blockchainMarket.resolveTxHash,
      market: blockchainMarket.market,
    };
  }

  // List all blockchain markets
  async listBlockchainMarkets(params: { page: number; limit: number; status?: number }): Promise<{
    data: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (params.page - 1) * params.limit;
    const where: any = {};

    if (params.status !== undefined) {
      where.status = params.status;
    }

    const [markets, total] = await Promise.all([
      this.prisma.blockchainMarket.findMany({
        where,
        include: { market: { select: { question: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit,
      }),
      this.prisma.blockchainMarket.count({ where }),
    ]);

    return {
      data: markets.map((m) => ({
        id: m.id,
        marketId: m.marketId,
        question: m.market.question,
        slug: m.market.slug,
        onChainMarketId: m.onChainMarketId,
        totalFutDeposited: Number(m.totalFutDeposited),
        status: m.status === 0 ? 'PENDING' : m.status === 1 ? 'ACTIVE' : 'RESOLVED',
        result: m.result,
        createdAt: m.createdAt.toISOString(),
      })),
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  // Resolve market on blockchain (admin only)
  async resolveMarketOnChain(
    marketId: number,
    adminUserId: number,
    manualResult?: boolean,
  ): Promise<{ txHash: string; result: boolean }> {
    const blockchainMarket = await this.prisma.blockchainMarket.findUnique({
      where: { marketId },
    });

    if (!blockchainMarket) {
      throw new NotFoundException('Blockchain market not found');
    }

    if (blockchainMarket.status === 2) {
      throw new BadRequestException('Market already resolved');
    }

    const adminWallet = await this.prisma.solanaWallet.findUnique({
      where: { userId: adminUserId },
    });

    if (!adminWallet || !adminWallet.isCustodial) {
      throw new BadRequestException('Admin must have a custodial wallet');
    }

    const adminKeypair = await this.walletService.getKeypair(adminUserId);
    const marketPDA = new PublicKey(blockchainMarket.onChainMarketId);
    const feed = new PublicKey(blockchainMarket.feedPubkey || 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR');

    const program = this.blockchainService.getProgram();
    const globalPDA = this.blockchainService.getGlobalPDA();

    let resolveIx: anchor.web3.TransactionInstruction;

    if (manualResult !== undefined) {
      // Admin manual close
      resolveIx = await program.methods
        .adminCloseMarket(`market_${marketId}`, manualResult)
        .accounts({
          user: adminKeypair.publicKey,
          market: marketPDA,
          global: globalPDA,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
    } else {
      // Oracle-based resolution
      resolveIx = await program.methods
        .resolve()
        .accounts({
          user: adminKeypair.publicKey,
          market: marketPDA,
          global: globalPDA,
          feed,
          systemProgram: SystemProgram.programId,
        })
        .instruction();
    }

    const vtx = await this.blockchainService.buildVersionedTransaction(adminKeypair.publicKey, [resolveIx]);

    const sim = await this.blockchainService.simulateTransaction(vtx);
    if (!sim.success) {
      throw new BadRequestException(`Resolution simulation failed: ${sim.error}`);
    }

    const txHash = await this.blockchainService.sendAndConfirmTx(vtx, [adminKeypair]);

    // Fetch result from chain
    const onChainData = await this.blockchainService.fetchMarketInfo(marketPDA);
    const result = onChainData?.result ?? manualResult ?? false;

    // Update database
    await this.prisma.blockchainMarket.update({
      where: { marketId },
      data: {
        status: 2, // Resolved
        result,
        resolveTxHash: txHash,
      },
    });

    this.logger.log(`Resolved market ${marketId} on blockchain with result: ${result}`);

    return { txHash, result };
  }
}
