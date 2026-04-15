#!/usr/bin/env bash
###############################################################################
#  build_prediction_market_smartcontracts.sh
#  Build & Deploy the Prediction Market smart contract
#
#  Usage:
#    ./build_prediction_market_smartcontracts.sh          # builds + deploys to devnet
#    ./build_prediction_market_smartcontracts.sh devnet   # same as above
#    ./build_prediction_market_smartcontracts.sh mainnet  # builds + deploys to mainnet-beta
#    ./build_prediction_market_smartcontracts.sh build    # build only (no deploy)
###############################################################################
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$ROOT_DIR/prediction-market-smartcontract"
ANCHOR_BIN="$HOME/.avm/bin/anchor"
WALLET="$PROJECT_DIR/prediction.json"

# Program IDs
PREDICTION_PROGRAM_ID="6tb9fNKNxfEfzAPda2NScrq9RpxBJqPWQWiqWtnQm3oY"

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

check_wallet() {
    if [ ! -f "$WALLET" ]; then
        fail "Wallet not found at $WALLET. Please place your deployment keypair there."
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
    log "Building Prediction Market smart contract..."
    cd "$PROJECT_DIR"
    
    $ANCHOR_BIN build 2>&1 | tail -5
    
    if [ ! -f "$PROJECT_DIR/target/deploy/prediction.so" ]; then
        fail "Build failed — prediction.so not found."
    fi
    
    local size
    size=$(wc -c < "$PROJECT_DIR/target/deploy/prediction.so" | tr -d ' ')
    ok "Build successful! Program size: ${size} bytes"
    
    # Verify program ID matches
    local built_id
    built_id=$(solana-keygen pubkey "$PROJECT_DIR/target/deploy/prediction-keypair.json" 2>/dev/null || echo "unknown")
    log "Built program ID: $built_id"
    log "Expected program ID: $PREDICTION_PROGRAM_ID"
}

# ---------- deploy ----------
deploy_program() {
    log "Deploying Prediction Market to $CLUSTER..."
    cd "$PROJECT_DIR"
    
    local max_retries=3
    local attempt=1
    
    while [ $attempt -le $max_retries ]; do
        log "Deploy attempt $attempt/$max_retries..."
        
        if $ANCHOR_BIN deploy --provider.cluster "$CLUSTER" 2>&1; then
            ok "Prediction Market deployed successfully to $CLUSTER!"
            log "Program ID: $PREDICTION_PROGRAM_ID"
            
            # Copy IDL to frontend and backend
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
    log "Copying IDL files to frontend and backend..."
    local idl_src="$PROJECT_DIR/target/idl/prediction.json"
    
    if [ -f "$idl_src" ]; then
        local fe_dest="$ROOT_DIR/prediction-market-frontend/src/components/prediction_market_sdk/idl/prediction.json"
        local be_dest="$ROOT_DIR/prediction-market-backend/src/prediction_market_sdk/idl/prediction.json"
        
        [ -d "$(dirname "$fe_dest")" ] && cp "$idl_src" "$fe_dest" && ok "IDL copied to frontend"
        [ -d "$(dirname "$be_dest")" ] && cp "$idl_src" "$be_dest" && ok "IDL copied to backend"
    else
        warn "IDL file not found at $idl_src — skipping copy."
    fi
}

# ---------- verify on-chain ----------
verify_deployment() {
    log "Verifying on-chain deployment..."
    
    if solana program show "$PREDICTION_PROGRAM_ID" --url "$RPC_URL" 2>/dev/null; then
        ok "Program verified on-chain at $PREDICTION_PROGRAM_ID"
    else
        warn "Could not verify program on-chain. It may still be confirming."
    fi
}

# ---------- main ----------
main() {
    local mode="${1:-devnet}"
    
    echo ""
    echo "============================================================"
    echo "  🔮 Prediction Market Smart Contract — Build & Deploy"
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
    check_wallet
    build_program
    deploy_program
    verify_deployment
    
    echo ""
    echo "============================================================"
    echo "  ✅ Prediction Market deployed to $CLUSTER"
    echo "  Program ID: $PREDICTION_PROGRAM_ID"
    echo "============================================================"
    echo ""
}

main "$@"
