import { createMutation, createQuery } from 'react-query-kit';

import { client } from '../common';

// Types
export type GroupMember = {
  id: number;
  user: { id: number; username: string; firstname: string | null; image: string | null };
  contributionAmount: number;
  ownershipPercentage: number;
  memberChosenOutcome: 'YES' | 'NO' | null;
  joinedAt: string;
};

export type Group = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  statusCode: number;
  isPublic: boolean;
  inviteCode: string | null;
  currentLiquidity: number;
  targetLiquidity: number;
  minContribution: number;
  maxContribution: number | null;
  maxParticipants: number | null;
  managerFeePercent: number;
  adminApproved: boolean;
  outcomeSelected: string | null;
  decisionMethod: string;
  memberCount: number;
  creator: { id: number; username: string; firstname: string | null };
  market: { id: number; question: string; slug: string };
  isManager: boolean;
  isMember: boolean;
  userMembership?: {
    contributionAmount: number;
    ownershipPercentage: number;
    joinedAt: string;
  };
  createdAt: string;
};

export type GroupPreview = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  isPublic: boolean;
  currentLiquidity: number;
  targetLiquidity: number;
  minContribution: number;
  maxContribution: number | null;
  memberCount: number;
  market: { id: number; question: string; slug: string };
  creator: { id: number; username: string };
};

// Queries
export const useGroups = createQuery<Group[], { status?: string; isPublic?: boolean }>({
  queryKey: ['groups'],
  fetcher: async (params) => {
    const response = await client.get('/groups', { params });
    return response.data;
  },
});

export const useMyGroups = createQuery<Group[], void>({
  queryKey: ['my-groups'],
  fetcher: async () => {
    const response = await client.get('/groups/my-groups');
    return response.data;
  },
});

export const useGroup = createQuery<Group, { slug: string }>({
  queryKey: ['group'],
  fetcher: async ({ slug }) => {
    const response = await client.get(`/groups/${slug}`);
    return response.data;
  },
});

export const useGroupMembers = createQuery<GroupMember[], { groupId: number }>({
  queryKey: ['group-members'],
  fetcher: async ({ groupId }) => {
    const response = await client.get(`/groups/${groupId}/members`);
    return response.data;
  },
});

export const useGroupByInviteCode = createQuery<GroupPreview, { code: string }>({
  queryKey: ['group-invite'],
  fetcher: async ({ code }) => {
    const response = await client.get(`/groups/invite/${code}`);
    // API returns { invitation, group } structure
    return response.data.group || response.data;
  },
});

// Proposed Market interface for creating new markets within groups
export type ProposedMarket = {
  question: string;
  categoryId: number;
  subcategoryId?: number;
  description?: string;
  image?: string;
  endDate: string;
  initialYesPool?: number;
  initialNoPool?: number;
};

export type Category = {
  id: number;
  name: string;
  image?: string;
};

export type Subcategory = {
  id: number;
  name: string;
  categoryId: number;
};

// Categories Query
export const useCategories = createQuery<Category[], void>({
  queryKey: ['categories'],
  fetcher: async () => {
    const response = await client.get('/categories');
    return response.data;
  },
});

export const useSubcategories = createQuery<Subcategory[], { categoryId: number }>({
  queryKey: ['subcategories'],
  fetcher: async ({ categoryId }) => {
    const response = await client.get('/subcategories', { params: { categoryId } });
    return response.data;
  },
});

// Mutations
export const useCreateGroup = createMutation<
  Group & { hasProposedMarket?: boolean; marketNeedsApproval?: boolean },
  {
    name: string;
    description?: string;
    marketId?: number;
    proposedMarket?: ProposedMarket;
    isPublic: boolean;
    minContribution: number;
    maxContribution?: number;
    targetLiquidity: number;
    maxParticipants?: number;
    managerFeePercent: number;
    decisionMethod: string;
  }
>({
  mutationFn: async (data) => {
    const response = await client.post('/groups', data);
    return response.data;
  },
});

export const useUploadMarketImage = createMutation<{ url: string }, FormData>({
  mutationFn: async (formData) => {
    const response = await client.post('/groups/upload/market-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
});

export const useJoinGroup = createMutation<
  void,
  { groupId: number; contributionAmount: number; memberChosenOutcome: 'YES' | 'NO'; inviteCode?: string }
>({
  mutationFn: async ({ groupId, contributionAmount, memberChosenOutcome, inviteCode }) => {
    const response = await client.post(`/groups/${groupId}/join`, {
      contributionAmount,
      memberChosenOutcome,
      inviteCode,
    });
    return response.data;
  },
});

export const useLeaveGroup = createMutation<void, { groupId: number }>({
  mutationFn: async ({ groupId }) => {
    const response = await client.post(`/groups/${groupId}/leave`);
    return response.data;
  },
});

export const useLockGroup = createMutation<void, { groupId: number }>({
  mutationFn: async ({ groupId }) => {
    const response = await client.post(`/groups/${groupId}/lock`);
    return response.data;
  },
});

export const useSetOutcome = createMutation<void, { groupId: number; outcome: 'YES' | 'NO' }>({
  mutationFn: async ({ groupId, outcome }) => {
    const response = await client.post(`/groups/${groupId}/set-outcome`, { outcome });
    return response.data;
  },
});

export const useVoteOutcome = createMutation<void, { groupId: number; outcome: 'YES' | 'NO' }>({
  mutationFn: async ({ groupId, outcome }) => {
    const response = await client.post(`/groups/${groupId}/vote`, { outcome });
    return response.data;
  },
});

export const useExecuteBet = createMutation<void, { groupId: number }>({
  mutationFn: async ({ groupId }) => {
    const response = await client.post(`/groups/${groupId}/execute`);
    return response.data;
  },
});

export const useSubmitForApproval = createMutation<void, { groupId: number }>({
  mutationFn: async ({ groupId }) => {
    const response = await client.post(`/groups/${groupId}/submit-approval`);
    return response.data;
  },
});

export const useAcceptInvitation = createMutation<
  void,
  { code: string; contributionAmount: number; memberChosenOutcome: 'YES' | 'NO' }
>({
  mutationFn: async ({ code, contributionAmount, memberChosenOutcome }) => {
    const response = await client.post(`/groups/invite/${code}/accept`, {
      contributionAmount,
      memberChosenOutcome,
    });
    return response.data;
  },
});
