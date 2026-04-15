import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainController } from './blockchain.controller';
import { AdminBlockchainController } from './admin-blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { SolanaWalletService } from './solana-wallet.service';
import { MarketSyncService } from './market-sync.service';
import { BetSyncService } from './bet-sync.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'super-secret-admin'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [BlockchainController, AdminBlockchainController],
  providers: [
    BlockchainService,
    SolanaWalletService,
    MarketSyncService,
    BetSyncService,
  ],
  exports: [
    BlockchainService,
    SolanaWalletService,
    MarketSyncService,
    BetSyncService,
  ],
})
export class BlockchainModule {}
