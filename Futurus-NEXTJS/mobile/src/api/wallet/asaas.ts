import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';
import { client } from '../common';

// ==================== Types ====================

export type AsaasBalance = {
  balance: number;
  currency: string;
  symbol: string;
};

export type AsaasDepositMethod = {
  id: number;
  method_code: number;
  name: string;
  currency: string;
  min_amount: number;
  max_amount: number;
  fixed_charge: number;
  percent_charge: number;
  type: 'pix' | 'credit_card';
};

export type AsaasWithdrawMethod = {
  id: number;
  name: string;
  currency: string;
  min_limit: number;
  max_limit: number;
  fixed_charge: number;
  percent_charge: number;
  type: 'pix' | 'bank_transfer' | 'other';
  required_fields: {
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }[];
};

// Deposit Request Types
export type PixDepositRequest = {
  amount: number;
  cpf: string;
};

export type CardDepositRequest = {
  amount: number;
  card_number: string;
  holder_name: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  installments: number;
  holder_cpf: string;
  holder_email: string;
  holder_phone: string;
  holder_postal_code: string;
  holder_address: string;
  holder_address_number: string;
  holder_province: string;
};

export type DepositResponse = {
  deposit: {
    trx: string;
    amount: number;
    charge: number;
    final_amount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'rejected';
  };
  pix?: {
    qr_code_base64: string;
    copy_paste: string;
    expires_at: string;
  };
};

// Withdraw Request Types
export type PixWithdrawRequest = {
  amount: number;
  cpf: string;
  pix_key_type: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';
  pix_key: string;
};

export type BankTransferRequest = {
  amount: number;
  cpf: string;
  bank_code: string;
  bank_agency: string;
  bank_account: string;
  bank_account_type: 'CONTA_CORRENTE' | 'CONTA_POUPANCA';
  bank_holder_name: string;
};

export type WithdrawResponse = {
  withdraw: {
    trx: string;
    amount: number;
    charge: number;
    final_amount: number;
    status: string;
    method: string;
  };
  balance: number;
};

export type StatusRequest = {
  trx: string;
};

export type DepositStatusResponse = {
  deposit: {
    trx: string;
    amount: number;
    charge: number;
    final_amount: number;
    status: string;
    method: string;
    created_at: string;
  };
};

export type WithdrawStatusResponse = {
  withdraw: {
    trx: string;
    amount: number;
    charge: number;
    final_amount: number;
    status: string;
    method: string;
    created_at: string;
  };
};

// ==================== Queries ====================

export const useAsaasBalance = createQuery<AsaasBalance, void, AxiosError>({
  queryKey: ['asaas-balance'],
  fetcher: async () => {
    const { data } = await client.get('/asaas/balance');
    return data;
  },
});

export const useAsaasDepositMethods = createQuery<{ methods: AsaasDepositMethod[] }, void, AxiosError>({
  queryKey: ['asaas-deposit-methods'],
  fetcher: async () => {
    const { data } = await client.get('/asaas/deposit/methods');
    return data;
  },
});

export const useAsaasWithdrawMethods = createQuery<{ methods: AsaasWithdrawMethod[] }, void, AxiosError>({
  queryKey: ['asaas-withdraw-methods'],
  fetcher: async () => {
    const { data } = await client.get('/asaas/withdraw/methods');
    return data;
  },
});

// ==================== Mutations ====================

export const useAsaasDepositPix = createMutation<DepositResponse, PixDepositRequest, AxiosError<any>>({
  mutationFn: async (variables) => {
    const { data } = await client.post('/asaas/deposit/pix', variables);
    return data;
  },
});

export const useAsaasDepositCard = createMutation<DepositResponse, CardDepositRequest, AxiosError<any>>({
  mutationFn: async (variables) => {
    const { data } = await client.post('/asaas/deposit/card', variables);
    return data;
  },
});

export const useAsaasWithdrawPix = createMutation<WithdrawResponse, PixWithdrawRequest, AxiosError<any>>({
  mutationFn: async (variables) => {
    const { data } = await client.post('/asaas/withdraw/pix', variables);
    return data;
  },
});

export const useAsaasWithdrawTransfer = createMutation<WithdrawResponse, BankTransferRequest, AxiosError<any>>({
  mutationFn: async (variables) => {
    const { data } = await client.post('/asaas/withdraw/transfer', variables);
    return data;
  },
});

export const useAsaasDepositStatus = createMutation<DepositStatusResponse, StatusRequest, AxiosError<any>>({
  mutationFn: async (variables) => {
    const { data } = await client.post('/asaas/deposit/status', variables);
    return data;
  },
});

export const useAsaasWithdrawStatus = createMutation<WithdrawStatusResponse, StatusRequest, AxiosError<any>>({
  mutationFn: async (variables) => {
    const { data } = await client.post('/asaas/withdraw/status', variables);
    return data;
  },
});
