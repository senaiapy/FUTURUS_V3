# 🪙 Wallet & Dev Environment Setup Guide

Complete guide to configure Phantom wallet for **Devnet**, connect to Futurus Coin (FUT), and test the prediction market.

---

## 📋 Table of Contents

1. [Configure Phantom for Devnet](#1--configure-phantom-for-devnet)
2. [Get Devnet FUT](#2--get-devnet-fut)
3. [Add Futurus Coin (FUT) to Your Wallet](#3--add-futuruscoin-fut-to-your-wallet)
4. [Send FUT Tokens to Your Wallet](#4--send-fut-tokens-to-your-wallet)
5. [Test the Prediction Market](#5--test-the-prediction-market)
6. [Key Addresses](#6--key-addresses)

---

## 1. 👻 Configure Phantom for Devnet

### Step 1: Open Phantom Settings

1. Open **Phantom** browser extension
2. Click the **hamburger menu** (☰) or **Settings gear** (⚙️)
3. Go to **Settings** → **Developer Settings**

### Step 2: Enable Devnet

1. Toggle **Testnet Mode** to **ON**
2. Select **Solana Devnet** from the network options
3. Phantom will now show _"Devnet"_ in the top banner

> 💡 **Tip:** When Testnet Mode is ON, Phantom will show a purple banner at the top saying "Devnet".

### Step 3: Verify Connection

Your address stays the same, but the balance will now show Devnet FUT instead of Mainnet FUT.

---

## 2. 💰 Get Devnet FUT

You need Devnet FUT for transaction fees. There are several ways to get it:

### Option A: Solana CLI Airdrop

```bash
# Airdrop to your Phantom wallet address
solana airdrop 2 <YOUR_PHANTOM_ADDRESS> --url devnet

# Example:
solana airdrop 2 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU --url devnet
```

### Option B: Web Faucet

Visit [https://faucet.solana.com](https://faucet.solana.com):

1. Paste your Phantom wallet address
2. Select **Devnet**
3. Click **Confirm Airdrop**
4. You'll receive 2 FUT

### Option C: Phantom Built-in Faucet

1. In Phantom (with Devnet enabled), go to your FUT balance
2. Click **"Receive"**
3. Some versions of Phantom offer a "Request Airdrop" button on Devnet

> 📝 You can request up to 2 FUT per airdrop. Repeat multiple times if needed.

---

## 3. 🪙 Add Futurus Coin (FUT) to Your Wallet

### Token Details

| Property         | Value                                          |
| ---------------- | ---------------------------------------------- |
| **Token Name**   | Futurus Coin                                    |
| **Symbol**       | FUT                                            |
| **Mint Address** | `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave` |
| **Decimals**     | 9                                              |
| **Program**      | `FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb` |
| **Network**      | Devnet                                         |

### Add FUT to Phantom

1. Open **Phantom** (make sure you're on **Devnet**)
2. Scroll down to your token list
3. Click **"Manage Token List"** or **"+"** button
4. Search for the mint address: `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave`
5. If not found, click **"Add Custom Token"**:
   - **Mint Address**: `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave`
   - **Token Name**: Futurus Coin
   - **Symbol**: FUT
   - **Decimals**: 9
6. Click **Save**

> 💡 The token will appear in your wallet once you have a balance.

### View on Solana Explorer

You can verify the token exists on Devnet:

[View FUT on Solana Explorer (Devnet)](https://explorer.solana.com/address/FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave?cluster=devnet)

---

## 4. 📤 Send FUT Tokens to Your Wallet

### Option A: Using the Init Script

If you deployed the Futurus Coin contract and ran the init script, the initial supply was minted to the deployer's wallet. To send FUT to your Phantom:

```bash
# Check who holds FUT tokens
spl-token accounts --owner $(solana-keygen pubkey ~/.config/solana/id.json) --url devnet

# Send FUT from deployer wallet to your Phantom
spl-token transfer \
  FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave \
  1000000000 \
  <YOUR_PHANTOM_ADDRESS> \
  --url devnet \
  --fund-recipient \
  --allow-unfunded-recipient
```

> **Note:** `--fund-recipient` creates the Associated Token Account (ATA) on the recipient's wallet if it doesn't exist.

### Option B: Using Solana CLI

```bash
# First, check if you have FUT tokens
spl-token balance FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave --url devnet

# Transfer 100 FUT tokens (with 9 decimals, 100 = 100.000000000)
spl-token transfer \
  FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave \
  100 \
  <YOUR_PHANTOM_ADDRESS> \
  --url devnet \
  --fund-recipient
```

### Option C: Via the Prediction Market Frontend

1. Visit **http://localhost:3000** (with Docker stack running)
2. Connect your Phantom (Devnet mode)
3. FUT tokens are distributed through market participation (betting, winning)

---

## 5. 🧪 Test the Prediction Market

### Prerequisites

- ✅ Phantom configured for Devnet
- ✅ Devnet FUT in your wallet (for gas fees)
- ✅ Docker stack running (`./setup-dev.sh`)

### Testing Flow

1. **Connect Wallet**
   - Go to http://localhost:3000
   - Click "Connect Wallet"
   - Select Phantom
   - Approve the connection

2. **Create a Market**
   - Click "Propose Market"
   - Fill in market details (question, expiry date, etc.)
   - Approve the transaction in Phantom
   - Wait for on-chain confirmation

3. **Fund a Market**
   - Go to "Fund Market"
   - Add liquidity to activate the market
   - Approve transaction

4. **Place a Bet**
   - Open an active market
   - Choose YES or NO
   - Enter your bet amount
   - Approve the transaction
   - FUT tokens are used for betting

5. **Market Resolution**
   - Once the market expires, the oracle fetches the result
   - Winners can claim their rewards
   - FUT tokens are distributed to winners

---

## 6. 📋 Key Addresses

### Devnet Program Addresses

| Program                 | Address                                        |
| ----------------------- | ---------------------------------------------- |
| **Prediction Market**   | `6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY` |
| **Futurus Coin Program** | `FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb` |
| **FUT Token Mint**      | `FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave` |

### Deployer Wallets

| Wallet                   | Address                                        |
| ------------------------ | ---------------------------------------------- |
| **Prediction Deployer**  | `99ULgGDkjraTZxy7ccX6f2gq6axcF7u2tMqsz3s45Uw1` |
| **Futurus Coin Deployer** | `8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ` |

### Network Configuration

| Setting       | Value                                         |
| ------------- | --------------------------------------------- |
| **RPC URL**   | `https://api.devnet.solana.com`               |
| **WebSocket** | `wss://api.devnet.solana.com/`                |
| **Explorer**  | `https://explorer.solana.com/?cluster=devnet` |

---

## 🐛 Troubleshooting

| Issue                        | Solution                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------- |
| Token not showing in Phantom | Make sure Devnet mode is ON, then add custom token with the mint address     |
| "Insufficient balance"       | Airdrop more Devnet FUT: `solana airdrop 2 <address> --url devnet`           |
| "Transaction failed"         | Check Phantom is on Devnet (purple banner), and you have enough FUT for gas  |
| FUT balance shows 0          | Transfer FUT from deployer wallet using `spl-token transfer` command         |
| Can't connect wallet         | Ensure frontend is running on http://localhost:3000 and Phantom is on Devnet |
| "Network mismatch"           | Both Phantom and the frontend must point to the same network (Devnet)        |

---

_Last updated: 2026-02-23_
