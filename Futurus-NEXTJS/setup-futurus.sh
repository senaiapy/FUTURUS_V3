#!/bin/bash

###############################################################################
# Futurus - Development Setup Script
#
# This script initializes the Futurus development/production stack.
# Includes: Database setup, Asaas gateways, KYC forms, and all configurations
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/backend/backups"
COMPOSE_FILE="docker-compose.yml"
# Load database credentials from .env file if it exists
if [ -f ".env" ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi

# Container names (dynamic from NEXT_PUBLIC_APP_NAME)
APP_PREFIX="${NEXT_PUBLIC_APP_NAME:-futurus}"
CONTAINER_DB="${APP_PREFIX}-db"
CONTAINER_BACKEND="${APP_PREFIX}-backend"

# Database credentials (use env vars or defaults)
DB_USER="${DB_USERNAME:-futurusus}"
DB_PASS="${DB_PASSWORD:-Ra4YKew3ZrET82dR}"
DB_NAME="${DB_DATABASE:-futurusus}"

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to execute PostgreSQL commands
pg_exec() {
    docker exec -e PGPASSWORD=$DB_PASS "$CONTAINER_DB" psql -h localhost -U $DB_USER -d $DB_NAME -c "$1"
}

# 1. Ask for backup
echo -e "\n"
print_header "🚀 FUTURUS STACK SETUP"
echo -e "\n"
print_header "DATABASE BACKUP"
read -p "Do you want a backup of the database in backend/backups? (y/n): " do_backup
if [[ $do_backup =~ ^[Yy]$ ]]; then
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="futurus_backup_${TIMESTAMP}.sql"

    print_info "Creating backup: $BACKUP_FILE ..."
    if docker exec -e PGPASSWORD=$DB_PASS "$CONTAINER_DB" pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null; then
        print_success "Backup created at $BACKUP_DIR/$BACKUP_FILE"
    else
        print_warning "Failed to create backup. Maybe the container is not running? Skipping..."
    fi
fi

# 2. Ask for ports
echo -e "\n"
print_header "PORT CONFIGURATION"
read -p "Port for frontend [3000]: " FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-3000}

read -p "Port for backend [3001]: " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-3001}

read -p "Port for admin [3002]: " ADMIN_PORT
ADMIN_PORT=${ADMIN_PORT:-3002}

read -p "Port for database [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Export for sub-processes
export FRONTEND_PORT
export BACKEND_PORT
export ADMIN_PORT
export DB_PORT

# 3. Mode Selection
echo -e "\n"
print_header "DEPLOYMENT MODE"
read -p "Deploy in development or production mode? (dev/prod): " MODE
if [[ $MODE == "prod" ]]; then
    ENV_FILE=".env.production"
    ENV_IDENTIFIER="production"
else
    ENV_FILE=".env.development"
    ENV_IDENTIFIER="development"
fi

print_info "Configuring environment files for $ENV_IDENTIFIER mode..."

# Copy environment files if they exist
for dir in backend frontend admin; do
    if [ -f "$dir/$ENV_FILE" ]; then
        cp "$dir/$ENV_FILE" "$dir/.env"
        print_success "Copied $dir/$ENV_FILE to $dir/.env"
    elif [ -f "$dir/.env.example" ] && [ ! -f "$dir/.env" ]; then
        cp "$dir/.env.example" "$dir/.env"
        print_warning "$dir/$ENV_FILE not found, using .env.example"
    fi
done

# 4. Erase Data
echo -e "\n"
print_header "CLEANUP"
read -p "Do you want to erase all data in volumes? (y/n): " erase_data
if [[ $erase_data =~ ^[Yy]$ ]]; then
    print_warning "Stopping containers and removing volumes..."
    docker compose down -v 2>/dev/null || docker-compose down -v
    print_success "Data erased."
else
    print_info "Keeping existing data."
fi

# 5. Prisma 7 Configuration Check
echo -e "\n"
print_header "PRISMA 7 CONFIGURATION"
if [ -f "backend/prisma.config.ts" ]; then
    print_success "Prisma 7 engine configuration found (backend/prisma.config.ts)"
else
    print_warning "Prisma 7 configuration (backend/prisma.config.ts) is missing. Creating default..."
    cat > backend/prisma.config.ts <<EOF
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
EOF
    print_success "Prisma 7 configuration created."
fi

# 6. Build and Deploy
echo -e "\n"
print_header "BUILD & DEPLOY"
print_info "Building all services without cache..."

docker compose build --no-cache 2>/dev/null || docker-compose build --no-cache
docker compose up -d 2>/dev/null || docker-compose up -d

print_info "Waiting for database to be ready..."
sleep 10

# Check if backend container is running
print_step "Checking if backend container is running..."
BACKEND_RUNNING=$(docker ps --filter "name=$CONTAINER_BACKEND" --filter "status=running" -q)
if [ -z "$BACKEND_RUNNING" ]; then
    print_error "Backend container is not running!"
    echo -e "${YELLOW}Container status:${NC}"
    docker ps -a --filter "name=$CONTAINER_BACKEND"
    echo -e "\n${YELLOW}Backend logs:${NC}"
    docker logs "$CONTAINER_BACKEND" --tail 50
    exit 1
fi
print_success "Backend container is running (ID: $BACKEND_RUNNING)"

# Wait for backend to be fully ready (check if Node.js process is up)
print_info "Waiting for backend service to be fully ready..."
for i in {1..30}; do
    if docker exec "$CONTAINER_BACKEND" pgrep -f "node" > /dev/null 2>&1; then
        print_success "Backend service is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend service failed to start after 30 seconds"
        echo -e "\n${YELLOW}Backend logs:${NC}"
        docker logs "$CONTAINER_BACKEND" --tail 50
        exit 1
    fi
    sleep 1
    echo -n "."
done
echo ""

print_step "Running Prisma Migrations..."
if [[ $MODE == "prod" ]]; then
    docker exec -t "$CONTAINER_BACKEND" npx prisma migrate deploy
else
    if [[ $erase_data =~ ^[Yy]$ ]]; then
        print_info "Resetting database to ensure clean state..."
        docker exec -t "$CONTAINER_BACKEND" npx prisma db push --force-reset
    else
        docker exec -t "$CONTAINER_BACKEND" npx prisma db push --accept-data-loss
    fi
fi

print_step "Generating Prisma Client..."
docker exec -t "$CONTAINER_BACKEND" npx prisma generate

print_step "Seeding database..."
docker exec -t "$CONTAINER_BACKEND" npx prisma db seed 2>/dev/null || true

# 7. 2FA and Security Environment Variables
echo -e "\n"
print_header "SECURITY & 2FA CONFIGURATION"

# Set default 2FA issuer if not present in backend/.env
if ! grep -q "OTP_ISSUER" backend/.env; then
    echo "OTP_ISSUER=\"Futurus Brasil\"" >> backend/.env
    print_success "Added OTP_ISSUER to backend/.env"
fi

# 8. Database Configuration and Localization
echo -e "\n"
print_header "DATABASE CONFIGURATION"

# Configure Brazilian Portuguese
print_step "🌍 Configuring Brazilian Portuguese language..."
pg_exec "
INSERT INTO \"Language\" (name, code, \"isDefault\", \"createdAt\", \"updatedAt\")
VALUES ('Portuguese', 'pt_br', 1, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET \"isDefault\" = 1;

UPDATE \"Language\" SET \"isDefault\" = 0 WHERE code != 'pt_br';
"

# Add referral_code column if not exists
print_step "🔗 Ensuring referral_code column exists in User table..."
pg_exec "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'referralCode') THEN
        ALTER TABLE \"User\" ADD COLUMN \"referralCode\" VARCHAR(40) UNIQUE;
    END IF;
END
\$\$;

UPDATE \"User\" SET \"referralCode\" = UPPER(SUBSTRING(username, 1, 6)) || LPAD(id::text, 4, '0') WHERE \"referralCode\" IS NULL;
"

# Add CPF column if not exists (required for Asaas PIX)
print_step "🆔 Ensuring CPF column exists in User table..."
pg_exec "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'cpf') THEN
        ALTER TABLE \"User\" ADD COLUMN cpf VARCHAR(20);
    END IF;
END
\$\$;
"

# Add member_chosen_outcome column for group syndicates
print_step "🎯 Ensuring member_chosen_outcome column exists in group_members table..."
pg_exec "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'group_members' AND column_name = 'member_chosen_outcome') THEN
        ALTER TABLE group_members ADD COLUMN member_chosen_outcome VARCHAR(10);
    END IF;
END
\$\$;
"

# Add 2FA columns if not exists (in case migrations were skipped)
print_step "🔐 Ensuring 2FA columns exist in User and Admin tables..."
pg_exec "
DO \$\$
BEGIN
    -- User table 2FA columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'ts') THEN
        ALTER TABLE \"User\" ADD COLUMN ts INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'tv') THEN
        ALTER TABLE \"User\" ADD COLUMN tv INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'tsc') THEN
        ALTER TABLE \"User\" ADD COLUMN tsc VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'twoFactorRecoveryCodes') THEN
        ALTER TABLE \"User\" ADD COLUMN \"twoFactorRecoveryCodes\" TEXT;
    END IF;

    -- Admin table 2FA columns (ensure they exist even if migration failed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Admin' AND column_name = 'ts') THEN
        ALTER TABLE \"Admin\" ADD COLUMN ts INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Admin' AND column_name = 'tv') THEN
        ALTER TABLE \"Admin\" ADD COLUMN tv INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Admin' AND column_name = 'tsc') THEN
        ALTER TABLE \"Admin\" ADD COLUMN tsc VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Admin' AND column_name = 'twoFactorRecoveryCodes') THEN
        ALTER TABLE \"Admin\" ADD COLUMN \"twoFactorRecoveryCodes\" TEXT;
    END IF;
END
\$\$;
"

# 9. Register Asaas Payment Gateways
echo -e "\n"
print_header "PAYMENT GATEWAYS"

print_step "💳 Registering Asaas PIX Gateway (code: 127)..."
pg_exec "
INSERT INTO \"Gateway\" (code, name, alias, status, \"gatewayParameters\", \"supportedCurrencies\", crypto, description, \"createdAt\", \"updatedAt\")
VALUES (
    127,
    'Asaas PIX',
    'AsaasPix',
    1,
    '{\"api_key\":{\"title\":\"API Key\",\"global\":true,\"value\":\"\"},\"mode\":{\"title\":\"Mode\",\"global\":true,\"value\":\"sandbox\"}}',
    '{\"BRL\":\"BRL\"}',
    0,
    'Asaas PIX Payment Gateway - Instant payments via PIX',
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    alias = EXCLUDED.alias,
    status = EXCLUDED.status,
    \"updatedAt\" = NOW();
"

pg_exec "
INSERT INTO \"GatewayCurrency\" (name, currency, symbol, \"methodCode\", \"gatewayAlias\", \"minAmount\", \"maxAmount\", \"percentCharge\", \"fixedCharge\", rate, \"gatewayParameter\", \"createdAt\", \"updatedAt\")
VALUES (
    'Asaas PIX',
    'BRL',
    'R\$',
    127,
    'AsaasPix',
    1.00,
    100000.00,
    1.50,
    0.00,
    1.00,
    '{\"api_key\":\"\", \"mode\":\"sandbox\"}',
    NOW(),
    NOW()
)
ON CONFLICT (\"methodCode\") DO UPDATE SET
    name = EXCLUDED.name,
    \"minAmount\" = EXCLUDED.\"minAmount\",
    \"maxAmount\" = EXCLUDED.\"maxAmount\",
    \"percentCharge\" = EXCLUDED.\"percentCharge\",
    \"updatedAt\" = NOW();
"

print_step "💳 Registering Asaas Credit Card Gateway (code: 128)..."
pg_exec "
INSERT INTO \"Gateway\" (code, name, alias, status, \"gatewayParameters\", \"supportedCurrencies\", crypto, description, \"createdAt\", \"updatedAt\")
VALUES (
    128,
    'Asaas Credit Card',
    'AsaasCard',
    1,
    '{\"api_key\":{\"title\":\"API Key\",\"global\":true,\"value\":\"\"},\"mode\":{\"title\":\"Mode\",\"global\":true,\"value\":\"sandbox\"}}',
    '{\"BRL\":\"BRL\"}',
    0,
    'Pay with Credit or Debit Card via Asaas - Supports installments',
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    alias = EXCLUDED.alias,
    status = EXCLUDED.status,
    \"updatedAt\" = NOW();
"

pg_exec "
INSERT INTO \"GatewayCurrency\" (name, currency, symbol, \"methodCode\", \"gatewayAlias\", \"minAmount\", \"maxAmount\", \"percentCharge\", \"fixedCharge\", rate, \"gatewayParameter\", \"createdAt\", \"updatedAt\")
VALUES (
    'Asaas Credit Card - BRL',
    'BRL',
    'R\$',
    128,
    'AsaasCard',
    10.00,
    50000.00,
    3.99,
    0.49,
    1.00,
    '{\"api_key\":\"\", \"mode\":\"sandbox\"}',
    NOW(),
    NOW()
)
ON CONFLICT (\"methodCode\") DO UPDATE SET
    name = EXCLUDED.name,
    \"minAmount\" = EXCLUDED.\"minAmount\",
    \"maxAmount\" = EXCLUDED.\"maxAmount\",
    \"percentCharge\" = EXCLUDED.\"percentCharge\",
    \"fixedCharge\" = EXCLUDED.\"fixedCharge\",
    \"updatedAt\" = NOW();
"

# 8. Register Withdraw Methods
echo -e "\n"
print_header "WITHDRAW METHODS"

print_step "💸 Registering PIX Withdraw Method..."
pg_exec "
INSERT INTO \"WithdrawMethod\" (id, name, \"minLimit\", \"maxLimit\", \"fixedCharge\", \"percentCharge\", rate, currency, description, status, \"createdAt\", \"updatedAt\")
VALUES (
    1,
    'PIX Withdraw',
    10.00,
    50000.00,
    0.00,
    1.00,
    1.00,
    'BRL',
    'Withdraw via PIX using Asaas. Fast and secure transfers to any PIX key (CPF, CNPJ, Email, Phone, or Random Key).',
    1,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    \"minLimit\" = EXCLUDED.\"minLimit\",
    \"maxLimit\" = EXCLUDED.\"maxLimit\",
    \"percentCharge\" = EXCLUDED.\"percentCharge\",
    status = EXCLUDED.status,
    \"updatedAt\" = NOW();
"

print_step "💸 Registering Bank Transfer Withdraw Method..."
pg_exec "
INSERT INTO \"WithdrawMethod\" (id, name, \"minLimit\", \"maxLimit\", \"fixedCharge\", \"percentCharge\", rate, currency, description, status, \"createdAt\", \"updatedAt\")
VALUES (
    2,
    'Bank Transfer',
    10.00,
    50000.00,
    0.00,
    1.50,
    1.00,
    'BRL',
    'Withdraw via bank transfer using Asaas. TED/DOC transfer to any bank account in Brazil.',
    1,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    \"minLimit\" = EXCLUDED.\"minLimit\",
    \"maxLimit\" = EXCLUDED.\"maxLimit\",
    \"percentCharge\" = EXCLUDED.\"percentCharge\",
    status = EXCLUDED.status,
    \"updatedAt\" = NOW();
"

# 9. Create KYC Form
echo -e "\n"
print_header "KYC CONFIGURATION"

print_step "📋 Creating KYC verification form..."
pg_exec "
INSERT INTO \"Form\" (act, \"formData\", \"createdAt\", \"updatedAt\")
VALUES (
    'kyc',
    '{
        \"document_type\": {
            \"name\": \"Tipo de Documento\",
            \"label\": \"document_type\",
            \"is_required\": \"required\",
            \"instruction\": \"Selecione o tipo de documento\",
            \"extensions\": \"\",
            \"options\": [\"Passaporte\", \"RG\", \"CNH\"],
            \"type\": \"select\",
            \"width\": \"12\"
        },
        \"document_front\": {
            \"name\": \"Frente do Documento\",
            \"label\": \"document_front\",
            \"is_required\": \"required\",
            \"instruction\": \"Envie uma foto clara da frente do seu documento\",
            \"extensions\": \"jpg,jpeg,png\",
            \"options\": [],
            \"type\": \"file\",
            \"width\": \"12\"
        },
        \"document_back\": {
            \"name\": \"Verso do Documento\",
            \"label\": \"document_back\",
            \"is_required\": \"required\",
            \"instruction\": \"Envie uma foto clara do verso do seu documento\",
            \"extensions\": \"jpg,jpeg,png\",
            \"options\": [],
            \"type\": \"file\",
            \"width\": \"12\"
        },
        \"selfie\": {
            \"name\": \"Selfie com Documento\",
            \"label\": \"selfie\",
            \"is_required\": \"required\",
            \"instruction\": \"Envie uma selfie segurando seu documento\",
            \"extensions\": \"jpg,jpeg,png\",
            \"options\": [],
            \"type\": \"file\",
            \"width\": \"12\"
        },
        \"cpf\": {
            \"name\": \"CPF\",
            \"label\": \"cpf\",
            \"is_required\": \"required\",
            \"instruction\": \"Digite seu CPF (apenas números)\",
            \"extensions\": \"\",
            \"options\": [],
            \"type\": \"text\",
            \"width\": \"12\"
        }
    }',
    NOW(),
    NOW()
)
ON CONFLICT (act) DO UPDATE SET
    \"formData\" = EXCLUDED.\"formData\",
    \"updatedAt\" = NOW();
"

# 10. General Settings
echo -e "\n"
print_header "GENERAL SETTINGS"

print_step "⚙️ Configuring general settings..."
pg_exec "
INSERT INTO \"GeneralSetting\" (id, \"siteName\", \"logoUrl\", \"contactEmail\", \"contactPhone\", \"contactAddress\", \"curText\", \"curSym\", \"kycVerification\", \"registration\", \"createdAt\", \"updatedAt\")
VALUES (
    1,
    'Futurus Brasil',
    NULL,
    'contato@futurus-brasil.com',
    '+55 11 99500-1234',
    'Av. Paulista 3500 CJ.124, São Paulo - SP',
    'BRL',
    'R\$',
    1,
    1,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    \"siteName\" = COALESCE(NULLIF(\"GeneralSetting\".\"siteName\", ''), EXCLUDED.\"siteName\"),
    \"contactEmail\" = COALESCE(\"GeneralSetting\".\"contactEmail\", EXCLUDED.\"contactEmail\"),
    \"contactPhone\" = COALESCE(\"GeneralSetting\".\"contactPhone\", EXCLUDED.\"contactPhone\"),
    \"contactAddress\" = COALESCE(\"GeneralSetting\".\"contactAddress\", EXCLUDED.\"contactAddress\"),
    \"curText\" = EXCLUDED.\"curText\",
    \"curSym\" = EXCLUDED.\"curSym\",
    \"kycVerification\" = EXCLUDED.\"kycVerification\",
    \"updatedAt\" = NOW();
"

# 11. Create required directories
echo -e "\n"
print_header "FILE SYSTEM"

print_step "📁 Creating required directories..."
docker exec "$CONTAINER_BACKEND" mkdir -p /app/uploads/verify /app/uploads/support /app/uploads/documents /app/uploads/images /app/uploads/markets /app/uploads/blogs 2>/dev/null || true
print_success "Upload directories created (verify, support, documents, images, markets, blogs)."

# 12. Restore Backup
echo -e "\n"
print_header "DATABASE RESTORE"
read -p "Do you want to restore a database backup? (y/n): " restore_db
if [[ $restore_db =~ ^[Yy]$ ]]; then
    BACKUPS=($(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null))
    if [ ${#BACKUPS[@]} -eq 0 ]; then
        print_warning "No backups found in $BACKUP_DIR"
    else
        print_info "Available backups:"
        for i in "${!BACKUPS[@]}"; do
            echo "$((i+1))) $(basename "${BACKUPS[$i]}")"
        done
        read -p "Select backup number: " backup_num
        if [[ $backup_num -gt 0 && $backup_num -le ${#BACKUPS[@]} ]]; then
            SELECTED_BACKUP="${BACKUPS[$((backup_num-1))]}"
            print_info "Restoring $SELECTED_BACKUP ..."

            # Terminate active connections to allow dropping schema
            print_info "Closing active database connections..."
            docker exec -i -e PGPASSWORD=$DB_PASS "$CONTAINER_DB" psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1

            # To avoid "already exists" errors, we drop and recreate the public schema
            docker exec -i -e PGPASSWORD=$DB_PASS "$CONTAINER_DB" psql -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

            cat "$SELECTED_BACKUP" | docker exec -i -e PGPASSWORD=$DB_PASS "$CONTAINER_DB" psql -U $DB_USER -d $DB_NAME
            print_success "Database restored successfully."
        else
            print_warning "Invalid selection. Skipping restore."
        fi
    fi
fi

# 13. Fix Database Sequences
echo -e "\n"
print_header "DATABASE SEQUENCES"

print_step "🔄 Synchronizing database sequences with current data..."
pg_exec "
-- Fix all primary key sequences to match current max IDs
-- This prevents 'unique constraint failed on id' errors after backup restores

-- Core tables
SELECT setval('\"User_id_seq\"', COALESCE((SELECT MAX(id) FROM \"User\"), 1));
SELECT setval('\"Market_id_seq\"', COALESCE((SELECT MAX(id) FROM \"Market\"), 1));
SELECT setval('\"MarketOption_id_seq\"', COALESCE((SELECT MAX(id) FROM \"MarketOption\"), 1));
SELECT setval('\"Category_id_seq\"', COALESCE((SELECT MAX(id) FROM \"Category\"), 1));
SELECT setval('\"Subcategory_id_seq\"', COALESCE((SELECT MAX(id) FROM \"Subcategory\"), 1));
SELECT setval('\"Purchase_id_seq\"', COALESCE((SELECT MAX(id) FROM \"Purchase\"), 1));

-- Groups tables
SELECT setval('groups_id_seq', COALESCE((SELECT MAX(id) FROM groups), 1));
SELECT setval('group_members_id_seq', COALESCE((SELECT MAX(id) FROM group_members), 1));
SELECT setval('group_transactions_id_seq', COALESCE((SELECT MAX(id) FROM group_transactions), 1));
SELECT setval('group_invitations_id_seq', COALESCE((SELECT MAX(id) FROM group_invitations), 1));
SELECT setval('group_orders_id_seq', COALESCE((SELECT MAX(id) FROM group_orders), 1));
SELECT setval('group_votes_id_seq', COALESCE((SELECT MAX(id) FROM group_votes), 1));

-- Notifications
SELECT setval('\"NotificationLog_id_seq\"', COALESCE((SELECT MAX(id) FROM \"NotificationLog\"), 1));
SELECT setval('\"AdminNotification_id_seq\"', COALESCE((SELECT MAX(id) FROM \"AdminNotification\"), 1));

-- Financial tables
SELECT setval('\"Deposit_id_seq\"', COALESCE((SELECT MAX(id) FROM \"Deposit\"), 1));
SELECT setval('\"Withdrawal_id_seq\"', COALESCE((SELECT MAX(id) FROM \"Withdrawal\"), 1));
SELECT setval('\"Transaction_id_seq\"', COALESCE((SELECT MAX(id) FROM \"Transaction\"), 1));

-- Other tables
SELECT setval('\"Comment_id_seq\"', COALESCE((SELECT MAX(id) FROM \"Comment\"), 1));
SELECT setval('\"SupportTicket_id_seq\"', COALESCE((SELECT MAX(id) FROM \"SupportTicket\"), 1));
SELECT setval('\"SupportMessage_id_seq\"', COALESCE((SELECT MAX(id) FROM \"SupportMessage\"), 1));
" 2>/dev/null || true
print_success "Database sequences synchronized."

# 14. Verify all services are running
echo -e "\n"
print_header "SERVICE STATUS"

# Check each container
for container in "$CONTAINER_DB" "$CONTAINER_BACKEND" "${APP_PREFIX}-frontend" "${APP_PREFIX}-admin"; do
    STATUS=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not found")
    if [[ "$STATUS" == "running" ]]; then
        print_success "$container is running ✓"
    else
        print_error "$container is NOT running ✗ (status: $STATUS)"
    fi
done

# 14. Summary
echo -e "\n"
print_header "✅ SETUP COMPLETED"
echo -e ""
echo -e "${CYAN}Services:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:${BACKEND_PORT}${NC}"
echo -e "  Admin:     ${GREEN}http://localhost:${ADMIN_PORT}${NC}"
echo -e "  Database:  ${GREEN}localhost:${DB_PORT}${NC}"
echo -e ""
echo -e "${CYAN}Mode:${NC} $ENV_IDENTIFIER"
echo -e ""
echo -e "${CYAN}Asaas Configuration:${NC}"
echo -e "  PIX Gateway:    Code 127 (configured)"
echo -e "  Card Gateway:   Code 128 (configured)"
echo -e "  PIX Withdraw:   Method ID 1 (configured)"
echo -e "  Bank Transfer:  Method ID 2 (configured)"
echo -e ""
echo -e "${CYAN}Webhook URL:${NC}"
echo -e "  Configure in Asaas Dashboard: ${YELLOW}http://your-domain/api/asaas/ipn${NC}"
echo -e ""
echo -e "${YELLOW}⚠️  Remember to configure your Asaas API keys in the Admin Panel:${NC}"
echo -e "   Admin > Gateways > Configure > Enter API Key"
echo -e ""
print_success "Futurus stack is up and running!"
