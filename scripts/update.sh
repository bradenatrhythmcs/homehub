#!/bin/bash

# Configuration
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$APP_DIR/backups"
REMOTE_URL="origin"
BRANCH="main"
UPDATE_LOG="$APP_DIR/logs/update.log"

# Ensure logs directory exists
mkdir -p "$(dirname "$UPDATE_LOG")"

# Logging function
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" | tee -a "$UPDATE_LOG"
}

# Check if we're in a git repository
check_git() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "Error: Not a git repository"
        exit 1
    fi
}

# Check for updates
check_updates() {
    cd "$APP_DIR" || exit 1
    check_git

    git fetch "$REMOTE_URL" "$BRANCH"
    local behind=$(git rev-list HEAD.."$REMOTE_URL/$BRANCH" --count)
    
    if [ "$behind" -gt 0 ]; then
        log "Updates available"
        echo "Updates available"
        return 0
    else
        log "No updates available"
        echo "No updates available"
        return 1
    fi
}

# Get update details
get_update_details() {
    cd "$APP_DIR" || exit 1
    check_git

    git fetch "$REMOTE_URL" "$BRANCH"
    local current_version=$(git rev-parse --short HEAD)
    local latest_version=$(git rev-parse --short "$REMOTE_URL/$BRANCH")
    local latest_message=$(git log -1 --format=%s "$REMOTE_URL/$BRANCH")
    local changes=$(git log HEAD.."$REMOTE_URL/$BRANCH" --oneline)

    echo "Current version: $current_version"
    echo "Latest version: $latest_version"
    echo "Latest commit: $latest_message"
    echo "Changes:"
    echo "$changes"
}

# Backup current state
backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/backup_$timestamp.tar.gz"
    
    mkdir -p "$BACKUP_DIR"
    tar -czf "$backup_file" -C "$APP_DIR" .
    
    if [ $? -eq 0 ]; then
        log "Backup created: $backup_file"
        echo "$backup_file"
    else
        log "Error: Backup failed"
        exit 1
    fi
}

# Update dependencies
update_deps() {
    cd "$APP_DIR" || exit 1
    
    log "Updating server dependencies..."
    cd server && npm install
    
    log "Updating client dependencies..."
    cd ../client && npm install
}

# Rebuild application
rebuild() {
    cd "$APP_DIR" || exit 1
    
    log "Building client..."
    cd client && npm run build
    
    if [ $? -ne 0 ]; then
        log "Error: Client build failed"
        return 1
    fi
    
    return 0
}

# Perform update
apply_update() {
    cd "$APP_DIR" || exit 1
    check_git

    log "Starting update process..."
    
    # Create backup
    local backup_file=$(backup)
    log "Created backup: $backup_file"
    
    # Pull changes
    if ! git pull "$REMOTE_URL" "$BRANCH"; then
        log "Error: Failed to pull updates"
        return 1
    fi
    
    # Update dependencies
    if ! update_deps; then
        log "Error: Failed to update dependencies"
        git reset --hard HEAD@{1}
        return 1
    fi
    
    # Rebuild application
    if ! rebuild; then
        log "Error: Failed to rebuild application"
        git reset --hard HEAD@{1}
        return 1
    fi
    
    log "Update completed successfully"
    return 0
}

# Main execution
case "$1" in
    "check")
        check_updates
        ;;
    "details")
        get_update_details
        ;;
    "apply")
        apply_update
        ;;
    *)
        echo "Usage: $0 {check|details|apply}"
        exit 1
        ;;
esac 