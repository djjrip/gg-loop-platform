#!/bin/bash
# GG Loop Database Backup Script
# Run this script to create a backup of your PostgreSQL database

# Exit on error
set -e

# Set restrictive permissions for created files (owner read/write only)
umask 077

# Check if required tools are available
if ! command -v pg_dump &> /dev/null; then
    echo "❌ ERROR: pg_dump is not installed or not in PATH"
    echo "   Install PostgreSQL client tools to use this script"
    exit 1
fi

if ! command -v gzip &> /dev/null; then
    echo "❌ ERROR: gzip is not installed or not in PATH"
    exit 1
fi

# Create backups directory if it doesn't exist
mkdir -p backups
chmod 700 backups  # Only owner can read/write/execute

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
if ! pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
    echo "❌ ERROR: pg_dump failed"
    echo "   Check your DATABASE_URL and database connection"
    rm -f "$BACKUP_FILE"  # Clean up partial file
    exit 1
fi

# Ensure restrictive permissions on backup file
chmod 600 "$BACKUP_FILE"

# Compress the backup
echo "🗜️  Compressing backup..."
if ! gzip "$BACKUP_FILE"; then
    echo "❌ ERROR: gzip compression failed"
    exit 1
fi

# Ensure restrictive permissions on compressed file
chmod 600 "$COMPRESSED_FILE"

# Get file size
FILE_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)

# Get permissions to verify they're secure
PERMISSIONS=$(ls -l "$COMPRESSED_FILE" | awk '{print $1}')

echo ""
echo "✅ Backup completed successfully!"
echo "📁 File: $COMPRESSED_FILE"
echo "📊 Size: $FILE_SIZE"
echo "🔒 Permissions: $PERMISSIONS (owner read/write only)"
echo ""
echo "💡 To restore this backup later, use:"
echo "   gunzip -c $COMPRESSED_FILE | psql \$DATABASE_URL"
echo ""
echo "📌 IMPORTANT: Download and save this file somewhere safe!"
echo "   Recommended: Google Drive, Dropbox, encrypted USB drive"
echo "   Then delete from Replit to save space"

# List all backups
echo ""
echo "📋 All backups:"
ls -lh backups/*.sql.gz 2>/dev/null || echo "No backups found"
