#!/bin/bash

# TryZore CRM Database Restore Script
# This script restores a database backup to Supabase

set -euo pipefail

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
PROJECT_REF="${SUPABASE_PROJECT_REF:-ulymixjoyuhapqxkcwbi}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found in $BACKUP_DIR"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Check if required environment variables are set
if [ -z "${SUPABASE_DB_URL:-}" ]; then
    echo "Error: SUPABASE_DB_URL is not set. Please configure your database connection URL."
    exit 1
fi

echo "⚠️  WARNING: This will restore data to your database!"
echo "Project: $PROJECT_REF"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "Starting database restore..."

# Create temporary file for uncompressed backup
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Decompress the backup if it's gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
else
    cp "$BACKUP_FILE" "$TEMP_FILE"
fi

# Restore the backup
# Note: This will only restore data, not system schemas
if psql "$SUPABASE_DB_URL" < "$TEMP_FILE"; then
    echo "✅ Database restored successfully!"
    
    # Run post-restore checks
    echo ""
    echo "Running post-restore checks..."
    
    # Check row counts for main tables
    psql "$SUPABASE_DB_URL" -c "
        SELECT 
            'organizations' as table_name, COUNT(*) as row_count FROM organizations
        UNION ALL
        SELECT 'users', COUNT(*) FROM users
        UNION ALL
        SELECT 'clients', COUNT(*) FROM clients
        UNION ALL
        SELECT 'events', COUNT(*) FROM events
        UNION ALL
        SELECT 'memberships', COUNT(*) FROM memberships
        UNION ALL
        SELECT 'tags', COUNT(*) FROM tags
        ORDER BY table_name;
    "
    
    echo ""
    echo "✅ Restore completed! Please verify your data and test the application."
    echo ""
    echo "⚠️  Important post-restore steps:"
    echo "1. Check that RLS policies are still enabled"
    echo "2. Verify all functions and triggers are working"
    echo "3. Test authentication and permissions"
    echo "4. Run your test suite"
    
else
    echo "❌ Restore failed!"
    exit 1
fi