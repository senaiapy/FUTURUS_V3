# 🛠️ Solana Docker Tools — Manual

This directory contains a self-contained Docker environment for Solana development, including **Solana CLI**, **Anchor**, **SPL Token CLI**, and **Rust**.

---

> **Note:** This environment is now optimized for **Apple Silicon (ARM64)**. Build times are reduced from 12 hours to ~10 minutes, and it uses `solana-cli 1.18.15` and `spl-token-cli 5.5.0` to match your local system.

---

## 🚀 Getting Started

### 1. Start the Environment

Run this command from the `Docker-Solana` folder:

```bash
./run-docker.sh
```

_(Alternatively: `docker compose -f docker-compose.solana.yml up -d --build`)_

### 2. Enter the Container

```bash
./enter-docker.sh
```

_(Alternatively: `docker exec -it solana-tooling bash`)_

---

## Solana Version

```bash
solana --version
```

## 🔑 Keypair Management

### Create a new Wallet

```bash
solana-keygen new --outfile /root/.config/solana/id.json
```

### Create a new Wallet BOSS

```bash
solana-keygen new --outfile /root/.config/solana/mnt.json
```

## generate a passphrase in https://it-tools.tech/bip39-generator

_Note: Your keys are persisted in `./volumes/solana-config` on your host machine._

### Check Balance

```bash
solana balance --url devnet
```

### Airdrop SOL (Devnet only)

```bash
solana airdrop 2 --url devnet
```

## https://faucet.solana.com/

---

## 🪙 Token Management (SPL Token)

## Set the keypair and check the address

```bash
solana config set --keypair id.json

solana address
```

### 1. Create a New Token Mint (Token-2022)

To support native metadata instructions, we must use the **Token-2022** program and enable the **metadata extension** during creation.

```bash
spl-token --program-2022 create-token --enable-metadata --enable-freeze --url devnet
```

_Save the output **Address** (e.g., `MINT_ADDRESS`)._

### 2. Create a Token Account

You need a specific account to hold the tokens you just created.

```bash
spl-token create-account <MINT_ADDRESS> --url devnet
```

### 3. Mint Tokens

Mint a specific amount to your account.

```bash
spl-token mint <MINT_ADDRESS> 2000000000 --url devnet
```

### 4. Verify Supply and Metadata

```bash
spl-token supply <MINT_ADDRESS> --url devnet
spl-token display <MINT_ADDRESS> --url devnet
```

---

## 🏷️ Metadata Initialization

**Note:** This command only works if you created the token with `--enable-metadata` using the Token-2022 program (as shown in Step 1).

### 1. Initialize Metadata

```bash
spl-token initialize-metadata <MINT_ADDRESS> "Token Name" "SYMBOL" "https://url-to-json-metadata.json" --url devnet
```

**Example (Copy & Paste):**

```bash
spl-token initialize-metadata <MINT_ADDRESS> "Futurus Coin" "FUT" https://peach-worthy-eel-144.mypinata.cloud/ipfs/bafkreifqtz6pm3hx2mau2c66aqojzw7bkgwlscup7cqqcs62ziz2exorju --url devnet
```

### 2. Update Metadata (if needed)

```bash
spl-token update-metadata <MINT_ADDRESS> "name" "New Name" --url devnet
```

---

## Shielding & Security 🛡️

### 1. Revoke Mint Authority

Once you have minted your total supply, it is a security best practice to revoke the mint authority so no more tokens can ever be created.

```bash
spl-token authorize <MINT_ADDRESS> mint --disable --url devnet
```

### 2. Revoke Freeze Authority

To ensure the token cannot be frozen by the creator (increasing trust):

```bash
spl-token authorize <MINT_ADDRESS> freeze --disable --url devnet
```

### 3. Verify Constraints

```bash
solana account <MINT_ADDRESS> --url devnet
```

Check that the `Mint Authority` and `Freeze Authority` are set to `None`.

---

## 🌐 Network Switching

### Switch to Devnet

```bash
solana config set --url https://api.devnet.solana.com
```

### Switch to Mainnet

```bash
# ⚠️ Only use this if you have real SOL for transaction fees
solana config set --url https://api.mainnet-beta.solana.com
```

---

## 📦 Building Smart Contracts (Anchor)

Inside the container, navigate to your program folder and run:

```bash
cd /workspace/your-program-folder
anchor build
anchor deploy --provider.cluster devnet
```
