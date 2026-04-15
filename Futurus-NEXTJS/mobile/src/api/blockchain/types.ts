export type SolanaWallet = {
  publicKey: string;
  isCustodial: boolean;
  solBalance: number;
  futBalance: number;
  lastSyncAt: string | null;
};

export type WalletResponse = {
  hasWallet: boolean;
  publicKey?: string;
  isCustodial?: boolean;
  solBalance?: number;
  futBalance?: number;
  lastSyncAt?: string | null;
};

export type BlockchainPosition = {
  id: number;
  marketId: number;
  question: string;
  slug: string;
  yesAmount: number;
  noAmount: number;
  totalInvested: number;
  claimed: boolean;
  marketStatus: 'PENDING' | 'ACTIVE' | 'RESOLVED';
  marketResult: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export type BlockchainTransaction = {
  id: number;
  txHash: string;
  txType: string;
  amount: number;
  token: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  confirmedAt?: string;
};

export type PlaceBetRequest = {
  marketId: number;
  isYes: boolean;
  amount: number;
};

export type PlaceBetResponse = {
  txHash: string;
  tokensReceived: number;
  newPrice: number;
  positionId: number;
};

export type ClaimResponse = {
  txHash: string;
  amountClaimed: number;
};

export type BalanceResponse = {
  solBalance: number;
  futBalance: number;
};

export type PositionsResponse = {
  data: BlockchainPosition[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type TransactionsResponse = {
  data: BlockchainTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
