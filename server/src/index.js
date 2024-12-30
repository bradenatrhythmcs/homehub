require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { ensureDataDirectory, DB_PATH } = require('./config/database');
const db = require('./db');
const SystemSettings = require('./models/system.settings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Initialize database and start server
const initializeServer = async () => {
    try {
        // Ensure data directory exists
        await ensureDataDirectory();
        
        console.log('Opening database at:', DB_PATH);
        
        // Initialize database connection
        await db.initialize();
        console.log('Connected to database successfully');
        
        // Initialize system settings
        await SystemSettings.initialize();
        console.log('System settings initialized');
        
        // Run migrations
        await require('./db/migrate').migrate();
        console.log('Database migration completed successfully');
        
        // Routes
        app.use('/api/auth', require('./routes/auth.routes'));
        app.use('/api/users', require('./routes/user.routes'));
        app.use('/api/wifi', require('./routes/wifi.routes'));
        app.use('/api/system', require('./routes/system.routes'));
        app.use('/api/contacts', require('./routes/contact.routes'));
        
        // Serve static files in production
        if (process.env.NODE_ENV === 'production') {
            app.use(express.static(path.join(__dirname, '../../client/dist')));
            app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
            });
        }
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});

// Start the server
initializeServer(); 