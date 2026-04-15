import type { AxiosError } from 'axios';
import type {
  DepositRequest,
  DepositResponse,
  TransactionsResponse,
  WalletBalance,
  WithdrawRequest,
  WithdrawResponse,
} from './types';
import { createMutation, createQuery } from 'react-query-kit';
import { client } from '../common';

export const useBalance = createQuery<WalletBalance, void, AxiosError>({
  queryKey: ['balance'],
  fetcher: async () => {
    const { data } = await client.get('/wallet');
    return data;
  },
});

export const useInitiateDeposit = createMutation<DepositResponse, DepositRequest, AxiosError<any>>({
  mutationFn: async (variables: DepositRequest) => {
    const { data } = await client.post('/wallet/deposit', variables);
    return data;
  },
});

export const useWithdraw = createMutation<WithdrawResponse, WithdrawRequest, AxiosError<any>>({
  mutationFn: async (variables: WithdrawRequest) => {
    const { data } = await client.post('/wallet/withdraw', variables);
    return data;
  },
});

export const useTransactions = createQuery<TransactionsResponse, { limit?: number; page?: number }, AxiosError>({
  queryKey: ['transactions'],
  fetcher: async (variables) => {
    const { data } = await client.get('/wallet/transactions', {
      params: variables,
    });
    return data;
  },
});
