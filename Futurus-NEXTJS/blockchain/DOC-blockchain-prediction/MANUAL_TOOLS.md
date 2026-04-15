# 🛠️ Tools Installation & Setup Guide

This guide explains how to install the necessary tools to develop, deploy, and interact with the Prediction Market on Solana.

---

## 1. ⌨️ Install Solana CLI (Agave)

The current toolchain uses the **Agave** client (Solana 2.x/3.x).

**Official Installer (Recommended):**

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

**Verify installation:**

```bash
solana --version
```

---

## 2. 🔑 Keypair & Network Setup

Before interacting with the network, you need a local keypair and to point the CLI to the correct network.

### Create a Devnet Keypair:

```bash
solana-keygen new --no-passphrase --outfile ~/.config/solana/id.json
```

### Switch to Devnet:

```bash
solana config set --url devnet
```

---

## 3. ⚓ Install Rust & Anchor

Anchor is the framework used for the smart contracts.

### Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Install Anchor CLI

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

---

## 4. 🦊 Browser Wallet Setup

To interact with the frontend at `http://localhost:3000`, you need a Solana wallet extension.

### Recommended Wallets:

- **Phantom**: [Download Website](https://phantom.app/download)
- **Solflare**: [Download Website](https://solflare.com/download)

### Connection Steps:

1.  Install the extension in Chrome/Brave/Firefox.
2.  Create a new wallet or import an existing one.
3.  **Switch to Devnet for testing:**
    - **Phantom**: Settings > Developer Settings > Testnet Mode (On) > Select Devnet.
    - **Solflare**: Settings > Network > Devnet.

---

## 5. 🚰 Getting Free Tokens (Devnet Faucet)

To test on Devnet, you need free "Play FUT".

### Option A: Solana CLI (Fastest)

```bash
# Set network to devnet
solana config set --url https://api.devnet.solana.com

# Request airdrop (2 FUT max per request)
solana airdrop 2
```

### Option B: Web Faucets

If the CLI airdrop is rate-limited, use these websites:

- [Solana Faucet](https://faucet.solana.com/)
- [LST Faucet](https://solfaucet.com/)

---

## 🏁 Summary Checklist

- [ ] Solana CLI installed (`solana --version`)
- [ ] Local keypair generated (`solana address`)
- [ ] CLI switched to **Devnet** (`solana config get`)
- [ ] Anchor CLI installed (`anchor --version`)
- [ ] Phantom/Solflare installed in browser
- [ ] Browser wallet switched to **Devnet**
- [ ] Received free Devnet FUT for transactions

Now you are ready to follow **MANUAL_SMART.md** for deployment!
