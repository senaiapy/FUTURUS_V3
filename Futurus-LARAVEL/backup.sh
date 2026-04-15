#!/bin/bash

set -euo pipefail

# Load environment variables from root .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found in root directory!"
    exit 1
fi

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"

# Auto-detect container name if not provided
if [ -n "${1:-}" ]; then
    CONTAINER_NAME="$1"
elif docker ps --format '{{.Names}}' | grep -q "^futurus-db-dev$"; then
    CONTAINER_NAME="futurus-db-dev"
elif docker ps --format '{{.Names}}' | grep -q "^futurus-db-prod$"; then
    CONTAINER_NAME="futurus-db-prod"
elif docker ps --format '{{.Names}}' | grep -q "^futurus-db$"; then
    CONTAINER_NAME="futurus-db"
else
    echo "Error: No database container found!"
    echo "Running containers:"
    docker ps --format '{{.Names}}' | grep -E "futurus|db" || echo "  (none)"
    echo ""
    echo "Usage: ./backup.sh [container_name]"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting database backup..."
echo "Backup file: ${BACKUP_FILE}"
echo "Container: ${CONTAINER_NAME}"

# Run mysqldump inside the container
docker exec "${CONTAINER_NAME}" /usr/bin/mysqldump \
    -u root \
    --password="${DB_ROOT_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    "${DB_DATABASE}" > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    # Compress backup
    gzip "${BACKUP_FILE}"
    echo "Backup completed successfully!"
    echo "File: ${BACKUP_FILE}.gz"
    echo "Size: $(du -sh "${BACKUP_FILE}.gz" | cut -f1)"
else
    echo "Backup failed!"
    exit 1
fi
