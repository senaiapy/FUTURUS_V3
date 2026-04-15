export type WalletBalance = {
  balance: number;
  balanceBonus: number;
  balanceTotal: number;
  totalSharesBought: number;
  totalInvested: number;
  totalWinning: number;
  referralEarnings: number;
  walletAddress?: string;
};

export type DepositMethod = {
  id: string;
  name: string;
  image?: string;
  code: string;
  minAmount: string;
  maxAmount: string;
  charge?: string;
  fixedCharge?: string;
  isManual?: boolean;
};

export type WithdrawMethod = {
  id: string;
  name: string;
  image?: string;
  minAmount: string;
  maxAmount: string;
  fixedCharge: string;
  percentCharge: string;
  delay?: string;
  isDefault?: boolean;
};

export type WithdrawRequest = {
  balance: number;
  balanceBonus: number;
  balanceTotal: number;
  totalSharesBought: number;
  totalInvested: number;
  totalWinning: number;
  referralEarnings: number;
  walletAddress?: string;
};

export type WithdrawRequest = {
  method: 'pix' | 'crypto';
  amount: number;
  pixKey?: string;
  walletAddress?: string;
};

export type WithdrawResponse = {
  id: string;
  amount: string;
  fee: string;
  finalAmount: string;
  pixKey?: string;
  status: string;
  trx: string;
  createdAt: string;
};

export type DepositRequest = {
  amount: number;
  paymentMethod: 'PIX' | 'USDC';
};

export type DepositResponse = {
  transactionId: string;
  amount: number;
  status?: string;
  pixCode?: string;
  pixQrCode?: string;
  walletAddress?: string;
  expiresAt?: string;
};

export type Transaction = {
  id: string;
  type: string;
  trxType?: string;
  trx?: string;
  amount: string;
  status: string;
  description: string;
  remark?: string;
  details?: string;
  createdAt: string;
};

export type TransactionsResponse = {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
