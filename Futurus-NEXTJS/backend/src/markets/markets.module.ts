import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { MarketsGateway } from './markets.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [MarketsController],
  providers: [MarketsService, MarketsGateway],
  exports: [MarketsService, MarketsGateway],
})
export class MarketsModule {}
