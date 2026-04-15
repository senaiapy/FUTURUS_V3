#!/bin/bash
###############################################################################
#  setup-dev.sh — Development mode setup (Solana Devnet)
#
#  Starts the prediction market stack connected to Solana Devnet.
#  Uses docker-compose.dev.yml (no local validator needed).
#
#  Usage:
#    ./setup-dev.sh          # Start all services
#    ./setup-dev.sh stop     # Stop all services
#    ./setup-dev.sh restart  # Restart all services
#    ./setup-dev.sh logs     # Show logs
#    ./setup-dev.sh status   # Show container status
###############################################################################
set -euo pipefail

COMPOSE_FILE="docker-compose.dev.yml"
PROJECT_NAME="prediction-market"

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

# ---------- env setup ----------
setup_env() {
    log "Setting up environment files..."

    # Root .env
    if [ ! -f .env ]; then
        cat <<EOT > .env
COMPOSE_PROJECT_NAME=prediction-market
DB_URL=mongodb://mongodb:27017/prediction-market
FUTANA_RPC_URL=https://api.devnet.solana.com
FUT_MINT=FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave
EOT
        ok "Created root .env"
    else
        ok "Root .env already exists"
    fi

    # Backend .env
    if [ ! -f prediction-market-backend/.env ]; then
        cat <<EOT > prediction-market-backend/.env
PORT=8080
DB_URL=mongodb://mongodb:27017/prediction-market
PASSKEY=dev-passkey
FUTANA_RPC_URL=https://api.devnet.solana.com
FUTANA_CLUSTER=devnet
FUT_MINT=FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave
NEXT_PUBLIC_API_URL=http://localhost:8082
EOT
        ok "Created backend .env"
    else
        ok "Backend .env already exists"
    fi

    # Frontend .env.local
    if [ ! -f prediction-market-frontend/.env.local ]; then
        cat <<EOT > prediction-market-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8082
NEXT_PUBLIC_FUTANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_FUT_MINT=FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave
EOT
        ok "Created frontend .env.local"
    else
        ok "Frontend .env.local already exists"
    fi
}

# ---------- wallet check ----------
check_wallet() {
    if [ -f prediction-market-backend/src/prediction.json ]; then
        ok "Backend wallet (prediction.json) found"
    else
        warn "Backend wallet (prediction.json) not found in backend/src/"
        warn "Please copy your deployment wallet there."
    fi

    # Copy to smart contract if needed
    if [ ! -f prediction-market-smartcontract/prediction.json ] && [ -f prediction-market-backend/src/prediction.json ]; then
        cp prediction-market-backend/src/prediction.json prediction-market-smartcontract/prediction.json
        ok "Copied prediction.json to smart contract directory"
    fi
}

# ---------- docker ----------
start_services() {
    log "Building and starting Docker containers (Devnet mode)..."
    docker compose -f "$COMPOSE_FILE" up -d --build

    log "Waiting for services to be ready..."
    sleep 10

    # Check backend health
    local retries=0
    while [ $retries -lt 10 ]; do
        if curl -s -m 2 http://localhost:8082/ > /dev/null 2>&1; then
            ok "Backend is ready"
            break
        fi
        retries=$((retries + 1))
        sleep 2
    done

    # Check frontend health
    retries=0
    while [ $retries -lt 10 ]; do
        if curl -s -m 2 http://localhost:3000/ > /dev/null 2>&1; then
            ok "Frontend is ready"
            break
        fi
        retries=$((retries + 1))
        sleep 2
    done
}

stop_services() {
    log "Stopping Docker containers..."
    docker compose -f "$COMPOSE_FILE" down
    ok "All services stopped"
}

show_logs() {
    docker compose -f "$COMPOSE_FILE" logs -f
}

show_status() {
    docker compose -f "$COMPOSE_FILE" ps
}

# ---------- main ----------
main() {
    local action="${1:-start}"

    echo ""
    echo "============================================================"
    echo "  🧪 Prediction Market — DEV MODE (Solana Devnet)"
    echo "============================================================"
    echo ""

    case "$action" in
        start)
            setup_env
            check_wallet
            start_services
            echo ""
            echo "============================================================"
            echo "  ✅ Dev environment is running!"
            echo "============================================================"
            echo "  🌐 Frontend:       http://localhost:3000"
            echo "  🖥️  Backend API:    http://localhost:8082"
            echo "  🔗 Solana Network:  Devnet (https://api.devnet.solana.com)"
            echo "  🗄️  MongoDB:        mongodb://localhost:27017"
            echo "  🪙 FUT Mint:        FHcFVMktPV8YgiKPHA5xnbzaEugQ8py7FYZrG8CXRave"
            echo "============================================================"
            echo "  📝 NEXT STEPS:"
            echo "  1. Configure Phantom wallet for Devnet (see WALLET_DEV.md)"
            echo "  2. Get Devnet FUT: solana airdrop 2 <your-address> --url devnet"
            echo "  3. Visit http://localhost:3000 and connect your wallet!"
            echo "============================================================"
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            start_services
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|logs|status}"
            exit 1
            ;;
    esac
}

main "$@"
