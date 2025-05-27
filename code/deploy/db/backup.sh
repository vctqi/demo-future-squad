#!/bin/bash

# Database backup script

# Exit on error
set -e

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
FILENAME="${BACKUP_DIR}/marketplace_${TIMESTAMP}.sql"
DB_CONTAINER="postgres"
DB_NAME="marketplace"
DB_USER="postgres"

# Ensure backup directory exists
mkdir -p ${BACKUP_DIR}

# Perform the backup
echo "Creating database backup: ${FILENAME}"
docker exec ${DB_CONTAINER} pg_dump -U ${DB_USER} -d ${DB_NAME} > ${FILENAME}

# Create compressed version
gzip -f ${FILENAME}
echo "Backup compressed: ${FILENAME}.gz"

# Delete backups older than 7 days
find ${BACKUP_DIR} -name "marketplace_*.sql.gz" -type f -mtime +7 -delete
echo "Old backups cleaned up"

echo "Backup completed successfully"