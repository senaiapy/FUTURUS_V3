import type { Market, MarketsQuery, MarketsResponse } from './types';
import { createQuery } from 'react-query-kit';

import { client } from '../common';

type Variables = MarketsQuery;
type Response = MarketsResponse;

export const useMarkets = createQuery<Response, Variables, Error>({
  queryKey: ['markets'],
  fetcher: async (variables) => {
    const { data } = await client.get('/markets', {
      params: {
        page: variables.page || 1,
        limit: variables.limit || 20,
        search: variables.search,
        category: variables.category,
        status: variables.status,
        isFeatured: variables.isFeatured,
      },
    });
    return data;
  },
});

export const useMarket = createQuery<Market, { slug: string }, Error>({
  queryKey: ['market'],
  fetcher: async ({ slug }) => {
    if (!slug) {
      throw new Error('Slug is required');
    }
    const { data } = await client.get(`/markets/${slug}`);
    return data;
  },
});
