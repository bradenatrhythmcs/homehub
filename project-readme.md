# HomeHub

A local network application that runs on Raspberry Pi, providing WiFi information sharing, bill management, and household management capabilities.

## Features

### User Management
- User authentication with email and password
- Netflix-style profile selection
- User roles (admin/regular user)
- Profile customization with avatars
- Password reset functionality
- Account settings management

### WiFi Management
- WiFi password sharing with QR code generation
- Secure storage of WiFi credentials
- Easy network connection through QR code scanning
- Support for multiple WiFi networks

### Bill Management
- Track and manage household bills
- Add, edit, and delete bills
- Set bill due dates and amounts
- Mark bills as paid/unpaid
- Bill history tracking
- Cost tracking for each bill
- Bill categories and organization

### Contact Management
- Store important household contacts
- Add, edit, and delete contact information
- Categorize contacts (emergency, maintenance, utilities, etc.)
- Quick access to important phone numbers and emails

### System Features
- Local network accessibility
- Responsive design for multiple devices
- Dark/Light mode support
- Secure data storage with SQLite
- Real-time updates
- Mobile-friendly interface

## Technology Stack

- Frontend:
  - React.js
  - TailwindCSS for styling
  - QRCode.react for WiFi QR codes
  - React Router for navigation

- Backend:
  - Node.js
  - Express.js
  - SQLite for database
  - JWT for authentication
  - bcrypt for password hashing

## Project Structure

```
homehub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # Express routes
│   │   └── utils/        # Utility functions
│   └── config/           # Configuration files
└── scripts/              # Deployment scripts

```

## Setup Instructions

### Prerequisites

1. Raspberry Pi (3 or newer recommended)
2. Node.js 18 or newer
3. npm or yarn
4. Git
5. SQLite3

### Raspberry Pi Installation

1. Update your Raspberry Pi:
```bash
sudo apt update
sudo apt upgrade
```

2. Install required dependencies:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install SQLite
sudo apt-get install sqlite3

# Install Git
sudo apt-get install git
```

3. Clone and setup the application:
```bash
git clone https://github.com/yourusername/homehub.git
cd homehub

# Install dependencies
cd server && npm install
cd ../client && npm install && npm run build
```

4. Initialize the database:
```bash
cd server
npm run migrate
```

5. Setup environment variables:
```bash
# In server directory
cp .env.example .env
nano .env

# Add the following variables:
JWT_SECRET=your_secret_key
PORT=3000
NODE_ENV=production
```

6. Setup PM2 for process management:
```bash
sudo npm install -g pm2
pm2 start src/index.js --name "homehub-server"
pm2 startup
pm2 save
```

7. Configure the application to start on boot:
```bash
# Add PM2 to startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
```

8. Access the application:
- Open a browser on any device connected to your local network
- Navigate to `http://[raspberry-pi-ip]:3000`
- Default admin credentials will be provided in the initial setup

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/homehub.git
cd homehub
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Create environment files:
```bash
# In server directory
cp .env.example .env
```

4. Start development servers:
```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm start
```

## Maintenance

### Database Backups
- Regular database backups are recommended
- The SQLite database is located at `server/data/database.sqlite`
- Create periodic backups using:
```bash
cp server/data/database.sqlite server/data/database.backup.sqlite
```

### Updates
- Pull latest changes from the repository
- Run database migrations
- Rebuild the client
- Restart the PM2 process

## Troubleshooting

Common issues and solutions:
1. If the application isn't accessible:
   - Check if the server is running: `pm2 status`
   - Verify the correct port is being used
   - Check firewall settings

2. Database issues:
   - Verify SQLite file permissions
   - Run migrations: `npm run migrate`
   - Check database logs

3. Network connectivity:
   - Verify Raspberry Pi is connected to the network
   - Check if the correct IP address is being used
   - Verify port forwarding if accessing from outside the network

## Security Considerations

- Store sensitive information in environment variables
- Implement rate limiting for API endpoints
- Use HTTPS in production
- Regularly update dependencies
- Implement proper input validation
- Use secure session management
- Implement proper error handling

## License

MIT License - See LICENSE file for details