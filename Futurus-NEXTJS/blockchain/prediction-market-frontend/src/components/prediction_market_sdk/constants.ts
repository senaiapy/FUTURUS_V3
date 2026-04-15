import { PublicKey } from "@solana/web3.js";

// ─── PDA Seeds (must match smart contract constants.rs) ─────────────────
export const GLOBAL_SEED  = process.env.NEXT_PUBLIC_GLOBAL_SEED  || "global_seed";
export const MARKET_SEED  = process.env.NEXT_PUBLIC_MARKET_SEED  || "market_seed";
export const MINT_SEED_A  = process.env.NEXT_PUBLIC_MINT_SEED_A  || "mint_a_seed";
export const MINT_SEED_B  = process.env.NEXT_PUBLIC_MINT_SEED_B  || "mint_b_seed";
export const METADATA_SEED = "metadata";

// ─── Program IDs ────────────────────────────────────────────────────────
export const PREDICTION_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PREDICTION_ID || "6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY"
);

// ─── Token ──────────────────────────────────────────────────────────────
export const FUT_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_FUT_MINT || "FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave"
);

// ─── Oracle ─────────────────────────────────────────────────────────────
export const FUT_USDC_FEED = process.env.NEXT_PUBLIC_FUT_USDC_FEED || "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR";

// ─── Well-known Programs (these don't change across networks) ───────────
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// ─── Fee Authority ──────────────────────────────────────────────────────
export const feeAuthority = new PublicKey(
  process.env.NEXT_PUBLIC_FEE_AUTHORITY || "99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1"
);

// ─── Default Token Amounts ──────────────────────────────────────────────
export const tokenAAmount = Number(process.env.NEXT_PUBLIC_TOKEN_A_AMOUNT || 10000000);
export const tokenBAmount = Number(process.env.NEXT_PUBLIC_TOKEN_B_AMOUNT || 10000000);
