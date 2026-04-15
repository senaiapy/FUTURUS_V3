import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

interface OAuthUserData {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(login: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsernameOrEmail(login);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      void password;

      if (user.ts === 1) {
        return { ...result, requires2fa: true };
      }

      return result;
    }
    return null;
  }

  async login(user: any) {
    if (user.requires2fa) {
      return {
        requires2fa: true,
        userId: user.id,
      };
    }
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async validateOAuthUser(oauthData: OAuthUserData) {
    // Check if user already exists with this provider
    let user = await this.prisma.user.findFirst({
      where: {
        provider: oauthData.provider,
        providerId: oauthData.providerId,
      },
    });

    if (user) {
      // Update user image if changed
      if (oauthData.image && user.image !== oauthData.image) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { image: oauthData.image },
        });
      }
      return user;
    }

    // Check if user exists with this email (link accounts)
    user = await this.prisma.user.findFirst({
      where: { email: oauthData.email },
    });

    if (user) {
      // Link OAuth provider to existing account
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          image: oauthData.image || user.image,
        },
      });
      return user;
    }

    // Create new user
    const username =
      oauthData.email.split('@')[0] + Math.floor(Math.random() * 1000);

    user = await this.prisma.user.create({
      data: {
        email: oauthData.email,
        username,
        firstname: oauthData.firstName,
        lastname: oauthData.lastName,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
        provider: oauthData.provider,
        providerId: oauthData.providerId,
        image: oauthData.image,
        ev: 1, // Email verified - OAuth emails are pre-verified
        status: 1, // Active
      },
    });

    return user;
  }
}
