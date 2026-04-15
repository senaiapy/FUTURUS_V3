# Futurus Prediction Market - Complete Functionalities Report

> **Generated:** 2026-03-26 | **Network:** Solana Blockchain (Devnet/Mainnet)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Smart Contracts (On-Chain Programs)](#3-smart-contracts-on-chain-programs)
   - [Prediction Market Contract](#31-prediction-market-contract)
   - [Futurus Coin (FUT) Token Contract](#32-futurus-coin-fut-token-contract)
4. [Backend Services](#4-backend-services)
5. [Frontend SDK Integration](#5-frontend-sdk-integration)
6. [Data Models](#6-data-models)
7. [API Endpoints](#7-api-endpoints)
8. [Events System](#8-events-system)
9. [Fee Structure](#9-fee-structure)
10. [Oracle Integration](#10-oracle-integration)
11. [Security Features](#11-security-features)

---

## 1. Executive Summary

The **Futurus Prediction Market** is a decentralized prediction market platform built on the **Solana blockchain**. It allows users to:

- **Create prediction markets** with Yes/No outcomes
- **Place bets** using FUT tokens on market outcomes
- **Provide liquidity** to activate markets
- **Earn rewards** through correct predictions
- **Participate in referral programs** for additional earnings

### Key Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Smart Contracts | Rust + Anchor | On-chain logic |
| Backend | Node.js + Express | API & orchestration |
| Frontend | Next.js + React | User interface |
| Database | MongoDB | Off-chain data storage |
| Oracle | Switchboard | Price feed resolution |

### Program IDs

| Program | Address |
|---------|---------|
| Prediction Market | `6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY` |
| Futurus Coin (FUT) | `FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb` |
| FUT Token Mint | `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave` |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interface                               │
│                    (Next.js + Wallet Adapter)                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Frontend SDK (TypeScript)                        │
│  • createMarket()  • depositLiquidity()  • marketBetting()           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
┌───────────────────────────┐     ┌────────────────────────────────────┐
│   Backend API (Express)   │     │      Solana Blockchain              │
│   • Market CRUD           │     │  ┌────────────────────────────────┐ │
│   • Profile management    │     │  │  Prediction Market Program     │ │
│   • Referral system       │     │  │  • initialize()                │ │
│   • Bot automation        │     │  │  • init_market()               │ │
└───────────────────────────┘     │  │  • add_liquidity()             │ │
            │                      │  │  • create_bet()                │ │
            ▼                      │  │  • resolve()                   │ │
┌───────────────────────────┐     │  │  • claim()                     │ │
│      MongoDB              │     │  └────────────────────────────────┘ │
│   • Markets               │     │  ┌────────────────────────────────┐ │
│   • Referrals             │     │  │  Futurus Coin Program          │ │
│   • User positions        │     │  │  • initialize()                │ │
└───────────────────────────┘     │  │  • mint_to()                   │ │
                                   │  │  • burn()                      │ │
                                   │  │  • transfer()                  │ │
                                   │  └────────────────────────────────┘ │
                                   │  ┌────────────────────────────────┐ │
                                   │  │  Switchboard Oracle            │ │
                                   │  │  • Price feeds                 │ │
                                   │  └────────────────────────────────┘ │
                                   └────────────────────────────────────┘
```

---

## 3. Smart Contracts (On-Chain Programs)

### 3.1 Prediction Market Contract

**Location:** `prediction-market-smartcontract/programs/prediction/`

#### 3.1.1 Instructions (Entry Points)

| Instruction | Function | Description | Access |
|-------------|----------|-------------|--------|
| `initialize` | `init()` | Initialize global state with fee settings | Admin only (once) |
| `get_res` | `get_oracle_res()` | Query oracle for current price (legacy) | Admin only |
| `init_market` | `create_market()` | Create a new prediction market | Any user |
| `add_liquidity` | `deposit_liquidity()` | Add SOL liquidity to market | Any user |
| `create_bet` | `betting()` | Place a bet (Yes/No) using FUT tokens | Any user |
| `mint_token` | `token_mint()` | Mint Yes/No tokens to market PDA | Market creator |
| `resolve` | `resolve_market()` | Resolve market using Switchboard oracle | Admin only |
| `claim` | `claim_winnings()` | Claim proportional winnings from pool | Winners only |
| `admin_close_market` | `close_market()` | Manually close market with result | Admin only |

---

#### 3.1.2 Detailed Function Analysis

##### `initialize(params: GlobalParams)`
**File:** [init.rs](prediction-market-smartcontract/programs/prediction/src/instructions/init.rs)

```rust
GlobalParams {
    fee_authority: Pubkey,      // Address receiving fees
    creator_fee_amount: u64,    // Fee for creating markets (lamports)
    market_count: u64,          // Min lamports to activate market
    decimal: u8,                // Token decimals (default: 9)
    fund_fee_percentage: f64,   // % fee on liquidity deposits
    betting_fee_percentage: f64 // % fee on bets
}
```

**Actions:**
1. Creates Global PDA account with seed `"global_seed"`
2. Sets admin as transaction signer
3. Stores fee configuration
4. Emits `GlobalInitialized` event

---

##### `init_market(params: MarketParams)`
**File:** [create_market.rs](prediction-market-smartcontract/programs/prediction/src/instructions/create_market.rs)

```rust
MarketParams {
    quest: i64,                  // Question identifier
    value: f64,                  // Target value for oracle comparison
    range: u8,                   // 0=above, 1=equal, 2=below
    date: i64,                   // Resolution timestamp (Unix)
    token_amount: u64,           // Initial token supply
    token_price: u64,            // Initial token price
    market_id: String,           // Unique market identifier
    name_a: Option<String>,      // "Yes" token name
    name_b: Option<String>,      // "No" token name
    symbol_a: Option<String>,    // "Yes" token symbol
    symbol_b: Option<String>,    // "No" token symbol
    url_a: Option<String>,       // "Yes" token metadata URI
    url_b: Option<String>,       // "No" token metadata URI
}
```

**Actions:**
1. Creates Market PDA with seed `["market_seed", market_id]`
2. Creates Yes token mint with seed `["mint_a_seed", market_pda]`
3. Creates No token mint with seed `["mint_b_seed", market_pda]`
4. Initializes Metaplex metadata for both tokens
5. Transfers creator fee to fee authority
6. Sets market status to `Prepare`
7. Emits `MarketCreated` event

---

##### `add_liquidity(amount: u64)`
**File:** [deposite_liquidity.rs](prediction-market-smartcontract/programs/prediction/src/instructions/deposite_liquidity.rs)

**Constraints:**
- Market must be in `Prepare` status
- Minimum amount: 100,000 lamports

**Actions:**
1. Transfers SOL from user to market PDA
2. Calculates and transfers fee to fee authority
3. If market balance >= `market_count`, updates status to `Active`
4. Emits `MarketStatusUpdated` event

---

##### `create_bet(params: BettingParams)`
**File:** [betting.rs](prediction-market-smartcontract/programs/prediction/src/instructions/betting.rs)

```rust
BettingParams {
    market_id: String,  // Market identifier
    amount: u64,        // Token amount to purchase
    is_yes: bool,       // true = Yes bet, false = No bet
}
```

**Constraints:**
- Market must be in `Active` status

**Actions:**
1. Calculates FUT cost based on current token price
2. Transfers FUT tokens from user to market PDA
3. Transfers Yes/No tokens from market PDA to user
4. Calculates and transfers betting fee to fee authority
5. Updates token prices using AMM formula
6. Creates/updates UserPosition account
7. Emits `BettingEvent` and `PositionCreated` events

**Price Formula (AMM):**
```
token_price_a = total_reserve * total_tokens / token_a_amount
token_price_b = total_reserve * total_tokens / token_b_amount
```

---

##### `resolve()`
**File:** [resolve_market.rs](prediction-market-smartcontract/programs/prediction/src/instructions/resolve_market.rs)

**Constraints:**
- Only admin can call
- Market must be in `Active` status
- Current time >= resolution_date

**Actions:**
1. Reads price from Switchboard oracle
2. Determines result based on `range`:
   - `range=0`: Yes wins if oracle_value > market_value
   - `range=1`: Yes wins if oracle_value == market_value
   - `range=2`: Yes wins if oracle_value < market_value
3. Sets market result (true = Yes wins, false = No wins)
4. Updates status to `Finished`
5. Emits `OracleResUpdated`, `MarketResolved`, `MarketStatusUpdated` events

---

##### `claim(market_id: String)`
**File:** [claim_winnings.rs](prediction-market-smartcontract/programs/prediction/src/instructions/claim_winnings.rs)

**Constraints:**
- Market must be in `Finished` status
- User must have winning position
- User must not have already claimed

**Actions:**
1. Verifies user holds winning tokens (Yes or No based on result)
2. Calculates proportional share:
   ```
   user_winnings = (user_winning_tokens / total_winning_tokens) * market_fut_balance
   ```
3. Transfers FUT from market to user
4. Marks position as claimed
5. Emits `WinningsClaimed` event

---

##### `admin_close_market(market_id: String, result: bool)`
**File:** [close_market.rs](prediction-market-smartcontract/programs/prediction/src/instructions/close_market.rs)

**Purpose:** Emergency/manual resolution for subjective markets

**Constraints:**
- Only admin can call
- Market must not already be `Finished`

**Actions:**
1. Sets market result to specified value
2. Updates status to `Finished`
3. Emits `MarketStatusUpdated` event

---

#### 3.1.3 State Accounts

##### Global State
**File:** [global.rs](prediction-market-smartcontract/programs/prediction/src/states/global.rs)

```rust
pub struct Global {
    pub admin: Pubkey,              // Contract admin
    pub fee_authority: Pubkey,      // Fee recipient
    pub creator_fee_amount: u64,    // Market creation fee
    pub decimal: u8,                // Token decimals
    pub market_count: u64,          // Min lamports for activation
    pub betting_fee_percentage: f64,// Betting fee %
    pub fund_fee_percentage: f64,   // Liquidity fee %
}
```

##### Market State
**File:** [market.rs](prediction-market-smartcontract/programs/prediction/src/states/market.rs)

```rust
pub struct Market {
    pub creator: Pubkey,           // Market creator
    pub feed: Pubkey,              // Oracle feed address
    pub value: f64,                // Target value
    pub quest: i64,                // Question ID
    pub range: u8,                 // Comparison type
    pub token_a: Pubkey,           // Yes token mint
    pub token_b: Pubkey,           // No token mint
    pub token_a_amount: u64,       // Remaining Yes tokens
    pub token_b_amount: u64,       // Remaining No tokens
    pub token_price_a: u64,        // Current Yes price
    pub token_price_b: u64,        // Current No price
    pub yes_amount: u16,           // Number of Yes bets
    pub no_amount: u16,            // Number of No bets
    pub total_reserve: u64,        // Total value reserve
    pub resolution_date: i64,      // Resolution timestamp
    pub market_status: MarketStatus,// Prepare/Active/Finished
    pub result: bool,              // true=Yes wins
    pub bump: u8,                  // PDA bump
    pub total_fut_deposited: u64,  // Total FUT in pool
    pub total_yes_sold: u64,       // Yes tokens sold
    pub total_no_sold: u64,        // No tokens sold
}

pub enum MarketStatus {
    Prepare,   // Awaiting liquidity
    Active,    // Open for betting
    Finished,  // Resolved
}
```

##### User Position State
**File:** [user_position.rs](prediction-market-smartcontract/programs/prediction/src/states/user_position.rs)

```rust
pub struct UserPosition {
    pub user: Pubkey,           // User wallet
    pub market: Pubkey,         // Market PDA
    pub yes_amount: u64,        // Yes tokens held
    pub no_amount: u64,         // No tokens held
    pub yes_fut_paid: u64,      // FUT paid for Yes
    pub no_fut_paid: u64,       // FUT paid for No
    pub claimed: bool,          // Winnings claimed?
    pub bump: u8,               // PDA bump
}
```

---

#### 3.1.4 PDA Seeds

| Seed Name | Value | Derivation |
|-----------|-------|------------|
| `GLOBAL_SEED` | `"global_seed"` | `[GLOBAL_SEED]` |
| `MARKET_SEED` | `"market_seed"` | `[MARKET_SEED, market_id]` |
| `MINT_SEED_A` | `"mint_a_seed"` | `[MINT_SEED_A, market_pda]` |
| `MINT_SEED_B` | `"mint_b_seed"` | `[MINT_SEED_B, market_pda]` |
| `USER_POSITION_SEED` | `"user_position"` | `[USER_POSITION_SEED, market_pda, user]` |

---

#### 3.1.5 Error Codes
**File:** [errors.rs](prediction-market-smartcontract/programs/prediction/src/errors.rs)

| Error | Code | Description |
|-------|------|-------------|
| `InvalidSwitchboardAccount` | 6000 | Invalid oracle account |
| `StaleFeed` | 6001 | Oracle not updated in 5 min |
| `ConfidenceIntervalExceeded` | 6002 | Oracle confidence too low |
| `InvalidFundAmount` | 6003 | Below minimum liquidity |
| `FutPriceBelowUnlockPrice` | 6004 | FUT price check failed |
| `ArithmeticError` | 6005 | Math overflow/underflow |
| `InvalidCreator` | 6006 | Wrong market creator |
| `InvalidFeeAuthority` | 6007 | Wrong fee authority |
| `NotPreparing` | 6008 | Market not in Prepare |
| `InvalidMarket` | 6009 | Invalid market account |
| `MarketNotActive` | 6010 | Market not in Active |
| `InvalidAdmin` | 6011 | Not admin |
| `MarketNotResolved` | 6012 | Market not finished |
| `NoWinningPosition` | 6013 | No winning tokens |
| `AlreadyClaimed` | 6014 | Already claimed |
| `MarketAlreadyResolved` | 6015 | Already finished |
| `ResolutionDateNotReached` | 6016 | Too early to resolve |
| `InsufficientMarketBalance` | 6017 | Not enough FUT |
| `InvalidTokenMint` | 6018 | Wrong token mint |
| `PositionAlreadyExists` | 6019 | Position exists |
| `InsufficientTokenBalance` | 6020 | Not enough tokens |
| `MarketNotFinished` | 6021 | Market not done |

---

### 3.2 Futurus Coin (FUT) Token Contract

**Location:** `prediction-futurus-coin/programs/futurus_coin/`
**File:** [lib.rs](prediction-futurus-coin/programs/futurus_coin/src/lib.rs)

#### 3.2.1 Token Specifications

| Property | Value |
|----------|-------|
| Name | Futurus Coin |
| Symbol | FUT |
| Decimals | 9 |
| Initial Supply | 1,000,000,000 (1 billion) |
| Standard | SPL Token |

#### 3.2.2 Instructions

##### `initialize(metadata_uri: String)`
Creates the FUT token with:
- Mint account with 9 decimals
- Associated token account (vault) for initial supply
- Metaplex metadata with name, symbol, and URI
- Mints 1 billion tokens to vault

##### `mint_to(amount: u64)`
Mints additional FUT tokens to a specified account.
- Requires mint authority signature

##### `burn(amount: u64)`
Burns FUT tokens from holder's account.
- Requires token owner signature

##### `transfer(amount: u64)`
Transfers FUT tokens between accounts.
- Standard SPL token transfer

---

## 4. Backend Services

**Location:** `prediction-market-backend/`

### 4.1 Server Configuration
**File:** [index.ts](prediction-market-backend/src/index.ts)

- Express.js server on port 9000
- MongoDB connection
- CORS enabled
- Body parser with 50MB limit
- Auto-initialization of global settings

### 4.2 Controllers

#### 4.2.1 Market Controller
**File:** [market/index.ts](prediction-market-backend/src/controller/market/index.ts)

| Function | Description |
|----------|-------------|
| `create_market()` | Creates market entry in MongoDB |
| `betting()` | Records bet and updates prices |
| `additionalInfo()` | Updates market with on-chain data |
| `getMarketData()` | Paginated market listing with aggregations |
| `addLiquidity()` | Records liquidity deposit |
| `setReferralFee()` | Calculates and records referral earnings |
| `getFilteredMarket()` | Advanced filtering (volume, expiry, probabilities) |

#### 4.2.2 Oracle Controller
**File:** [oracle/index.ts](prediction-market-backend/src/controller/oracle/index.ts)

| Function | Description |
|----------|-------------|
| `registFeed()` | Registers custom oracle feed |

#### 4.2.3 Profile Controller
**File:** [profile/index.ts](prediction-market-backend/src/controller/profile/index.ts)

| Function | Description |
|----------|-------------|
| `getProfileData()` | Returns comprehensive user statistics |

**Profile Data Includes:**
- Active bets count
- Total bets
- Betting history
- Total liquidity provided
- Earnings from liquidity fees
- Earnings from bets
- Proposed markets
- Referral count

#### 4.2.4 Referral Controller
**File:** [referral/index.ts](prediction-market-backend/src/controller/referral/index.ts)

| Function | Description |
|----------|-------------|
| `getReferCode()` | Generates/retrieves referral code |
| `claimReward()` | Claims accumulated referral rewards |

#### 4.2.5 Bot Controller
**File:** [bot/utils.ts](prediction-market-backend/src/controller/bot/utils.ts)

| Function | Description |
|----------|-------------|
| `execute()` | Main bot loop |
| `expireInitData()` | Deletes INIT markets older than 24h |
| `expirePendingData()` | Refunds PENDING markets older than 7 days |
| `airdropReward()` | Resolves expired markets and distributes rewards |

### 4.3 SDK Functions
**File:** [prediction_market_sdk/index.ts](prediction-market-backend/src/prediction_market_sdk/index.ts)

| Function | Description |
|----------|-------------|
| `setClusterConfig()` | Configures Solana connection |
| `global()` | Initializes global PDA |
| `withdraw()` | Creates withdraw instruction |
| `claimFee()` | Transfers SOL to user |
| `buildVT()` | Builds versioned transactions with lookup tables |
| `getOracleResult()` | Fetches and processes oracle data |
| `udpateFeed()` | Updates Switchboard feed |

---

## 5. Frontend SDK Integration

**Location:** `prediction-market-frontend/src/components/prediction_market_sdk/`

### 5.1 Core Functions
**File:** [index.ts](prediction-market-frontend/src/components/prediction_market_sdk/index.ts)

#### `createMarket(param: CreateMarketType)`
Creates a new prediction market:
1. Derives Market PDA
2. Derives Yes/No token mints
3. Derives metadata accounts
4. Builds `initMarket` + `mintToken` instructions
5. Creates versioned transaction
6. Signs with user wallet
7. Returns market addresses

#### `depositLiquidity(param: DepositeLiquidityType)`
Adds liquidity to market:
1. Builds `addLiquidity` instruction
2. Adds compute budget
3. Signs and sends transaction
4. Returns new market status

#### `marketBetting(param: BetType)`
Places a bet:
1. Gets/creates user token accounts
2. Gets/creates FUT token accounts
3. Builds `createBet` instruction
4. Signs and sends transaction
5. Returns updated token prices

#### `fetchMarketInfo(pda: PublicKey)`
Fetches on-chain market state.

---

## 6. Data Models

### 6.1 Market Model (MongoDB)
**File:** [model/market.ts](prediction-market-backend/src/model/market.ts)

```typescript
{
  marketField: Number,      // Market category
  apiType: Number,          // API type for oracle
  task: String,             // Oracle task description
  creator: String,          // Creator wallet
  tokenA: String,           // Yes token mint
  tokenB: String,           // No token mint
  initAmount: Number,       // Initial token supply
  tradingAmountA: Number,   // Remaining Yes tokens
  tradingAmountB: Number,   // Remaining No tokens
  tokenAPrice: Number,      // Yes token price
  tokenBPrice: Number,      // No token price
  market: String,           // Market PDA address
  question: String,         // Market question
  value: Number,            // Target value
  range: Number,            // Comparison type
  date: String,             // Resolution date
  marketStatus: String,     // INIT/PENDING/ACTIVE/CLOSED
  feedName: String,         // Oracle feed name
  imageUrl: String,         // Market image
  description: String,      // Market description
  feedkey: String,          // Oracle feed address
  isYes: Boolean,           // Result (Yes/No)
  playerA: [{               // Yes bettors
    player: String,
    amount: Number
  }],
  playerB: [{               // No bettors
    player: String,
    amount: Number
  }],
  investors: [{             // Liquidity providers
    investor: String,
    amount: Number
  }]
}
```

### 6.2 Referral Model (MongoDB)
**File:** [model/referral.ts](prediction-market-backend/src/model/referral.ts)

```typescript
{
  wallet: String,           // User wallet
  referralCode: String,     // Generated code (8 chars)
  status: String,           // PENDING/ACTIVE
  fee: Number,              // Accumulated rewards
  referredLevel: Number,    // Referral tier (0-2)
  wallet_refered: String,   // Who referred this user
  createdAt: String         // Timestamp
}
```

---

## 7. API Endpoints

### 7.1 Market Routes
**Base:** `/api/market`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create` | Create new market |
| POST | `/betting` | Record bet |
| POST | `/additionalInfo` | Update market with chain data |
| GET | `/getMarketData` | List markets (paginated) |
| POST | `/addLiquidity` | Record liquidity deposit |
| POST | `/getFilteredMarket` | Filter markets |

### 7.2 Oracle Routes
**Base:** `/api/oracle`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/registFeed` | Register oracle feed |

### 7.3 Referral Routes
**Base:** `/api/referral`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/getReferCode` | Get/create referral code |
| POST | `/claimReward` | Claim referral rewards |

### 7.4 Profile Routes
**Base:** `/api/profile`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user profile data |

---

## 8. Events System

### 8.1 On-Chain Events
**File:** [events.rs](prediction-market-smartcontract/programs/prediction/src/events.rs)

| Event | Fields | Trigger |
|-------|--------|---------|
| `GlobalInitialized` | global_id, fee_recipient, fees, decimals | `initialize()` |
| `OracleResUpdated` | oracle_res | `get_res()`, `resolve()` |
| `MarketCreated` | market_id, value, range, creator, tokens, prices | `init_market()` |
| `MarketStatusUpdated` | market_id, status | Status changes |
| `BettingEvent` | user, market_id, is_yes, amount, fut_cost, prices | `create_bet()` |
| `MarketResolved` | market_id, result, oracle_value, market_value | `resolve()` |
| `WinningsClaimed` | user, market_id, amount, is_yes | `claim()` |
| `LiquidityWithdrawn` | user, market_id, amount | Withdrawals |
| `PositionCreated` | user, market_id, is_yes, token_amount, fut_paid | `create_bet()` |

### 8.2 Backend Event Listeners
**File:** [event.ts](prediction-market-backend/src/prediction_market_sdk/event.ts)

```typescript
// Listens for on-chain events and updates MongoDB
OracleEvent      → Logs oracle results
GlobalEvent      → Logs initialization
MarketEvent      → Updates market status to PENDING
```

---

## 9. Fee Structure

### 9.1 Fee Types

| Fee Type | Description | Percentage |
|----------|-------------|------------|
| Creator Fee | SOL paid to create market | Fixed amount |
| Betting Fee | % of FUT bet amount | Configurable |
| Fund Fee | % of liquidity deposit | Configurable |

### 9.2 Fee Distribution

```
User Bet (100 FUT)
    │
    ├── Market Pool: ~97 FUT (configurable)
    │
    └── Fee Authority: ~3 FUT (betting_fee_percentage)
```

### 9.3 Referral Rewards

| Level | Percentage of Fees |
|-------|-------------------|
| Level 0 (Direct) | 70% of 0.5% |
| Level 1 | 20% of 0.5% |
| Level 2 | 10% of 0.5% |

---

## 10. Oracle Integration

### 10.1 Switchboard On-Demand

The platform uses **Switchboard** for decentralized oracle data:

```typescript
// Feed update flow
const feedAccount = new PullFeed(queue.program, feedAddress);
const [pullIx, responses, success, luts] = await feedAccount.fetchUpdateIx({
    crossbarClient: crossbar,
    gateway: "",
    chain: "solana"
});
```

### 10.2 Market Resolution Logic

```rust
// Range interpretation
match market.range {
    0 => oracle_value > market_value,  // "Above" - Yes wins if higher
    1 => oracle_value == market_value, // "Equal" - Yes wins if equal
    2 => oracle_value < market_value,  // "Below" - Yes wins if lower
}
```

### 10.3 Oracle Configuration

| Parameter | Value |
|-----------|-------|
| Staleness Tolerance | 300 seconds (5 min) |
| Feed Address (default) | `GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR` |

---

## 11. Security Features

### 11.1 Access Control

| Action | Required Authority |
|--------|-------------------|
| Initialize global | Deployer (one-time) |
| Create market | Any user (pays fee) |
| Add liquidity | Any user |
| Place bet | Any user |
| Resolve market | Admin only |
| Close market manually | Admin only |
| Claim winnings | Position holder only |

### 11.2 Validation Checks

- **PDA Derivation**: All accounts derived deterministically
- **Signature Verification**: All mutations require valid signatures
- **Amount Checks**: Arithmetic overflow/underflow protection
- **Status Checks**: Operations only valid in correct market state
- **Time Checks**: Resolution only after resolution_date

### 11.3 Account Constraints

```rust
// Example constraint patterns used
#[account(
    constraint = user.key() == global.admin @ ContractError::InvalidAdmin
)]
#[account(
    constraint = market.market_status == MarketStatus::Active @ ContractError::MarketNotActive
)]
#[account(
    constraint = !user_position.claimed @ ContractError::AlreadyClaimed
)]
```

---

## Appendix A: Market Lifecycle

```
┌──────────────┐     ┌───────────────┐     ┌────────────────┐     ┌──────────────┐
│    INIT      │────►│    PREPARE    │────►│     ACTIVE     │────►│   FINISHED   │
│  (MongoDB)   │     │  (On-chain)   │     │   (Betting)    │     │  (Resolved)  │
└──────────────┘     └───────────────┘     └────────────────┘     └──────────────┘
       │                    │                      │                      │
       │                    │                      │                      │
   Market created      Tokens minted         Bets placed           Oracle checked
   in database         Awaiting              Prices updated         Result set
   24h expiry          liquidity             FUT deposited          Winners claim
```

---

## Appendix B: Token Flow

```
                         FUT Token Flow

User Wallet ──────────────────────────────────────────────► Market Pool
    │                    (betting)                              │
    │                                                           │
    │                                                           │
    └─────────────► Fee Authority ◄────────────────────────────┘
                   (betting fees)                    (from pool on claim)
                         │
                         ▼
                  Yes/No Tokens
                  (to bettor)
```

---

## Appendix C: Environment Variables

### Backend (.env)
```
PORT=9000
FUTANA_CLUSTER=devnet
FUTANA_RPC_URL=https://api.devnet.solana.com
FUT_MINT=FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave
FEE_AUTHORITY=99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1
MONGODB_URI=mongodb://localhost:27017/futurus
```

### Frontend (.env.local)
```
NEXT_PUBLIC_FUTANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_FUT_MINT=FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave
NEXT_PUBLIC_FEE_AUTHORITY=99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1
NEXT_PUBLIC_API_URL=http://localhost:9000
```

---

*Report generated by analyzing the Futurus Prediction Market blockchain codebase.*
