#!/bin/bash

set -euo pipefail

echo "Setting up Futurus Brasil Production Environment with Proxy..."

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
echo "Stopping any running containers..."
docker compose -f docker-compose.prod.yml -f docker-compose.proxy.yml stop 2>/dev/null || true

# Ask for container and volume cleanup
read -p "Do you want to delete existing containers and volumes? (y/N): " cleanup
if [[ ${cleanup:-N} =~ ^[Yy]$ ]]; then
    echo "Cleaning up containers and volumes..."
    docker compose -f docker-compose.prod.yml -f docker-compose.proxy.yml down -v
fi

# Check for .env file in core directory
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
else
    sed -i 's/APP_ENV=local/APP_ENV=production/g' core/.env
    sed -i 's/APP_DEBUG=true/APP_DEBUG=false/g' core/.env
    sed -i 's/DB_HOST=localhost/DB_HOST=db/g' core/.env
    sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_DATABASE}/g" core/.env
    sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USERNAME}/g" core/.env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/g" core/.env
    sed -i 's|APP_URL=.*|APP_URL=http://localhost:4444|g' core/.env
fi

# Build and start containers
echo "Building and starting Production Docker containers with Proxy..."
docker compose -f docker-compose.prod.yml -f docker-compose.proxy.yml build --no-cache
docker compose -f docker-compose.prod.yml -f docker-compose.proxy.yml up -d

# Wait for container to be ready
echo "Waiting for app container to be ready..."
sleep 10

# Wait for database
echo "Waiting for database to be ready..."
for i in {1..30}; do
    if docker exec futurus-db-prod mysql -u"${DB_USERNAME}" -p"${DB_PASSWORD}" -e "SELECT 1" &>/dev/null; then
        echo "Database is ready!"
        break
    fi
    sleep 2
done

# Optimize Laravel
echo "Optimizing Laravel for Production..."
docker exec futurus-app-prod php core/artisan config:cache
docker exec futurus-app-prod php core/artisan route:cache
docker exec futurus-app-prod php core/artisan view:cache

# Fix permissions
echo "Ensuring storage permissions..."
docker exec futurus-app-prod chown -R www-data:www-data core/storage core/bootstrap/cache

echo ""
echo "================================================"
echo "Production environment is up!"
echo "Access: http://localhost:4444"
echo "================================================"

# Prompt for database restore
read -p "Do you want to restore a database backup? (y/N): " restore
if [[ ${restore:-N} =~ ^[Yy]$ ]]; then
    ./restore.sh
fi
