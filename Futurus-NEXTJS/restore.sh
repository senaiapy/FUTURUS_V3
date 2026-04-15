#!/bin/bash

# Load environment variables from root .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "❌ .env file not found in root directory!"
    exit 1
fi

# Configuration
BACKUP_DIR="backups"
CONTAINER_NAME="futurus-db"

# Check if backups directory exists and has files
if [ ! -d "${BACKUP_DIR}" ] || [ -z "$(ls -A "${BACKUP_DIR}")" ]; then
    echo "❌ No backups found in ${BACKUP_DIR}!"
    exit 1
fi

# If argument provided, use it as backup file
if [ ! -z "$1" ]; then
    BACKUP_FILE="$1"
    if [ ! -f "${BACKUP_FILE}" ]; then
        echo "❌ File ${BACKUP_FILE} not found!"
        exit 1
    fi
else
    # Otherwise, list backups and ask user to select
    echo "📂 Available backups:"
    select file in "${BACKUP_DIR}"/*.sql; do
        if [ -n "$file" ]; then
            BACKUP_FILE="$file"
            break
        else
            echo "Invalid selection."
        fi
    done
fi

echo "🚀 Restoring database from: ${BACKUP_FILE}..."

# Restore backup to the container
cat "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USERNAME}" "${DB_DATABASE}"

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi
