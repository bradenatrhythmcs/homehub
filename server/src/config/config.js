const path = require('path');

// Load the appropriate .env file based on environment
require('dotenv').config({
    path: path.join(__dirname, '../../', `.env.${process.env.NODE_ENV || 'development'}`)
});

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    database: {
        path: process.env.DATABASE_PATH || path.join(__dirname, '../../data', 
            `${process.env.NODE_ENV || 'development'}.sqlite`),
        // Additional SQLite configuration options can go here
        options: {
            verbose: process.env.NODE_ENV === 'development'
        }
    },
    jwtSecret: process.env.JWT_SECRET,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    isDevelopment: function() {
        return this.env === 'development';
    },
    isProduction: function() {
        return this.env === 'production';
    }
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Ensure database directory exists
const dbDir = path.dirname(config.database.path);
const fs = require('fs');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

module.exports = config; 