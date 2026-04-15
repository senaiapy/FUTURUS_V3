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
  FUT_MINT,
  FEE_AUTHORITY,
  TOKEN_METADATA_PROGRAM_ID,
  LAMPORTS_PER_FUT,
} from './sdk/constants';
import BN from 'bn.js';

@Injectable()
export class BetSyncService {
  private readonly logger = new Logger(BetSyncService.name);

  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private walletService: SolanaWalletService,
  ) {}

  // Place bet on blockchain
  async placeBetOnChain(
    userId: number,
    data: {
      marketId: number;
      isYes: boolean;
      amount: number;
    },
  ): Promise<{
    txHash: string;
    tokensReceived: number;
    newPrice: number;
    positionId: number;
  }> {
    // Get blockchain market
    const blockchainMarket = await this.prisma.blockchainMarket.findUnique({
      where: { marketId: data.marketId },
      include: { market: true },
    });

    if (!blockchainMarket) {
      throw new NotFoundException('Blockchain market not found');
    }

    if (blockchainMarket.status !== 1) {
      throw new BadRequestException('Market is not active');
    }

    // Get user wallet
    const wallet = await this.prisma.solanaWallet.findUnique({
      where: { userId },
    });

    if (!wallet || !wallet.isCustodial) {
      throw new BadRequestException('User must have a custodial wallet for blockchain betting');
    }

    // Check FUT balance
    const userKeypair = await this.walletService.getKeypair(userId);
    const futBalance = await this.blockchainService.getFutBalance(userKeypair.publicKey);

    if (futBalance < data.amount) {
      throw new BadRequestException(`Insufficient FUT balance. Have: ${futBalance}, Need: ${data.amount}`);
    }

    const marketPDA = new PublicKey(blockchainMarket.onChainMarketId);
    const tokenMint = data.isYes
      ? new PublicKey(blockchainMarket.tokenMintA)
      : new PublicKey(blockchainMarket.tokenMintB);

    const program = this.blockchainService.getProgram();
    const globalPDA = this.blockchainService.getGlobalPDA();

    // Derive all required accounts
    const userFutAccount = await this.blockchainService.getAssociatedTokenAccount(
      userKeypair.publicKey,
      FUT_MINT,
    );
    const marketFutAccount = await this.blockchainService.getAssociatedTokenAccount(
      marketPDA,
      FUT_MINT,
    );
    const feeAuthorityFutAccount = await this.blockchainService.getAssociatedTokenAccount(
      FEE_AUTHORITY,
      FUT_MINT,
    );
    const pdaTokenAccount = await this.blockchainService.getAssociatedTokenAccount(
      marketPDA,
      tokenMint,
    );
    const userTokenAccount = await this.blockchainService.getAssociatedTokenAccount(
      userKeypair.publicKey,
      tokenMint,
    );
    const userPositionPDA = this.blockchainService.deriveUserPositionPDA(
      marketPDA,
      userKeypair.publicKey,
    );

    // Build create_bet instruction
    const betIx = await program.methods
      .createBet({
        marketId: `market_${data.marketId}`,
        amount: new BN(Math.floor(data.amount * LAMPORTS_PER_FUT)),
        isYes: data.isYes,
      })
      .accounts({
        user: userKeypair.publicKey,
        futMint: FUT_MINT,
        userFutAccount,
        marketFutAccount,
        feeAuthorityFutAccount,
        creator: userKeypair.publicKey, // For fee tracking
        tokenMint,
        pdaTokenAccount,
        userTokenAccount,
        feeAuthority: FEE_AUTHORITY,
        market: marketPDA,
        global: globalPDA,
        userPosition: userPositionPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .instruction();

    const vtx = await this.blockchainService.buildVersionedTransaction(
      userKeypair.publicKey,
      [betIx],
    );

    // Simulate
    const sim = await this.blockchainService.simulateTransaction(vtx);
    if (!sim.success) {
      this.logger.error(`Bet simulation failed: ${sim.error}`);
      throw new BadRequestException(`Transaction simulation failed: ${sim.error}`);
    }

    // Send transaction
    const txHash = await this.blockchainService.sendAndConfirmTx(vtx, [userKeypair]);

    // Record transaction
    await this.walletService.recordTransaction(userId, {
      txHash,
      txType: 'BET',
      amount: data.amount,
      token: 'FUT',
      marketId: data.marketId,
      status: 1, // Confirmed
    });

    // Fetch updated market data
    const onChainData = await this.blockchainService.fetchMarketInfo(marketPDA);
    const newPrice = data.isYes
      ? Number(onChainData?.tokenPriceA || 0) / LAMPORTS_PER_FUT
      : Number(onChainData?.tokenPriceB || 0) / LAMPORTS_PER_FUT;

    // Create or update position in database
    let position = await this.prisma.blockchainPosition.findFirst({
      where: { userId, blockchainMarketId: blockchainMarket.id },
    });

    const tokensReceived = data.amount / newPrice; // Approximate

    if (position) {
      position = await this.prisma.blockchainPosition.update({
        where: { id: position.id },
        data: {
          yesAmount: data.isYes
            ? { increment: tokensReceived }
            : position.yesAmount,
          noAmount: !data.isYes
            ? { increment: tokensReceived }
            : position.noAmount,
          totalInvested: { increment: data.amount },
          onChainPositionPda: userPositionPDA.toBase58(),
        },
      });
    } else {
      position = await this.prisma.blockchainPosition.create({
        data: {
          userId,
          blockchainMarketId: blockchainMarket.id,
          onChainPositionPda: userPositionPDA.toBase58(),
          yesAmount: data.isYes ? tokensReceived : 0,
          noAmount: !data.isYes ? tokensReceived : 0,
          totalInvested: data.amount,
        },
      });
    }

    // Update market totals
    await this.prisma.blockchainMarket.update({
      where: { id: blockchainMarket.id },
      data: {
        totalFutDeposited: { increment: data.amount },
        tokenPriceA: Number(onChainData?.tokenPriceA || 0) / LAMPORTS_PER_FUT,
        tokenPriceB: Number(onChainData?.tokenPriceB || 0) / LAMPORTS_PER_FUT,
      },
    });

    // Update wallet balance
    await this.walletService.syncBalances(userId);

    this.logger.log(`User ${userId} placed ${data.isYes ? 'YES' : 'NO'} bet of ${data.amount} FUT on market ${data.marketId}`);

    return {
      txHash,
      tokensReceived,
      newPrice,
      positionId: position.id,
    };
  }

  // Claim winnings from resolved market
  async claimWinnings(
    userId: number,
    marketId: number,
  ): Promise<{ txHash: string; amountClaimed: number }> {
    const blockchainMarket = await this.prisma.blockchainMarket.findUnique({
      where: { marketId },
    });

    if (!blockchainMarket) {
      throw new NotFoundException('Blockchain market not found');
    }

    if (blockchainMarket.status !== 2) {
      throw new BadRequestException('Market is not resolved yet');
    }

    const position = await this.prisma.blockchainPosition.findFirst({
      where: { userId, blockchainMarketId: blockchainMarket.id },
    });

    if (!position) {
      throw new NotFoundException('No position found for this market');
    }

    if (position.claimed) {
      throw new BadRequestException('Winnings already claimed');
    }

    const wallet = await this.prisma.solanaWallet.findUnique({
      where: { userId },
    });

    if (!wallet || !wallet.isCustodial) {
      throw new BadRequestException('User must have a custodial wallet');
    }

    const userKeypair = await this.walletService.getKeypair(userId);
    const marketPDA = new PublicKey(blockchainMarket.onChainMarketId);

    // Determine winning token mint
    const winningTokenMint = blockchainMarket.result
      ? new PublicKey(blockchainMarket.tokenMintA) // YES won
      : new PublicKey(blockchainMarket.tokenMintB); // NO won

    const program = this.blockchainService.getProgram();
    const globalPDA = this.blockchainService.getGlobalPDA();

    // Derive accounts
    const userFutAccount = await this.blockchainService.getAssociatedTokenAccount(
      userKeypair.publicKey,
      FUT_MINT,
    );
    const marketFutAccount = await this.blockchainService.getAssociatedTokenAccount(
      marketPDA,
      FUT_MINT,
    );
    const userWinningTokenAccount = await this.blockchainService.getAssociatedTokenAccount(
      userKeypair.publicKey,
      winningTokenMint,
    );
    const userPositionPDA = this.blockchainService.deriveUserPositionPDA(
      marketPDA,
      userKeypair.publicKey,
    );

    const claimIx = await program.methods
      .claim(`market_${marketId}`)
      .accounts({
        user: userKeypair.publicKey,
        futMint: FUT_MINT,
        userFutAccount,
        marketFutAccount,
        market: marketPDA,
        global: globalPDA,
        userPosition: userPositionPDA,
        userWinningTokenAccount,
        winningTokenMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const vtx = await this.blockchainService.buildVersionedTransaction(
      userKeypair.publicKey,
      [claimIx],
    );

    const sim = await this.blockchainService.simulateTransaction(vtx);
    if (!sim.success) {
      throw new BadRequestException(`Claim simulation failed: ${sim.error}`);
    }

    const txHash = await this.blockchainService.sendAndConfirmTx(vtx, [userKeypair]);

    // Calculate approximate winnings
    const winningAmount = blockchainMarket.result
      ? Number(position.yesAmount)
      : Number(position.noAmount);

    // Update position as claimed
    await this.prisma.blockchainPosition.update({
      where: { id: position.id },
      data: {
        claimed: true,
        claimTxHash: txHash,
      },
    });

    // Record transaction
    await this.walletService.recordTransaction(userId, {
      txHash,
      txType: 'CLAIM',
      amount: winningAmount,
      token: 'FUT',
      marketId,
      status: 1,
    });

    // Sync balances
    await this.walletService.syncBalances(userId);

    this.logger.log(`User ${userId} claimed ${winningAmount} FUT from market ${marketId}`);

    return {
      txHash,
      amountClaimed: winningAmount,
    };
  }

  // Get user's blockchain positions
  async getUserPositions(
    userId: number,
    params: { page: number; limit: number },
  ): Promise<{
    data: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (params.page - 1) * params.limit;

    const [positions, total] = await Promise.all([
      this.prisma.blockchainPosition.findMany({
        where: { userId },
        include: {
          blockchainMarket: {
            include: {
              market: { select: { question: true, slug: true, status: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: params.limit,
      }),
      this.prisma.blockchainPosition.count({ where: { userId } }),
    ]);

    return {
      data: positions.map((p) => ({
        id: p.id,
        marketId: p.blockchainMarket.marketId,
        question: p.blockchainMarket.market.question,
        slug: p.blockchainMarket.market.slug,
        yesAmount: Number(p.yesAmount),
        noAmount: Number(p.noAmount),
        totalInvested: Number(p.totalInvested),
        claimed: p.claimed,
        marketStatus:
          p.blockchainMarket.status === 0
            ? 'PENDING'
            : p.blockchainMarket.status === 1
              ? 'ACTIVE'
              : 'RESOLVED',
        marketResult: p.blockchainMarket.result,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  // Get specific position
  async getPosition(userId: number, marketId: number): Promise<any | null> {
    const blockchainMarket = await this.prisma.blockchainMarket.findUnique({
      where: { marketId },
    });

    if (!blockchainMarket) {
      return null;
    }

    const position = await this.prisma.blockchainPosition.findFirst({
      where: { userId, blockchainMarketId: blockchainMarket.id },
      include: {
        blockchainMarket: {
          include: {
            market: { select: { question: true, slug: true } },
          },
        },
      },
    });

    if (!position) {
      return null;
    }

    return {
      id: position.id,
      marketId: position.blockchainMarket.marketId,
      question: position.blockchainMarket.market.question,
      yesAmount: Number(position.yesAmount),
      noAmount: Number(position.noAmount),
      totalInvested: Number(position.totalInvested),
      claimed: position.claimed,
      onChainPositionPda: position.onChainPositionPda,
      marketResult: position.blockchainMarket.result,
    };
  }
}
