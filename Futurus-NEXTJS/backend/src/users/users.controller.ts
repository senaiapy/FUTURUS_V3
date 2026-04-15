import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@GetUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@GetUser() user: any, @Body() body: any) {
    return this.usersService.updateProfile(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @GetUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.usersService.changePassword(
      user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  // KYC
  @Get('kyc-form')
  async getKycForm() {
    return this.usersService.getKycForm();
  }

  @UseGuards(JwtAuthGuard)
  @Get('kyc-data')
  async getKycData(@GetUser() user: any) {
    return this.usersService.getKycData(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('kyc-submit')
  @UseInterceptors(AnyFilesInterceptor())
  async submitKyc(
    @GetUser() user: any,
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this.usersService.submitKyc(user.id, body, files);
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa')
  async get2faData(@GetUser() user: any) {
    return this.usersService.get2faData(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa-mobile')
  async get2faDataMobile(@GetUser() user: any) {
    return this.usersService.get2faDataMobile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enable2fa(@GetUser() user: any, @Body() body: any) {
    return this.usersService.enable2fa(user.id, body.code, body.key);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disable2fa(@GetUser() user: any, @Body() body: any) {
    return this.usersService.disable2fa(user.id, body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/recovery-codes')
  async getRecoveryCodes(@GetUser() user: any) {
    return this.usersService.getRecoveryCodes(user.id);
  }

  // Referrals
  @UseGuards(JwtAuthGuard)
  @Get('referrals')
  async getReferrals(@GetUser() user: any) {
    return this.usersService.getReferrals(user.id);
  }

  // Bookmarks
  @UseGuards(JwtAuthGuard)
  @Post('markets/:id/bookmark')
  async toggleBookmark(
    @GetUser() user: any,
    @Param('id', ParseIntPipe) marketId: number,
  ) {
    return this.usersService.toggleBookmark(user.id, marketId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookmarks')
  async getBookmarkedMarkets(@GetUser() user: any) {
    return this.usersService.getBookmarkedMarkets(user.id);
  }

  // Login History
  @UseGuards(JwtAuthGuard)
  @Get('login-history')
  async getLoginHistory(@GetUser() user: any) {
    return this.usersService.getLoginHistory(user.id);
  }

  // Password Reset (public)
  @Post('password/email')
  async sendResetCode(@Body('email') email: string) {
    return this.usersService.sendResetCode(email);
  }

  @Post('password/verify-code')
  async verifyResetCode(@Body() body: { email: string; token: string }) {
    return this.usersService.verifyResetCode(body.email, body.token);
  }

  @Post('password/reset')
  async resetPassword(
    @Body() body: { email: string; token: string; password: string },
  ) {
    return this.usersService.resetPassword(
      body.email,
      body.token,
      body.password,
    );
  }

  // Delete Account
  @UseGuards(JwtAuthGuard)
  @Post('delete-account')
  async deleteAccount(@GetUser() user: any) {
    return this.usersService.deleteAccount(user.id);
  }

  // Dashboard
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@GetUser() user: any) {
    return this.usersService.getDashboardStats(user.id);
  }

  // Leaderboard (public)
  @Get('leaderboard')
  async getLeaderboard(
    @Query('period') period?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getLeaderboard({
      period: period || 'all',
      limit: parseInt(limit || '100'),
    });
  }
}
