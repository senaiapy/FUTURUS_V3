import type {
  BetsListResponse,
  PlaceBetRequest,
  PlaceBetResponse,
  PositionsListResponse,
} from './types';
import { createMutation, createQuery } from 'react-query-kit';

import { client } from '../common';

export const usePlaceBet = createMutation<
  PlaceBetResponse,
  PlaceBetRequest,
  Error
>({
  mutationFn: async (variables) => {
    const { data } = await client.post('/bets/buy', variables);
    return data;
  },
});

export const useMyBets = createQuery<
  BetsListResponse,
  { status?: string; page?: number; limit?: number },
  Error
>({
  queryKey: ['my-bets'],
  fetcher: async (variables) => {
    const { data } = await client.get('/bets/my-bets', {
      params: variables,
    });
    return data;
  },
});

export const useMyPositions = createQuery<
  PositionsListResponse,
  { page?: number; limit?: number },
  Error
>({
  queryKey: ['my-positions'],
  fetcher: async (variables) => {
    const { data } = await client.get('/bets/my-positions', {
      params: variables,
    });
    return data;
  },
});
