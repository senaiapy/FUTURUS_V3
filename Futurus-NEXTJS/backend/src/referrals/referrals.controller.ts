import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  // Public - Get referral settings
  @Get('settings')
  async getReferralSettings() {
    return this.referralsService.getReferralSettings();
  }

  // Public - Get referral by code
  @Get(':code')
  async getReferralByCode(@Param('code') code: string) {
    return this.referralsService.getReferralByCode(code);
  }

  @Post('generate')
  async generateReferralCode() {
    return this.referralsService.generateReferralCode();
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Get('admin/settings')
  async getAdminReferralSettings() {
    return this.referralsService.getReferralSettings();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/settings')
  async updateReferralSettings(@Body() body: any) {
    return this.referralsService.updateReferralSettings(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/settings/register')
  async updateReferralRegisterSettings(@Body() body: any) {
    return this.referralsService.updateReferralRegisterSettings(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/status/:type')
  async toggleReferralStatus(@Param('type') type: string) {
    return this.referralsService.toggleReferralStatus(type);
  }
}
