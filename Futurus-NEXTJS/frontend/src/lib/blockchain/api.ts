import api from "@/lib/api";

// Types
export interface SolanaWallet {
  publicKey: string;
  isCustodial: boolean;
  solBalance: number;
  futBalance: number;
  lastSyncAt: string | null;
}

export interface BlockchainPosition {
  id: number;
  marketId: number;
  question: string;
  slug: string;
  yesAmount: number;
  noAmount: number;
  totalInvested: number;
  claimed: boolean;
  marketStatus: "PENDING" | "ACTIVE" | "RESOLVED";
  marketResult: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlockchainTransaction {
  id: number;
  txHash: string;
  txType: string;
  amount: number;
  token: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  createdAt: string;
  confirmedAt?: string;
}

// Wallet API
export const blockchainApi = {
  // Create custodial wallet
  createWallet: async (token: string) => {
    const res = await api.post(
      "/blockchain/wallet/create",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  // Link external wallet
  linkWallet: async (token: string, publicKey: string) => {
    const res = await api.post(
      "/blockchain/wallet/link",
      { publicKey },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  // Get wallet info
  getWallet: async (token: string): Promise<{ hasWallet: boolean } & Partial<SolanaWallet>> => {
    const res = await api.get("/blockchain/wallet", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Sync and get balances
  syncBalances: async (token: string): Promise<{ solBalance: number; futBalance: number }> => {
    const res = await api.get("/blockchain/wallet/balance", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Place blockchain bet
  placeBet: async (
    token: string,
    data: { marketId: number; isYes: boolean; amount: number }
  ) => {
    const res = await api.post("/blockchain/bet", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Claim winnings
  claimWinnings: async (token: string, marketId: number) => {
    const res = await api.post(
      `/blockchain/claim/${marketId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  // Get positions
  getPositions: async (
    token: string,
    page = 1,
    limit = 20
  ): Promise<{ data: BlockchainPosition[]; meta: any }> => {
    const res = await api.get("/blockchain/positions", {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get position for specific market
  getPosition: async (
    token: string,
    marketId: number
  ): Promise<{ hasPosition: boolean } & Partial<BlockchainPosition>> => {
    const res = await api.get(`/blockchain/positions/${marketId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get transactions
  getTransactions: async (
    token: string,
    page = 1,
    limit = 20,
    txType?: string
  ): Promise<{ data: BlockchainTransaction[]; meta: any }> => {
    const res = await api.get("/blockchain/transactions", {
      params: { page, limit, txType },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Check if market is deployed to blockchain
  getBlockchainMarket: async (marketId: number) => {
    const res = await api.get(`/blockchain/markets/${marketId}`);
    return res.data;
  },

  // List blockchain markets
  listBlockchainMarkets: async (page = 1, limit = 20, status?: string) => {
    const res = await api.get("/blockchain/markets", {
      params: { page, limit, status },
    });
    return res.data;
  },
};

export default blockchainApi;
