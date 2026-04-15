#!/bin/bash
set -e

echo "🛠️ Starting Installation of Solana Development Tools..."

# 1. Install Rust
if ! command -v rustc &> /dev/null; then
    echo "🦀 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✅ Rust is already installed: $(rustc --version)"
fi

# 2. Install Solana CLI (Agave)
if ! command -v solana &> /dev/null; then
    echo "☀️ Installing Solana CLI (Agave stable)..."
    sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    # Add to shell profile if not present
    if [[ ":$PATH:" != *":$HOME/.local/share/solana/install/active_release/bin:"* ]]; then
        echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> "$HOME/.zshrc"
    fi
else
    echo "✅ Solana CLI is already installed: $(solana --version)"
fi

# 3. Install AVM and Anchor
if ! command -v avm &> /dev/null; then
    echo "⚓ Installing Anchor Version Manager (AVM)..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
else
    echo "✅ AVM is already installed: $(avm --version)"
fi

echo "⚓ Setting up Anchor latest stable (0.32.1)..."
avm install latest || true
avm use latest

# 4. Install SPL Token CLI
if ! command -v spl-token &> /dev/null; then
    echo "🪙 Installing SPL Token CLI..."
    cargo install spl-token-cli
else
    echo "✅ SPL Token CLI is already installed: $(spl-token --version)"
fi

echo "------------------------------------------------"
echo "🎉 All tools installed successfully!"
echo "Please restart your terminal or run: source ~/.zshrc"
echo "------------------------------------------------"
