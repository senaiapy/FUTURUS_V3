import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Decimal } from 'decimal.js';
import { GroupsService } from '../groups/groups.service';
import { TOTP, Secret } from 'otpauth';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
  ) {}

  async findById(id: number) {
    return this.prisma.admin.findUnique({ where: { id } });
  }

  // ==================== AUTH ====================
  async validateAdmin(username: string, pass: string): Promise<any> {
    const admin = await this.prisma.admin.findUnique({ where: { username } });
    if (admin && (await bcrypt.compare(pass, admin.password))) {
      const { password, ...result } = admin;

      // Check if 2FA is enabled but not yet verified for this login attempt
      if (admin.ts === 1) {
        return { ...result, requires2fa: true };
      }

      return result;
    }
    return null;
  }

  async login(admin: any) {
    if (admin.requires2fa) {
      return {
        requires2fa: true,
        adminId: admin.id,
      };
    }
    const payload = { username: admin.username, sub: admin.id, role: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
      admin,
      role: 'admin',
    };
  }

  // Login as User with admin permissions (staff login)
  async loginAsUser(username: string, pass: string): Promise<any> {
    // Try to find user by username or email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 1) {
      throw new UnauthorizedException('User account is not active');
    }

    // Check if user has admin permissions
    const permission = await this.prisma.adminPermission.findUnique({
      where: { userId: user.id },
    });

    if (!permission) {
      throw new UnauthorizedException(
        'Access Denied - You are not part of the admin group',
      );
    }

    if (!permission.isActive) {
      throw new UnauthorizedException(
        'Access Denied - Your admin access is locked',
      );
    }

    // Parse permissions
    const permissions = permission.permissions
      ? JSON.parse(permission.permissions)
      : {};

    // Create JWT with user_admin role
    const payload = {
      username: user.username,
      sub: user.id,
      role: 'user_admin',
      permissions,
    };

    const { password, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: user.id,
        name:
          `${user.firstname || ''} ${user.lastname || ''}`.trim() ||
          user.username,
        username: user.username,
        email: user.email,
        image: user.image,
      },
      role: 'user_admin',
      permissions,
    };
  }

  // ==================== 2FA ====================
  async get2faData(adminId: number) {
    console.log(`Getting 2FA data for admin ID: ${adminId}`);
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { ts: true, tsc: true, username: true, email: true },
    });

    if (!admin) throw new NotFoundException('Admin not found');

    if (admin.ts === 1) {
      return { enabled: true };
    }

    // Generate or use existing secret
    let secretStr = admin.tsc;
    if (!secretStr) {
      const secret = new Secret({ size: 20 });
      secretStr = secret.base32.toUpperCase();
      await this.prisma.admin.update({
        where: { id: adminId },
        data: { tsc: secretStr },
      });
      console.log(`Generated new 2FA secret for admin ${admin.username}`);
    }

    const appName = 'Futurus Admin';
    const label = `Admin:${admin.email || admin.username}`;
    
    const totp = new TOTP({
      issuer: appName,
      label: label,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secretStr),
    });

    const qrCodeUrl = await QRCode.toDataURL(totp.toString(), {
      margin: 2,
      width: 300,
    });

    return {
      enabled: false,
      secret: secretStr,
      qrCodeUrl,
    };
  }

  async enable2fa(adminId: number, code: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    if (!admin.tsc) throw new BadRequestException('Secret not generated');

    const totp = new TOTP({
      issuer: 'Futurus Admin',
      label: admin.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(admin.tsc),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) throw new BadRequestException('Invalid code');

    // Generate recovery codes if they don't exist
    const recoveryCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    ).join(',');

    return this.prisma.admin.update({
      where: { id: adminId },
      data: { 
        ts: 1,
        twoFactorRecoveryCodes: admin.twoFactorRecoveryCodes ? undefined : recoveryCodes
      },
    });
  }

  async getRecoveryCodes(adminId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { twoFactorRecoveryCodes: true },
    });
    return admin?.twoFactorRecoveryCodes?.split(',') || [];
  }

  async disable2fa(adminId: number, code: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    if (!admin.tsc) throw new BadRequestException('2FA not enabled');

    const totp = new TOTP({
      issuer: 'Futurus Admin',
      label: admin.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(admin.tsc),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) throw new BadRequestException('Invalid code');

    return this.prisma.admin.update({
      where: { id: adminId },
      data: { ts: 0, tsc: null },
    });
  }

  async verify2fa(adminId: number, code: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin || !admin.tsc) return false;

    const totp = new TOTP({
      issuer: 'Futurus Admin',
      label: admin.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(admin.tsc),
    });

    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  }

  // ==================== DASHBOARD ====================
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      totalMarkets,
      liveMarkets,
      pendingMarkets,
      totalVolume,
      totalPurchases,
      totalDeposits,
      pendingDeposits,
      totalWithdrawals,
      pendingWithdrawals,
      pendingTickets,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 1 } }),
      this.prisma.user.count({ where: { status: 0 } }),
      this.prisma.market.count(),
      this.prisma.market.count({ where: { status: 1 } }),
      this.prisma.market.count({ where: { status: 2 } }),
      this.prisma.market.aggregate({ _sum: { volume: true } }),
      this.prisma.purchase.count(),
      this.prisma.deposit.aggregate({
        _sum: { amount: true },
        where: { status: 1 },
      }),
      this.prisma.deposit.count({ where: { status: 2 } }),
      this.prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: { status: 1 },
      }),
      this.prisma.withdrawal.count({ where: { status: 2 } }),
      this.prisma.supportTicket.count({ where: { status: { in: [0, 2] } } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      totalMarkets,
      liveMarkets,
      pendingMarkets,
      totalVolume: totalVolume._sum.volume || 0,
      totalPurchases,
      totalDeposits: totalDeposits._sum.amount || 0,
      pendingDeposits,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      pendingWithdrawals,
      pendingTickets,
    };
  }

  async getChartData(type: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (type === 'deposit-withdraw') {
      const deposits = await this.prisma.deposit.findMany({
        where: { status: 1, createdAt: { gte: thirtyDaysAgo } },
        select: { amount: true, createdAt: true },
      });
      const withdrawals = await this.prisma.withdrawal.findMany({
        where: { status: 1, createdAt: { gte: thirtyDaysAgo } },
        select: { amount: true, createdAt: true },
      });
      return { deposits, withdrawals };
    }

    if (type === 'transactions') {
      return this.prisma.transaction.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { amount: true, trxType: true, createdAt: true },
      });
    }

    return [];
  }

  // ==================== USERS MANAGEMENT ====================
  async getAllUsers(filter?: string) {
    const where: any = {};
    if (filter === 'active') where.status = 1;
    else if (filter === 'banned') where.status = 0;
    else if (filter === 'email-verified') where.ev = 1;
    else if (filter === 'email-unverified') where.ev = 0;
    else if (filter === 'mobile-verified') where.sv = 1;
    else if (filter === 'mobile-unverified') where.sv = 0;
    else if (filter === 'kyc-unverified') where.kv = 0;
    else if (filter === 'kyc-pending') where.kv = 2;
    else if (filter === 'with-balance') where.balance = { gt: 0 };

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        email: true,
        mobile: true,
        balance: true,
        status: true,
        ev: true,
        sv: true,
        kv: true,
        createdAt: true,
        image: true,
      },
    });
  }

  async getUserDetail(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        purchases: { orderBy: { createdAt: 'desc' }, take: 10 },
        transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
        deposits: { orderBy: { createdAt: 'desc' }, take: 10 },
        withdrawals: { orderBy: { createdAt: 'desc' }, take: 10 },
        logins: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  async updateUserStatus(id: number, status: number) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async updateUser(id: number, data: any) {
    const updatable: any = {};
    const fields = [
      'firstname',
      'lastname',
      'email',
      'mobile',
      'status',
      'ev',
      'sv',
      'kv',
    ];
    for (const f of fields) {
      if (data[f] !== undefined) updatable[f] = data[f];
    }
    return this.prisma.user.update({ where: { id }, data: updatable });
  }

  async addSubBalance(
    id: number,
    amount: number,
    type: 'add' | 'sub',
    remark?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const decAmount = new Decimal(amount);
    if (type === 'sub' && new Decimal(user.balance.toString()).lt(decAmount)) {
      throw new BadRequestException('Insufficient balance to subtract');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          balance:
            type === 'add'
              ? { increment: decAmount }
              : { decrement: decAmount },
        },
      });

      await tx.transaction.create({
        data: {
          userId: id,
          amount: decAmount,
          charge: 0,
          postBalance: updated.balance,
          trxType: type === 'add' ? '+' : '-',
          trx: 'ADM' + Date.now().toString(36).toUpperCase(),
          details: remark || `Balance ${type} by admin`,
          remark: `admin_${type}`,
        },
      });

      return {
        message: `Balance ${type === 'add' ? 'added' : 'subtracted'} successfully`,
        balance: updated.balance,
      };
    });
  }

  async kycApprove(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { kv: 1 },
    });
  }

  async kycReject(id: number, reason: string) {
    return this.prisma.user.update({
      where: { id },
      data: { kv: 0, kycRejectionReason: reason },
    });
  }

  // ==================== CATEGORIES ====================
  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: { subCategories: true, _count: { select: { markets: true } } },
    });
  }

  async createCategory(data: { name: string; slug?: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug:
          data.slug ||
          data.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, ''),
      },
    });
  }

  async updateCategory(id: number, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async toggleCategoryStatus(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return this.prisma.category.update({
      where: { id },
      data: { status: cat.status === 1 ? 0 : 1 },
    });
  }

  // ==================== SUBCATEGORIES ====================
  async getSubcategories(categoryId?: number) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    return this.prisma.subCategory.findMany({
      where,
      include: { category: true },
    });
  }

  async createSubcategory(data: { name: string; categoryId: number }) {
    return this.prisma.subCategory.create({ data });
  }

  async toggleSubcategoryStatus(id: number) {
    const sub = await this.prisma.subCategory.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subcategory not found');
    return this.prisma.subCategory.update({
      where: { id },
      data: { status: sub.status === 1 ? 0 : 1 },
    });
  }

  // ==================== SYSTEM INFO ====================
  async getSystemInfo() {
    return {
      php_version: process.version,
      laravel_version: 'NestJS ' + require('../../package.json').version,
      server_software: process.platform,
      server_ip: '127.0.0.1', // Mock or use a lib to get IP
    };
  }

  // ==================== KYC SETTING ====================
  async getKYCSetting() {
    const form = await this.prisma.form.findFirst({ where: { act: 'kyc' } });
    if (!form) return { form_data: [] };
    return { form_data: JSON.parse(form.formData || '[]') };
  }

  async updateKYCSetting(data: any) {
    const existing = await this.prisma.form.findFirst({
      where: { act: 'kyc' },
    });
    const formData = JSON.stringify(data.form_data);
    if (existing) {
      return this.prisma.form.update({
        where: { id: existing.id },
        data: { formData },
      });
    }
    return this.prisma.form.create({ data: { act: 'kyc', formData } });
  }

  // ==================== NOTIFICATION SETTINGS ====================
  async getNotificationSettings() {
    return this.prisma.generalSetting.findFirst();
  }

  async updateNotificationSettings(data: any) {
    const gs = await this.prisma.generalSetting.findFirst();
    if (!gs) return this.prisma.generalSetting.create({ data });
    return this.prisma.generalSetting.update({ where: { id: gs.id }, data });
  }

  // ==================== COOKIE POLICY ====================
  async getCookiePolicy() {
    const cookie = await this.prisma.frontend.findFirst({
      where: { dataKeys: 'cookie.data' },
    });
    if (!cookie) return { short_desc: '', description: '', status: 0 };
    return JSON.parse(cookie.dataValues || '{}');
  }

  async updateCookiePolicy(data: any) {
    const existing = await this.prisma.frontend.findFirst({
      where: { dataKeys: 'cookie.data' },
    });
    const dataValues = JSON.stringify(data);
    if (existing) {
      return this.prisma.frontend.update({
        where: { id: existing.id },
        data: { dataValues },
      });
    }
    return this.prisma.frontend.create({
      data: { dataKeys: 'cookie.data', dataValues },
    });
  }

  // ==================== EXTENSIONS ====================
  async getExtensions() {
    return this.prisma.extension.findMany();
  }

  async updateExtensionStatus(id: number, status: number) {
    return this.prisma.extension.update({ where: { id }, data: { status } });
  }

  // ==================== CRON JOBS ====================
  async getCronJobs() {
    return this.prisma.cronJob.findMany();
  }

  // ==================== MARKETS ====================
  async getMarkets(filter?: string) {
    const where: any = {};
    const now = new Date();

    if (filter === 'draft') where.status = 0;
    else if (filter === 'upcoming') {
      where.status = 1;
      where.startDate = { gt: now };
    } else if (filter === 'live') {
      where.status = 1;
      where.startDate = { lte: now };
      where.endDate = { gt: now };
    } else if (filter === 'closing-soon') {
      const threeDays = new Date();
      threeDays.setDate(threeDays.getDate() + 3);
      where.status = 1;
      where.endDate = { lte: threeDays, gt: now };
    } else if (filter === 'pending') where.status = 2;
    else if (filter === 'declared') where.status = 3;
    else if (filter === 'cancelled') where.status = 4;
    else if (filter === 'completed') where.isPaid = true;
    else if (filter === 'disabled') where.status = 9;

    return this.prisma.market.findMany({
      where,
      include: {
        category: true,
        options: true,
        _count: { select: { purchases: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMarket(data: any) {
    return this.prisma.market.create({
      data: {
        question: data.question,
        slug: data.slug || data.question.toLowerCase().replace(/ /g, '-'),
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        image: data.image,
        type: data.type || 1,
        status: data.status || 0, // Draft by default
        options: data.options
          ? {
              create: data.options.map((opt: any) => ({
                question: opt.question,
                initialYesPool: opt.initialYesPool || 100,
                initialNoPool: opt.initialNoPool || 100,
                yesPool: opt.initialYesPool || 100,
                noPool: opt.initialNoPool || 100,
                commission: opt.commission || 5,
                chance: 50,
              })),
            }
          : undefined,
      },
      include: { options: true },
    });
  }

  async updateMarket(id: number, data: any) {
    return this.prisma.market.update({ where: { id }, data });
  }

  async toggleMarketStatus(id: number, status: number) {
    return this.prisma.market.update({ where: { id }, data: { status } });
  }

  async toggleMarketLock(id: number) {
    const m = await this.prisma.market.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Market not found');
    return this.prisma.market.update({
      where: { id },
      data: { isLock: !m.isLock },
    });
  }

  async toggleMarketTrending(id: number) {
    const m = await this.prisma.market.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Market not found');
    return this.prisma.market.update({
      where: { id },
      data: { isTrending: !m.isTrending },
    });
  }

  async cancelMarket(id: number) {
    // Cancel market and refund all purchases
    const market = await this.prisma.market.findUnique({
      where: { id },
      include: { purchases: { where: { status: { in: [0, 1] } } } },
    });
    if (!market) throw new NotFoundException('Market not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.market.update({ where: { id }, data: { status: 4 } });

      for (const purchase of market.purchases) {
        await tx.user.update({
          where: { id: purchase.userId },
          data: { balance: { increment: purchase.amount } },
        });
        await tx.purchase.update({
          where: { id: purchase.id },
          data: { status: 4 }, // Cancelled
        });
      }

      return { message: 'Market cancelled and refunds processed' };
    });
  }

  // Market Options
  async getMarketOptions(marketId: number) {
    return this.prisma.marketOption.findMany({ where: { marketId } });
  }

  async createMarketOption(marketId: number, data: any) {
    return this.prisma.marketOption.create({
      data: {
        marketId,
        question: data.question,
        initialYesPool: data.initialYesPool || 100,
        initialNoPool: data.initialNoPool || 100,
        yesPool: data.initialYesPool || 100,
        noPool: data.initialNoPool || 100,
        commission: data.commission || 5,
        chance: 50,
      },
    });
  }

  async toggleOptionLock(id: number) {
    const opt = await this.prisma.marketOption.findUnique({ where: { id } });
    if (!opt) throw new NotFoundException('Option not found');
    return this.prisma.marketOption.update({
      where: { id },
      data: { isLock: !opt.isLock },
    });
  }

  // Market Resolution
  async resolveMarket(
    marketId: number,
    results: { optionId: number; outcome: 'yes' | 'no' }[],
  ) {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      include: {
        options: true,
        purchases: { where: { status: { in: [0, 1] } } },
      },
    });
    if (!market) throw new NotFoundException('Market not found');

    return this.prisma.$transaction(async (tx) => {
      // Set results on options
      for (const result of results) {
        await tx.marketOption.update({
          where: { id: result.optionId },
          data: {
            isWinner: result.outcome === 'yes',
            winnerOutcome: result.outcome,
          },
        });
      }

      // Process payouts
      for (const purchase of market.purchases) {
        const optionResult = results.find(
          (r) => r.optionId === purchase.marketOptionId,
        );
        if (!optionResult) continue;

        const won = purchase.type === optionResult.outcome;

        if (won) {
          const winAmount = new Decimal(purchase.winAmount.toString());
          await tx.user.update({
            where: { id: purchase.userId },
            data: {
              balance: { increment: winAmount },
              totalProfit: {
                increment: new Decimal(purchase.profit.toString()),
              },
            },
          });

          await tx.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 2,
              isPaid: true,
              win: true,
              payoutProcessedAt: new Date(),
            },
          });

          await tx.transaction.create({
            data: {
              userId: purchase.userId,
              amount: winAmount,
              charge: 0,
              postBalance: 0, // Will be updated
              trxType: '+',
              trx: purchase.trx,
              details: `Won prediction on ${market.question}`,
              remark: 'purchase_win',
            },
          });
        } else {
          await tx.purchase.update({
            where: { id: purchase.id },
            data: { status: 3, win: false },
          });
        }
      }

      // Update market
      await tx.market.update({
        where: { id: marketId },
        data: { status: 3, isPaid: true, resolvedAt: new Date() },
      });

      return { message: 'Market resolved successfully' };
    });
  }

  // ==================== DEPOSITS ADMIN ====================
  async getDeposits(filter?: string, userId?: number) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (filter === 'pending') where.status = 2;
    else if (filter === 'approved') where.status = 1;
    else if (filter === 'rejected') where.status = 3;

    return this.prisma.deposit.findMany({
      where,
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveDeposit(id: number) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.status !== 2)
      throw new BadRequestException('Deposit is not pending');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.deposit.update({
        where: { id },
        data: { status: 1 },
      });

      const user = await tx.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount } },
      });

      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          amount: deposit.amount,
          charge: deposit.charge,
          postBalance: user.balance,
          trxType: '+',
          trx: deposit.trx || 'DEP' + Date.now().toString(36).toUpperCase(),
          details: `Deposit successful via Admin`,
          remark: 'deposit',
        },
      });

      return { message: 'Deposit approved successfully', deposit: updated };
    });
  }

  async rejectDeposit(id: number, message: string) {
    const deposit = await this.prisma.deposit.findUnique({ where: { id } });
    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.status !== 2)
      throw new BadRequestException('Deposit is not pending');

    return this.prisma.deposit.update({
      where: { id },
      data: { status: 3, adminFeedback: message },
    });
  }

  // ==================== WITHDRAWALS ADMIN ====================
  async getWithdrawals(filter?: string, userId?: number) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (filter === 'pending') where.status = 2;
    else if (filter === 'approved') where.status = 1;
    else if (filter === 'rejected') where.status = 3;

    return this.prisma.withdrawal.findMany({
      where,
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveWithdrawal(id: number, feedback?: string) {
    const withdraw = await this.prisma.withdrawal.findUnique({ where: { id } });
    if (!withdraw) throw new NotFoundException('Withdrawal not found');
    if (withdraw.status !== 2)
      throw new BadRequestException('Withdrawal is not pending');

    return this.prisma.withdrawal.update({
      where: { id },
      data: { status: 1, adminFeedback: feedback },
    });
  }

  async rejectWithdrawal(id: number, feedback?: string) {
    const withdraw = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!withdraw) throw new NotFoundException('Withdrawal not found');
    if (withdraw.status !== 2)
      throw new BadRequestException('Withdrawal is not pending');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawal.update({
        where: { id },
        data: { status: 3, adminFeedback: feedback },
      });

      const user = await tx.user.update({
        where: { id: withdraw.userId },
        data: { balance: { increment: withdraw.amount } },
      });

      await tx.transaction.create({
        data: {
          userId: withdraw.userId,
          amount: withdraw.amount,
          charge: 0,
          postBalance: user.balance,
          trxType: '+',
          trx: withdraw.trx || 'WDR' + Date.now().toString(36).toUpperCase(),
          details: 'Refunded for withdrawal rejection',
          remark: 'withdraw_reject',
        },
      });

      return {
        message: 'Withdrawal rejected successfully',
        withdrawal: updated,
      };
    });
  }

  // ==================== REPORTS ====================
  async getTransactionReport(userId?: number) {
    const where: any = {};
    if (userId) where.userId = userId;

    return this.prisma.transaction.findMany({
      where,
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getPurchaseReport(userId?: number) {
    const where: any = {};
    if (userId) where.userId = userId;

    return this.prisma.purchase.findMany({
      where,
      include: {
        user: { select: { id: true, username: true } },
        market: { select: { id: true, question: true } },
        marketOption: { select: { id: true, question: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getLoginHistory() {
    return this.prisma.userLogin.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // ==================== NOTIFICATIONS ====================
  async getAdminNotifications() {
    return this.prisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markNotificationRead(id: number) {
    return this.prisma.adminNotification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllNotificationsRead() {
    return this.prisma.adminNotification.updateMany({
      data: { isRead: true },
    });
  }

  // ==================== ADMIN PROFILE ====================
  async getAdminProfile(adminId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    const { password, ...result } = admin;
    return result;
  }

  async updateAdminProfile(
    adminId: number,
    data: { name?: string; email?: string; image?: string },
  ) {
    return this.prisma.admin.update({ where: { id: adminId }, data });
  }

  async updateAdminPassword(
    adminId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('Admin not found');

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid)
      throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashed },
    });
    return { message: 'Password updated successfully' };
  }

  // ==================== SETTINGS ====================
  async getGeneralSettings() {
    return this.prisma.generalSetting.findFirst();
  }

  async updateGeneralSettings(data: any) {
    const settings = await this.prisma.generalSetting.findFirst();
    if (!settings) {
      return this.prisma.generalSetting.create({ data });
    }
    return this.prisma.generalSetting.update({
      where: { id: settings.id },
      data,
    });
  }

  // ==================== COMMENTS ADMIN ====================
  async getReportedComments() {
    return this.prisma.comment.findMany({
      where: { isReported: true },
      include: {
        user: { select: { id: true, username: true } },
        market: { select: { id: true, question: true } },
      },
    });
  }

  async toggleCommentStatus(id: number) {
    const c = await this.prisma.comment.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Comment not found');
    return this.prisma.comment.update({
      where: { id },
      data: { status: c.status === 1 ? 0 : 1 },
    });
  }

  // ==================== SUBSCRIBERS ====================
  async getSubscribers() {
    return this.prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async removeSubscriber(id: number) {
    return this.prisma.subscriber.delete({ where: { id } });
  }

  // ==================== SUPPORT ADMIN ====================
  async getTickets(filter?: string) {
    const where: any = {};
    if (filter === 'pending') where.status = 0;
    else if (filter === 'answered') where.status = 1;
    else if (filter === 'closed') where.status = 3;

    return this.prisma.supportTicket.findMany({
      where,
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { lastReply: 'desc' },
    });
  }

  async getTicketDetail(id: number) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, email: true, image: true },
        },
        conversations: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async replyTicket(id: number, adminId: number, message: string) {
    return this.prisma.$transaction(async (tx) => {
      const msg = await tx.supportMessage.create({
        data: {
          ticketId: id,
          adminId: adminId,
          message: message,
        },
      });

      await tx.supportTicket.update({
        where: { id },
        data: { status: 1, lastReply: new Date() },
      });

      return msg;
    });
  }

  async closeTicket(id: number) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: 3 },
    });
  }

  // ==================== USER IMPERSONATION ====================
  async generateImpersonationToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, status: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 1) {
      throw new BadRequestException('Cannot impersonate inactive user');
    }

    // Generate a JWT token for the user (same as auth service)
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' }); // 1-hour impersonation token

    // Log the impersonation for audit trail
    await this.prisma.adminNotification.create({
      data: {
        userId: user.id,
        title: 'User Impersonation',
        clickUrl: `/users/${user.id}`,
      },
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      expiresIn: 3600,
      loginUrl: `${process.env.FRONTEND_URL}/auth/callback?token=${token}`,
    };
  }

  // ==================== GROUPS ====================
  async getGroups(params: {
    status?: number;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    return this.groupsService.findAllAdmin(params);
  }

  async getGroupStats() {
    return this.groupsService.getStats();
  }

  async getGroupDetail(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, username: true, firstname: true, image: true },
        },
        market: {
          select: {
            id: true,
            question: true,
            slug: true,
            image: true,
            status: true,
          },
        },
        members: {
          where: { status: 0 }, // ACTIVE
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstname: true,
                image: true,
              },
            },
          },
          orderBy: { contributionAmount: 'desc' },
        },
        orders: true,
        _count: { select: { members: true, votes: true } },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async approveGroup(adminId: number, groupId: number) {
    return this.groupsService.approveGroup(adminId, groupId);
  }

  async rejectGroup(adminId: number, groupId: number, reason: string) {
    return this.groupsService.rejectGroup(adminId, groupId, reason);
  }

  async cancelGroup(groupId: number, reason: string) {
    return this.groupsService.cancelAndRefund(groupId, reason);
  }

  async approveResult(adminId: number, groupId: number) {
    return this.groupsService.approveResult(adminId, groupId);
  }

  async rejectResult(adminId: number, groupId: number, reason: string) {
    return this.groupsService.rejectResult(adminId, groupId, reason);
  }
}
