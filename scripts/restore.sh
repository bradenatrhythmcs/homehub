#!/bin/bash

# Configuration
BACKUP_DIR="/home/pi/backups/homehub"
DB_PATH="/home/pi/homehub/data/production.sqlite"
TEMP_DIR="/tmp/homehub_restore"

# Function to list available backups
list_backups() {
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/*.sqlite.gz | awk '{print NR")", $9, "("$5")", $6, $7, $8}'
}

# Function to restore a specific backup
restore_backup() {
    local backup_file="$1"
    
    # Create temp directory
    mkdir -p "$TEMP_DIR"
    
    # Decompress backup to temp directory
    echo "Decompressing backup..."
    cp "$backup_file" "$TEMP_DIR/"
    gunzip "$TEMP_DIR/$(basename "$backup_file")"
    
    # Get the decompressed file name
    local decompressed_file="$TEMP_DIR/$(basename "$backup_file" .gz)"
    
    # Check if current database exists and create backup
    if [ -f "$DB_PATH" ]; then
        local current_backup="$DB_PATH.$(date +%Y%m%d_%H%M%S).bak"
        echo "Creating backup of current database at $current_backup"
        cp "$DB_PATH" "$current_backup"
    fi
    
    # Restore the backup
    echo "Restoring database..."
    if cp "$decompressed_file" "$DB_PATH"; then
        echo "Database restored successfully!"
    else
        echo "Error: Failed to restore database"
        exit 1
    fi
    
    # Clean up
    rm -rf "$TEMP_DIR"
}

# Main script

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory not found at $BACKUP_DIR"
    exit 1
fi

# Check if there are any backups
if [ ! "$(ls -A "$BACKUP_DIR"/*.sqlite.gz 2>/dev/null)" ]; then
    echo "Error: No backups found in $BACKUP_DIR"
    exit 1
fi

# If no arguments provided, list backups and prompt for selection
if [ $# -eq 0 ]; then
    list_backups
    
    echo -n "Enter the number of the backup to restore (or 'q' to quit): "
    read -r selection
    
    if [ "$selection" = "q" ]; then
        echo "Restore cancelled"
        exit 0
    fi
    
    # Get the selected backup file
    backup_file=$(ls "$BACKUP_DIR"/*.sqlite.gz | sed -n "${selection}p")
    
    if [ -z "$backup_file" ]; then
        echo "Error: Invalid selection"
        exit 1
    fi
else
    # Use provided backup file
    backup_file="$1"
    if [ ! -f "$backup_file" ]; then
        echo "Error: Backup file not found: $backup_file"
        exit 1
    fi
fi

# Confirm restore
echo "Warning: This will replace the current database with the backup."
echo "Backup file: $backup_file"
echo -n "Are you sure you want to proceed? (y/N): "
read -r confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Perform restore
restore_backup "$backup_file"

# Exit successfully
exit 0 