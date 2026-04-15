import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async getReferralSettings() {
    let settings = await this.prisma.referralSetting.findFirst();
    if (!settings) {
      settings = await this.prisma.referralSetting.create({
        data: {
          type: 'commission',
          commission: JSON.stringify({
            level1: 5,
            level2: 2,
            level3: 1,
          }),
          status: 0,
        },
      });
    }
    return settings;
  }

  async getReferralByCode(code: string) {
    const user = await this.prisma.user.findFirst({
      where: { username: code },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return {
        valid: false,
        message: 'Invalid referral code',
      };
    }

    return {
      valid: true,
      user: {
        id: user.id.toString(),
        username: user.username,
      },
      bonusAmount: 50,
    };
  }

  async generateReferralCode() {
    // This would be user-specific in a real implementation
    return {
      code: 'FUTURUS123',
      link: 'https://futurus.com.br/ref/FUTURUS123',
      totalReferrals: 0,
      totalEarnings: '0.00',
    };
  }

  async updateReferralSettings(data: any) {
    const settings = await this.getReferralSettings();
    return this.prisma.referralSetting.update({
      where: { id: settings.id },
      data,
    });
  }

  async updateReferralRegisterSettings(data: any) {
    // Update registration bonus settings
    const settings = await this.prisma.generalSetting.findFirst();
    if (settings) {
      return this.prisma.generalSetting.update({
        where: { id: settings.id },
        data: { refCommissionCount: data.enabled ? 1 : 0 },
      });
    }
    return { message: 'Settings updated' };
  }

  async toggleReferralStatus(type: string) {
    const settings = await this.getReferralSettings();
    return this.prisma.referralSetting.update({
      where: { id: settings.id },
      data: {
        status: settings.status === 1 ? 0 : 1,
      },
    });
  }
}
