export type MarketCategory
  = | 'POLITICS'
    | 'SPORTS'
    | 'CRYPTO'
    | 'ENTERTAINMENT'
    | 'ECONOMY'
    | 'TECHNOLOGY'
    | 'OTHER';

export type MarketStatus
  = | 'DRAFT'
    | 'OPEN'
    | 'CLOSED'
    | 'RESOLVED'
    | 'CANCELLED';

export type Outcome = {
  id: string;
  title: string;
  probability: number;
  price: string;
  totalShares: string;
  isWinner: boolean | null;
};

export type Market = {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  category: MarketCategory;
  endDate: string;
  status: MarketStatus;
  totalVolume: string;
  liquidityPool: string;
  outcomes: Outcome[];
  createdById: string;
  createdAt: string;
};

export type MarketsResponse = {
  data: Market[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type MarketsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: MarketCategory;
  status?: MarketStatus;
  isFeatured?: boolean;
};
