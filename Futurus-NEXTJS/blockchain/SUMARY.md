# 📋 Futurus Prediction Market — Deployment Summary

> Last updated: **2026-02-23** | Network: **Devnet** (deployed) / **Mainnet** (pending)

---

## ✅ Devnet Deployments

| Program               | Program ID                                     | Status         |
| --------------------- | ---------------------------------------------- | -------------- |
| **Prediction Market** | `6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY` | ✅ Deployed    |
| **Futurus Coin (FUT)** | `FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb` | ✅ Deployed    |
| **Global PDA**        | `FSoYspwNqg9oWFXqvYfMgoKd2jC84WsyviCCW8zxM6Pw` | ✅ Initialized |

---

## 🔑 Authorities (Upgrade Wallets)

| Program               | Authority Public Key                           | Wallet File                                       |
| --------------------- | ---------------------------------------------- | ------------------------------------------------- |
| **Prediction Market** | `99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1` | `prediction-market-smartcontract/prediction.json` |
| **Futurus Coin (FUT)** | `8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ` | `~/.config/solana/id.json`                        |

---

## 🪙 Token Addresses

| Token           | Mint Address                                   | Decimals | Symbol |
| --------------- | ---------------------------------------------- | -------- | ------ |
| **Futurus Coin** | `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave` | 9        | FUT    |

---

## 📦 Program Details

### Prediction Market

| Field                   | Value                                          |
| ----------------------- | ---------------------------------------------- |
| **Program ID**          | `6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY` |
| **Owner**               | `BPFLoaderUpgradeab1e11111111111111111111111`  |
| **ProgramData Address** | `2oWGJ4CrG2CbEN8XhT899n6Q6AAgp9GTkmkvjjZyoLyB` |
| **Authority**           | `99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1` |
| **IDL Account**         | `C1M2aMuVvCWoBj85ZUFkgCEwiQR45Pb4fAf56Tk68e8a` |
| **Data Length**         | 439,728 bytes                                  |
| **Balance**             | 3.06 FUT                                       |

### Futurus Coin (FUT)

| Field                   | Value                                          |
| ----------------------- | ---------------------------------------------- |
| **Program ID**          | `FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb` |
| **Owner**               | `BPFLoaderUpgradeab1e11111111111111111111111`  |
| **ProgramData Address** | `6tFuLnUEifvrLVK1JaEQEhqeo7eU7kMYfcfWMdKqVbby` |
| **Authority**           | `8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ` |
| **IDL Account**         | `EYT8tdJkWU4PrT4cHXxotLsjhpGsbjT1AvTMprMkTyim` |
| **Data Length**         | 283,704 bytes                                  |
| **Balance**             | 1.98 FUT                                       |

---

## 🔗 External Dependencies

| Service                      | Address                                        |
| ---------------------------- | ---------------------------------------------- |
| **Switchboard Oracle**       | `SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f`  |
| **Metaplex Token Metadata**  | `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`  |
| **SPL Token Program**        | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`  |
| **Associated Token Program** | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` |

---

## 🌐 Solana Explorer Links (Devnet)

- **Prediction Market**: [View on Explorer](https://explorer.solana.com/address/6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY?cluster=devnet)
- **Futurus Coin**: [View on Explorer](https://explorer.solana.com/address/FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb?cluster=devnet)
- **FUT Token Mint**: [View on Explorer](https://explorer.solana.com/address/FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave?cluster=devnet)
- **Global PDA**: [View on Explorer](https://explorer.solana.com/address/FSoYspwNqg9oWFXqvYfMgoKd2jC84WsyviCCW8zxM6Pw?cluster=devnet)

---

## ⚠️ Mainnet Status

| Wallet                      | Mainnet Balance | Required |
| --------------------------- | --------------- | -------- |
| Prediction (`99ULgGDk...`)  | 0.002 FUT       | ~5 FUT   |
| Futurus Coin (`8wNSvnXQ...`) | 0 FUT           | ~5 FUT   |

> Mainnet deployment pending — wallets need to be funded first.

---

## 🛠️ Build & Deploy Scripts

```bash
# Smart contract build & deploy (Devnet)
./build_prediction_market_smartcontracts.sh devnet
./build_futurusCoin.sh devnet

# Smart contract build & deploy (Mainnet)
./build_prediction_market_smartcontracts.sh mainnet
./build_futurusCoin.sh mainnet

# Build smart contracts only (no deploy)
./build_prediction_market_smartcontracts.sh build
./build_futurusCoin.sh build
```

---

## 🐳 Docker Stack Commands

### Development / Testing (Devnet)

```bash
./setup-dev.sh              # Start all services on Devnet
./setup-dev.sh stop         # Stop all services
./setup-dev.sh restart      # Restart all services
./setup-dev.sh logs         # Live logs
./setup-dev.sh status       # Container status
```

### Production (Mainnet)

```bash
./setup.sh                  # Start all services on Mainnet (with confirmation)
./setup.sh stop             # Stop all services
./setup.sh restart          # Restart all services
./setup.sh logs             # Live logs
./setup.sh status           # Container status
```

---

## 📂 Environment Configuration

### Dev Mode (Devnet) — `setup-dev.sh` / `docker-compose.dev.yml`

| Variable                     | Value                                          |
| ---------------------------- | ---------------------------------------------- |
| `FUTANA_RPC_URL`             | `https://api.devnet.solana.com`                |
| `FUTANA_CLUSTER`             | `devnet`                                       |
| `FUT_MINT`                   | `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave` |
| `NEXT_PUBLIC_FUTANA_RPC_URL` | `https://api.devnet.solana.com`                |
| `NEXT_PUBLIC_FUT_MINT`       | `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave` |
| `NEXT_PUBLIC_API_URL`        | `http://localhost:8082`                        |
| `PASSKEY`                    | `dev-passkey`                                  |

### Production Mode (Mainnet) — `setup.sh` / `docker-compose.yml`

| Variable                     | Value                                 |
| ---------------------------- | ------------------------------------- |
| `FUTANA_RPC_URL`             | `https://api.mainnet-beta.solana.com` |
| `FUTANA_CLUSTER`             | `mainnet-beta`                        |
| `FUT_MINT`                   | ⚠️ Set your Mainnet FUT mint address  |
| `NEXT_PUBLIC_FUTANA_RPC_URL` | `https://api.mainnet-beta.solana.com` |
| `NEXT_PUBLIC_FUT_MINT`       | ⚠️ Set your Mainnet FUT mint address  |
| `NEXT_PUBLIC_API_URL`        | `http://localhost:8082`               |
| `PASSKEY`                    | ⚠️ Set a secure production passkey    |

---

## 🔧 On-Chain PDA Seeds (Smart Contract)

| Seed Constant | Value         | Used By                   |
| ------------- | ------------- | ------------------------- |
| `GLOBAL_SEED` | `global_seed` | Global state PDA          |
| `MARKET_SEED` | `market_seed` | Market PDA (+ market_id)  |
| `MINT_SEED_A` | `mint_a_seed` | YES token mint (+ market) |
| `MINT_SEED_B` | `mint_b_seed` | NO token mint (+ market)  |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Stack                                 │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Frontend   │    │   Backend    │    │   MongoDB    │       │
│  │  Next.js     │◄──►│  Express     │◄──►│  Database    │       │
│  │  Port 3000   │    │  Port 8082   │    │  Port 27017  │       │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘       │
│         │                   │                                    │
└─────────┼───────────────────┼────────────────────────────────────┘
          │                   │
          ▼                   ▼
┌─────────────────────────────────────────┐
│         Solana Blockchain               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Prediction Market Program      │    │
│  │  6tb9fNKN...                    │    │
│  │  • Create markets               │    │
│  │  • Place bets (YES/NO)          │    │
│  │  • Resolve via oracle           │    │
│  │  • Distribute rewards           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Futurus Coin Program            │    │
│  │  FbafBa96...                    │    │
│  │  • FUT token mint               │    │
│  │  • Used as betting currency     │    │
│  │  • SPL Token standard           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Switchboard Oracle             │    │
│  │  • Price feeds for resolution   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 📄 Anchor & SDK Versions

| Component             | Version | Notes                          |
| --------------------- | ------- | ------------------------------ |
| **Anchor CLI**        | 0.32.1  | Build tool                     |
| **Solana CLI**        | 3.0.15  | Deployment & management        |
| **Rust**              | 1.93.1  | Compiler                       |
| **@coral-xyz/anchor** | 0.30.1  | Backend & Frontend SDK         |
| **IDL Format**        | 0.30    | Uses `writable`/`signer` (new) |
| **Node.js**           | 18/20   | Backend (18) / Frontend (20)   |

---

## 📝 Documentation Index

| Document                                    | Description                                       |
| ------------------------------------------- | ------------------------------------------------- |
| `SUMARY.md` (this file)                     | Deployment summary and architecture               |
| `WALLET_DEV.md`                             | Phantom wallet setup for Devnet + FUT token guide |
| `BUILD_SMARTCONTRACTS.md`                   | Smart contract build & deploy guide               |
| `MANUAL_SMART.md`                           | Manual smart contract operations                  |
| `DOC/install.md`                            | Tool installation guide                           |
| `setup-dev.sh`                              | Dev mode startup (Devnet)                         |
| `setup.sh`                                  | Production startup (Mainnet)                      |
| `build_prediction_market_smartcontracts.sh` | Prediction Market build/deploy                    |
| `build_futurusCoin.sh`                      | Futurus Coin build/deploy                          |

---

## ✅ Final Status Checklist

| Task                                          | Status                 |
| --------------------------------------------- | ---------------------- |
| Prediction Market smart contract built        | ✅                     |
| Prediction Market deployed to Devnet          | ✅                     |
| Futurus Coin smart contract built              | ✅                     |
| Futurus Coin deployed to Devnet                | ✅                     |
| Global PDA initialized on Devnet              | ✅                     |
| Backend upgraded to Anchor 0.30 IDL           | ✅                     |
| Frontend upgraded to Anchor 0.30 IDL          | ✅                     |
| Frontend PDA seeds aligned with contract      | ✅                     |
| FUT_MINT reads from environment variable      | ✅                     |
| Docker dev stack running (MongoDB+Backend+FE) | ✅                     |
| `setup-dev.sh` created (Devnet)               | ✅                     |
| `setup.sh` created (Mainnet with safety)      | ✅                     |
| `docker-compose.dev.yml` created              | ✅                     |
| `docker-compose.yml` updated for production   | ✅                     |
| `WALLET_DEV.md` created                       | ✅                     |
| IDL files copied to frontend & backend        | ✅                     |
| Build/deploy scripts created                  | ✅                     |
| All changes committed & pushed to GitHub      | ✅                     |
| Mainnet deployment                            | ⏳ Pending (needs FUT) |
