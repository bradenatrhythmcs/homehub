#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Detect platform
PLATFORM=$(uname)
IS_RASPBERRY_PI=false
if [ -f "/etc/rpi-issue" ] || [ -f "/proc/device-tree/model" ] && grep -q "Raspberry Pi" "/proc/device-tree/model"; then
    IS_RASPBERRY_PI=true
fi

# Set paths based on environment
if [ "$IS_RASPBERRY_PI" = true ]; then
    BACKUP_DIR="/var/lib/homehub/backups"
    DB_PATH="/var/lib/homehub/database.sqlite"
    CONFIG_DIR="/opt/homehub/server"
else
    BACKUP_DIR="./data/backups"
    DB_PATH="./data/development.sqlite"
    CONFIG_DIR="./server"
fi

# Backup configuration
RETENTION_DAYS=7
MAX_BACKUPS=10

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Get current date for backup file name
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="homehub_$DATE"
BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}.sqlite"

# Check if running as root for production
if [ "$IS_RASPBERRY_PI" = true ] && [ "$EUID" -ne 0 ]; then
    error "Please run as root when backing up production environment"
    exit 1
fi

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    error "Database file not found at $DB_PATH"
    exit 1
fi

# Create backup directory with proper permissions
if [ "$IS_RASPBERRY_PI" = true ]; then
    mkdir -p "$BACKUP_DIR"
    chown node:node "$BACKUP_DIR"
fi

# Backup database
log "Creating backup of database..."
if [ "$IS_RASPBERRY_PI" = true ]; then
    if sudo -u node cp "$DB_PATH" "$BACKUP_FILE"; then
        log "Database backup created successfully"
    else
        error "Failed to create database backup"
        exit 1
    fi
else
    if cp "$DB_PATH" "$BACKUP_FILE"; then
        log "Database backup created successfully"
    else
        error "Failed to create database backup"
        exit 1
    fi
fi

# Backup configuration
log "Backing up configuration..."
if [ "$IS_RASPBERRY_PI" = true ]; then
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" -C "$CONFIG_DIR" .env.production
else
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" -C "$CONFIG_DIR" .env
fi

# Compress database backup
log "Compressing database backup..."
if gzip "$BACKUP_FILE"; then
    log "Backup compressed successfully"
else
    warn "Failed to compress backup"
fi

# Clean up old backups
log "Cleaning up old backups..."

# Delete backups older than RETENTION_DAYS days
if [ "$IS_RASPBERRY_PI" = true ]; then
    sudo -u node find "$BACKUP_DIR" -name "homehub_*.sqlite.gz" -type f -mtime +$RETENTION_DAYS -delete
    sudo -u node find "$BACKUP_DIR" -name "homehub_*_config.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
else
    find "$BACKUP_DIR" -name "homehub_*.sqlite.gz" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "homehub_*_config.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
fi

# Keep only MAX_BACKUPS most recent backups
num_backups=$(find "$BACKUP_DIR" -name "homehub_*.sqlite.gz" | wc -l)
if [ "$num_backups" -gt "$MAX_BACKUPS" ]; then
    log "Removing excess backups to maintain maximum of $MAX_BACKUPS backups..."
    if [ "$IS_RASPBERRY_PI" = true ]; then
        sudo -u node sh -c "ls -t \"$BACKUP_DIR\"/homehub_*.sqlite.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f"
        sudo -u node sh -c "ls -t \"$BACKUP_DIR\"/homehub_*_config.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f"
    else
        ls -t "$BACKUP_DIR"/homehub_*.sqlite.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        ls -t "$BACKUP_DIR"/homehub_*_config.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
    fi
fi

# Print backup statistics
log "Backup complete!"
log "Total backups: $(find "$BACKUP_DIR" -name "homehub_*.sqlite.gz" | wc -l)"
log "Backup directory size: $(du -sh "$BACKUP_DIR" | cut -f1)"

# Set proper permissions for production
if [ "$IS_RASPBERRY_PI" = true ]; then
    chown -R node:node "$BACKUP_DIR"
fi

exit 0 