#!/bin/bash

# Function to generate a random secure JWT secret
generate_jwt_secret() {
    openssl rand -base64 32
}

# Function to generate a secure encryption key
generate_encryption_key() {
    openssl rand -hex 32  # Generates a 256-bit key in hex format
}

# Function to setup environment files
setup_env() {
    local env_type="$1"
    local env_file="server/.env.${env_type}"
    local db_path
    local client_url
    local port
    local log_level

    if [ "$env_type" = "production" ]; then
        db_path="/home/pi/homehub/data/production.sqlite"
        client_url="http://localhost:80"
        port="3000"
        log_level="info"
    else
        db_path="./data/development.sqlite"
        client_url="http://localhost:5173"
        port="3000"
        log_level="debug"
    fi

    cat > "$env_file" << EOL
# Server Configuration
NODE_ENV=${env_type}
PORT=${port}

# Database Configuration
DATABASE_PATH=${db_path}

# Security
JWT_SECRET=$(generate_jwt_secret)
SALT_ROUNDS=10
ENCRYPTION_KEY=$(generate_encryption_key)

# Client URL
CLIENT_URL=${client_url}

# Other Configuration
LOG_LEVEL=${log_level}
EOL

    echo "Created ${env_file}"
    chmod 600 "$env_file"
}

# Function to install dependencies
install_dependencies() {
    local env_type="$1"
    
    echo "📦 Installing dependencies..."
    
    # Install production dependencies
    npm install --production
    
    if [ "$env_type" = "development" ]; then
        echo "📦 Installing development dependencies..."
        # Install development dependencies
        npm install --save-dev morgan
    fi
}

# Detect if running on Raspberry Pi
is_raspberry_pi() {
    if [ -f /etc/os-release ]; then
        if grep -q "Raspberry Pi" /etc/os-release; then
            return 0
        fi
    fi
    return 1
}

# Main installation script
main() {
    echo "🚀 Starting HomeHub installation..."

    # Check for required tools
    if ! command -v openssl &> /dev/null; then
        echo "❌ OpenSSL is required but not installed. Please install it first."
        exit 1
    fi

    # Create necessary directories
    mkdir -p data

    # Determine environment type
    if is_raspberry_pi; then
        ENV_TYPE="production"
        echo "📍 Detected Raspberry Pi environment - setting up production..."
        
        # Create production data directory with correct permissions
        sudo mkdir -p /home/pi/homehub/data
        sudo chown -R "$USER:$USER" /home/pi/homehub
        
        # Setup production environment
        setup_env "$ENV_TYPE"
        
        # Create symbolic link for database directory
        ln -sf /home/pi/homehub/data ./data
        
        echo "✅ Production environment setup complete"
        echo "🔒 Your database will be stored in: /home/pi/homehub/data/production.sqlite"
    else
        ENV_TYPE="development"
        echo "💻 Setting up development environment..."
        setup_env "$ENV_TYPE"
        echo "✅ Development environment setup complete"
        echo "🔒 Your database will be stored in: ./data/development.sqlite"
    fi

    # Install dependencies based on environment
    install_dependencies "$ENV_TYPE"

    echo "
🎉 Installation complete!

Next steps:
1. Review the generated environment file in server/.env.$ENV_TYPE
2. Start the server with: npm start

⚠️  IMPORTANT SECURITY NOTES:
- Keep your environment file secure and never commit it to version control
- The encryption key and JWT secret are randomly generated and unique to this installation
- Make sure to backup your environment file securely - if lost, stored passwords cannot be recovered
"
}

# Run main function
main
