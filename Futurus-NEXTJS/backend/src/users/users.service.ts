import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { TOTP, Secret } from 'otpauth';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsernameOrEmail(login: string): Promise<User | null> {
    const normalizedLogin = login.toLowerCase();
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: login },
          { email: normalizedLogin },
          { username: normalizedLogin },
        ],
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: any): Promise<User> {
    const existing = await this.findByUsernameOrEmail(data.email);
    if (existing) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Handle 'name' field from mobile app - split into firstname/lastname
    let firstname = data.firstname;
    let lastname = data.lastname;
    if (data.name && !firstname) {
      const nameParts = data.name.trim().split(' ');
      firstname = nameParts[0];
      lastname = nameParts.slice(1).join(' ') || '';
    }

    return await this.prisma.user.create({
      data: {
        firstname: firstname || '',
        lastname: lastname || '',
        email: data.email.toLowerCase(),
        username: data.username || data.email.split('@')[0],
        password: hashedPassword,
        mobile: data.phone,
        status: 1,
        profileComplete: true,
      },
    });
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        email: true,
        image: true,
        mobile: true,
        dialCode: true,
        balance: true,
        totalSharesBought: true,
        totalProfit: true,
        successRate: true,
        countryName: true,
        city: true,
        state: true,
        zip: true,
        address: true,
        status: true,
        kv: true,
        ev: true,
        sv: true,
        ts: true,
        profileComplete: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    userId: number,
    data: {
      firstname?: string;
      lastname?: string;
      mobile?: string;
      dialCode?: string;
      countryName?: string;
      city?: string;
      state?: string;
      zip?: string;
      address?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid)
      throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  // KYC
  async getKycForm() {
    const form = await this.prisma.form.findFirst({ where: { act: 'kyc' } });
    return form;
  }

  async getKycData(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { kv: true, kycData: true, kycRejectionReason: true },
    });
    return user;
  }

  async submitKyc(
    userId: number,
    body: any,
    files: Array<Express.Multer.File>,
  ) {
    // Check if running inside Docker (via standard DATABASE_URL configuration)
    const isDocker = process.env.DATABASE_URL?.includes('db:') || false;
    
    // Determine the absolute path to Laravel's assets/verify directory
    const laravelVerifyPath = isDocker 
      ? '/app/laravel_verify'
      : path.resolve(__dirname, '../../../../Futurus-LARAVEL/assets/verify');

    // Ensure the directory exists
    try {
      await fs.mkdir(laravelVerifyPath, { recursive: true });
    } catch (err) {
      console.error('Failed to create laravel verification directory', err);
    }

    // Prepare the exact JSON structure expected by Laravel
    const kycDataArray = [];

    // Parse the body if it contains stringified JSON from NextJS frontend or normal fields from FormData
    let parsedBody = body;
    if (body.kycData && typeof body.kycData === 'string') {
      try {
        parsedBody = JSON.parse(body.kycData);
      } catch (e) {}
    }

    if (parsedBody.documentType || parsedBody.document_type) {
      kycDataArray.push({
        name: 'Tipo de Documento',
        type: 'text',
        value: parsedBody.documentType || parsedBody.document_type,
      });
    }
    if (parsedBody.firstname) {
      kycDataArray.push({
        name: 'Nome',
        type: 'text',
        value: parsedBody.firstname,
      });
    }
    if (parsedBody.lastname) {
      kycDataArray.push({
        name: 'Sobrenome',
        type: 'text',
        value: parsedBody.lastname,
      });
    }
    if (parsedBody.address) {
      kycDataArray.push({
        name: 'Endereço',
        type: 'text',
        value: parsedBody.address,
      });
    }

    // Process uploaded files securely
    if (files && files.length > 0) {
      for (const file of files) {
        const extension = path.extname(file.originalname) || '.jpg';
        const randomName = crypto.randomBytes(6).toString('hex');
        const fileName = `${Date.now()}_${randomName}${extension}`;
        const filePath = path.join(laravelVerifyPath, fileName);

        await fs.writeFile(filePath, file.buffer);

        let fieldName = 'Documento Anexado';
        if (file.fieldname === 'document_front')
          fieldName = 'Frente do Documento';
        if (file.fieldname === 'document_back')
          fieldName = 'Verso do Documento';
        if (file.fieldname === 'selfie') fieldName = 'Selfie com Documento';

        kycDataArray.push({
          name: fieldName,
          type: 'file',
          value: fileName,
        });
      }
    }

    const kycDataJson = JSON.stringify(kycDataArray);

    return this.prisma.user.update({
      where: { id: userId },
      data: { kycData: kycDataJson, kv: 2 }, // 2 = pending
    });
  }

  // 2FA
  async get2faData(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { ts: true, tsc: true, username: true, email: true },
      });

      if (!user) throw new NotFoundException('User not found');

      if (user.ts === 1) {
        return { enabled: true };
      }

      // If not enabled, generate/return secret and local QR URL
      let secret = user.tsc;
      if (!secret) {
        // Generate a proper Base32 secret for TOTP
        secret = new Secret({ size: 20 }).base32;
        await this.prisma.user.update({
          where: { id: userId },
          data: { tsc: secret },
        });
      }

      const appName = process.env.OTP_ISSUER || 'Futurus';
      const label = `${appName}:${user.email || user.username}`;

      const totp = new TOTP({
        issuer: appName,
        label: label,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(secret),
      });

      const qrCodeUrl = await QRCode.toDataURL(totp.toString(), {
        margin: 2,
        width: 400, // Increased size for better scan quality
      });

      return {
        enabled: false,
        secret,
        qrCodeUrl,
      };
    } catch (error) {
      console.error('Error fetching 2FA data:', error);
      throw error;
    }
  }

  async get2faDataMobile(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { ts: true, tsc: true, username: true, email: true },
      });

      if (!user) throw new NotFoundException('User not found');

      if (user.ts === 1) {
        return { enabled: true };
      }

      let secret = user.tsc;
      if (!secret) {
        secret = new Secret({ size: 20 }).base32;
        await this.prisma.user.update({
          where: { id: userId },
          data: { tsc: secret },
        });
      }

      const appName = process.env.OTP_ISSUER || 'Futurus';
      const label = `${appName}:${user.email || user.username}`;

      const totp = new TOTP({
        issuer: appName,
        label: label,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: Secret.fromBase32(secret),
      });

      const totpUri = totp.toString();

      return {
        enabled: false,
        secret,
        totpUri,
      };
    } catch (error) {
      console.error('Error fetching mobile 2FA data:', error);
      throw error;
    }
  }

  async enable2fa(userId: number, code: string, key?: string) {
    // Verify the 6-digit TOTP code using the secret key
    if (!code || code.length !== 6) {
      throw new BadRequestException('Invalid verification code format');
    }

    // Get the user to retrieve their secret
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tsc: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use the provided key or the stored secret
    const secret = key || user.tsc;
    if (!secret) {
      throw new BadRequestException(
        '2FA secret not found. Please enable 2FA first.',
      );
    }

    // Verify TOTP code
    const totp = new TOTP({
      issuer: process.env.OTP_ISSUER || 'Futurus',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret),
    });

    // Validate the code (allow 1 window of time for clock skew)
    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate recovery codes if they don't exist
    const recoveryCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase(),
    ).join(',');

    const updateData: any = {
      ts: 1,
      tsc: key || user.tsc,
    };

    // If user doesn't have recovery codes yet, set them
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorRecoveryCodes: true },
    });

    if (!currentUser?.twoFactorRecoveryCodes) {
      updateData.twoFactorRecoveryCodes = recoveryCodes;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async getRecoveryCodes(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorRecoveryCodes: true },
    });
    return user?.twoFactorRecoveryCodes?.split(',') || [];
  }

  async disable2fa(userId: number, code: string) {
    if (!code || code.length !== 6) {
      throw new BadRequestException('Invalid verification code format');
    }

    // Get the user to retrieve their secret
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tsc: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.tsc) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify TOTP code before disabling
    const totp = new TOTP({
      issuer: 'Futurus',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(user.tsc),
    });

    // Validate the code (allow 1 window of time for clock skew)
    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) {
      throw new BadRequestException('Invalid verification code');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { ts: 0, tsc: null },
    });
  }

  async verify2fa(userId: number, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tsc: true, email: true, ts: true },
    });

    if (!user || user.ts !== 1 || !user.tsc) {
      return false;
    }

    const totp = new TOTP({
      issuer: process.env.OTP_ISSUER || 'Futurus',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(user.tsc),
    });

    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  }

  // Referrals
  async getReferrals(userId: number) {
    return this.prisma.user.findMany({
      where: { refBy: userId },
      select: { id: true, username: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Bookmarks
  async toggleBookmark(userId: number, marketId: number) {
    const existing = await this.prisma.marketBookmark.findFirst({
      where: { userId, marketId },
    });

    if (existing) {
      await this.prisma.marketBookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    } else {
      await this.prisma.marketBookmark.create({ data: { userId, marketId } });
      return { bookmarked: true };
    }
  }

  async getBookmarkedMarkets(userId: number) {
    return this.prisma.marketBookmark.findMany({
      where: { userId },
      include: {
        market: {
          include: {
            category: true,
            options: { where: { status: 1 } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Login history
  async recordLogin(userId: number, data: any) {
    return this.prisma.userLogin.create({
      data: {
        userId,
        userIp: data.ip,
        browser: data.browser,
        os: data.os,
        city: data.city,
        country: data.country,
        countryCode: data.countryCode,
        longitude: data.longitude,
        latitude: data.latitude,
      },
    });
  }

  async getLoginHistory(userId: number) {
    return this.prisma.userLogin.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // Password Reset
  async sendResetCode(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const token = crypto.randomBytes(20).toString('hex');
    await this.prisma.passwordReset.create({
      data: { email, token },
    });

    // TODO: Send email with token
    return { message: 'Reset code sent to your email' };
  }

  async verifyResetCode(email: string, token: string) {
    const reset = await this.prisma.passwordReset.findFirst({
      where: { email, token, status: 1 },
    });
    if (!reset) throw new BadRequestException('Invalid or expired code');
    return { valid: true };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    const reset = await this.prisma.passwordReset.findFirst({
      where: { email, token, status: 1 },
    });
    if (!reset) throw new BadRequestException('Invalid or expired code');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordReset.update({
      where: { id: reset.id },
      data: { status: 0 },
    });

    return { message: 'Password reset successfully' };
  }

  // Delete Account
  async deleteAccount(userId: number) {
    // Soft delete - just ban the user
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 0, banReason: 'Account deleted by user' },
    });
  }

  // ==================== DASHBOARD STATS ====================
  async getDashboardStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        totalSharesBought: true,
        totalProfit: true,
        kv: true,
        ts: true,
      },
    });

    const [totalWithdraw, totalDeposit, recentPurchases, recentMarkets] =
      await Promise.all([
        this.prisma.withdrawal.aggregate({
          where: { userId, status: 1 },
          _sum: { amount: true },
        }),
        this.prisma.deposit.aggregate({
          where: { userId, status: 1 },
          _sum: { amount: true },
        }),
        this.prisma.purchase.findMany({
          where: { userId },
          include: { market: true },
          orderBy: { createdAt: 'desc' },
          take: 4,
        }),
        this.prisma.market.findMany({
          where: { status: 1 },
          orderBy: { createdAt: 'desc' },
          take: 4,
        }),
      ]);

    return {
      user,
      summaries: {
        totalWithdraw: totalWithdraw._sum.amount || 0,
        totalDeposit: totalDeposit._sum.amount || 0,
        totalShares: user?.totalSharesBought || 0,
      },
      recentPurchases,
      recentMarkets,
    };
  }

  async getLeaderboard(params: { period: string; limit: number }) {
    const { period, limit } = params;

    // Calculate date filter based on period
    let createdAtFilter = {};
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      createdAtFilter = { gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      createdAtFilter = { gte: monthAgo };
    } else if (period === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      createdAtFilter = { gte: yearAgo };
    }

    // Get top users by profit
    const users = await this.prisma.user.findMany({
      where: {
        status: 1, // Active users only
        ...(period !== 'all' && {
          purchases: {
            some: {
              createdAt: createdAtFilter,
            },
          },
        }),
      },
      select: {
        id: true,
        username: true,
        image: true,
        totalProfit: true,
        totalSharesBought: true,
        createdAt: true,
        _count: {
          select: {
            purchases: true,
          },
        },
      },
      orderBy: {
        totalProfit: 'desc',
      },
      take: limit,
    });

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      image: user.image,
      totalProfit: user.totalProfit,
      totalShares: user.totalSharesBought,
      totalTrades: user._count.purchases,
      joinedAt: user.createdAt,
    }));

    return {
      success: true,
      period,
      count: leaderboard.length,
      data: leaderboard,
    };
  }
}
