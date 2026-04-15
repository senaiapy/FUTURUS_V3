// Export from asaas (specific asaas types and hooks)
export type {
  AsaasBalance,
  AsaasDepositMethod,
  // Asaas-specific responses
  DepositResponse as AsaasDepositResponse,
  AsaasWithdrawMethod,
  WithdrawResponse as AsaasWithdrawResponse,
  BankTransferRequest,
  CardDepositRequest,
  DepositStatusResponse,
  PixDepositRequest,
  PixWithdrawRequest,
  StatusRequest,
  WithdrawStatusResponse,
} from './asaas';

// Export asaas hooks
export {
  useAsaasBalance,
  useAsaasDepositCard,
  useAsaasDepositMethods,
  useAsaasDepositPix,
  useAsaasDepositStatus,
  useAsaasWithdrawMethods,
  useAsaasWithdrawPix,
  useAsaasWithdrawStatus,
  useAsaasWithdrawTransfer,
} from './asaas';

// Export from methods
export * from './methods';

// Export types from types.ts (general wallet types)
export type {
  DepositMethod,
  DepositRequest,
  Transaction,
  TransactionsResponse,
  WalletBalance,
  WithdrawMethod,
  WithdrawRequest,
} from './types';

// Export general wallet response types with aliases to avoid conflicts
export type {
  DepositResponse as WalletDepositResponse,
  WithdrawResponse as WalletWithdrawResponse,
} from './types';

// Export from use-wallet (queries/mutations)
export * from './use-wallet';
