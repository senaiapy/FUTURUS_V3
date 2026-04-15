import { client } from '@/api/common/client';

/**
 * Game API interfaces and types
 */

export type GameTask = {
  id: string;
  name: string;
  description: string;
  coinReward: number;
  taskType: string;
  delayHours: number;
  orderIndex: number;
  isActive: boolean;
  verificationRequired: boolean;
  externalUrl?: string;
  instructions?: string;
};

export type UserTask = {
  id: string;
  userId: string;
  taskId: string;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'PENDING_VERIFY' | 'COMPLETED';
  startedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  nextAvailableAt?: string;
  proofUrl?: string;
  verificationNotes?: string;
  task: GameTask;
};

export type CoinTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
};

export type Dashboard = {
  coinBalance: number;
  totalCoinsEarned: number;
  referralCode?: string;
  onboardingComplete: boolean;
  completedTasks: number;
  totalTasks: number;
  nextTask?: UserTask;
  referralCount: number;
  recentTransactions: CoinTransaction[];
};

export type Referral = {
  id: string;
  referrerId: string;
  referredUserId: string;
  code: string;
  status: 'PENDING' | 'COMPLETED';
  bonusAwarded: boolean;
  createdAt: string;
  completedAt?: string;
  referrer: {
    id: string;
    email: string;
    name?: string;
  };
  referred: {
    id: string;
    email: string;
    name?: string;
  };
};

/**
 * Game API endpoints
 * Compatible with both NestJS and Laravel backends
 */
class GameApiService {
  /**
   * Get user dashboard with game statistics
   */
  async getDashboard(): Promise<Dashboard> {
    const { data } = await client.get('/game/progress/dashboard');
    return data;
  }

  /**
   * Get user coin balance
   */
  async getCoinBalance(): Promise<{ balance: number }> {
    const { data } = await client.get('/game/coins/balance');
    return data;
  }

  /**
   * Get user coin transactions with pagination
   */
  async getCoinTransactions(page: number = 1, limit: number = 20): Promise<{
    transactions: CoinTransaction[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { data } = await client.get('/game/coins/transactions', {
      params: { page, limit },
    });
    return data;
  }

  /**
   * Get all available game tasks
   */
  async getAllTasks(): Promise<{ tasks?: GameTask[] } | GameTask[]> {
    const { data } = await client.get('/game/tasks');
    // Laravel format: { tasks: [...] }
    // NestJS format: [...]
    return data;
  }

  /**
   * Get user's tasks with progress
   */
  async getUserTasks(): Promise<{ userTasks: UserTask[] } | UserTask[]> {
    const { data } = await client.get('/game/tasks/user/my-tasks');
    // Laravel format: { userTasks: [...] }
    // NestJS format: [...]
    return data;
  }

  /**
   * Start a game task
   */
  async startTask(taskId: string): Promise<{ userTask: UserTask }> {
    const { data } = await client.post(`/game/progress/start/${taskId}`);
    return data;
  }

  /**
   * Complete a game task
   */
  async completeTask(taskId: string, proofUrl?: string): Promise<{ userTask: UserTask }> {
    const { data } = await client.post(`/game/progress/complete/${taskId}`, {
      proofUrl,
    });
    return data;
  }

  /**
   * Generate a referral code for the user
   */
  async generateReferralCode(): Promise<{ code: string }> {
    const { data } = await client.post('/game/referrals/generate');
    return data;
  }

  /**
   * Get user's referrals
   */
  async getReferrals(): Promise<{ referrals?: Referral[] } | Referral[]> {
    const { data } = await client.get('/game/referrals');
    // Laravel format: { referrals: [...] }
    // NestJS format: [...]
    return data;
  }

  /**
   * Get referral by code (for validation)
   */
  async getReferralByCode(code: string): Promise<{ referral: Referral | null }> {
    const { data } = await client.get(`/game/referrals/${code}`);
    return data;
  }
}

export const gameApi = new GameApiService();

// Export for easy import
export default gameApi;
