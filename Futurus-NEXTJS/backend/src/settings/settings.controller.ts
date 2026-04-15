import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { SaveCookieConsentDto } from './dto/save-cookie-consent.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public
  @Get()
  async getSettings() {
    return this.settingsService.getGeneralSettings();
  }

  @Get('general')
  async getGeneralSettings() {
    return this.settingsService.getGeneralSettings();
  }

  @Get('languages')
  async getLanguages() {
    return this.settingsService.getLanguages();
  }

  @Get('countries')
  async getCountries() {
    return this.settingsService.getCountries();
  }

  @Get('policies')
  async getPolicies() {
    return this.settingsService.getPolicies();
  }

  @Get('policy/:slug')
  async getPolicyBySlug(@Param('slug') slug: string) {
    return this.settingsService.getPolicyBySlug(slug);
  }

  @Get('faq')
  async getFaq() {
    return this.settingsService.getFaq();
  }

  @Get('seo')
  async getSeo() {
    return this.settingsService.getSeo();
  }

  @Get('frontend-sections')
  async getFrontendSections(@Query('key') key?: string) {
    return this.settingsService.getFrontendSections(key);
  }

  @Get('pages')
  async getPages() {
    return this.settingsService.getPages();
  }

  @Get('pages/:slug')
  async getPageBySlug(@Param('slug') slug: string) {
    return this.settingsService.getPageBySlug(slug);
  }

  @Get('custom-pages')
  async getCustomPages() {
    return this.settingsService.getCustomPages();
  }

  @Get('custom-page/:slug')
  async getCustomPageBySlug(@Param('slug') slug: string) {
    return this.settingsService.getCustomPageBySlug(slug);
  }

  @Get('extensions')
  async getExtensions() {
    return this.settingsService.getExtensions();
  }

  @Get('extension/:act')
  async getExtensionByAct(@Param('act') act: string) {
    return this.settingsService.getExtensionByAct(act);
  }

  @Get('cookie')
  async getCookie() {
    return this.settingsService.getCookiePolicy();
  }

  @Post('cookie/accept')
  async acceptCookie() {
    return this.settingsService.acceptCookie();
  }

  // Subscriber (public)
  @Post('subscribe')
  async subscribe(@Body('email') email: string) {
    return this.settingsService.addSubscriber(email);
  }

  // Contact form
  @Post('contact')
  async submitContact(
    @Body()
    body: {
      name: string;
      email: string;
      subject: string;
      message: string;
    },
  ) {
    return this.settingsService.submitContact(body);
  }

  // Admin endpoints
  @Patch('general')
  async updateGeneralSettings(@Body() body: any) {
    return this.settingsService.updateGeneralSettings(body);
  }

  @Post('languages')
  async createLanguage(
    @Body() body: { name: string; code: string; image?: string },
  ) {
    return this.settingsService.createLanguage(body);
  }

  @Patch('languages/:id')
  async updateLanguage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.settingsService.updateLanguage(id, body);
  }

  @Delete('languages/:id')
  async deleteLanguage(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.deleteLanguage(id);
  }

  @Post('frontend-sections')
  async createFrontendSection(@Body() body: any) {
    return this.settingsService.createFrontendSection(body);
  }

  @Patch('frontend-sections/:id')
  async updateFrontendSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.settingsService.updateFrontendSection(id, body);
  }

  @Delete('frontend-sections/:id')
  async deleteFrontendSection(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.deleteFrontendSection(id);
  }

  @Post('pages')
  async createPage(@Body() body: any) {
    return this.settingsService.createPage(body);
  }

  @Patch('pages/:id')
  async updatePage(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.settingsService.updatePage(id, body);
  }

  @Delete('pages/:id')
  async deletePage(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.deletePage(id);
  }

  @Patch('extensions/:id')
  async updateExtension(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.settingsService.updateExtension(id, body);
  }

  @Get('subscribers')
  async getSubscribers() {
    return this.settingsService.getSubscribers();
  }

  @Delete('subscribers/:id')
  async removeSubscriber(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.removeSubscriber(id);
  }

  // Cookie Consent (GDPR)
  @Post('cookie-consent')
  async saveCookieConsent(
    @Body() dto: SaveCookieConsentDto,
    @Req() req: Request,
  ) {
    return this.settingsService.saveCookieConsent({
      ...dto,
      ipAddress: req.ip || req.socket.remoteAddress,
      sessionId: (req.headers['x-session-id'] as string) || undefined,
    });
  }

  @Get('cookie-policy')
  async getCookiePolicy() {
    return this.settingsService.getCookiePolicy();
  }

  // Admin: Cookie consent management
  @Get('cookie-consents')
  async getCookieConsents(
    @Query('userId', ParseIntPipe) userId?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.settingsService.getCookieConsents({ userId, limit });
  }

  @Get('cookie-consents/stats')
  async getCookieConsentStats() {
    return this.settingsService.getCookieConsentStats();
  }

  // System status (for maintenance mode check)
  @Get('status')
  async getStatus() {
    const settings = await this.settingsService.getGeneralSettings();
    return {
      maintenanceMode: settings.maintenanceMode === 1,
      maintenanceMessage:
        settings.maintenanceMessage ||
        'System under maintenance. We will be back soon!',
    };
  }
}
