#!/bin/bash

echo "🚀 Setting up Futurus Brasil Development Environment..."

# Ensure we are in the project root
cd "$(dirname "$0")"

# Load environment variables from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  Warning: .env file not found, using defaults"
    DB_DATABASE="futurusus"
    DB_USERNAME="futurusus"
    DB_PASSWORD="password"
    DB_ROOT_PASSWORD="root"
fi

# Stopping existing containers
echo "🛑 Stopping any running containers..."
docker compose stop

# Ask for container and volume cleanup
read -p "🗑️  Do you want to delete existing containers and volumes? (y/N): " cleanup
if [[ $cleanup =~ ^[Yy]$ ]]; then
    echo "🧹 Cleaning up containers and volumes..."
    docker compose down -v
fi

# Check for .env file in core directory
if [ ! -f core/.env ]; then
    echo "📄 Creating core/.env from .env.example..."
    cp core/.env.example core/.env
fi

# Update .env for Docker environment
echo "⚙️  Configuring core/.env for Docker..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS sed
    sed -i '' 's/DB_HOST=localhost/DB_HOST=db/g' core/.env
    sed -i '' 's|APP_URL=.*|APP_URL=http://localhost:4444|g' core/.env
    sed -i '' 's/APP_ENV=production/APP_ENV=local/g' core/.env
    sed -i '' 's/APP_DEBUG=false/APP_DEBUG=true/g' core/.env
else
    # Linux sed
    sed -i 's/DB_HOST=localhost/DB_HOST=db/g' core/.env
    sed -i 's|APP_URL=.*|APP_URL=http://localhost:4444|g' core/.env
    sed -i 's/APP_ENV=production/APP_ENV=local/g' core/.env
    sed -i 's/APP_DEBUG=false/APP_DEBUG=true/g' core/.env
fi

# Build and start containers
echo "📦 Building and starting Docker containers (without cache)..."
docker compose build --no-cache && docker compose up -d --build

# Wait for container to be ready
echo "⏳ Waiting for app container to be ready..."
sleep 5

# Install dependencies
echo "📥 Installing Composer dependencies..."
docker exec futurus-app-dev composer install --working-dir=core

# Generate APP_KEY if not set
if grep -q "APP_KEY=$" core/.env || ! grep -q "APP_KEY=" core/.env; then
    echo "🔑 Generating Laravel Application Key..."
    docker exec futurus-app-dev php core/artisan key:generate
fi

# Fix permissions
echo "🔒 Fixing storage permissions..."
docker exec futurus-app-dev chown -R www-data:www-data core/storage core/bootstrap/cache

# Database Localization & Fixes
echo "🌍 Configuring Brazilian Portuguese and fixing typos..."
docker exec futurus-db-dev mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
INSERT INTO languages (name, code, is_default) VALUES ('Portuguese', 'pt_br', 1) ON DUPLICATE KEY UPDATE is_default = 1;
UPDATE languages SET is_default = 0 WHERE code != 'pt_br';
UPDATE frontends SET data_values = REPLACE(data_values, 'Mercaod', 'Mercado') WHERE data_values LIKE '%Mercaod%';
UPDATE frontends SET data_values = JSON_SET(data_values, '$.map_link', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.384109317227!2d-46.663754499999996!3d-23.5546443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce582c4835016b%3A0xc3ed2fd608723ebf!2sAv.%20Paulista%2C%203500%20-%20Bela%20Vista%2C%20S%C3%A3o+Paulo%20-%20SP%2C%2001310-300%2C%20Brasil!5e0!3m2!1spt-BR!2spy!4v1771556620888!5m2!1spt-BR!2spy') WHERE id = 27;
"

# Add referral_code column to users table if it doesn't exist
echo "🔗 Ensuring referral_code column exists in users table..."
docker exec futurus-db-dev mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'futurusus'
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
"

# Add CPF column to users table if it doesn't exist (required for Asaas PIX)
echo "🆔 Ensuring CPF column exists in users table..."
docker exec futurus-db-dev mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'futurusus'
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
"

# Register Asaas Gateways (PIX and Credit Card)
echo "💳 Registering Asaas Payment Gateways..."
docker exec futurus-db-dev mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
-- Asaas PIX Gateway
INSERT IGNORE INTO gateways (code, name, alias, image, status, gateway_parameters, supported_currencies, crypto, description, created_at, updated_at)
VALUES (127, 'Asaas PIX', 'Asaas', 'asaas_pix_logo.png', 1, '{\"api_key\":{\"title\":\"API Key\",\"global\":true,\"value\":\"\"},\"mode\":{\"title\":\"Mode\",\"global\":true,\"value\":\"sandbox\"}}', '{\"BRL\":\"BRL\"}', 0, 'Asaas PIX Payment Gateway', NOW(), NOW());

INSERT IGNORE INTO gateway_currencies (name, currency, symbol, method_code, gateway_alias, min_amount, max_amount, percent_charge, fixed_charge, rate, gateway_parameter, created_at, updated_at)
VALUES ('Asaas PIX', 'BRL', 'R\$', 127, 'Asaas', 1.00000000, 100000.00000000, 0.00, 0.00000000, 1.00000000, '{\"api_key\":\"\", \"mode\":\"sandbox\"}', NOW(), NOW());

-- Asaas Credit Card Gateway
INSERT IGNORE INTO gateways (code, name, alias, image, status, gateway_parameters, supported_currencies, crypto, description, created_at, updated_at)
VALUES (128, 'Asaas Credit Card', 'AsaasCard', NULL, 1, '{\"api_key\":{\"title\":\"API Key\",\"global\":true,\"value\":\"\"},\"mode\":{\"title\":\"Mode\",\"global\":true,\"value\":\"sandbox\"}}', '{\"BRL\":\"BRL\"}', 0, 'Pay with Credit or Debit Card via Asaas', NOW(), NOW());

INSERT IGNORE INTO gateway_currencies (name, currency, symbol, method_code, gateway_alias, min_amount, max_amount, percent_charge, fixed_charge, rate, gateway_parameter, created_at, updated_at)
VALUES ('Asaas Credit Card - BRL', 'BRL', 'R\$', 128, 'AsaasCard', 10.00000000, 50000.00000000, 3.99, 0.49000000, 1.00000000, '{\"api_key\":\"\", \"mode\":\"sandbox\"}', NOW(), NOW());
"

# Register Withdraw Methods
echo "💸 Registering Withdraw Methods..."
docker exec futurus-db-dev mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
-- Asaas PIX Withdraw
INSERT IGNORE INTO withdraw_methods (id, name, min_limit, max_limit, fixed_charge, percent_charge, rate, currency, description, status, created_at, updated_at)
VALUES (1, 'Asaas PIX', 10.00000000, 50000.00000000, 0.00000000, 1.00000000, 1.00000000, 'BRL', 'Withdraw via PIX using Asaas. Fast and secure transfers to any PIX key.', 1, NOW(), NOW());

-- Asaas Bank Transfer Withdraw
INSERT IGNORE INTO withdraw_methods (id, name, min_limit, max_limit, fixed_charge, percent_charge, rate, currency, description, status, created_at, updated_at)
VALUES (2, 'Asaas Transfer', 10.00000000, 50000.00000000, 0.00000000, 1.50000000, 1.00000000, 'BRL', 'Withdraw via bank transfer using Asaas. Transfer to any bank account in Brazil.', 1, NOW(), NOW());
"

# Create KYC Form
echo "📋 Creating KYC Form..."
docker exec futurus-db-dev mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
INSERT IGNORE INTO forms (act, form_data, created_at, updated_at)
VALUES ('kyc', '{\"document_type\":{\"name\":\"Document Type\",\"label\":\"document_type\",\"is_required\":\"required\",\"instruction\":\"\",\"extensions\":\"\",\"options\":[\"Passport\",\"National ID\",\"Driver License\"],\"type\":\"select\",\"width\":\"12\"},\"document_front\":{\"name\":\"Document Front Side\",\"label\":\"document_front\",\"is_required\":\"required\",\"instruction\":\"Upload a clear photo of the front of your document\",\"extensions\":\"jpg,jpeg,png\",\"options\":[],\"type\":\"file\",\"width\":\"12\"},\"document_back\":{\"name\":\"Document Back Side\",\"label\":\"document_back\",\"is_required\":\"required\",\"instruction\":\"Upload a clear photo of the back of your document\",\"extensions\":\"jpg,jpeg,png\",\"options\":[],\"type\":\"file\",\"width\":\"12\"},\"selfie\":{\"name\":\"Selfie with Document\",\"label\":\"selfie\",\"is_required\":\"required\",\"instruction\":\"Upload a selfie holding your document\",\"extensions\":\"jpg,jpeg,png\",\"options\":[],\"type\":\"file\",\"width\":\"12\"}}', NOW(), NOW());
"

# Create required directories
echo "📁 Creating required directories..."
docker exec futurus-app-dev mkdir -p core/assets/verify core/assets/support
docker exec futurus-app-dev chown -R www-data:www-data core/assets/verify core/assets/support

# Reset Admin Password (admin/admin123)
echo "🔐 Setting admin password..."
ADMIN_HASH='$2y$10$vS3jeL6zq1ed99jVKFmq5uSy4T/GVEub.zqu0O0fzxlJNyIz0RY7q'
docker exec futurus-db-dev mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" "${DB_DATABASE}" -e "
UPDATE admins SET password = '${ADMIN_HASH}' WHERE username = 'admin';
"

# Clear Cache
echo "🧹 Clearing Laravel cache..."
docker exec futurus-app-dev php core/artisan config:clear
docker exec futurus-app-dev php core/artisan cache:clear

echo "✅ Environment is up! Access it at http://localhost:4444"
echo "🔑 Admin Login: http://localhost:4444/admin (admin / admin123)"
echo "📝 Database is running on localhost:3307"

# Prompt for database restore
read -p "🔄 Do you want to restore a database backup? (y/N): " restore
if [[ $restore =~ ^[Yy]$ ]]; then
    ./restore.sh
fi
