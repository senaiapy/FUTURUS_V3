import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MarketsModule } from './markets/markets.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PurchasesModule } from './purchases/purchases.module';
import { AdminModule } from './admin/admin.module';
import { CategoriesModule } from './categories/categories.module';
import { DepositsModule } from './deposits/deposits.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { CommentsModule } from './comments/comments.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SettingsModule } from './settings/settings.module';
import { SupportModule } from './support/support.module';
import { GatewaysModule } from './gateways/gateways.module';
import { ReferralsModule } from './referrals/referrals.module';
import { GameModule } from './game/game.module';
import { AsaasModule } from './asaas/asaas.module';
import { PaypalModule } from './paypal/paypal.module';
import { StripeModule } from './stripe/stripe.module';
import { PermissionsModule } from './permissions/permissions.module';
import { BlogsModule } from './blogs/blogs.module';
import { GroupsModule } from './groups/groups.module';
import { BetsModule } from './bets/bets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { MaintenanceMiddleware } from './common/middleware/maintenance.middleware';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60, // 1 minute
        limit: 100, // 100 requests per minute
        // For auth endpoints, use stricter limits in controllers
      },
    ]),
    MarketsModule,
    AuthModule,
    UsersModule,
    PurchasesModule,
    AdminModule,
    CategoriesModule,
    DepositsModule,
    WithdrawalsModule,
    CommentsModule,
    TransactionsModule,
    SettingsModule,
    SupportModule,
    GatewaysModule,
    ReferralsModule,
    GameModule,
    AsaasModule,
    PaypalModule,
    StripeModule,
    PermissionsModule,
    BlogsModule,
    GroupsModule,
    BetsModule,
    NotificationsModule,
    BlockchainModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, MaintenanceMiddleware).forRoutes('*');
  }
}
