#!/usr/bin/env bash
###############################################################################
#  build_Futurus Coin.sh
#  Build & Deploy the Futurus Coin (FUT) token smart contract
#
#  Usage:
#    ./build_Futurus Coin.sh              # builds + deploys to devnet
#    ./build_Futurus Coin.sh devnet       # same as above
#    ./build_Futurus Coin.sh mainnet      # builds + deploys to mainnet-beta
#    ./build_Futurus Coin.sh build        # build only (no deploy)
###############################################################################
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$ROOT_DIR/futurus-coin"
ANCHOR_BIN="$HOME/.avm/bin/anchor"

# Program ID
FUTURUS_COIN_PROGRAM_ID="FbafBa96yT3WJQVHtcQuBx9tYUNm6ythEPaqUSm4PAhb"

# ---------- colours ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

# ---------- pre-flight checks ----------
check_tools() {
    log "Checking required tools..."
    command -v solana    >/dev/null 2>&1 || fail "solana CLI not found. Run install_tools.sh first."
    command -v "$ANCHOR_BIN" >/dev/null 2>&1 || fail "anchor CLI not found at $ANCHOR_BIN. Run install_tools.sh first."
    command -v rustc     >/dev/null 2>&1 || fail "rustc not found. Install Rust first."
    
    log "Solana CLI:  $(solana --version)"
    log "Anchor CLI:  $($ANCHOR_BIN --version)"
    log "Rust:        $(rustc --version)"
    ok "All tools present."
}

# ---------- wallet ----------
get_wallet() {
    local network="$1"
    # Futurus Coin uses ~/.config/solana/id.json as upgrade authority
    WALLET="$HOME/.config/solana/id.json"
    
    if [ ! -f "$WALLET" ]; then
        fail "Wallet not found at $WALLET. Run: solana-keygen new"
    fi
    
    local pubkey
    pubkey=$(solana-keygen pubkey "$WALLET")
    log "Wallet address: $pubkey"
    
    local balance
    balance=$(solana balance "$pubkey" --url "$RPC_URL" 2>/dev/null || echo "0 FUT")
    log "Wallet balance: $balance"
}

# ---------- network setup ----------
configure_network() {
    local network="${1:-devnet}"
    
    case "$network" in
        devnet)
            RPC_URL="https://api.devnet.solana.com"
            CLUSTER="devnet"
            ;;
        mainnet|mainnet-beta)
            RPC_URL="https://api.mainnet-beta.solana.com"
            CLUSTER="mainnet"
            ;;
        *)
            fail "Unknown network: $network. Use 'devnet' or 'mainnet'."
            ;;
    esac
    
    log "Network:     $CLUSTER"
    log "RPC URL:     $RPC_URL"
}

# ---------- build ----------
build_program() {
    log "Building Futurus Coin smart contract..."
    cd "$PROJECT_DIR"
    
    $ANCHOR_BIN build 2>&1 | tail -5
    
    if [ ! -f "$PROJECT_DIR/target/deploy/futurus_coin.so" ]; then
        fail "Build failed — futurus_coin.so not found."
    fi
    
    local size
    size=$(wc -c < "$PROJECT_DIR/target/deploy/futurus_coin.so" | tr -d ' ')
    ok "Build successful! Program size: ${size} bytes"
    
    local built_id
    built_id=$(solana-keygen pubkey "$PROJECT_DIR/target/deploy/futurus_coin-keypair.json" 2>/dev/null || echo "unknown")
    log "Built program ID: $built_id"
    log "Expected program ID: $FUTURUS_COIN_PROGRAM_ID"
}

# ---------- deploy ----------
deploy_program() {
    log "Deploying Futurus Coin to $CLUSTER..."
    cd "$PROJECT_DIR"
    
    local max_retries=3
    local attempt=1
    
    while [ $attempt -le $max_retries ]; do
        log "Deploy attempt $attempt/$max_retries..."
        
        if $ANCHOR_BIN deploy --provider.cluster "$CLUSTER" 2>&1; then
            ok "Futurus Coin deployed successfully to $CLUSTER!"
            log "Program ID: $FUTURUS_COIN_PROGRAM_ID"
            
            # Copy IDL
            copy_idl
            return 0
        else
            warn "Deploy attempt $attempt failed. Waiting 15 seconds before retry..."
            sleep 15
            attempt=$((attempt + 1))
        fi
    done
    
    fail "Deploy failed after $max_retries attempts."
}

# ---------- copy IDL ----------
copy_idl() {
    log "Copying Futurus Coin IDL to frontend and backend..."
    local idl_src="$PROJECT_DIR/target/idl/futurus_coin.json"
    
    if [ -f "$idl_src" ]; then
        local fe_dest="$ROOT_DIR/prediction-market-frontend/src/components/prediction_market_sdk/idl/futurus_coin.json"
        local be_dest="$ROOT_DIR/prediction-market-backend/src/prediction_market_sdk/idl/futurus_coin.json"
        
        [ -d "$(dirname "$fe_dest")" ] && cp "$idl_src" "$fe_dest" && ok "IDL copied to frontend"
        [ -d "$(dirname "$be_dest")" ] && cp "$idl_src" "$be_dest" && ok "IDL copied to backend"
    else
        warn "IDL file not found at $idl_src — skipping copy."
    fi
}

# ---------- verify on-chain ----------
verify_deployment() {
    log "Verifying on-chain deployment..."
    
    if solana program show "$FUTURUS_COIN_PROGRAM_ID" --url "$RPC_URL" 2>/dev/null; then
        ok "Program verified on-chain at $FUTURUS_COIN_PROGRAM_ID"
    else
        warn "Could not verify program on-chain. It may still be confirming."
    fi
}

# ---------- main ----------
main() {
    local mode="${1:-devnet}"
    
    echo ""
    echo "============================================================"
    echo "  🪙 Futurus Coin (FUT) Smart Contract — Build & Deploy"
    echo "============================================================"
    echo ""
    
    check_tools
    
    if [ "$mode" = "build" ]; then
        build_program
        echo ""
        ok "Build-only mode complete."
        exit 0
    fi
    
    configure_network "$mode"
    get_wallet "$mode"
    build_program
    deploy_program
    verify_deployment
    
    echo ""
    echo "============================================================"
    echo "  ✅ Futurus Coin deployed to $CLUSTER"
    echo "  Program ID: $FUTURUS_COIN_PROGRAM_ID"
    echo "============================================================"
    echo ""
}

main "$@"
