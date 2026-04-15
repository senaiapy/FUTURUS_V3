#!/bin/bash
set -e

# Configuration
TOKEN_NAME="Futurus Coin"
TOKEN_SYMBOL="FUT"
DECIMALS=9
SUPPLY=1000000000
METADATA_URL="https://raw.githubusercontent.com/user/repo/main/@futurus-coin/metadata.json"

# Paths
export PATH="/Users/galo/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

echo "🚀 Starting Futurus Coin Deployment Process..."

# Get current network
RPC_URL=$(solana config get | grep "RPC URL" | awk '{print $3}')
NETWORK="unknown"
[[ "$RPC_URL" == *"devnet"* ]] && NETWORK="devnet"
[[ "$RPC_URL" == *"mainnet"* ]] && NETWORK="mainnet"

echo "🌐 Target Network: $NETWORK ($RPC_URL)"

# 1. Check Balance
BALANCE=$(solana balance | awk '{print $1}')
echo "💰 Current Balance: $BALANCE FUT"

if (( $(echo "$BALANCE < 0.01" | bc -l) )); then
    if [ "$NETWORK" == "devnet" ]; then
        echo "⚠️ Low balance on Devnet. Attempting airdrop..."
        solana airdrop 1 || echo "Airdrop failed, hoping for existing funds..."
    else
        echo "❌ Error: Insufficient funds for Mainnet deployment. You need at least 0.05 FUT."
        exit 1
    fi
fi

# 2. Create Token
echo "🛠️ Creating Token Mint (Token-2022)..."
# Use Token-2022 for native metadata support
MINT_OUTPUT=$(spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EP2H6D395arY66SCXkM2 --decimals $DECIMALS --enable-metadata)
MINT_ADDRESS=$(echo "$MINT_OUTPUT" | grep "Creating token" | awk '{print $3}')

if [ -z "$MINT_ADDRESS" ]; then
    echo "❌ Error creating token mint. Output:"
    echo "$MINT_OUTPUT"
    exit 1
fi

echo "✅ Created Token Mint: $MINT_ADDRESS"

# 3. Initialize Metadata
echo "📇 Initializing Metadata (FUT)..."
spl-token initialize-metadata "$MINT_ADDRESS" "$TOKEN_NAME" "$TOKEN_SYMBOL" "$METADATA_URL" --program-id TokenzQdBNbLqP5VEhdkAS6EP2H6D395arY66SCXkM2

# 4. Create Token Account and Mint Supply
echo "🏦 Creating Associated Token Account for the creator..."
spl-token create-account "$MINT_ADDRESS" --program-id TokenzQdBNbLqP5VEhdkAS6EP2H6D395arY66SCXkM2

echo "🪙 Minting $SUPPLY tokens to your account..."
spl-token mint "$MINT_ADDRESS" "$SUPPLY" --program-id TokenzQdBNbLqP5VEhdkAS6EP2H6D395arY66SCXkM2

echo "------------------------------------------------"
echo "🎉 SUCCESS! Futurus Coin is now active."
echo "Mint Address: $MINT_ADDRESS"
echo "Symbol: $TOKEN_SYMBOL"
echo "Decimals: $DECIMALS"
echo "Total Supply Minted: $SUPPLY"
echo "------------------------------------------------"
echo "Next: Use this Mint Address in your Smart Contract and Frontend."
