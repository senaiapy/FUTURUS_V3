import { Module } from '@nestjs/common';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MarketsModule } from '../markets/markets.module';

@Module({
  imports: [PrismaModule, MarketsModule],
  controllers: [BetsController],
  providers: [BetsService],
  exports: [BetsService],
})
export class BetsModule {}
