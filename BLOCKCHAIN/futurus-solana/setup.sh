#!/bin/bash
###############################################################################
#  setup.sh — Production mode setup (Solana Mainnet)
#
#  Starts the prediction market stack connected to Solana Mainnet-Beta.
#  Uses docker-compose.yml (production configuration).
#
#  ⚠️  IMPORTANT: Mainnet requires real FUT for transaction fees.
#
#  Usage:
#    ./setup.sh              # Start all services
#    ./setup.sh stop         # Stop all services
#    ./setup.sh restart      # Restart all services
#    ./setup.sh logs         # Show logs
#    ./setup.sh status       # Show container status
###############################################################################
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
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

# ---------- confirm production ----------
confirm_production() {
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️   WARNING: PRODUCTION MODE (Mainnet-Beta)           ║${NC}"
    echo -e "${RED}║                                                        ║${NC}"
    echo -e "${RED}║  This will connect to Solana Mainnet.                  ║${NC}"
    echo -e "${RED}║  Real FUT will be used for transaction fees.           ║${NC}"
    echo -e "${RED}║                                                        ║${NC}"
    echo -e "${RED}║  For development/testing, use: ./setup-dev.sh          ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    read -p "Are you sure you want to start in PRODUCTION mode? (yes/no): " answer
    if [ "$answer" != "yes" ]; then
        echo "Aborted. Use ./setup-dev.sh for development."
        exit 0
    fi
}

# ---------- env setup ----------
setup_env() {
    log "Setting up production environment files..."

    # Root .env
    if [ ! -f .env ]; then
        cat <<EOT > .env
COMPOSE_PROJECT_NAME=prediction-market
DB_URL=mongodb://mongodb:27017/prediction-market
FUTANA_RPC_URL=https://api.mainnet-beta.solana.com
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
PASSKEY=change-me-production-passkey
FUTANA_RPC_URL=https://api.mainnet-beta.solana.com
FUTANA_CLUSTER=mainnet-beta
FUT_MINT=CHANGE_ME_MAINNET_FUT_MINT_ADDRESS
NEXT_PUBLIC_API_URL=http://localhost:8082
EOT
        ok "Created backend .env"
        warn "Please update FUT_MINT in prediction-market-backend/.env with your Mainnet mint address"
    else
        ok "Backend .env already exists"
    fi

    # Frontend .env.local
    if [ ! -f prediction-market-frontend/.env.local ]; then
        cat <<EOT > prediction-market-frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8082
NEXT_PUBLIC_FUTANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_FUT_MINT=CHANGE_ME_MAINNET_FUT_MINT_ADDRESS
EOT
        ok "Created frontend .env.local"
        warn "Please update NEXT_PUBLIC_FUT_MINT in prediction-market-frontend/.env.local with your Mainnet mint address"
    else
        ok "Frontend .env.local already exists"
    fi
}

# ---------- wallet check ----------
check_wallet() {
    if [ -f prediction-market-backend/src/prediction.json ]; then
        ok "Backend wallet (prediction.json) found"

        # Check mainnet FUT balance
        if command -v solana &> /dev/null; then
            local pubkey
            pubkey=$(solana-keygen pubkey prediction-market-backend/src/prediction.json 2>/dev/null || echo "")
            if [ -n "$pubkey" ]; then
                log "Wallet public key: $pubkey"
                local balance
                balance=$(solana balance "$pubkey" --url mainnet-beta 2>/dev/null || echo "0")
                log "Mainnet FUT balance: $balance"
                if echo "$balance" | grep -q "^0 FUT$"; then
                    warn "Wallet has 0 FUT on Mainnet. You need FUT for transaction fees."
                fi
            fi
        fi
    else
        fail "Backend wallet (prediction.json) not found in backend/src/. Cannot start production."
    fi

    # Copy to smart contract if needed
    if [ ! -f prediction-market-smartcontract/prediction.json ] && [ -f prediction-market-backend/src/prediction.json ]; then
        cp prediction-market-backend/src/prediction.json prediction-market-smartcontract/prediction.json
        ok "Copied prediction.json to smart contract directory"
    fi
}

# ---------- docker ----------
start_services() {
    log "Building and starting Docker containers (Production mode)..."
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
    echo "  🚀 Prediction Market — PRODUCTION MODE (Solana Mainnet)"
    echo "============================================================"
    echo ""

    case "$action" in
        start)
            confirm_production
            setup_env
            check_wallet
            start_services
            echo ""
            echo "============================================================"
            echo "  ✅ Production environment is running!"
            echo "============================================================"
            echo "  🌐 Frontend:       http://localhost:3000"
            echo "  🖥️  Backend API:    http://localhost:8082"
            echo "  🔗 Solana Network:  Mainnet-Beta"
            echo "  🗄️  MongoDB:        mongodb://localhost:27017"
            echo "============================================================"
            echo "  ⚠️  PRODUCTION REMINDERS:"
            echo "  1. Ensure wallets have sufficient FUT for gas fees"
            echo "  2. Verify FUT_MINT address is correct for Mainnet"
            echo "  3. Update PASSKEY in backend .env (not dev-passkey)"
            echo "  4. Consider using a private RPC endpoint"
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
