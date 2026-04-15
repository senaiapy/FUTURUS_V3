# 🛠️ Smart Contract Deployment and Configuration Guide

This manual covers how to build and deploy the **Prediction Market** and **Futurus Coin (FUT)** smart contracts to **Devnet** and **Mainnet**.

> 📖 For full build & deploy documentation with scripts, see [BUILD_SMARTCONTRACTS.md](BUILD_SMARTCONTRACTS.md).

---

## 1. 🔑 Wallet Configuration

The project uses two wallets for deployment:

| Contract              | Wallet File                                       | Public Key                                     |
| --------------------- | ------------------------------------------------- | ---------------------------------------------- |
| **Prediction Market** | `prediction-market-smartcontract/prediction.json` | `99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1` |
| **Futurus Coin**       | `~/.config/solana/id.json`                        | `8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ` |

### Check Wallet Addresses

```bash
solana-keygen pubkey prediction-market-smartcontract/prediction.json
solana-keygen pubkey ~/.config/solana/id.json
```

### Set CLI to Use Prediction Wallet

```bash
solana config set --keypair $(pwd)/prediction-market-smartcontract/prediction.json
```

---

## 2. 🌐 Environment Setup

### For Devnet Testing

```bash
solana config set --url https://api.devnet.solana.com

# Airdrop FUT (if needed — max 2 FUT per request)
solana airdrop 2
solana airdrop 2 $(solana-keygen pubkey prediction-market-smartcontract/prediction.json)
```

### For Mainnet Deployment

```bash
solana config set --url https://api.mainnet-beta.solana.com
```

> ⚠️ **Mainnet requires real FUT.** Deploy costs ~5 FUT per program. Fund your wallets before deploying.

---

## 3. 🚀 Automated Deployment (Recommended)

Use the build scripts from the project root:

```bash
# Make scripts executable
chmod +x build_prediction_market_smartcontracts.sh
chmod +x build_futurusCoin.sh

# Deploy to Devnet
./build_prediction_market_smartcontracts.sh devnet
./build_futurusCoin.sh devnet

# Deploy to Mainnet
./build_prediction_market_smartcontracts.sh mainnet
./build_futurusCoin.sh mainnet

# Build only (no deploy)
./build_prediction_market_smartcontracts.sh build
./build_futurusCoin.sh build
```

---

## 4. 🔧 Manual Deployment Steps

### Build the Prediction Market

```bash
cd prediction-market-smartcontract
~/.avm/bin/anchor build
```

### Deploy Prediction Market

```bash
# Devnet
~/.avm/bin/anchor deploy --provider.cluster devnet

# Mainnet
~/.avm/bin/anchor deploy --provider.cluster mainnet
```

### Build Futurus Coin

```bash
cd futurus-coin
~/.avm/bin/anchor build
```

### Deploy Futurus Coin

```bash
# Devnet
~/.avm/bin/anchor deploy --provider.cluster devnet

# Mainnet
~/.avm/bin/anchor deploy --provider.cluster mainnet
```

---

## 5. 📝 Post-Deployment Steps

1. **Copy IDL files** to frontend and backend:

   ```bash
   # From root directory
   cp prediction-market-smartcontract/target/idl/prediction.json prediction-market-frontend/src/components/prediction_market_sdk/idl/prediction.json
   cp prediction-market-smartcontract/target/idl/prediction.json prediction-market-backend/src/prediction_market_sdk/idl/prediction.json
   cp futurus-coin/target/idl/futurus_coin.json prediction-market-frontend/src/components/prediction_market_sdk/idl/futurus_coin.json
   cp futurus-coin/target/idl/futurus_coin.json prediction-market-backend/src/prediction_market_sdk/idl/futurus_coin.json
   ```

2. **Restart backend** to pick up new IDL:

   ```bash
   docker-compose restart backend
   ```

3. **Verify on Solana Explorer**:
   - [Prediction Market on Explorer](https://explorer.solana.com/address/6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY?cluster=devnet)
   - [Futurus Coin on Explorer](https://explorer.solana.com/address/FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb?cluster=devnet)

---

## 6. 📋 Program IDs

| Program           | ID                                             |
| ----------------- | ---------------------------------------------- |
| Prediction Market | `6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY` |
| Futurus Coin (FUT) | `FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb` |
| FUT Token Mint    | `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave` |

---

## 💡 Troubleshooting

| Issue                          | Solution                                                        |
| ------------------------------ | --------------------------------------------------------------- |
| `anchor` not found             | Use full path: `~/.avm/bin/anchor`                              |
| `anchor-lang version mismatch` | Add `anchor_version = "0.30.1"` to `[toolchain]` in Anchor.toml |
| Insufficient funds             | Airdrop on devnet: `solana airdrop 2 -ud`                       |
| Write transactions failed      | Devnet rate limit — wait 30s and retry                          |
| Authority mismatch             | Use the correct wallet for each program                         |
| Build stack warning            | Non-fatal warning — deployment still works                      |

---

_Last updated: 2026-02-23_
