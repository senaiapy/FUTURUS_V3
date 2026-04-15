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
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
CONTAINER_NAME="futurus-db"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "🚀 Starting database backup..."
echo "📂 Backup file: ${BACKUP_FILE}"

# Run pg_dump inside the container
docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USERNAME}" "${DB_DATABASE}" > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "📄 File size: $(du -sh "${BACKUP_FILE}" | cut -f1)"
else
    echo "❌ Backup failed!"
    exit 1
fi
