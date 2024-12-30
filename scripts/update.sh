#!/bin/bash

# Configuration
APP_NAME="homehub"
APP_DIR="/opt/$APP_NAME"
SERVICE_NAME="$APP_NAME.service"
DATA_DIR="/var/lib/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"
DB_FILE="$DATA_DIR/database.sqlite"
BACKUP_DIR="$DATA_DIR/backups"

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

# Check if running as root for production
if [ "$IS_RASPBERRY_PI" = true ] && [ "$EUID" -ne 0 ]; then
    error "Please run as root when updating production environment"
    exit 1
fi

# Create backup before update
create_backup() {
    log "Creating backup before update..."
    
    # Ensure backup directory exists
    mkdir -p "$BACKUP_DIR"
    chown node:node "$BACKUP_DIR"
    
    # Create backup filename with timestamp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    DB_BACKUP="$BACKUP_DIR/database_$TIMESTAMP.sqlite"
    CONFIG_BACKUP="$BACKUP_DIR/config_$TIMESTAMP.tar.gz"
    
    # Backup database
    if [ -f "$DB_FILE" ]; then
        log "Backing up database..."
        sudo -u node cp "$DB_FILE" "$DB_BACKUP"
        sudo -u node sqlite3 "$DB_BACKUP" "VACUUM;"
    else
        warn "No database found to backup"
    fi
    
    # Backup configuration
    log "Backing up configuration..."
    sudo -u node tar -czf "$CONFIG_BACKUP" -C "$APP_DIR/server" .env.production
    
    # Clean up old backups (keep last 7 days)
    find "$BACKUP_DIR" -name "database_*.sqlite" -mtime +7 -delete
    find "$BACKUP_DIR" -name "config_*.tar.gz" -mtime +7 -delete
}

# Stop service in production
stop_service() {
    if [ "$IS_RASPBERRY_PI" = true ]; then
        log "Stopping HomeHub service..."
        systemctl stop "$SERVICE_NAME"
    fi
}

# Start service in production
start_service() {
    if [ "$IS_RASPBERRY_PI" = true ]; then
        log "Starting HomeHub service..."
        systemctl start "$SERVICE_NAME"
    fi
}

# Update dependencies
update_dependencies() {
    log "Updating dependencies..."
    if [ "$IS_RASPBERRY_PI" = true ]; then
        cd "$APP_DIR/server" && npm ci --production
        cd "$APP_DIR/client" && npm ci && npm run build
    else
        cd server && npm install
        cd ../client && npm install
    fi
}

# Apply database migrations
apply_migrations() {
    log "Checking for database migrations..."
    if [ "$IS_RASPBERRY_PI" = true ]; then
        cd "$APP_DIR/server"
        
        # Run migrations as node user
        sudo -u node NODE_ENV=production node src/db/migrate.js
        
        # Verify database integrity
        if ! sqlite3 "$DB_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
            error "Database integrity check failed after migration"
            return 1
        fi
    else
        cd server
        NODE_ENV=development node src/db/migrate.js
    fi
}

# Main update process
main() {
    log "Starting update process..."
    
    # Check disk space
    if [ "$IS_RASPBERRY_PI" = true ]; then
        AVAILABLE_SPACE=$(df -k "$APP_DIR" | awk 'NR==2 {print $4}')
        REQUIRED_SPACE=500000  # 500MB in KB
        
        if [ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]; then
            error "Insufficient disk space. Required: 500MB, Available: $((AVAILABLE_SPACE/1024))MB"
            exit 1
        fi
    fi
    
    # Create backup
    create_backup
    
    # Stop service in production
    stop_service
    
    # Pull latest changes
    log "Pulling latest changes..."
    if [ "$IS_RASPBERRY_PI" = true ]; then
        cd "$APP_DIR"
        sudo -u node git fetch origin
        sudo -u node git reset --hard origin/main
    else
        git fetch origin
        git reset --hard origin/main
    fi
    
    # Update dependencies
    update_dependencies
    
    # Apply migrations
    if ! apply_migrations; then
        error "Migration failed, attempting to restore from backup..."
        # TODO: Implement backup restoration
        exit 1
    fi
    
    # Start service in production
    start_service
    
    log "Update completed successfully!"
    
    # Print locations
    if [ "$IS_RASPBERRY_PI" = true ]; then
        log "Database location: $DB_FILE"
        log "Backup location: $BACKUP_DIR"
        log "Log location: $LOG_DIR"
        log "You can check the service status with: systemctl status $SERVICE_NAME"
    fi
}

# Run main update process
main 