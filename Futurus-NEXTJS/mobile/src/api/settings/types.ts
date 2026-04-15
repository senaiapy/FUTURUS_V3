export type TokenConfig = {
  symbol: string;
  name: string;
  address: string;
  network: string;
  decimals: number;
};

export type AppSettings = {
  id: string;
  siteName: string;
  siteDescription?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  currency: string;
  currencySymbol: string;
  platformFeePercent: number;
  withdrawalFeePercent: number;
  minDeposit: number;
  minWithdrawal: number;
  supportedTokens?: TokenConfig[];
  treasuryAddress?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  language?: string;
  contactAddress?: string;
  contactHours?: string;
  createdAt: string;
  updatedAt: string;
};

export type TwoFactorStatus = {
  enabled: boolean;
  secret?: string;
  qrCodeUrl?: string;
  totpUri?: string;
};

export type EnableTwoFactorRequest = {
  code: string;
  key?: string; // Required for Laravel backend
};

export type DisableTwoFactorRequest = {
  code: string;
};
