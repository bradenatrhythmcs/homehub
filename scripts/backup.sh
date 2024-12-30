#!/bin/bash

# Configuration
BACKUP_DIR="/home/pi/backups/homehub"
DB_PATH="/home/pi/homehub/data/production.sqlite"
RETENTION_DAYS=7
MAX_BACKUPS=10

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Get current date for backup file name
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/homehub_$DATE.sqlite"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database file not found at $DB_PATH"
    exit 1
fi

# Create backup
echo "Creating backup of database..."
if cp "$DB_PATH" "$BACKUP_FILE"; then
    echo "Backup created successfully at $BACKUP_FILE"
else
    echo "Error: Failed to create backup"
    exit 1
fi

# Compress backup
echo "Compressing backup..."
if gzip "$BACKUP_FILE"; then
    echo "Backup compressed successfully"
else
    echo "Warning: Failed to compress backup"
fi

# Clean up old backups
echo "Cleaning up old backups..."

# Delete backups older than RETENTION_DAYS days
find "$BACKUP_DIR" -name "homehub_*.sqlite.gz" -type f -mtime +$RETENTION_DAYS -delete

# Keep only MAX_BACKUPS most recent backups
num_backups=$(find "$BACKUP_DIR" -name "homehub_*.sqlite.gz" | wc -l)
if [ "$num_backups" -gt "$MAX_BACKUPS" ]; then
    echo "Removing excess backups to maintain maximum of $MAX_BACKUPS backups..."
    ls -t "$BACKUP_DIR"/homehub_*.sqlite.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
fi

# Print backup statistics
echo "Backup complete!"
echo "Total backups: $(find "$BACKUP_DIR" -name "homehub_*.sqlite.gz" | wc -l)"
echo "Backup directory size: $(du -sh "$BACKUP_DIR" | cut -f1)"

# Exit successfully
exit 0 