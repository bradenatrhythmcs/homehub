#!/bin/bash

# Configuration
APP_NAME="homehub"
APP_DIR="/home/pi/homehub"
SYSTEMD_SERVICE="/etc/systemd/system/${APP_NAME}.service"
NGINX_SITE="/etc/nginx/sites-available/${APP_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"
BACKUP_DIR="/home/pi/backups/${APP_NAME}"

# Function to check if script is run as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo "Error: This script must be run as root"
        exit 1
    fi
}

# Function to check if running on Raspberry Pi
is_raspberry_pi() {
    if [ -f /proc/device-tree/model ] && grep -q "Raspberry Pi" /proc/device-tree/model; then
        return 0
    else
        return 1
    fi
}

# Function to install system dependencies
install_dependencies() {
    echo "Installing system dependencies..."
    apt-get update
    apt-get install -y nodejs npm sqlite3 nginx
    
    # Install PM2 globally
    npm install -g pm2
    
    echo "Dependencies installed successfully"
}

# Function to setup systemd service
setup_systemd() {
    echo "Setting up systemd service..."
    
    # Create systemd service file
    cat > "$SYSTEMD_SERVICE" << EOL
[Unit]
Description=HomeHub Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=${APP_DIR}/server
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOL
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable "$APP_NAME"
    systemctl start "$APP_NAME"
    
    echo "Systemd service setup complete"
}

# Function to setup Nginx
setup_nginx() {
    local domain="$1"
    
    echo "Setting up Nginx configuration..."
    
    # Create Nginx site configuration
    cat > "$NGINX_SITE" << EOL
server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL
    
    # Enable site and restart Nginx
    ln -sf "$NGINX_SITE" "$NGINX_ENABLED"
    nginx -t && systemctl restart nginx
    
    echo "Nginx setup complete"
}

# Function to setup SSL with Let's Encrypt
setup_ssl() {
    local domain="$1"
    
    echo "Setting up SSL with Let's Encrypt..."
    
    # Install certbot
    apt-get install -y certbot python3-certbot-nginx
    
    # Obtain and install certificate
    certbot --nginx -d "$domain" --non-interactive --agree-tos --email "admin@${domain}" --redirect
    
    echo "SSL setup complete"
}

# Function to deploy application
deploy_app() {
    echo "Deploying application..."
    
    # Build client
    cd "$APP_DIR/client"
    npm install
    npm run build
    
    # Setup server
    cd "$APP_DIR/server"
    npm install
    
    # Run database migrations
    npm run migrate
    
    # Restart service
    systemctl restart "$APP_NAME"
    
    echo "Application deployed successfully"
}

# Function to setup backup cron job
setup_backup() {
    echo "Setting up backup cron job..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    chown pi:pi "$BACKUP_DIR"
    
    # Add cron job for daily backup at 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/scripts/backup.sh") | crontab -
    
    echo "Backup cron job setup complete"
}

# Main script

# Check if running on Raspberry Pi
if ! is_raspberry_pi; then
    echo "Error: This script is intended to run on a Raspberry Pi"
    exit 1
fi

# Parse command line arguments
case "$1" in
    install)
        check_root
        install_dependencies
        ;;
    setup)
        check_root
        setup_systemd
        
        # Setup Nginx if domain provided
        if [ -n "$2" ]; then
            setup_nginx "$2"
            read -p "Do you want to setup SSL with Let's Encrypt? (y/N): " setup_ssl_confirm
            if [ "$setup_ssl_confirm" = "y" ] || [ "$setup_ssl_confirm" = "Y" ]; then
                setup_ssl "$2"
            fi
        fi
        
        setup_backup
        ;;
    deploy)
        deploy_app
        ;;
    *)
        echo "Usage: $0 {install|setup [domain]|deploy}"
        echo
        echo "Commands:"
        echo "  install        - Install system dependencies"
        echo "  setup [domain] - Setup systemd service and optionally Nginx with domain"
        echo "  deploy         - Deploy application updates"
        exit 1
        ;;
esac

exit 0 