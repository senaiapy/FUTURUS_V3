import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SolanaWalletService } from './solana-wallet.service';
import { MarketSyncService } from './market-sync.service';
import { BetSyncService } from './bet-sync.service';
import {
  CreateWalletDto,
  LinkWalletDto,
  PlaceBlockchainBetDto,
} from './dto';

@Controller('blockchain')
export class BlockchainController {
  constructor(
    private walletService: SolanaWalletService,
    private marketSyncService: MarketSyncService,
    private betSyncService: BetSyncService,
  ) {}

  // ===== WALLET ENDPOINTS =====

  @UseGuards(JwtAuthGuard)
  @Post('wallet/create')
  async createWallet(@Request() req: any, @Body() dto: CreateWalletDto) {
    return this.walletService.createCustodialWallet(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('wallet/link')
  async linkWallet(@Request() req: any, @Body() dto: LinkWalletDto) {
    return this.walletService.linkExternalWallet(req.user.id, dto.publicKey);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet')
  async getWallet(@Request() req: any) {
    const wallet = await this.walletService.getWallet(req.user.id);
    if (!wallet) {
      return { hasWallet: false };
    }
    return { hasWallet: true, ...wallet };
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet/balance')
  async getBalance(@Request() req: any) {
    return this.walletService.syncBalances(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('txType') txType?: string,
  ) {
    return this.walletService.getTransactions(req.user.id, { page, limit, txType });
  }

  // ===== BETTING ENDPOINTS =====

  @UseGuards(JwtAuthGuard)
  @Post('bet')
  async placeBet(@Request() req: any, @Body() dto: PlaceBlockchainBetDto) {
    return this.betSyncService.placeBetOnChain(req.user.id, {
      marketId: dto.marketId,
      isYes: dto.isYes,
      amount: dto.amount,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('claim/:marketId')
  async claimWinnings(
    @Request() req: any,
    @Param('marketId', ParseIntPipe) marketId: number,
  ) {
    return this.betSyncService.claimWinnings(req.user.id, marketId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('positions')
  async getPositions(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.betSyncService.getUserPositions(req.user.id, { page, limit });
  }

  @UseGuards(JwtAuthGuard)
  @Get('positions/:marketId')
  async getPosition(
    @Request() req: any,
    @Param('marketId', ParseIntPipe) marketId: number,
  ) {
    const position = await this.betSyncService.getPosition(req.user.id, marketId);
    if (!position) {
      return { hasPosition: false };
    }
    return { hasPosition: true, ...position };
  }

  // ===== MARKET ENDPOINTS (READ-ONLY FOR USERS) =====

  @Get('markets')
  async listMarkets(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    const statusMap: Record<string, number> = {
      PENDING: 0,
      ACTIVE: 1,
      RESOLVED: 2,
    };
    const statusNum = status ? statusMap[status.toUpperCase()] : undefined;
    return this.marketSyncService.listBlockchainMarkets({ page, limit, status: statusNum });
  }

  @Get('markets/:marketId')
  async getMarket(@Param('marketId', ParseIntPipe) marketId: number) {
    const market = await this.marketSyncService.getBlockchainMarket(marketId);
    if (!market) {
      return { isDeployed: false };
    }
    return { isDeployed: true, ...market };
  }
}

// Admin controller moved to admin-blockchain.controller.ts
