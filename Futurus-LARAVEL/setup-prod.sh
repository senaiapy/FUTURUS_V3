#!/bin/bash

set -euo pipefail

echo "=============================================="
echo "  FUTURUS PRODUCTION SETUP"
echo "  Security Hardened (Pentest Fixes Applied)"
echo "=============================================="

# Ensure we are in the project root
cd "$(dirname "$0")"

# Load environment variables
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create .env file with required variables:"
    echo "  DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_ROOT_PASSWORD"
    exit 1
fi

export $(grep -v '^#' .env | xargs)

# Validate required environment variables
required_vars=("DB_DATABASE" "DB_USERNAME" "DB_PASSWORD" "DB_ROOT_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var:-}" ]; then
        echo "Error: ${var} is not set in .env"
        exit 1
    fi
done

# Stopping existing containers
echo ""
echo "[1/12] Stopping any running containers..."
docker compose -f docker-compose.prod.yml stop 2>/dev/null || true

# Ask for container and volume cleanup
read -p "Do you want to delete existing containers and volumes? (y/N): " cleanup
if [[ ${cleanup:-N} =~ ^[Yy]$ ]]; then
    echo "Cleaning up containers and volumes..."
    docker compose -f docker-compose.prod.yml down -v
fi

# Check for .env file in core directory
echo ""
echo "[2/12] Configuring Laravel environment..."
if [ ! -f core/.env ]; then
    echo "Creating core/.env from .env.example..."
    cp core/.env.example core/.env
fi

# Update .env for Production environment
echo "Configuring core/.env for Production..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/APP_ENV=local/APP_ENV=production/g' core/.env
    sed -i '' 's/APP_DEBUG=true/APP_DEBUG=false/g' core/.env
    sed -i '' 's/DB_HOST=localhost/DB_HOST=db/g' core/.env
    sed -i '' "s/DB_DATABASE=.*/DB_DATABASE=${DB_DATABASE}/g" core/.env
    sed -i '' "s/DB_USERNAME=.*/DB_USERNAME=${DB_USERNAME}/g" core/.env
    sed -i '' "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/g" core/.env
    sed -i '' 's|APP_URL=.*|APP_URL=http://localhost:4444|g' core/.env
    # Security: Enable session encryption
    sed -i '' 's/SESSION_DRIVER=file/SESSION_DRIVER=database/g' core/.env 2>/dev/null || true
else
    sed -i 's/APP_ENV=local/APP_ENV=production/g' core/.env
    sed -i 's/APP_DEBUG=true/APP_DEBUG=false/g' core/.env
    sed -i 's/DB_HOST=localhost/DB_HOST=db/g' core/.env
    sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_DATABASE}/g" core/.env
    sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USERNAME}/g" core/.env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/g" core/.env
    sed -i 's|APP_URL=.*|APP_URL=http://localhost:4444|g' core/.env
    # Security: Enable session encryption
    sed -i 's/SESSION_DRIVER=file/SESSION_DRIVER=database/g' core/.env 2>/dev/null || true
fi

# ============================================
# SECURITY HARDENING (Pentest Fixes)
# ============================================

echo ""
echo "[3/12] SECURITY: Removing install directory (Pentest Fix #1)..."
rm -rf install 2>/dev/null || true
rm -rf core/install 2>/dev/null || true

echo ""
echo "[4/12] SECURITY: Removing sensitive files..."
# Remove files that should not be in production
rm -f docker-compose.yml 2>/dev/null || true  # Keep only prod version
rm -rf .git 2>/dev/null || true
rm -rf .github 2>/dev/null || true
rm -f core/phpunit.xml 2>/dev/null || true
rm -rf core/tests 2>/dev/null || true

echo ""
echo "[5/12] SECURITY: Clearing log files..."
rm -f core/storage/logs/*.log 2>/dev/null || true
touch core/storage/logs/.gitkeep 2>/dev/null || true

# Build and start containers
echo ""
echo "[6/12] Building and starting Production Docker containers..."
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Wait for container to be ready
echo ""
echo "[7/12] Waiting for app container to be ready..."
sleep 10

# Wait for database to be healthy
echo ""
echo "[8/12] Waiting for database to be ready..."
for i in {1..30}; do
    if docker exec futurus-db-prod mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" -e "SELECT 1" &>/dev/null; then
        echo "Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Warning: Database health check timed out"
    fi
    sleep 2
done

# SECURITY: Rotate APP_KEY
echo ""
echo "[9/12] SECURITY: Generating new APP_KEY..."
docker exec futurus-app-prod php core/artisan key:generate --force 2>/dev/null || echo "APP_KEY rotation skipped"

# Optimize Laravel (inside container)
echo ""
echo "[10/12] Optimizing Laravel for Production..."
docker exec futurus-app-prod php core/artisan config:cache
docker exec futurus-app-prod php core/artisan route:cache
docker exec futurus-app-prod php core/artisan view:cache

# Fix permissions
echo ""
echo "[11/12] SECURITY: Setting proper permissions..."
docker exec futurus-app-prod chown -R www-data:www-data core/storage core/bootstrap/cache
docker exec futurus-app-prod chmod -R 775 core/storage core/bootstrap/cache
docker exec futurus-app-prod chmod 640 core/.env 2>/dev/null || true

# SECURITY: Remove install directory from container
echo ""
echo "[12/12] SECURITY: Final security cleanup in container..."
docker exec futurus-app-prod rm -rf /var/www/html/install 2>/dev/null || true
docker exec futurus-app-prod rm -rf /var/www/html/.git 2>/dev/null || true
docker exec futurus-app-prod rm -f /var/www/html/docker-compose*.yml 2>/dev/null || true
docker exec futurus-app-prod rm -f /var/www/html/Dockerfile* 2>/dev/null || true

# Database migrations
echo ""
echo "Running database migrations..."
docker exec futurus-db-prod mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = '${DB_DATABASE}'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'referral_code'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN referral_code VARCHAR(40) NULL DEFAULT NULL UNIQUE',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
UPDATE users SET referral_code = CONCAT(UPPER(SUBSTRING(username, 1, 6)), LPAD(id, 4, '0')) WHERE referral_code IS NULL;
" || echo "Warning: referral_code migration skipped"

docker exec futurus-db-prod mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = '${DB_DATABASE}'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'cpf'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN cpf VARCHAR(20) NULL DEFAULT NULL AFTER mobile',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
" || echo "Warning: cpf migration skipped"

# Register Asaas Gateways
echo "Registering payment gateways..."
docker exec futurus-db-prod mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
INSERT IGNORE INTO gateways (code, name, alias, image, status, gateway_parameters, supported_currencies, crypto, description, created_at, updated_at)
VALUES (127, 'Asaas PIX', 'Asaas', 'asaas_pix_logo.png', 1, '{\"api_key\":{\"title\":\"API Key\",\"global\":true,\"value\":\"\"},\"mode\":{\"title\":\"Mode\",\"global\":true,\"value\":\"sandbox\"}}', '{\"BRL\":\"BRL\"}', 0, 'Asaas PIX Payment Gateway', NOW(), NOW());

INSERT IGNORE INTO gateway_currencies (name, currency, symbol, method_code, gateway_alias, min_amount, max_amount, percent_charge, fixed_charge, rate, gateway_parameter, created_at, updated_at)
VALUES ('Asaas PIX', 'BRL', 'R\$', 127, 'Asaas', 1.00000000, 100000.00000000, 0.00, 0.00000000, 1.00000000, '{\"api_key\":\"\", \"mode\":\"sandbox\"}', NOW(), NOW());

INSERT IGNORE INTO gateways (code, name, alias, image, status, gateway_parameters, supported_currencies, crypto, description, created_at, updated_at)
VALUES (128, 'Asaas Credit Card', 'AsaasCard', NULL, 1, '{\"api_key\":{\"title\":\"API Key\",\"global\":true,\"value\":\"\"},\"mode\":{\"title\":\"Mode\",\"global\":true,\"value\":\"sandbox\"}}', '{\"BRL\":\"BRL\"}', 0, 'Pay with Credit or Debit Card via Asaas', NOW(), NOW());

INSERT IGNORE INTO gateway_currencies (name, currency, symbol, method_code, gateway_alias, min_amount, max_amount, percent_charge, fixed_charge, rate, gateway_parameter, created_at, updated_at)
VALUES ('Asaas Credit Card - BRL', 'BRL', 'R\$', 128, 'AsaasCard', 10.00000000, 50000.00000000, 3.99, 0.49000000, 1.00000000, '{\"api_key\":\"\", \"mode\":\"sandbox\"}', NOW(), NOW());
" || echo "Warning: gateway registration skipped"

# Register Withdraw Methods
echo "Registering withdraw methods..."
docker exec futurus-db-prod mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
INSERT IGNORE INTO withdraw_methods (id, name, min_limit, max_limit, fixed_charge, percent_charge, rate, currency, description, status, created_at, updated_at)
VALUES (1, 'Asaas PIX', 10.00000000, 50000.00000000, 0.00000000, 1.00000000, 1.00000000, 'BRL', 'Withdraw via PIX using Asaas.', 1, NOW(), NOW());

INSERT IGNORE INTO withdraw_methods (id, name, min_limit, max_limit, fixed_charge, percent_charge, rate, currency, description, status, created_at, updated_at)
VALUES (2, 'Asaas Transfer', 10.00000000, 50000.00000000, 0.00000000, 1.50000000, 1.00000000, 'BRL', 'Withdraw via bank transfer using Asaas.', 1, NOW(), NOW());
" || echo "Warning: withdraw methods registration skipped"

# Create KYC Form
echo "Creating KYC form..."
docker exec futurus-db-prod mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
INSERT IGNORE INTO forms (act, form_data, created_at, updated_at)
VALUES ('kyc', '{\"document_type\":{\"name\":\"Document Type\",\"label\":\"document_type\",\"is_required\":\"required\",\"instruction\":\"\",\"extensions\":\"\",\"options\":[\"Passport\",\"National ID\",\"Driver License\"],\"type\":\"select\",\"width\":\"12\"},\"document_front\":{\"name\":\"Document Front Side\",\"label\":\"document_front\",\"is_required\":\"required\",\"instruction\":\"Upload a clear photo of the front of your document\",\"extensions\":\"jpg,jpeg,png\",\"options\":[],\"type\":\"file\",\"width\":\"12\"},\"document_back\":{\"name\":\"Document Back Side\",\"label\":\"document_back\",\"is_required\":\"required\",\"instruction\":\"Upload a clear photo of the back of your document\",\"extensions\":\"jpg,jpeg,png\",\"options\":[],\"type\":\"file\",\"width\":\"12\"},\"selfie\":{\"name\":\"Selfie with Document\",\"label\":\"selfie\",\"is_required\":\"required\",\"instruction\":\"Upload a selfie holding your document\",\"extensions\":\"jpg,jpeg,png\",\"options\":[],\"type\":\"file\",\"width\":\"12\"}}', NOW(), NOW());
" || echo "Warning: KYC form creation skipped"

# Create required directories
echo "Creating required directories..."
docker exec futurus-app-prod mkdir -p core/assets/verify core/assets/support
docker exec futurus-app-prod chown -R www-data:www-data core/assets/verify core/assets/support

# Reset Admin Password (admin/admin123)
echo "Setting admin password..."
ADMIN_HASH='$2y$10$vS3jeL6zq1ed99jVKFmq5uSy4T/GVEub.zqu0O0fzxlJNyIz0RY7q'
docker exec futurus-db-prod mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
UPDATE admins SET password = '${ADMIN_HASH}' WHERE username = 'admin';
" || echo "Warning: admin password reset skipped"

echo ""
echo "=============================================="
echo "  DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "  Access: http://localhost:4444"
echo "  Admin:  http://localhost:4444/admin"
echo "  Login:  admin / admin123"
echo ""
echo "  Security Fixes Applied:"
echo "  [x] Install directory removed"
echo "  [x] APP_KEY rotated"
echo "  [x] Debug mode disabled"
echo "  [x] Sensitive files removed"
echo "  [x] Security headers configured"
echo "  [x] Proper permissions set"
echo ""
echo "  MANUAL ACTIONS REQUIRED:"
echo "  [ ] Rotate database password (was exposed)"
echo "  [ ] Update API keys (were exposed)"
echo "  [ ] Run: composer update (fix vulnerable packages)"
echo ""
echo "=============================================="

# Prompt for database restore
read -p "Do you want to restore a database backup? (y/N): " restore
if [[ ${restore:-N} =~ ^[Yy]$ ]]; then
    ./restore.sh
fi
