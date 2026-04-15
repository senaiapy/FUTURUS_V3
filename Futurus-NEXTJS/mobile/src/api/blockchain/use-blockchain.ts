import type { AxiosError } from 'axios';
import type {
  BalanceResponse,
  BlockchainPosition,
  ClaimResponse,
  PlaceBetRequest,
  PlaceBetResponse,
  PositionsResponse,
  TransactionsResponse,
  WalletResponse,
} from './types';
import { createMutation, createQuery } from 'react-query-kit';
import { client } from '../common';

// Wallet hooks
export const useBlockchainWallet = createQuery<WalletResponse, void, AxiosError>({
  queryKey: ['blockchain-wallet'],
  fetcher: async () => {
    const { data } = await client.get('/blockchain/wallet');
    return data;
  },
});

export const useCreateWallet = createMutation<WalletResponse, void, AxiosError<any>>({
  mutationFn: async () => {
    const { data } = await client.post('/blockchain/wallet/create');
    return data;
  },
});

export const useLinkWallet = createMutation<WalletResponse, { publicKey: string }, AxiosError<any>>({
  mutationFn: async (variables) => {
    const { data } = await client.post('/blockchain/wallet/link', variables);
    return data;
  },
});

export const useSyncBalances = createQuery<BalanceResponse, void, AxiosError>({
  queryKey: ['blockchain-balance'],
  fetcher: async () => {
    const { data } = await client.get('/blockchain/wallet/balance');
    return data;
  },
});

// Betting hooks
export const usePlaceBlockchainBet = createMutation<PlaceBetResponse, PlaceBetRequest, AxiosError<any>>({
  mutationFn: async (variables) => {
    const { data } = await client.post('/blockchain/bet', variables);
    return data;
  },
});

export const useClaimWinnings = createMutation<ClaimResponse, { marketId: number }, AxiosError<any>>({
  mutationFn: async ({ marketId }) => {
    const { data } = await client.post(`/blockchain/claim/${marketId}`);
    return data;
  },
});

// Positions hooks
export const useBlockchainPositions = createQuery<PositionsResponse, { page?: number; limit?: number }, AxiosError>({
  queryKey: ['blockchain-positions'],
  fetcher: async (variables) => {
    const { data } = await client.get('/blockchain/positions', {
      params: variables,
    });
    return data;
  },
});

export const useBlockchainPosition = createQuery<
  { hasPosition: boolean } & Partial<BlockchainPosition>,
  { marketId: number },
  AxiosError
>({
  queryKey: ['blockchain-position'],
  fetcher: async ({ marketId }) => {
    const { data } = await client.get(`/blockchain/positions/${marketId}`);
    return data;
  },
});

// Transactions hooks
export const useBlockchainTransactions = createQuery<
  TransactionsResponse,
  { page?: number; limit?: number; txType?: string },
  AxiosError
>({
  queryKey: ['blockchain-transactions'],
  fetcher: async (variables) => {
    const { data } = await client.get('/blockchain/transactions', {
      params: variables,
    });
    return data;
  },
});

// Market hooks
export const useBlockchainMarket = createQuery<
  { isDeployed: boolean; onChainMarketId?: string; tokenMintA?: string; tokenMintB?: string },
  { marketId: number },
  AxiosError
>({
  queryKey: ['blockchain-market'],
  fetcher: async ({ marketId }) => {
    const { data } = await client.get(`/blockchain/markets/${marketId}`);
    return data;
  },
});
