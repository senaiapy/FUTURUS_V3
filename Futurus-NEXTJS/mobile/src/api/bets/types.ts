export type Bet = {
  id: string;
  amount: number;
  shares: number;
  price: number;
  type: 'BUY' | 'SELL';
  status: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
  outcome: {
    id: string;
    title: string;
    price: number;
    probability: number;
    market: {
      id: string;
      title: string;
      slug: string;
      status: string;
    };
  };
};

export type Position = {
  id: string;
  shares: number;
  avgPrice: number;
  createdAt: string;
  updatedAt: string;
  outcome: {
    id: string;
    title: string;
    price: number;
    probability: number;
    isWinner?: boolean;
    market: {
      id: string;
      title: string;
      slug: string;
      status: string;
    };
  };
};

export type PlaceBetRequest = {
  marketId: string;
  outcomeId: string;
  buyOption: 'yes' | 'no';
  amount: number;
};

export type PlaceBetResponse = {
  bet: Bet;
  shares: number;
  price: number;
  fee: number;
  newBalance: number;
};

export type BetsListResponse = {
  data: Bet[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type PositionsListResponse = {
  data: Position[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
