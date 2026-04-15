import { client } from '../common/client';

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
  status:
    | 'LOCKED'
    | 'AVAILABLE'
    | 'IN_PROGRESS'
    | 'PENDING_VERIFY'
    | 'COMPLETED';
  startedAt?: string;
  completedAt?: string;
  verifiedAt?: string;
  nextAvailableAt?: string;
  proofUrl?: string;
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
};

/**
 * Extract an array from a response, supporting both:
 *  - Laravel:  { key: [...] }
 *  - NestJS:   [...]
 */
function extractArray<T>(data: any, key: string): T[] {
  if (Array.isArray(data))
    return data as T[];
  if (data && Array.isArray(data[key]))
    return data[key] as T[];
  return [];
}

// Dashboard
export async function getDashboard(): Promise<Dashboard> {
  const response = await client.get('/game/progress/dashboard');
  return response.data;
}

// Coins
export async function getCoinBalance(): Promise<number> {
  const response = await client.get('/game/coins/balance');
  return response.data?.balance ?? 0;
}

export async function getCoinTransactions(limit: number = 20): Promise<CoinTransaction[]> {
  const response = await client.get('/game/coins/transactions', {
    params: { limit },
  });
  return extractArray<CoinTransaction>(response.data, 'transactions');
}

// Tasks
export async function getAllTasks(): Promise<GameTask[]> {
  const response = await client.get('/game/tasks');
  return extractArray<GameTask>(response.data, 'tasks');
}

export async function getUserTasks(): Promise<UserTask[]> {
  const response = await client.get('/game/tasks/user/my-tasks');
  // Laravel: { userTasks: [...] }  NestJS: [...]
  return extractArray<UserTask>(response.data, 'userTasks');
}

export async function startTask(taskId: string): Promise<UserTask> {
  const response = await client.post(`/game/progress/start/${taskId}`);
  return response.data.userTask ?? response.data;
}

export async function completeTask(taskId: string, proofUrl?: string): Promise<UserTask> {
  const response = await client.post(`/game/progress/complete/${taskId}`, {
    proofUrl,
  });
  return response.data.userTask ?? response.data;
}

// Referrals
export async function generateReferralCode(): Promise<string> {
  const response = await client.post('/game/referrals/generate');
  return response.data.code ?? '';
}

export async function getReferrals(): Promise<Referral[]> {
  const response = await client.get('/game/referrals');
  // Laravel: { referrals: [...] }  NestJS: [...]
  return extractArray<Referral>(response.data, 'referrals');
}

export async function getReferralByCode(code: string): Promise<Referral | null> {
  const response = await client.get(`/game/referrals/${code}`);
  return response.data ?? null;
}
