# 💸 Manual: Sending Futurus Coin (FUT)

This guide explains how to send **Futurus Coin (FUT)** to other wallets on both Devnet and Mainnet.

---

## 🌐 1. Select Network

### To Devnet

```bash
solana config set --url https://api.devnet.solana.com
```

### To Mainnet

```bash
solana config set --url https://api.mainnet-beta.solana.com
```

---

## 🪙 2. Sending FUT

### Step A: Find the Token Address (MINT)

- **Devnet MINT**: `EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj`
- **Mainnet MINT**: _(Insert your Mainnet address after creation)_

### Step B: Transfer Command

Use the following command to send tokens. The `--fund-recipient` flag is crucial as it automatically creates a token account for the receiver if they don't have one.

```bash
spl-token transfer <MINT_ADDRESS> <AMOUNT> <RECIPIENT_WALLET_ADDRESS> --fund-recipient
```

**Example (Devnet):**

```bash
# Sending 5000 FUT to a friend on Devnet
spl-token transfer EP2h7Z5AwPiVrKzjV1aV56HP4Jd6VWYx91Z8QN2SNUfj 5000 6vXm... --fund-recipient
```

---

## 🔍 3. Verification

### Check your current FUT balance

```bash
spl-token balance <MINT_ADDRESS>
```

### View Transaction on Explorer

```bash
# It will print a signature after the transfer, copy it and go to:
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```
