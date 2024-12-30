# HomeHub

A home management system designed to run on a Raspberry Pi.

## Security Notice

This application handles sensitive information. The installation script will automatically:
1. Generate secure random values for JWT authentication
2. Generate secure random values for data encryption
3. Set up proper file permissions
4. Configure the environment securely

For additional security:
1. Keep your production environment files secure
2. Consider setting up a GitHub token for automatic updates
3. Regularly backup your data

## Installation

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/bradenatrhythmcs/homehub.git
   cd homehub
   ```

2. Copy the development environment file:
   ```bash
   cp server/.env.development server/.env
   ```

3. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. Start the development servers:
   ```bash
   # Terminal 1 (Server)
   cd server && npm run dev
   
   # Terminal 2 (Client)
   cd client && npm run dev
   ```

### Production Setup (Raspberry Pi)

1. Clone the repository:
   ```bash
   git clone https://github.com/bradenatrhythmcs/homehub.git
   ```

2. Run the installation script:
   ```bash
   cd homehub
   sudo ./scripts/install.sh
   ```

The script will:
- Install required dependencies
- Set up the database
- Generate secure secrets
- Configure the systemd service
- Start the application

## Updating

To update the application:

```bash
sudo ./scripts/update.sh
```

The update script will:
1. Create a backup of your database and configuration
2. Pull the latest changes
3. Update dependencies
4. Apply any database migrations
5. Restart the service

## Features

- User Management
- WiFi Network Management
- System Monitoring
- Automatic Updates
- Database Backups
- Secure Storage

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

If you discover any security issues, please report them via email instead of creating a public issue. 