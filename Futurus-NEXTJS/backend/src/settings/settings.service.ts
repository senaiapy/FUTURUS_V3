import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getGeneralSettings() {
    let settings = await this.prisma.generalSetting.findFirst();
    if (!settings) {
      settings = await this.prisma.generalSetting.create({
        data: {
          siteName: 'Futurus',
          curText: 'USD',
          curSym: '$',
          baseColor: '221 75% 60%',
          secondaryColor: '224 40% 27%',
          registration: 1,
          ev: 0,
          sv: 0,
          activeTemplate: 'basic',
        },
      });
    }
    return settings;
  }

  async updateGeneralSettings(data: any) {
    const settings = await this.getGeneralSettings();
    return this.prisma.generalSetting.update({
      where: { id: settings.id },
      data,
    });
  }

  async getLanguages() {
    return this.prisma.language.findMany({ orderBy: { name: 'asc' } });
  }

  async createLanguage(data: { name: string; code: string }) {
    return this.prisma.language.create({ data });
  }

  async updateLanguage(id: number, data: any) {
    return this.prisma.language.update({ where: { id }, data });
  }

  async deleteLanguage(id: number) {
    return this.prisma.language.delete({ where: { id } });
  }

  // Frontend CMS sections
  async getFrontendSections(key?: string) {
    const where: any = {};
    if (key) where.dataKeys = key;
    return this.prisma.frontend.findMany({ where, orderBy: { id: 'desc' } });
  }

  async updateFrontendSection(id: number, data: any) {
    return this.prisma.frontend.update({ where: { id }, data });
  }

  async createFrontendSection(data: any) {
    return this.prisma.frontend.create({ data });
  }

  async deleteFrontendSection(id: number) {
    return this.prisma.frontend.delete({ where: { id } });
  }

  // Pages
  async getPages() {
    return this.prisma.page.findMany({ orderBy: { id: 'desc' } });
  }

  async getPageBySlug(slug: string) {
    return this.prisma.page.findUnique({ where: { slug } });
  }

  async createPage(data: any) {
    return this.prisma.page.create({ data });
  }

  async updatePage(id: number, data: any) {
    return this.prisma.page.update({ where: { id }, data });
  }

  async deletePage(id: number) {
    return this.prisma.page.delete({ where: { id } });
  }

  // Extensions
  async getExtensions() {
    return this.prisma.extension.findMany();
  }

  async updateExtension(id: number, data: any) {
    return this.prisma.extension.update({ where: { id }, data });
  }

  // Subscribers
  async getSubscribers() {
    return this.prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async addSubscriber(email: string) {
    return this.prisma.subscriber.upsert({
      where: { email },
      create: { email },
      update: {},
    });
  }

  async removeSubscriber(id: number) {
    return this.prisma.subscriber.delete({ where: { id } });
  }

  // Countries data
  async getCountries() {
    const countries = [
      { code: 'BR', name: 'Brazil', dialCode: '+55' },
      { code: 'US', name: 'United States', dialCode: '+1' },
      { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
      { code: 'DE', name: 'Germany', dialCode: '+49' },
      { code: 'FR', name: 'France', dialCode: '+33' },
      { code: 'ES', name: 'Spain', dialCode: '+34' },
      { code: 'IT', name: 'Italy', dialCode: '+39' },
      { code: 'CA', name: 'Canada', dialCode: '+1' },
      { code: 'AU', name: 'Australia', dialCode: '+61' },
      { code: 'JP', name: 'Japan', dialCode: '+81' },
      { code: 'IN', name: 'India', dialCode: '+91' },
      { code: 'MX', name: 'Mexico', dialCode: '+52' },
      { code: 'AR', name: 'Argentina', dialCode: '+54' },
      { code: 'CL', name: 'Chile', dialCode: '+56' },
      { code: 'CO', name: 'Colombia', dialCode: '+57' },
      { code: 'PE', name: 'Peru', dialCode: '+51' },
      { code: 'VE', name: 'Venezuela', dialCode: '+58' },
      { code: 'PT', name: 'Portugal', dialCode: '+351' },
    ];
    return countries;
  }

  // Policies data
  async getPolicies() {
    const policies = [
      { slug: 'privacy', name: 'Privacy Policy', title: 'Privacy Policy' },
      { slug: 'terms', name: 'Terms of Service', title: 'Terms of Service' },
      { slug: 'security', name: 'Security Policy', title: 'Security Policy' },
    ];
    return policies;
  }

  async getPolicyBySlug(slug: string) {
    const policies = await this.getPolicies();
    return policies.find((p) => p.slug === slug) || null;
  }

  // FAQ data
  async getFaq() {
    const faqs = [
      {
        id: 1,
        question: 'How do prediction markets work?',
        answer:
          'Prediction markets allow you to trade on the outcome of real-world events. You buy "YES" or "NO" shares based on your prediction. If you\'re correct, you earn a payout based on the probability at the time of purchase.',
        category: 'General',
      },
      {
        id: 2,
        question: 'How are prices determined?',
        answer:
          'Prices are determined by supply and demand. As more people buy YES shares, the price increases. As more people buy NO shares, the price decreases.',
        category: 'Trading',
      },
      {
        id: 3,
        question: 'What happens if a market is cancelled?',
        answer:
          'If a market is cancelled, all purchases are refunded in full. The amount is credited back to your account balance.',
        category: 'General',
      },
      {
        id: 4,
        question: 'How do I deposit funds?',
        answer:
          'You can deposit funds using PIX, USDC, or various payment methods. Go to your dashboard and click on "Deposit" to see available options.',
        category: 'Payments',
      },
      {
        id: 5,
        question: 'How long do withdrawals take?',
        answer:
          'PIX withdrawals are processed instantly. Cryptocurrency withdrawals typically take 10-30 minutes depending on network congestion.',
        category: 'Payments',
      },
      {
        id: 6,
        question: 'Is KYC verification required?',
        answer:
          'Yes, for withdrawals above certain limits, KYC verification is required. You can complete this in your dashboard under the "KYC" section.',
        category: 'Account',
      },
      {
        id: 7,
        question: 'What are the fees?',
        answer:
          'We charge a 1% fee on withdrawals. Deposits are free of charge. Trading fees are built into the spread between YES and NO prices.',
        category: 'Fees',
      },
      {
        id: 8,
        question: 'Can I trade on mobile?',
        answer:
          'Yes! Our mobile app is available for both iOS and Android. Download it from the App Store or Google Play.',
        category: 'General',
      },
      {
        id: 9,
        question: 'How are markets resolved?',
        answer:
          'Markets are resolved by our team based on official sources and data. Once resolved, winning positions are automatically paid out.',
        category: 'Trading',
      },
      {
        id: 10,
        question: 'What is the referral program?',
        answer:
          "Earn commissions when you refer new users. Share your unique referral link, and you'll earn a percentage of their trading volume.",
        category: 'Account',
      },
    ];
    return faqs;
  }

  // SEO data
  async getSeo() {
    return {
      title: 'Futurus - Prediction Markets',
      description:
        'Trade on real-world events including politics, sports, crypto, and more. Buy YES or NO shares and earn based on your predictions.',
      keywords:
        'prediction markets, trading, crypto, sports betting, politics, trading platform',
      ogImage: '/images/og-image.png',
      twitterCard: '/images/twitter-card.png',
    };
  }

  // Cookie policy
  async getCookiePolicy() {
    return {
      title: 'Cookie Policy',
      content:
        'We use cookies to improve your experience. By continuing to use our site, you agree to our use of cookies.',
    };
  }

  async acceptCookie() {
    return { message: 'Cookie preference saved' };
  }

  // Custom pages
  async getCustomPages() {
    return this.prisma.frontend.findMany({
      where: { templateName: 'custom' },
      orderBy: { id: 'desc' },
    });
  }

  async getCustomPageBySlug(slug: string) {
    return this.prisma.frontend.findFirst({
      where: { slug, templateName: 'custom' },
    });
  }

  // Extension by act
  async getExtensionByAct(act: string) {
    return this.prisma.extension.findFirst({ where: { act } });
  }

  // Contact form
  async submitContact(_body: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    // In production, send email or store in database
    return {
      success: true,
      message: 'Your message has been sent. We will get back to you soon.',
    };
  }

  // Cookie Consent (GDPR)
  async saveCookieConsent(data: {
    userId?: number;
    ipAddress?: string;
    sessionId?: string;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  }) {
    return this.prisma.cookieConsent.create({
      data: {
        userId: data.userId || null,
        ipAddress: data.ipAddress,
        sessionId: data.sessionId,
        analytics: data.analytics,
        marketing: data.marketing,
        functional: data.functional,
      },
    });
  }

  async getCookieConsents(filters?: { userId?: number; limit?: number }) {
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;

    return this.prisma.cookieConsent.findMany({
      where,
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });
  }

  async getCookieConsentStats() {
    const total = await this.prisma.cookieConsent.count();
    const analyticsAccepted = await this.prisma.cookieConsent.count({
      where: { analytics: true },
    });
    const marketingAccepted = await this.prisma.cookieConsent.count({
      where: { marketing: true },
    });

    return {
      total,
      analyticsAccepted,
      marketingAccepted,
      analyticsRate: total > 0 ? (analyticsAccepted / total) * 100 : 0,
      marketingRate: total > 0 ? (marketingAccepted / total) * 100 : 0,
    };
  }
}
