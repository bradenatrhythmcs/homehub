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
    error "Please run as root when installing in production environment"
    exit 1
fi

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        if [ "$IS_RASPBERRY_PI" = true ]; then
            log "Installing Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt-get install -y nodejs
        else
            error "Please install Node.js manually"
            exit 1
        fi
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        error "git is not installed"
        if [ "$IS_RASPBERRY_PI" = true ]; then
            log "Installing git..."
            apt-get install -y git
        else
            error "Please install git manually"
            exit 1
        fi
    fi
    
    # Check sqlite3
    if ! command -v sqlite3 &> /dev/null; then
        error "sqlite3 is not installed"
        if [ "$IS_RASPBERRY_PI" = true ]; then
            log "Installing sqlite3..."
            apt-get install -y sqlite3
        else
            error "Please install sqlite3 manually"
            exit 1
        fi
    fi
}

# Create necessary directories and set permissions
setup_directories() {
    log "Setting up directories..."
    
    if [ "$IS_RASPBERRY_PI" = true ]; then
        # Create node user if it doesn't exist
        if ! id -u node &>/dev/null; then
            useradd -r -s /bin/false node
        fi
        
        # Create directories
        mkdir -p "$APP_DIR" "$DATA_DIR" "$LOG_DIR" "$BACKUP_DIR"
        
        # Set permissions
        chown -R node:node "$APP_DIR" "$DATA_DIR" "$LOG_DIR" "$BACKUP_DIR"
        chmod 755 "$APP_DIR" "$DATA_DIR" "$LOG_DIR" "$BACKUP_DIR"
    else
        mkdir -p data logs
    fi
}

# Initialize database
init_database() {
    log "Initializing database..."
    
    if [ "$IS_RASPBERRY_PI" = true ]; then
        # Check if database already exists
        if [ -f "$DB_FILE" ]; then
            warn "Database already exists, skipping initialization"
            return 0
        fi
        
        # Create empty database
        sudo -u node touch "$DB_FILE"
        sudo -u node chmod 600 "$DB_FILE"
        
        # Run migrations
        cd "$APP_DIR/server"
        sudo -u node NODE_ENV=production node src/db/migrate.js
        
        # Verify database
        if ! sudo -u node sqlite3 "$DB_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
            error "Database initialization failed"
            return 1
        fi
    else
        if [ ! -f "server/data/database.sqlite" ]; then
            cd server
            NODE_ENV=development node src/db/migrate.js
            cd ..
        fi
    fi
}

# Setup systemd service
setup_service() {
    if [ "$IS_RASPBERRY_PI" = true ]; then
        log "Setting up systemd service..."
        
        cat > "/etc/systemd/system/$SERVICE_NAME" << EOL
[Unit]
Description=HomeHub Server
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=$APP_DIR/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL
        
        # Reload systemd and enable service
        systemctl daemon-reload
        systemctl enable "$SERVICE_NAME"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    if [ "$IS_RASPBERRY_PI" = true ]; then
        cd "$APP_DIR/server" && npm ci --production
        cd "$APP_DIR/client" && npm ci && npm run build
    else
        cd server && npm install
        cd ../client && npm install
    fi
}

# Initialize environment file
init_environment() {
    if [ "$IS_RASPBERRY_PI" = true ]; then
        log "Setting up environment configuration..."
        
        # Generate secure secrets
        JWT_SECRET=$(openssl rand -base64 48)        # 48 bytes = 384 bits for JWT
        ENCRYPTION_KEY=$(openssl rand -hex 32)       # 32 bytes = 256 bits for AES-256

        # Create production environment file
        cat > "$APP_DIR/server/.env.production" << EOL
NODE_ENV=production
PORT=3000
DB_PATH=$DB_FILE
API_URL=http://localhost:3000

# Security
# JWT secret (384-bit for HMAC-SHA384)
JWT_SECRET=$JWT_SECRET

# Encryption key (256-bit for AES-256-CBC)
ENCRYPTION_KEY=$ENCRYPTION_KEY

# File Storage
UPLOAD_DIR=$DATA_DIR/uploads
MAX_FILE_SIZE=5242880

# GitHub Integration
GITHUB_REPO=bradenatrhythmcs/homehub
GITHUB_BRANCH=main
GITHUB_TOKEN=

# Logging
LOG_LEVEL=info
LOG_FILE=$LOG_DIR/server.log
EOL
        
        # Set proper permissions
        chown node:node "$APP_DIR/server/.env.production"
        chmod 600 "$APP_DIR/server/.env.production"
    fi
}

# Main installation process
main() {
    log "Starting installation process..."
    
    # Check requirements
    check_requirements
    
    # Setup directories
    setup_directories
    
    # Clone repository in production
    if [ "$IS_RASPBERRY_PI" = true ]; then
        log "Cloning repository..."
        git clone https://github.com/bradenatrhythmcs/homehub.git "$APP_DIR"
        chown -R node:node "$APP_DIR"
    fi
    
    # Initialize environment
    init_environment
    
    # Install dependencies
    install_dependencies
    
    # Initialize database
    if ! init_database; then
        error "Database initialization failed"
        exit 1
    fi
    
    # Setup service in production
    setup_service
    
    # Start service in production
    if [ "$IS_RASPBERRY_PI" = true ]; then
        log "Starting HomeHub service..."
        systemctl start "$SERVICE_NAME"
        
        # Print important information
        log "Installation completed successfully!"
        log "Database location: $DB_FILE"
        log "Backup location: $BACKUP_DIR"
        log "Log location: $LOG_DIR"
        log "You can check the service status with: systemctl status $SERVICE_NAME"
    else
        log "Installation completed successfully!"
        log "Run 'npm run dev' in the server directory to start the development server"
    fi
}

# Run main installation process
main 