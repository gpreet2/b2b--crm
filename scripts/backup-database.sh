#!/bin/bash

# TryZore CRM Database Backup Script
# This script creates a manual backup of the Supabase database

set -euo pipefail

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
PROJECT_REF="${SUPABASE_PROJECT_REF:-ulymixjoyuhapqxkcwbi}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/tryzore_backup_${TIMESTAMP}.sql"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Check if required environment variables are set
if [ -z "${SUPABASE_DB_URL:-}" ]; then
    echo "Error: SUPABASE_DB_URL is not set. Please configure your database connection URL."
    exit 1
fi

echo "Starting database backup for project: $PROJECT_REF"
echo "Backup will be saved to: $BACKUP_FILE"

# Create the backup using pg_dump
# Note: Supabase connection string format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
if pg_dump "$SUPABASE_DB_URL" \
    --no-owner \
    --no-privileges \
    --no-tablespaces \
    --no-unlogged-table-data \
    --exclude-schema=auth \
    --exclude-schema=storage \
    --exclude-schema=supabase_functions \
    --exclude-schema=vault \
    --exclude-schema=graphql \
    --exclude-schema=graphql_public \
    --exclude-schema=realtime \
    --exclude-schema=pgsodium \
    --exclude-schema=pgsodium_masks \
    > "$BACKUP_FILE"; then
    
    # Compress the backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Calculate file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo "✅ Backup completed successfully!"
    echo "   File: $BACKUP_FILE"
    echo "   Size: $FILE_SIZE"
    
    # Optional: Upload to cloud storage
    # aws s3 cp "$BACKUP_FILE" "s3://your-backup-bucket/database-backups/" --profile your-profile
    # gsutil cp "$BACKUP_FILE" "gs://your-backup-bucket/database-backups/"
    
    # Clean up old backups (keep last 30 days)
    find "$BACKUP_DIR" -name "tryzore_backup_*.sql.gz" -mtime +30 -delete
    echo "✅ Old backups cleaned up (kept last 30 days)"
    
else
    echo "❌ Backup failed!"
    exit 1
fi