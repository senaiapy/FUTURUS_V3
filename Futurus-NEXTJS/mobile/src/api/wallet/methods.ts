import type { AxiosError } from 'axios';
import type {
  DepositMethod,
  WithdrawMethod,
} from './types';
import { createQuery } from 'react-query-kit';
import { client } from '../common';

export type DepositMethodsResponse = {
  success: boolean;
  data: DepositMethod[];
};

export type WithdrawMethodsResponse = {
  success: boolean;
  data: WithdrawMethod[];
};

export const useDepositMethods = createQuery<DepositMethodsResponse, void, AxiosError>({
  queryKey: ['depositMethods'],
  fetcher: async () => {
    const { data } = await client.get('/wallet/deposit-methods');
    return data;
  },
});

export const useWithdrawMethods = createQuery<WithdrawMethodsResponse, void, AxiosError>({
  queryKey: ['withdrawMethods'],
  fetcher: async () => {
    const { data } = await client.get('/wallet/withdraw-methods');
    return data;
  },
});
