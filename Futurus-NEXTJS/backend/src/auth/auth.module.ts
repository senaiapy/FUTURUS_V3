import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
// Commented out OAuth strategies - uncomment and add real credentials to enable social login
// import { GoogleStrategy } from './strategies/google.strategy';
// import { FacebookStrategy } from './strategies/facebook.strategy';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    // GoogleStrategy,    // Uncomment and add GOOGLE_CLIENT_ID/SECRET to enable
    // FacebookStrategy,  // Uncomment and add FACEBOOK_CLIENT_ID/SECRET to enable
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
