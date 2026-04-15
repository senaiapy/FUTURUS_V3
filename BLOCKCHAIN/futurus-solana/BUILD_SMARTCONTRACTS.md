# 🏗️ BUILD & DEPLOY — Smart Contracts

Complete guide to build and deploy the **Prediction Market** and **Futurus Coin (FUT)** smart contracts to **Devnet** and **Mainnet**.

---

## 📋 Table of Contents

1. [Prerequisites](#1--prerequisites)
2. [Project Overview](#2--project-overview)
3. [Quick Start (Automated Scripts)](#3--quick-start-automated-scripts)
4. [Manual Build & Deploy — Prediction Market](#4--manual-build--deploy--prediction-market)
5. [Manual Build & Deploy — Futurus Coin](#5--manual-build--deploy--futuruscoin)
6. [Mainnet Deployment](#6--mainnet-deployment)
7. [Post-Deployment Steps](#7--post-deployment-steps)
8. [Troubleshooting](#8--troubleshooting)
9. [Reference](#9--reference)

---

## 1. 🛠️ Prerequisites

### Required Tools

| Tool           | Version | Install                                                                                               |
| -------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| **Rust**       | 1.93+   | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh`                                     |
| **Solana CLI** | 3.0+    | `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`                                       |
| **Anchor CLI** | 0.30.1+ | `cargo install --git https://github.com/coral-xyz/anchor avm && avm install 0.30.1 && avm use 0.30.1` |
| **Node.js**    | 18+     | `brew install node` (macOS)                                                                           |
| **Yarn**       | 1.22+   | `npm install -g yarn`                                                                                 |

### Verify Installation

```bash
solana --version       # solana-cli 3.0.x
~/.avm/bin/anchor --version  # anchor-cli 0.30.1+
rustc --version        # rustc 1.93+
node --version         # v18+
```

### Wallet Setup

```bash
# Generate a new keypair (if you don't have one)
solana-keygen new -o ~/.config/solana/id.json

# For the prediction market, the deploy wallet is:
#   prediction-market-smartcontract/prediction.json

# Check your wallet address
solana-keygen pubkey prediction-market-smartcontract/prediction.json
solana-keygen pubkey ~/.config/solana/id.json
```

### Fund Wallet (Devnet)

```bash
# Airdrop FUT on devnet (2 FUT per request, may need multiple)
solana airdrop 2 --url devnet
solana airdrop 2 $(solana-keygen pubkey prediction-market-smartcontract/prediction.json) --url devnet

# Check balance
solana balance --url devnet
```

---

## 2. 📦 Project Overview

### Smart Contracts

| Contract              | Program ID                                     | Wallet                     | Description                                                       |
| --------------------- | ---------------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| **Prediction Market** | `6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY` | `prediction.json`          | Prediction market with oracle integration, betting, and liquidity |
| **Futurus Coin (FUT)** | `FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb` | `~/.config/solana/id.json` | SPL token with mint, burn, and transfer                           |

### Directory Structure

```
futurus-solana/
├── prediction-market-smartcontract/   # Prediction Market program
│   ├── programs/prediction/src/       # Rust source code
│   ├── target/deploy/                 # Built .so files
│   ├── target/idl/                    # Generated IDL
│   ├── Anchor.toml                    # Anchor config
│   ├── Cargo.toml                     # Rust workspace config
│   └── prediction.json                # Deploy wallet
├── futurus-coin/                       # Futurus Coin program
│   ├── programs/futurus_coin/src/     # Rust source code
│   ├── target/deploy/                 # Built .so files
│   ├── target/idl/                    # Generated IDL
│   ├── Anchor.toml                    # Anchor config
│   └── Cargo.toml                     # Rust workspace config
├── build_prediction_market_smartcontracts.sh  # Auto build & deploy
├── build_futurusCoin.sh                       # Auto build & deploy
└── BUILD_SMARTCONTRACTS.md                    # This file
```

---

## 3. 🚀 Quick Start (Automated Scripts)

### Build & Deploy Everything to Devnet

```bash
cd /path/to/futurus-solana

# Make scripts executable
chmod +x build_prediction_market_smartcontracts.sh
chmod +x build_futurusCoin.sh

# Deploy Prediction Market to Devnet
./build_prediction_market_smartcontracts.sh devnet

# Deploy Futurus Coin to Devnet
./build_futurusCoin.sh devnet
```

### Build Only (No Deploy)

```bash
./build_prediction_market_smartcontracts.sh build
./build_futurusCoin.sh build
```

### Deploy to Mainnet

```bash
# ⚠️ REQUIRES REAL FUT — ensure your wallet is funded!
./build_prediction_market_smartcontracts.sh mainnet
./build_futurusCoin.sh mainnet
```

---

## 4. 🔮 Manual Build & Deploy — Prediction Market

### Step 1: Configure Solana CLI

```bash
# For Devnet
solana config set --url devnet

# For Mainnet
solana config set --url mainnet-beta
```

### Step 2: Build

```bash
cd prediction-market-smartcontract
~/.avm/bin/anchor build
```

Expected output:

```
Finished `release` profile [optimized]
Finished `test` profile [unoptimized + debuginfo]
```

The build produces:

- `target/deploy/prediction.so` — the compiled program
- `target/idl/prediction.json` — the IDL (interface description)
- `target/types/prediction.ts` — TypeScript types

### Step 3: Deploy to Devnet

```bash
~/.avm/bin/anchor deploy --provider.cluster devnet
```

Expected output:

```
Deploying program "prediction"...
Program Id: 6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY
Deploy success
```

### Step 4: Copy IDL to Frontend & Backend

```bash
# Copy to frontend
cp target/idl/prediction.json ../prediction-market-frontend/src/components/prediction_market_sdk/idl/prediction.json

# Copy to backend
cp target/idl/prediction.json ../prediction-market-backend/src/prediction_market_sdk/idl/prediction.json
```

### Step 5: Verify Deployment

```bash
solana program show 6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY --url devnet
```

---

## 5. 🪙 Manual Build & Deploy — Futurus Coin

### Step 1: Build

```bash
cd futurus-coin
~/.avm/bin/anchor build
```

### Step 2: Deploy to Devnet

```bash
~/.avm/bin/anchor deploy --provider.cluster devnet
```

Expected output:

```
Deploying program "futurus_coin"...
Program Id: FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb
Deploy success
```

### Step 3: Copy IDL

```bash
cp target/idl/futurus_coin.json ../prediction-market-frontend/src/components/prediction_market_sdk/idl/futurus_coin.json
cp target/idl/futurus_coin.json ../prediction-market-backend/src/prediction_market_sdk/idl/futurus_coin.json
```

### Step 4: Verify Deployment

```bash
solana program show FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb --url devnet
```

---

## 6. 🌐 Mainnet Deployment

> ⚠️ **WARNING**: Mainnet deployment uses real FUT. Ensure your wallet has sufficient funds (~5 FUT per program).

### Step 1: Prepare Mainnet Wallet

```bash
# Check your mainnet balance
solana balance $(solana-keygen pubkey prediction-market-smartcontract/prediction.json) --url mainnet-beta
solana balance --url mainnet-beta

# You need ~5 FUT for each program deployment
# Transfer FUT from an exchange or another wallet
```

### Step 2: Build (same as devnet)

```bash
cd prediction-market-smartcontract
~/.avm/bin/anchor build

cd ../futurus-coin
~/.avm/bin/anchor build
```

### Step 3: Deploy to Mainnet

```bash
# Prediction Market
cd prediction-market-smartcontract
~/.avm/bin/anchor deploy --provider.cluster mainnet

# Futurus Coin
cd ../futurus-coin
~/.avm/bin/anchor deploy --provider.cluster mainnet
```

### Step 4: Update .env for Mainnet

```bash
# In your .env file, update:
FUTANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Step 5: Verify on Solana Explorer

Visit:

- Prediction Market: `https://explorer.solana.com/address/6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY`
- Futurus Coin: `https://explorer.solana.com/address/FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb`

---

## 7. 📝 Post-Deployment Steps

### 1. Update Environment Variables

After deployment, ensure `.env` contains:

```env
COMPOSE_PROJECT_NAME=prediction-market
DB_URL=mongodb://mongodb:27017/prediction-market
FUTANA_RPC_URL=https://api.devnet.solana.com     # or mainnet-beta
FUT_MINT=<your_FUT_mint_address>
```

### 2. Initialize the Prediction Market Global State

```bash
# This is done through the frontend or via the backend API
# The admin wallet calls the `initialize` instruction with GlobalParams
```

### 3. Copy Updated IDL

The build scripts automatically copy IDL files. If you built manually, run:

```bash
# From the root directory
cp prediction-market-smartcontract/target/idl/prediction.json prediction-market-frontend/src/components/prediction_market_sdk/idl/prediction.json
cp prediction-market-smartcontract/target/idl/prediction.json prediction-market-backend/src/prediction_market_sdk/idl/prediction.json
cp futurus-coin/target/idl/futurus_coin.json prediction-market-frontend/src/components/prediction_market_sdk/idl/futurus_coin.json
cp futurus-coin/target/idl/futurus_coin.json prediction-market-backend/src/prediction_market_sdk/idl/futurus_coin.json
```

---

## 8. 🐛 Troubleshooting

### Common Errors

| Error                                   | Cause                      | Solution                                                        |
| --------------------------------------- | -------------------------- | --------------------------------------------------------------- |
| `anchor-lang version doesn't match CLI` | Version mismatch           | Add `anchor_version = "0.30.1"` to `[toolchain]` in Anchor.toml |
| `Insufficient funds`                    | Not enough FUT             | Airdrop on devnet: `solana airdrop 2 -ud`                       |
| `Write transactions failed`             | Devnet rate limit          | Wait 30 seconds and retry                                       |
| `Program's authority does not match`    | Wrong wallet               | Use the wallet that originally deployed the program             |
| `Stack offset exceeded`                 | Large accounts struct      | Warning only. Does not prevent deployment                       |
| `borsh is ambiguous`                    | Duplicate borsh dependency | Remove `borsh` from program's Cargo.toml                        |

### Devnet Airdrop

```bash
# Request multiple airdrops if needed
for i in {1..3}; do
  solana airdrop 2 --url devnet
  sleep 5
done
```

### Reset Build Cache

```bash
cd prediction-market-smartcontract
cargo clean
~/.avm/bin/anchor build

cd ../futurus-coin
cargo clean
~/.avm/bin/anchor build
```

### Check Program Authority

```bash
# See who owns each program
solana program show 6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY --url devnet
solana program show FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb --url devnet
```

---

## 9. 📚 Reference

### Key Addresses

| Item                                       | Address                                        |
| ------------------------------------------ | ---------------------------------------------- |
| **Prediction Program**                     | `6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY` |
| **Futurus Coin Program**                    | `FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb` |
| **Prediction Wallet** (upgrade authority)  | `99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1` |
| **Futurus Coin Wallet** (upgrade authority) | `8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ` |
| **FUT Token Mint**                         | `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave` |
| **Switchboard Oracle**                     | `SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f`  |
| **Metaplex Metadata**                      | `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`  |

### Anchor.toml Configuration

**Prediction Market** (`prediction-market-smartcontract/Anchor.toml`):

```toml
[programs.devnet]
prediction = "6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY"

[provider]
cluster = "devnet"
wallet = "./prediction.json"
```

**Futurus Coin** (`futurus-coin/Anchor.toml`):

```toml
[programs.devnet]
futurus_coin = "FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

### Dependencies

**Prediction Market** key dependencies:

- `anchor-lang` 0.30.1 (with `init-if-needed`, `event-cpi`)
- `anchor-spl` 0.30.1 (with `metadata`)
- `switchboard-solana` 0.30.4
- `switchboard-on-demand` 0.11.3
- `rust_decimal` 1.37.1

**Futurus Coin** key dependencies:

- `anchor-lang` 0.30.1 (with `init-if-needed`)
- `anchor-spl` 0.30.1 (with `metadata`)

---

_Last updated: 2026-02-23_
