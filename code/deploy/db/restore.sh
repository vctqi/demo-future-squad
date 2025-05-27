#!/bin/bash

# Database restore script

# Exit on error
set -e

# Configuration
BACKUP_DIR="/backups"
DB_CONTAINER="postgres"
DB_NAME="marketplace"
DB_USER="postgres"

# Check if backup file is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 BACKUP_FILE"
    echo "Available backups:"
    ls -la ${BACKUP_DIR}
    exit 1
fi

BACKUP_FILE="$1"

# Check if the backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Backup file not found: ${BACKUP_FILE}"
    echo "Available backups:"
    ls -la ${BACKUP_DIR}
    exit 1
fi

# Extract if it's a compressed file
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo "Extracting backup file..."
    EXTRACTED_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "${BACKUP_FILE}" > "${EXTRACTED_FILE}"
    BACKUP_FILE="${EXTRACTED_FILE}"
fi

# Restore the database
echo "Restoring database from: ${BACKUP_FILE}"
echo "Warning: This will overwrite the current database!"
read -p "Are you sure you want to proceed? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Drop and recreate the database
    docker exec ${DB_CONTAINER} psql -U ${DB_USER} -c "DROP DATABASE IF EXISTS ${DB_NAME};"
    docker exec ${DB_CONTAINER} psql -U ${DB_USER} -c "CREATE DATABASE ${DB_NAME};"
    
    # Restore from backup
    cat "${BACKUP_FILE}" | docker exec -i ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}
    
    echo "Database restored successfully"
else
    echo "Restore cancelled"
fi

# Clean up extracted file if we created one
if [[ "${BACKUP_FILE}" != "$1" ]]; then
    rm "${BACKUP_FILE}"
fi