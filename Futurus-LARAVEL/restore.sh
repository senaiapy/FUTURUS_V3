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

# Auto-detect container name
if docker ps --format '{{.Names}}' | grep -q "^futurus-db-dev$"; then
    CONTAINER_NAME="futurus-db-dev"
elif docker ps --format '{{.Names}}' | grep -q "^futurus-db-prod$"; then
    CONTAINER_NAME="futurus-db-prod"
elif docker ps --format '{{.Names}}' | grep -q "^futurus-db$"; then
    CONTAINER_NAME="futurus-db"
else
    echo "Error: No database container found!"
    echo "Running containers:"
    docker ps --format '{{.Names}}' | grep -E "futurus|db" || echo "  (none)"
    exit 1
fi

# Check if backups directory exists and has files
if [ ! -d "${BACKUP_DIR}" ] || [ -z "$(ls -A "${BACKUP_DIR}" 2>/dev/null)" ]; then
    echo "Error: No backups found in ${BACKUP_DIR}!"
    exit 1
fi

# If argument provided, use it as backup file
if [ ! -z "${1:-}" ]; then
    BACKUP_FILE="$1"
    if [ ! -f "${BACKUP_FILE}" ]; then
        echo "Error: File ${BACKUP_FILE} not found!"
        exit 1
    fi
else
    # Otherwise, list backups and ask user to select
    echo "Available backups:"
    select file in "${BACKUP_DIR}"/*.sql* ; do
        if [ -n "$file" ]; then
            BACKUP_FILE="$file"
            break
        else
            echo "Invalid selection."
        fi
    done
fi

echo "Restoring database from: ${BACKUP_FILE}..."
echo "Container: ${CONTAINER_NAME}"

# Check if file is gzipped
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" /usr/bin/mysql \
        -u root \
        --password="${DB_ROOT_PASSWORD}" \
        "${DB_DATABASE}"
else
    cat "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" /usr/bin/mysql \
        -u root \
        --password="${DB_ROOT_PASSWORD}" \
        "${DB_DATABASE}"
fi

if [ $? -eq 0 ]; then
    echo "Restore completed successfully!"
else
    echo "Restore failed!"
    exit 1
fi
