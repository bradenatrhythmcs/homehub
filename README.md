# HomeHub

A comprehensive home management system designed to run on a Raspberry Pi, helping families manage passwords, WiFi details, bills, and more.

## Features

- 👨‍👩‍👧‍👦 Family profiles with parent/child access levels
- 🔐 Secure password management
- 📡 WiFi network management
- 💰 Bill tracking and reminders
- 📱 Responsive web interface
- 🌙 Dark mode support
- 📊 System monitoring

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite3
- Raspberry Pi (for production) or any computer (for development)

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/homehub.git
   cd homehub
   ```

2. Run the installation script:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. Start the development servers:
   ```bash
   # Terminal 1 - Start the backend server
   cd server
   npm run dev

   # Terminal 2 - Start the frontend development server
   cd client
   npm run dev
   ```

4. Visit `http://localhost:5173` in your browser

## Production Deployment (Raspberry Pi)

1. Install required packages on Raspberry Pi:
   ```bash
   sudo apt-get update
   sudo apt-get install -y nodejs npm sqlite3
   ```

2. Clone and setup:
   ```bash
   cd /home/pi
   git clone https://github.com/yourusername/homehub.git
   cd homehub
   ./install.sh
   ```

3. Create a systemd service:
   ```bash
   sudo nano /etc/systemd/system/homehub.service
   ```

   Add the following content:
   ```ini
   [Unit]
   Description=HomeHub Server
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/homehub/server
   ExecStart=/usr/bin/npm start
   Restart=always
   Environment=NODE_ENV=production
   Environment=PORT=3000

   [Install]
   WantedBy=multi-user.target
   ```

4. Enable and start the service:
   ```bash
   sudo systemctl enable homehub
   sudo systemctl start homehub
   ```

5. Setup Nginx (optional, for domain routing):
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/homehub
   ```

   Add the configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/homehub /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Environment Variables

Create a `.env.development` or `.env.production` file with these variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_PATH=./data/development.sqlite

# Security
JWT_SECRET=your_secret_here
SALT_ROUNDS=10
ENCRYPTION_KEY=your_encryption_key_here

# Client URL
CLIENT_URL=http://localhost:5173

# Other Configuration
LOG_LEVEL=debug
```

## Security Notes

1. Always use HTTPS in production
2. Keep your environment files secure
3. Regularly backup your database
4. Never commit sensitive data to git
5. Use strong passwords for all services

## Backup and Restore

Backup script (run daily via cron):
```bash
#!/bin/bash
backup_dir="/home/pi/backups"
date=$(date +%Y%m%d)
mkdir -p "$backup_dir"
cp /home/pi/homehub/data/production.sqlite "$backup_dir/homehub_$date.sqlite"
find "$backup_dir" -type f -mtime +7 -delete
```

## Monitoring

The system provides real-time monitoring through the System Vitals dashboard, showing:
- Server status
- Memory usage
- CPU load
- Database size
- Uptime

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 