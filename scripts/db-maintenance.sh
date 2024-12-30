#!/bin/bash

# Configuration
DB_PATH="/home/pi/homehub/data/production.sqlite"
VACUUM_THRESHOLD_MB=50  # Minimum size in MB to trigger VACUUM
LOG_FILE="/var/log/homehub/db-maintenance.log"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log_message() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

# Function to check database integrity
check_integrity() {
    log_message "Checking database integrity..."
    if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
        log_message "Database integrity check passed"
        return 0
    else
        log_message "ERROR: Database integrity check failed"
        return 1
    fi
}

# Function to get database size in MB
get_db_size() {
    local size_bytes=$(stat -f%z "$DB_PATH" 2>/dev/null || stat -c%s "$DB_PATH")
    echo "scale=2; $size_bytes / 1048576" | bc
}

# Function to vacuum database
vacuum_db() {
    log_message "Running VACUUM on database..."
    if sqlite3 "$DB_PATH" "VACUUM;"; then
        log_message "VACUUM completed successfully"
        return 0
    else
        log_message "ERROR: VACUUM failed"
        return 1
    fi
}

# Function to analyze database
analyze_db() {
    log_message "Running ANALYZE on database..."
    if sqlite3 "$DB_PATH" "ANALYZE;"; then
        log_message "ANALYZE completed successfully"
        return 0
    else
        log_message "ERROR: ANALYZE failed"
        return 1
    fi
}

# Function to display database statistics
show_stats() {
    local size=$(get_db_size)
    local page_size=$(sqlite3 "$DB_PATH" "PRAGMA page_size;")
    local page_count=$(sqlite3 "$DB_PATH" "PRAGMA page_count;")
    local freelist_count=$(sqlite3 "$DB_PATH" "PRAGMA freelist_count;")
    
    echo "Database Statistics:"
    echo "-------------------"
    echo "Database Size: ${size}MB"
    echo "Page Size: ${page_size} bytes"
    echo "Page Count: ${page_count}"
    echo "Free Pages: ${freelist_count}"
    echo "Tables:"
    sqlite3 "$DB_PATH" ".tables"
    echo
    echo "Table Sizes:"
    sqlite3 "$DB_PATH" "SELECT name, COUNT(*) as count FROM sqlite_master WHERE type='table' GROUP BY name;"
}

# Main script

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    log_message "Error: Database file not found at $DB_PATH"
    exit 1
fi

# Parse command line arguments
case "$1" in
    check)
        check_integrity
        ;;
    vacuum)
        vacuum_db
        ;;
    analyze)
        analyze_db
        ;;
    stats)
        show_stats
        ;;
    auto)
        # Automatic maintenance routine
        log_message "Starting automatic maintenance..."
        
        # Check integrity
        check_integrity || exit 1
        
        # Check if VACUUM is needed
        size=$(get_db_size)
        if (( $(echo "$size > $VACUUM_THRESHOLD_MB" | bc -l) )); then
            log_message "Database size ($size MB) exceeds threshold ($VACUUM_THRESHOLD_MB MB)"
            vacuum_db
        fi
        
        # Run analyze
        analyze_db
        
        log_message "Automatic maintenance completed"
        ;;
    *)
        echo "Usage: $0 {check|vacuum|analyze|stats|auto}"
        echo
        echo "Commands:"
        echo "  check   - Run database integrity check"
        echo "  vacuum  - Compact the database file"
        echo "  analyze - Update database statistics"
        echo "  stats   - Show database statistics"
        echo "  auto    - Run automatic maintenance routine"
        exit 1
        ;;
esac

exit 0 