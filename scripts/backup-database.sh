#!/bin/bash
# GG Loop Database Backup Script
# Run this script to create a backup of your PostgreSQL database

# Exit on error
set -e

# Create backups directory if it doesn't exist
mkdir -p backups

# Generate timestamp for backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/ggloop-backup-${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

echo "🔄 Starting database backup..."
echo "📅 Timestamp: $(date)"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Create SQL backup
echo "📦 Exporting database to ${BACKUP_FILE}..."
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Compress the backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

# Get file size
FILE_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)

echo ""
echo "✅ Backup completed successfully!"
echo "📁 File: $COMPRESSED_FILE"
echo "📊 Size: $FILE_SIZE"
echo ""
echo "💡 To restore this backup later, use:"
echo "   gunzip -c $COMPRESSED_FILE | psql \$DATABASE_URL"
echo ""
echo "📌 Remember to save this file somewhere safe (Google Drive, Dropbox, etc.)"

# List all backups
echo ""
echo "📋 All backups:"
ls -lh backups/*.sql.gz 2>/dev/null || echo "No backups found"
