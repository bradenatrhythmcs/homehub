#!/bin/bash

# Configuration
ENV_TEMPLATE=".env.example"
DATA_DIR="data"
LOG_DIR="/var/log/homehub"
DEFAULT_PORT=3000
DEFAULT_CLIENT_PORT=5173

# Function to generate a secure random string
generate_secret() {
    openssl rand -hex 32
}

# Function to check if running on Raspberry Pi
is_raspberry_pi() {
    if [ -f /proc/device-tree/model ] && grep -q "Raspberry Pi" /proc/device-tree/model; then
        return 0
    else
        return 1
    fi
}

# Function to create environment file
create_env_file() {
    local env_type="$1"
    local env_file=".env.${env_type}"
    
    # Check if env file already exists
    if [ -f "$env_file" ]; then
        echo "Warning: $env_file already exists"
        read -p "Do you want to overwrite it? (y/N): " confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo "Skipping $env_file creation"
            return
        fi
    fi
    
    # Generate secrets
    local jwt_secret=$(generate_secret)
    local encryption_key=$(generate_secret)
    
    # Set environment-specific values
    local node_env="$env_type"
    local log_level="info"
    local port="$DEFAULT_PORT"
    local client_url="http://localhost:$DEFAULT_CLIENT_PORT"
    
    if [ "$env_type" = "production" ]; then
        log_level="error"
        if is_raspberry_pi; then
            client_url="http://localhost:$DEFAULT_PORT"  # In production, serve static files from Express
        fi
    fi
    
    # Create environment file
    cat > "$env_file" << EOL
# Server Configuration
NODE_ENV=${node_env}
PORT=${port}

# Database Configuration
DATABASE_PATH=./data/${env_type}.sqlite

# Security
JWT_SECRET=${jwt_secret}
SALT_ROUNDS=10
ENCRYPTION_KEY=${encryption_key}

# Client URL
CLIENT_URL=${client_url}

# Other Configuration
LOG_LEVEL=${log_level}
EOL
    
    echo "Created $env_file"
}

# Function to setup directories
setup_directories() {
    # Create data directory
    if [ ! -d "$DATA_DIR" ]; then
        mkdir -p "$DATA_DIR"
        echo "Created data directory: $DATA_DIR"
    fi
    
    # Create log directory (may require sudo)
    if [ ! -d "$LOG_DIR" ]; then
        if [ "$EUID" -eq 0 ]; then
            mkdir -p "$LOG_DIR"
            chmod 755 "$LOG_DIR"
            echo "Created log directory: $LOG_DIR"
        else
            echo "Warning: Log directory creation requires root privileges"
            echo "Please run: sudo mkdir -p $LOG_DIR && sudo chmod 755 $LOG_DIR"
        fi
    fi
}

# Function to check system requirements
check_requirements() {
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node >/dev/null; then
        missing_deps+=("nodejs")
    else
        echo "Node.js version: $(node --version)"
    fi
    
    # Check npm
    if ! command -v npm >/dev/null; then
        missing_deps+=("npm")
    else
        echo "npm version: $(npm --version)"
    fi
    
    # Check SQLite
    if ! command -v sqlite3 >/dev/null; then
        missing_deps+=("sqlite3")
    else
        echo "SQLite version: $(sqlite3 --version)"
    fi
    
    # Check OpenSSL
    if ! command -v openssl >/dev/null; then
        missing_deps+=("openssl")
    else
        echo "OpenSSL version: $(openssl version)"
    fi
    
    # Report missing dependencies
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo "Missing required dependencies: ${missing_deps[*]}"
        if is_raspberry_pi; then
            echo "Install them using: sudo apt-get install ${missing_deps[*]}"
        else
            echo "Please install the missing dependencies using your package manager"
        fi
        return 1
    fi
    
    return 0
}

# Main script

# Parse command line arguments
case "$1" in
    check)
        echo "Checking system requirements..."
        check_requirements
        ;;
    init)
        echo "Initializing environment..."
        
        # Check requirements first
        check_requirements || exit 1
        
        # Setup directories
        setup_directories
        
        # Create development environment
        create_env_file "development"
        
        # Create production environment if on Raspberry Pi
        if is_raspberry_pi; then
            create_env_file "production"
        fi
        
        echo "Environment initialization complete"
        ;;
    *)
        echo "Usage: $0 {check|init}"
        echo
        echo "Commands:"
        echo "  check  - Check system requirements"
        echo "  init   - Initialize environment files and directories"
        exit 1
        ;;
esac

exit 0 