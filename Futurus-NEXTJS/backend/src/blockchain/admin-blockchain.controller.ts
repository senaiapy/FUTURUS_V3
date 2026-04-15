import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketSyncService } from './market-sync.service';
import { SolanaWalletService } from './solana-wallet.service';
import { AdminGuard } from '../admin/admin.guard';

@Controller('admin/blockchain')
@UseGuards(AdminGuard)
export class AdminBlockchainController {
  constructor(
    private prisma: PrismaService,
    private marketSyncService: MarketSyncService,
    private walletService: SolanaWalletService,
  ) {}

  // ==================== STATS ====================
  @Get('stats')
  async getStats() {
    const [
      totalWallets,
      custodialWallets,
      linkedWallets,
      totalMarketsDeployed,
      activeMarkets,
      resolvedMarkets,
      totalTransactions,
      pendingTransactions,
      volumeAgg,
    ] = await Promise.all([
      this.prisma.solanaWallet.count(),
      this.prisma.solanaWallet.count({ where: { isCustodial: true } }),
      this.prisma.solanaWallet.count({ where: { isCustodial: false } }),
      this.prisma.blockchainMarket.count(),
      this.prisma.blockchainMarket.count({ where: { status: 1 } }),
      this.prisma.blockchainMarket.count({ where: { status: 2 } }),
      this.prisma.blockchainTransaction.count(),
      this.prisma.blockchainTransaction.count({ where: { status: 0 } }),
      this.prisma.blockchainMarket.aggregate({
        _sum: { totalFutDeposited: true },
      }),
    ]);

    return {
      totalWallets,
      custodialWallets,
      linkedWallets,
      totalMarketsDeployed,
      activeMarkets,
      resolvedMarkets,
      totalFutVolume: Number(volumeAgg._sum.totalFutDeposited || 0),
      totalTransactions,
      pendingTransactions,
    };
  }

  @Get('stats/detailed')
  async getDetailedStats(@Query('period') period: string = '30d') {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    // Current period counts
    const [currentWallets, currentMarkets, currentTxs] = await Promise.all([
      this.prisma.solanaWallet.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.blockchainMarket.count({ where: { createdAt: { gte: startDate } } }),
      this.prisma.blockchainTransaction.count({ where: { createdAt: { gte: startDate } } }),
    ]);

    // Previous period counts
    const [previousWallets, previousMarkets, previousTxs] = await Promise.all([
      this.prisma.solanaWallet.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } },
      }),
      this.prisma.blockchainMarket.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } },
      }),
      this.prisma.blockchainTransaction.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } },
      }),
    ]);

    // Calculate growth percentages
    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Volume by day
    const volumeByDay = await this.prisma.$queryRaw<
      { date: string; volume: number; transactions: bigint }[]
    >`
      SELECT
        DATE(created_at) as date,
        COALESCE(SUM(amount), 0) as volume,
        COUNT(*) as transactions
      FROM blockchain_transactions
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    // Top markets by volume
    const topMarkets = await this.prisma.blockchainMarket.findMany({
      where: { totalFutDeposited: { gt: 0 } },
      include: {
        market: { select: { question: true } },
        _count: { select: { positions: true } },
      },
      orderBy: { totalFutDeposited: 'desc' },
      take: 5,
    });

    // Transactions by type
    const txsByType = await this.prisma.blockchainTransaction.groupBy({
      by: ['txType'],
      _count: true,
      _sum: { amount: true },
      where: { createdAt: { gte: startDate } },
    });

    // Get totals
    const [totalWallets, custodialWallets, linkedWallets, totalMarkets, activeMarkets, resolvedMarkets, totalTxs] =
      await Promise.all([
        this.prisma.solanaWallet.count(),
        this.prisma.solanaWallet.count({ where: { isCustodial: true } }),
        this.prisma.solanaWallet.count({ where: { isCustodial: false } }),
        this.prisma.blockchainMarket.count(),
        this.prisma.blockchainMarket.count({ where: { status: 1 } }),
        this.prisma.blockchainMarket.count({ where: { status: 2 } }),
        this.prisma.blockchainTransaction.count(),
      ]);

    const volumeAgg = await this.prisma.blockchainMarket.aggregate({
      _sum: { totalFutDeposited: true },
    });

    return {
      overview: {
        totalWallets,
        custodialWallets,
        linkedWallets,
        walletsGrowth: calcGrowth(currentWallets, previousWallets),
        totalMarketsDeployed: totalMarkets,
        activeMarkets,
        resolvedMarkets,
        marketsGrowth: calcGrowth(currentMarkets, previousMarkets),
        totalFutVolume: Number(volumeAgg._sum.totalFutDeposited || 0),
        volumeGrowth: 0, // Simplified
        totalTransactions: totalTxs,
        transactionsGrowth: calcGrowth(currentTxs, previousTxs),
      },
      volumeByDay: volumeByDay.map((v) => ({
        date: v.date,
        volume: Number(v.volume),
        transactions: Number(v.transactions),
      })),
      topMarkets: topMarkets.map((m: any) => ({
        marketId: m.marketId,
        question: m.market.question,
        volume: Number(m.totalFutDeposited),
        bets: m._count.positions,
      })),
      transactionsByType: txsByType.map((t: any) => ({
        type: t.txType,
        count: t._count,
        volume: Number(t._sum.amount || 0),
      })),
    };
  }

  // ==================== WALLETS ====================
  @Get('wallets')
  async getWallets(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { publicKey: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [wallets, total] = await Promise.all([
      this.prisma.solanaWallet.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, firstname: true, lastname: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.solanaWallet.count({ where }),
    ]);

    return {
      data: wallets.map((w: any) => ({
        id: w.id,
        userId: w.userId,
        publicKey: w.publicKey,
        isCustodial: w.isCustodial,
        futBalance: Number(w.futBalance),
        solBalance: Number(w.solBalance),
        lastSyncAt: w.lastSyncAt?.toISOString() || null,
        createdAt: w.createdAt.toISOString(),
        user: {
          id: w.user.id,
          name: w.user.firstname
            ? `${w.user.firstname} ${w.user.lastname || ''}`.trim()
            : w.user.username,
          email: w.user.email,
        },
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  @Post('wallets/:userId/sync')
  async syncWallet(@Param('userId', ParseIntPipe) userId: number) {
    await this.walletService.syncBalances(userId);
    return { success: true };
  }

  // ==================== MARKETS ====================
  @Get('markets')
  async getMarkets(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const params: any = { page: pageNum, limit: limitNum };
    if (status !== undefined) {
      params.status = parseInt(status);
    }

    return this.marketSyncService.listBlockchainMarkets(params);
  }

  @Post('markets/:marketId/deploy')
  async deployMarket(
    @Param('marketId', ParseIntPipe) marketId: number,
    @Body() body: { feedPubkey?: string },
  ) {
    // Use fee authority as the deployer (admin action)
    // In a real scenario, you'd get the admin user ID from the request
    const adminWallet = await this.prisma.solanaWallet.findFirst({
      where: { isCustodial: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!adminWallet) {
      throw new BadRequestException('No custodial wallet available for deployment');
    }

    return this.marketSyncService.deployMarketToBlockchain(
      marketId,
      adminWallet.userId,
      body.feedPubkey,
    );
  }

  @Post('markets/:marketId/resolve')
  async resolveMarket(
    @Param('marketId', ParseIntPipe) marketId: number,
    @Body() body: { result: boolean },
  ) {
    const adminWallet = await this.prisma.solanaWallet.findFirst({
      where: { isCustodial: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!adminWallet) {
      throw new BadRequestException('No custodial wallet available for resolution');
    }

    return this.marketSyncService.resolveMarketOnChain(
      marketId,
      adminWallet.userId,
      body.result,
    );
  }

  @Post('markets/:marketId/sync')
  async syncMarket(@Param('marketId', ParseIntPipe) marketId: number) {
    await this.marketSyncService.syncMarketFromBlockchain(marketId);
    return { success: true };
  }

  // ==================== TRANSACTIONS ====================
  @Get('transactions')
  async getTransactions(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { txHash: { contains: search, mode: 'insensitive' } },
        { solanaWallet: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { solanaWallet: { user: { email: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (type) {
      where.txType = type;
    }

    if (status !== undefined) {
      where.status = parseInt(status);
    }

    const [transactions, total] = await Promise.all([
      this.prisma.blockchainTransaction.findMany({
        where,
        include: {
          solanaWallet: {
            include: {
              user: { select: { id: true, username: true, firstname: true, lastname: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.blockchainTransaction.count({ where }),
    ]);

    return {
      data: transactions.map((tx: any) => ({
        id: tx.id,
        txHash: tx.txHash,
        txType: tx.txType,
        amount: Number(tx.amount),
        token: tx.token,
        marketId: tx.marketId,
        status: tx.status,
        createdAt: tx.createdAt.toISOString(),
        solanaWallet: tx.solanaWallet ? {
          publicKey: tx.solanaWallet.publicKey,
          user: {
            id: tx.solanaWallet.user.id,
            name: tx.solanaWallet.user.firstname
              ? `${tx.solanaWallet.user.firstname} ${tx.solanaWallet.user.lastname || ''}`.trim()
              : tx.solanaWallet.user.username,
            email: tx.solanaWallet.user.email,
          },
        } : null,
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  // ==================== SYNC ALL ====================
  @Post('sync')
  async syncAll() {
    // Sync all blockchain markets
    const markets = await this.prisma.blockchainMarket.findMany({
      where: { status: { in: [0, 1] } },
    });

    for (const market of markets) {
      try {
        await this.marketSyncService.syncMarketFromBlockchain(market.marketId);
      } catch (error) {
        console.error(`Failed to sync market ${market.marketId}:`, error);
      }
    }

    // Sync all wallet balances
    const wallets = await this.prisma.solanaWallet.findMany({
      where: { isCustodial: true },
    });

    for (const wallet of wallets) {
      try {
        await this.walletService.syncBalances(wallet.userId);
      } catch (error) {
        console.error(`Failed to sync wallet ${wallet.userId}:`, error);
      }
    }

    return { success: true, marketsSync: markets.length, walletsSync: wallets.length };
  }
}
