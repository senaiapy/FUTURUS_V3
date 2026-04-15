#!/bin/bash

echo "Setting up Futurus Brasil Local Environment (aaPanel)..."

# Ensure we are in the project root
cd "$(dirname "$0")"

# Check for required commands
command -v php >/dev/null 2>&1 || { echo "PHP is required but not installed. Aborting."; exit 1; }
command -v composer >/dev/null 2>&1 || { echo "Composer is required but not installed. Aborting."; exit 1; }
command -v mysql >/dev/null 2>&1 || { echo "MySQL client is required but not installed. Aborting."; exit 1; }

# Check PHP version
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo "Detected PHP version: $PHP_VERSION"

# Check for .env file in core directory
if [ ! -f core/.env ]; then
    echo "Creating core/.env from .env.example..."
    cp core/.env.example core/.env
fi

# Configure .env for local aaPanel environment
echo "Configuring core/.env for local aaPanel..."
sed -i 's/APP_ENV=production/APP_ENV=local/g' core/.env
sed -i 's/APP_DEBUG=false/APP_DEBUG=true/g' core/.env
sed -i 's/DB_HOST=db/DB_HOST=127.0.0.1/g' core/.env

# Install Composer dependencies
echo "Installing Composer dependencies..."
cd core
composer install --no-interaction --prefer-dist --optimize-autoloader
cd ..

# Generate APP_KEY if not set
if grep -q "APP_KEY=$" core/.env || ! grep -q "APP_KEY=" core/.env; then
    echo "Generating Laravel Application Key..."
    php core/artisan key:generate
fi

# Fix permissions for www-data (aaPanel uses www user)
echo "Fixing storage and temp permissions..."
mkdir -p core/storage core/temp
chown -R www:www core/storage core/bootstrap/cache core/temp 2>/dev/null || \
chown -R www-data:www-data core/storage core/bootstrap/cache core/temp 2>/dev/null || \
echo "Warning: Could not change ownership. You may need to run this as root."

chmod -R 775 core/storage core/bootstrap/cache core/temp

# Fix permissions for Gateway controllers and views
echo "Fixing Gateway and View permissions..."
find core/app/Http/Controllers/Gateway -type d -exec chmod 755 {} \;
find core/app/Http/Controllers/Gateway -type f -exec chmod 644 {} \;
find core/resources/views -type d -exec chmod 755 {} \;
find core/resources/views -type f -exec chmod 644 {} \;
chown -R www:www core/app/Http/Controllers/Gateway core/resources/views 2>/dev/null || \
chown -R www-data:www-data core/app/Http/Controllers/Gateway core/resources/views 2>/dev/null

# Clear and optimize Laravel
echo "Clearing Laravel cache..."
php core/artisan config:clear
php core/artisan cache:clear
php core/artisan route:clear
php core/artisan view:clear

# Database configuration
DB_HOST=$(grep "^DB_HOST=" core/.env | cut -d '=' -f2)
DB_USER=$(grep "^DB_USERNAME=" core/.env | cut -d '=' -f2)
DB_PASS=$(grep "^DB_PASSWORD=" core/.env | cut -d '=' -f2)
DB_NAME=$(grep "^DB_DATABASE=" core/.env | cut -d '=' -f2)

echo "Database: $DB_NAME @ $DB_HOST"

# Test database connection
echo "Testing database connection..."
if mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT 1" > /dev/null 2>&1; then
    echo "Database connection successful!"
else
    echo "Warning: Could not connect to database. Please check your .env configuration."
    echo "Skipping database setup..."
    DB_SKIP=1
fi

if [ -z "$DB_SKIP" ]; then
    # Database Localization & Fixes
    echo "Configuring Brazilian Portuguese and fixing typos..."
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
    INSERT INTO languages (name, code, is_default) VALUES ('Portuguese', 'pt_br', 1) ON DUPLICATE KEY UPDATE is_default = 1;
    UPDATE languages SET is_default = 0 WHERE code != 'pt_br';
    UPDATE frontends SET data_values = REPLACE(data_values, 'Mercaod', 'Mercado') WHERE data_values LIKE '%Mercaod%';
    UPDATE frontends SET data_values = JSON_SET(data_values, '\$.map_link', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.384109317227!2d-46.663754499999996!3d-23.5546443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce582c4835016b%3A0xc3ed2fd608723ebf!2sAv.%20Paulista%2C%203500%20-%20Bela%20Vista%2C%20S%C3%A3o+Paulo%20-%20SP%2C%2001310-300%2C%20Brasil!5e0!3m2!1spt-BR!2spy!4v1771556620888!5m2!1spt-BR!2spy') WHERE id = 27;
    "

    # Add referral_code column to users table if it doesn't exist
    echo "Ensuring referral_code column exists in users table..."
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
    SET @col_exists = (
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = '$DB_NAME'
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
    echo "Ensuring CPF column exists in users table..."
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
    SET @col_exists = (
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = '$DB_NAME'
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
    echo "Registering Asaas Payment Gateways..."
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
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
    echo "Registering Withdraw Methods..."
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
    -- Asaas PIX Withdraw
    INSERT IGNORE INTO withdraw_methods (id, name, min_limit, max_limit, fixed_charge, percent_charge, rate, currency, description, status, created_at, updated_at)
    VALUES (1, 'Asaas PIX', 10.00000000, 50000.00000000, 0.00000000, 1.00000000, 1.00000000, 'BRL', 'Withdraw via PIX using Asaas. Fast and secure transfers to any PIX key.', 1, NOW(), NOW());

    -- Asaas Bank Transfer Withdraw
    INSERT IGNORE INTO withdraw_methods (id, name, min_limit, max_limit, fixed_charge, percent_charge, rate, currency, description, status, created_at, updated_at)
    VALUES (2, 'Asaas Transfer', 10.00000000, 50000.00000000, 0.00000000, 1.50000000, 1.00000000, 'BRL', 'Withdraw via bank transfer using Asaas. Transfer to any bank account in Brazil.', 1, NOW(), NOW());
    "

    # Create KYC Form
    echo "Creating KYC Form..."
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "
    INSERT IGNORE INTO forms (act, form_data, created_at, updated_at)
    VALUES ('kyc', '{\"document_type\":{\"name\":\"Document Type\",\"label\":\"document_type\",\"is_required\":\"required\",\"instruction\":\"\",\"extensions\":\"\",\"options\":[\"Passport\",\"National ID\",\"Driver License\"],\"type\":\"select\",\"width\":\"12\"},\"document_front\":{\"name\":\"Document Front Side\",\"label\":\"document_front\",\"is_required\":\"required\",\"instruction\":\"Upload a clear photo of the front of your document\",\"extensions\":\"jpg,jpeg,png\",\"options\":[],\"type\":\"file\",\"width\":\"12\"},\"document_back\":{\"name\":\"Document Back Side\",\"label\":\"document_back\",\"is_required\":\"required\",\"instruction\":\"Upload a clear photo of the back of your document\",\"extensions\":\"jpg,jpeg,png\",\"options\":[],\"type\":\"file\",\"width\":\"12\"},\"selfie\":{\"name\":\"Selfie with Document\",\"label\":\"selfie\",\"is_required\":\"required\",\"instruction\":\"Upload a selfie holding your document\",\"extensions\":\"jpg,jpeg,png\",\"options\":[],\"type\":\"file\",\"width\":\"12\"}}', NOW(), NOW());
    "
fi

# Create required directories
echo "Creating required directories..."
mkdir -p core/assets/verify core/assets/support
chown -R www:www core/assets/verify core/assets/support 2>/dev/null || \
chown -R www-data:www-data core/assets/verify core/assets/support 2>/dev/null || \
chmod -R 775 core/assets/verify core/assets/support

# Create assets directories at root level too (for aaPanel compatibility)
mkdir -p assets/verify assets/support
chown -R www:www assets/verify assets/support 2>/dev/null || \
chown -R www-data:www-data assets/verify assets/support 2>/dev/null || \
chmod -R 775 assets/verify assets/support

# Run migrations if needed
echo "Running database migrations..."
php core/artisan migrate --force 2>/dev/null || echo "Migrations already up to date or skipped."

# Optimize for production-like performance (optional)
read -p "Optimize Laravel for production? (y/N): " optimize
if [[ $optimize =~ ^[Yy]$ ]]; then
    echo "Optimizing Laravel..."
    php core/artisan config:cache
    php core/artisan route:cache
    php core/artisan view:cache
fi

echo "Local environment setup complete!"
echo ""
echo "Notes:"
echo "  - Make sure your aaPanel site points to: $(pwd)/core/public"
echo "  - Ensure PHP 8.3 is selected for this site in aaPanel"
echo "  - Database: $DB_NAME @ $DB_HOST"
echo ""

# Prompt for database restore
read -p "Do you want to restore a database backup? (y/N): " restore
if [[ $restore =~ ^[Yy]$ ]]; then
    ./restore.sh
fi
