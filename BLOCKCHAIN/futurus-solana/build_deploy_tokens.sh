#!/bin/bash
set -e

# Load paths
FUTANA_BIN="$HOME/.local/share/solana/install/active_release/bin"
export PATH="$FUTANA_BIN:$HOME/.cargo/bin:$PATH"

# Ensure correct Anchor version
echo "⚓ Using Anchor $(anchor --version)..."
# avm use 0.29.0 || (echo "⚓ Installing Anchor 0.29.0..." && avm install 0.29.0 && avm use 0.29.0)

# Function to choose network
choose_network() {
    if [ ! -z "$1" ]; then
        choice_arg="$1"
    else
        echo "Select Network:"
        echo "1) Devnet (Test)"
        echo "2) Mainnet (Production)"
        read -p "Enter choice [1-2]: " choice
        case $choice in
            1) choice_arg="devnet" ;;
            2) choice_arg="mainnet" ;;
            *) echo "Invalid choice"; exit 1 ;;
        esac
    fi

    case $choice_arg in
        devnet) NETWORK="devnet"; RPC="https://api.devnet.solana.com" ;;
        mainnet) NETWORK="mainnet-beta"; RPC="https://api.mainnet-beta.solana.com" ;;
        *) echo "Invalid network: $choice_arg"; exit 1 ;;
    esac
}

choose_network "$1"

echo "🌐 Working on $NETWORK..."
solana config set --url $RPC

# 1. Build and Deploy Futurus Coin (CLI 5.5.0)
echo "🪙 Deploying Futurus Coin via SPL Token CLI 5.5.0..."
SPL_TOKEN_BIN="/Users/galo/.cargo/bin/spl-token"

# Configuration
TOKEN_NAME="Futurus Coin"
TOKEN_SYMBOL="FUT"
DECIMALS=9
SUPPLY=1000000000
METADATA_URL="https://raw.githubusercontent.com/user/repo/main/@futurus-coin/metadata.json"

# Create Token
echo "🛠️ Creating Token Mint (Standard Token)..."
MINT_OUTPUT=$("$SPL_TOKEN_BIN" create-token --program-id TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA --decimals $DECIMALS)
MINT_ADDRESS=$(echo "$MINT_OUTPUT" | grep "Creating token" | awk '{print $3}')

if [ -z "$MINT_ADDRESS" ]; then
    echo "❌ Token creation failed!"
    echo "$MINT_OUTPUT"
    exit 1
fi

echo "✅ Created Token: $MINT_ADDRESS"

# Initialize Metadata
echo "📇 Initializing Metadata..."
"$SPL_TOKEN_BIN" initialize-metadata "$MINT_ADDRESS" "$TOKEN_NAME" "$TOKEN_SYMBOL" "$METADATA_URL"

# Create Account and Mint
echo "🏦 Creating Account and Minting Supply..."
"$SPL_TOKEN_BIN" create-account "$MINT_ADDRESS"
"$SPL_TOKEN_BIN" mint "$MINT_ADDRESS" "$SUPPLY"

echo "✅ Futurus Coin Mint: $MINT_ADDRESS"

# 2. Build and Deploy Prediction Market
echo "🚀 Deploying Prediction Market Smart Contract..."
cd "prediction-market-smartcontract"

# Pin dependencies to avoid build errors
rm -f Cargo.lock
CARGO_BIN="$FUTANA_BIN/sdk/sbf/dependencies/platform-tools/rust/bin/cargo"
"$CARGO_BIN" update
"$CARGO_BIN" update -p blake3 --precise 1.5.0 || true
"$CARGO_BIN" update -p toml_datetime --precise 0.7.3 || true
"$CARGO_BIN" update -p wit-bindgen --precise 0.24.0 || true
"$CARGO_BIN" update -p regex --precise 1.10.0 || true
"$CARGO_BIN" update -p borsh@1.6.0 --precise 1.5.1 || true
"$CARGO_BIN" update -p getrandom --precise 0.2.15 || true
"$CARGO_BIN" update -p idna --precise 0.5.0 || true
"$CARGO_BIN" update -p spdx --precise 0.10.4 || true
"$CARGO_BIN" update -p winnow --precise 0.6.13 || true
"$CARGO_BIN" update -p wasip2 --precise 0.1.0 || true

# Build
anchor build

# Deploy
anchor deploy --provider.cluster $NETWORK

PROGRAM_ID=$(anchor keys list | grep "prediction" | awk '{print $3}')
echo "✅ Prediction Market Program ID: $PROGRAM_ID"

echo "------------------------------------------------"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Network: $NETWORK"
echo "Futurus Coin Mint: $MINT_ADDRESS"
echo "Prediction Market: $PROGRAM_ID"
echo "------------------------------------------------"
echo "Next steps:"
echo "1. Update the Frontend with these addresses."
echo "2. Update the Backend constants."
