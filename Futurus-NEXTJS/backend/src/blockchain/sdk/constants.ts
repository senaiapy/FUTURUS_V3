import { PublicKey } from '@solana/web3.js';

// PDA Seeds (must match smart contract constants.rs)
export const GLOBAL_SEED = process.env.GLOBAL_SEED || 'global_seed';
export const MARKET_SEED = process.env.MARKET_SEED || 'market_seed';
export const MINT_SEED_A = process.env.MINT_SEED_A || 'mint_a_seed';
export const MINT_SEED_B = process.env.MINT_SEED_B || 'mint_b_seed';
export const USER_POSITION_SEED = 'user_position';
export const METADATA_SEED = 'metadata';

// Program IDs
export const PREDICTION_ID = new PublicKey(
  process.env.PREDICTION_PROGRAM_ID ||
    '6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY',
);

// Token
export const FUT_MINT = new PublicKey(
  process.env.FUT_MINT || 'FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave',
);

// Oracle
export const FUT_USDC_FEED =
  process.env.FUT_USDC_FEED || 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR';

// Well-known Programs
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

// Fee Authority
export const FEE_AUTHORITY = new PublicKey(
  process.env.FEE_AUTHORITY_PUBLIC_KEY ||
    '99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1',
);

// Default Token Amounts
export const DEFAULT_TOKEN_A_AMOUNT = Number(
  process.env.DEFAULT_TOKEN_A_AMOUNT || 10000000,
);
export const DEFAULT_TOKEN_B_AMOUNT = Number(
  process.env.DEFAULT_TOKEN_B_AMOUNT || 10000000,
);

// Solana Configuration
export const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
export const SOLANA_CLUSTER = process.env.SOLANA_CLUSTER || 'devnet';

// Market Config Defaults
export const DEFAULT_MARKET_CONFIG = {
  range: 10,
  tokenAmount: 1_000_000_000_000, // 1M tokens with 6 decimals
  tokenPrice: 500_000, // 0.5 FUT initial price
  nameA: 'YES',
  nameB: 'NO',
  symbolA: 'YES',
  symbolB: 'NO',
  urlA: '',
  urlB: '',
};

// Lamports conversions
export const LAMPORTS_PER_FUT = 1_000_000_000; // 9 decimals like SOL
