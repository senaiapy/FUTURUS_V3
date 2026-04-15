# ☀️ Manual: Transferring & Receiving SOL

This guide explains how to fund your wallet with SOL for fees and how to transfer SOL to other wallets.

---

## 💧 1. Getting SOL (Funding your Wallet)

### A. Devnet (Free Faucet)

The easiest way to get Devnet SOL for testing:

1.  **Command Line (Fastest)**:

    ```bash
    solana airdrop 2 8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ --url devnet
    ```

2.  **Web Faucet** (If command line fails):
    Go to [https://faucet.solana.com/](https://faucet.solana.com/), paste your address `8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ`, and select Devnet.

### B. Mainnet (Real SOL)

To create a real token, you need real SOL. You must send it from an exchange (Binance, Coinbase, Phantom) to your wallet address:

**Your Wallet Address:**
`8wNSvnXQhAdSBoFnTycwqRDqRczFdcV9uWAYpLMEwPWJ`

---

## 💸 2. Sending SOL to Others

Use the `solana transfer` command to send native SOL.

### Step A: Select Network

```bash
# For Devnet
solana config set --url devnet

# For Mainnet
solana config set --url mainnet-beta
```

### Step B: Execute Transfer

```bash
# Format: solana transfer <RECIPIENT_ADDRESS> <SOL_AMOUNT> --allow-unfunded-recipient
solana transfer <RECIPIENT_ADDRESS> 0.1 --allow-unfunded-recipient
```

**Example:**

```bash
# Sending 0.05 SOL to another wallet
solana transfer GvXm... 0.05 --allow-unfunded-recipient
```

---

## 📊 3. Check Balance

```bash
solana balance
```

_(Ensure you are on the correct network using `solana config get` before checking)_
