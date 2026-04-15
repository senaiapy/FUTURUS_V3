import type {
  DisableTwoFactorRequest,
  EnableTwoFactorRequest,
  TwoFactorStatus,
} from './types';

import { createMutation, createQuery } from 'react-query-kit';

import { client } from '../common';

export const useTwoFactorStatus = createQuery<TwoFactorStatus, void>({
  queryKey: ['2fa-status-mobile'],
  fetcher: async () => {
    const res = await client.get('/users/2fa-mobile');
    return res.data;
  },
});

export const useEnableTwoFactor = createMutation<void, EnableTwoFactorRequest>({
  mutationFn: data => client.post('/users/2fa/enable', data),
});

export const useDisableTwoFactor = createMutation<void, DisableTwoFactorRequest>({
  mutationFn: data => client.post('/users/2fa/disable', data),
});

export const useRecoveryCodes = createQuery<string[]>({
  queryKey: ['2fa-recovery-codes'],
  fetcher: () => client.get('/users/2fa/recovery-codes').then(res => res.data),
});
