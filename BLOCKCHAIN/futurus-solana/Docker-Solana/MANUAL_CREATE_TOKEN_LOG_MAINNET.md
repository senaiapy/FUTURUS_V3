# 🚀 Futurus Coin — Mainnet Deployment Log (Token-2022)

This log contains the exact commands and checks required to deploy **Futurus Coin** to the Solana Mainnet.

---

## 🏗️ 1. Environment Setup & Verification

Before starting, ensure you are on Mainnet and have enough SOL for rent and fees (~0.05 - 0.1 SOL recommended).

### Check current configuration

```bash
solana config get
```

_Verify that `RPC URL` is `https://api.mainnet-beta.solana.com`._

### Switch to Mainnet (if not already)

```bash
solana config set --url https://api.mainnet-beta.solana.com
```

### Check Wallet Balance

```bash
solana balance
```

_Ensure you have REAL SOL here._

---

## 🪙 2. Token Creation

We use **Token-2022** with the **Metadata Extension** and **Freeze Authority** enabled (so we can disable it later for trust).

```bash
spl-token --program-2022 create-token --enable-metadata --enable-freeze
```

**⚠️ IMPORTANT:** Save the `Address` from the output above as your **MINT_ADDRESS**.

---

## 📂 3. Account & Minting

### Create the Token Account (ATA)

```bash
spl-token create-account <MINT_ADDRESS>
```

### Mint the Total Supply (2,000,000,000)

```bash
spl-token mint <MINT_ADDRESS> 2000000000
```

---

## 🏷️ 4. Metadata Initialization

This command writes the name, symbol, and image link directly into the token mint.

```bash
spl-token initialize-metadata <MINT_ADDRESS> "Futurus Coin" "FUT" "https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju"
```

---

## 🛡️ 5. Security & Trust (Revocations)

To make the token safe for the community, we permanently disable the ability to mint more tokens or freeze user accounts.

### Revoke Mint Authority

```bash
spl-token authorize <MINT_ADDRESS> mint --disable
```

### Revoke Freeze Authority

```bash
spl-token authorize <MINT_ADDRESS> freeze --disable
```

---

## ✅ 6. Final Verification

### Display Token Details

```bash
spl-token display <MINT_ADDRESS>
```

**Checklist:**

1. **Supply**: `2000000000000000000` (9 decimals)
2. **Mint authority**: `(not set)`
3. **Freeze authority**: `(not set)`
4. **Metadata**: Correct Name, Symbol, and URI.

### Verify on Explorer

URL: `https://explorer.solana.com/address/<MINT_ADDRESS>/token-extensions`

---

## 📋 Summary of Parameters

- **Name**: Futurus Coin
- **Symbol**: FUT
- **Decimals**: 9
- **Total Supply**: 2,000,000,000
- **Program**: Token-2022
- **Metadata URI**: `https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju`
