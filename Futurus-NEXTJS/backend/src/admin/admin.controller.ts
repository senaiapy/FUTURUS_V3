import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AdminService } from './admin.service';
import { AdminBalanceDto } from './dto/admin-balance.dto';
import { AdminChangePasswordDto } from './dto/change-password.dto';
import { Public } from './public.decorator';
import { AdminGuard } from './admin.guard';

const uploadsDir = join(process.cwd(), 'uploads', 'markets');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const imagesDir = join(process.cwd(), 'uploads', 'images');
if (!existsSync(imagesDir)) {
  mkdirSync(imagesDir, { recursive: true });
}

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==================== AUTH ====================
  @Post('login')
  @Public() // Override class-level guard to allow public access
  async login(@Body() body: { username: string; password: string }) {
    const admin = await this.adminService.validateAdmin(
      body.username,
      body.password,
    );
    if (!admin) throw new UnauthorizedException('Invalid admin credentials');
    return this.adminService.login(admin);
  }

  @Post('2fa/verify-login')
  @Public()
  async verify2faLogin(@Body() body: { adminId: string; code: string }) {
    const isValid = await this.adminService.verify2fa(
      parseInt(body.adminId),
      body.code,
    );
    if (!isValid) throw new UnauthorizedException('Invalid 2FA code');

    const admin = await this.adminService.findById(parseInt(body.adminId));
    return this.adminService.login({ ...admin, requires2fa: false });
  }

  @Post('login-user')
  @Public() // Allow users with admin permissions to login
  async loginAsUser(@Body() body: { username: string; password: string }) {
    return this.adminService.loginAsUser(body.username, body.password);
  }

  // ==================== SYSTEM ====================
  @Get('system/info')
  async getSystemInfo() {
    return this.adminService.getSystemInfo();
  }

  @Get('cron')
  async getCronJobs() {
    return this.adminService.getCronJobs();
  }

  @Get('extensions')
  async getExtensions() {
    return this.adminService.getExtensions();
  }

  @Patch('extensions/:id/status')
  async updateExtensionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.adminService.updateExtensionStatus(id, status);
  }

  // ==================== DASHBOARD ====================
  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('chart/:type')
  async getChartData(@Param('type') type: string) {
    return this.adminService.getChartData(type);
  }

  // ==================== NOTIFICATIONS ====================
  @Get('notifications')
  async getNotifications() {
    return this.adminService.getAdminNotifications();
  }

  @Patch('notifications/:id/read')
  async markNotificationRead(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.markNotificationRead(id);
  }

  @Post('notifications/read-all')
  async markAllRead() {
    return this.adminService.markAllNotificationsRead();
  }

  // ==================== USERS ====================
  @Get('users')
  async getUsers(@Query('filter') filter?: string) {
    return this.adminService.getAllUsers(filter);
  }

  @Get('users/:id')
  async getUserDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id')
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateUser(id, body);
  }

  // ==================== 2FA ====================
  @Get('2fa')
  async get2fa(@Request() req: any) {
    return this.adminService.get2faData(req.admin.sub);
  }

  @Post('2fa/enable')
  async enable2fa(@Request() req: any, @Body('code') code: string) {
    return this.adminService.enable2fa(req.admin.sub, code);
  }

  @Post('2fa/disable')
  async disable2fa(@Request() req: any, @Body('code') code: string) {
    return this.adminService.disable2fa(req.admin.sub, code);
  }

  @Get('2fa/recovery-codes')
  async getRecoveryCodes(@Request() req: any) {
    return this.adminService.getRecoveryCodes(req.admin.sub);
  }
  @Patch('users/:id/status')
  async setUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Post('users/:id/balance')
  async addSubBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() balanceDto: AdminBalanceDto,
  ) {
    return this.adminService.addSubBalance(
      id,
      balanceDto.amount,
      balanceDto.type || 'add',
      balanceDto.remark,
    );
  }

  @Post('users/:id/kyc-approve')
  async kycApprove(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.kycApprove(id);
  }

  @Post('users/:id/impersonate')
  async impersonateUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.generateImpersonationToken(id);
  }

  @Post('users/:id/kyc-reject')
  async kycReject(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ) {
    return this.adminService.kycReject(id, reason);
  }

  // ==================== CATEGORIES ====================
  @Get('categories')
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  async createCategory(@Body() body: { name: string; slug?: string }) {
    return this.adminService.createCategory(body);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.adminService.updateCategory(id, body);
  }

  @Patch('categories/:id/status')
  async toggleCategoryStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleCategoryStatus(id);
  }

  // ==================== SUBCATEGORIES ====================
  @Get('subcategories')
  async getSubcategories(@Query('categoryId') categoryId?: string) {
    return this.adminService.getSubcategories(
      categoryId ? +categoryId : undefined,
    );
  }

  @Post('subcategories')
  async createSubcategory(@Body() body: { name: string; categoryId: number }) {
    return this.adminService.createSubcategory(body);
  }

  @Patch('subcategories/:id/status')
  async toggleSubcategoryStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleSubcategoryStatus(id);
  }

  // ==================== MARKETS ====================
  @Get('markets')
  async getMarkets(@Query('filter') filter?: string) {
    return this.adminService.getMarkets(filter);
  }

  @Get('markets/:id')
  async getMarket(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getMarket(id);
  }

  @Post('markets')
  async createMarket(@Body() body: any) {
    return this.adminService.createMarket(body);
  }

  @Patch('markets/:id')
  async updateMarket(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateMarket(id, body);
  }

  @Patch('markets/:id/status')
  async toggleMarketStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.adminService.toggleMarketStatus(id, status);
  }

  @Post('markets/:id/lock')
  async toggleMarketLock(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleMarketLock(id);
  }

  @Post('markets/:id/trending')
  async toggleMarketTrending(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleMarketTrending(id);
  }

  @Post('markets/:id/cancel')
  async cancelMarket(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.cancelMarket(id);
  }

  @Post('markets/:id/resolve')
  async resolveMarket(
    @Param('id', ParseIntPipe) id: number,
    @Body('results') results: { optionId: number; outcome: 'yes' | 'no' }[],
  ) {
    return this.adminService.resolveMarket(id, results);
  }

  // Market Options
  @Get('markets/:id/options')
  async getMarketOptions(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getMarketOptions(id);
  }

  @Post('markets/:id/options')
  async createMarketOption(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.adminService.createMarketOption(id, body);
  }

  @Post('options/:id/lock')
  async toggleOptionLock(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleOptionLock(id);
  }

  // ==================== FILE UPLOAD ====================
  @Post('upload/market')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  async uploadMarketImage(@UploadedFile() file: Express.Multer.File) {
    return { url: `/uploads/markets/${file.filename}` };
  }

  @Post('upload/logo')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: imagesDir,
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'logo-' + uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for logo
    }),
  )
  async uploadLogoImage(@UploadedFile() file: Express.Multer.File) {
    const logoUrl = `/uploads/images/${file.filename}`;
    // Update the general settings with the new logo URL
    await this.adminService.updateGeneralSettings({ logoUrl });
    return { url: logoUrl };
  }

  // ==================== DEPOSITS ====================
  @Get('deposits')
  async getDeposits(
    @Query('filter') filter?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getDeposits(filter, userId ? +userId : undefined);
  }

  @Post('deposits/:id/approve')
  async approveDeposit(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveDeposit(id);
  }

  @Post('deposits/:id/reject')
  async rejectDeposit(
    @Param('id', ParseIntPipe) id: number,
    @Body('message') message: string,
  ) {
    return this.adminService.rejectDeposit(id, message);
  }

  // ==================== WITHDRAWALS ====================
  @Get('withdrawals')
  async getWithdrawals(
    @Query('filter') filter?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getWithdrawals(
      filter,
      userId ? +userId : undefined,
    );
  }

  @Post('withdrawals/:id/approve')
  async approveWithdrawal(
    @Param('id', ParseIntPipe) id: number,
    @Body('details') details?: string,
  ) {
    return this.adminService.approveWithdrawal(id, details);
  }

  @Post('withdrawals/:id/reject')
  async rejectWithdrawal(
    @Param('id', ParseIntPipe) id: number,
    @Body('details') details?: string,
  ) {
    return this.adminService.rejectWithdrawal(id, details);
  }

  // ==================== REPORTS ====================
  @Get('transactions')
  async getTransactions(@Query('userId') userId?: string) {
    return this.adminService.getTransactionReport(userId ? +userId : undefined);
  }

  @Get('reports/transactions')
  async getTransactionReport(@Query('userId') userId?: string) {
    return this.adminService.getTransactionReport(userId ? +userId : undefined);
  }

  @Get('reports/purchases')
  async getPurchaseReport(@Query('userId') userId?: string) {
    return this.adminService.getPurchaseReport(userId ? +userId : undefined);
  }

  @Get('reports/logins')
  async getLoginHistory() {
    return this.adminService.getLoginHistory();
  }

  // ==================== COMMENTS ====================
  @Get('comments/reported')
  async getReportedComments() {
    return this.adminService.getReportedComments();
  }

  @Patch('comments/:id/status')
  async toggleCommentStatus(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleCommentStatus(id);
  }

  // ==================== SUBSCRIBERS ====================
  @Get('subscribers')
  async getSubscribers() {
    return this.adminService.getSubscribers();
  }

  @Delete('subscribers/:id')
  async removeSubscriber(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeSubscriber(id);
  }

  // ==================== SUPPORT ====================
  @Get('tickets')
  async getTickets(@Query('filter') filter?: string) {
    return this.adminService.getTickets(filter);
  }

  @Get('tickets/:id')
  async getTicketDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getTicketDetail(id);
  }

  @Post('tickets/:id/reply')
  async replyTicket(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body('message') message: string,
  ) {
    return this.adminService.replyTicket(id, req.admin.sub, message);
  }

  @Post('tickets/:id/close')
  async closeTicket(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.closeTicket(id);
  }

  // ==================== SETTINGS ====================
  @Get('kyc-setting')
  async getKYCSetting() {
    return this.adminService.getKYCSetting();
  }

  @Post('kyc-setting')
  async updateKYCSetting(@Body() body: any) {
    return this.adminService.updateKYCSetting(body);
  }

  @Get('notification/settings')
  async getNotificationSettings() {
    return this.adminService.getNotificationSettings();
  }

  @Post('notification/settings')
  async updateNotificationSettings(@Body() body: any) {
    return this.adminService.updateNotificationSettings(body);
  }

  @Get('cookie-policy')
  async getCookiePolicy() {
    return this.adminService.getCookiePolicy();
  }

  @Post('cookie-policy')
  async updateCookiePolicy(@Body() body: any) {
    return this.adminService.updateCookiePolicy(body);
  }

  @Post('change-password')
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: AdminChangePasswordDto,
  ) {
    return this.adminService.updateAdminPassword(
      req.admin.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  // ==================== SETTINGS ====================
  @Get('settings/general')
  async getGeneralSettings() {
    return this.adminService.getGeneralSettings();
  }

  @Patch('settings/general')
  async updateGeneralSettings(@Body() body: any) {
    return this.adminService.updateGeneralSettings(body);
  }

  // ==================== GROUPS ====================
  @Get('groups')
  async getGroups(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getGroups({
      status: status ? parseInt(status) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  @Get('groups/stats')
  async getGroupStats() {
    return this.adminService.getGroupStats();
  }

  @Get('groups/:id')
  async getGroupDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getGroupDetail(id);
  }

  @Post('groups/:id/approve')
  async approveGroup(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.adminService.approveGroup(req.admin.sub, id);
  }

  @Post('groups/:id/reject')
  async rejectGroup(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectGroup(req.admin.sub, id, reason);
  }

  @Post('groups/:id/cancel')
  async cancelGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ) {
    return this.adminService.cancelGroup(id, reason || 'Cancelled by admin');
  }

  @Post('groups/:id/approve-result')
  async approveResult(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.adminService.approveResult(req.admin.sub, id);
  }

  @Post('groups/:id/reject-result')
  async rejectResult(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body('reason') reason: string,
  ) {
    return this.adminService.rejectResult(
      req.admin.sub,
      id,
      reason || 'Result rejected by admin',
    );
  }
}
