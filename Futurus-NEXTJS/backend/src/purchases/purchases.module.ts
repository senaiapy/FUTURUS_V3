import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { BetsController } from './bets.controller';
import { MarketsModule } from '../markets/markets.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [MarketsModule, PrismaModule],
  providers: [PurchasesService],
  controllers: [PurchasesController, BetsController],
})
export class PurchasesModule {}
