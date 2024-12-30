const config = require('./config/config');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./models/database');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware setup - ORDER IS IMPORTANT
const corsOptions = {
    origin: config.isDevelopment() 
        ? ['http://localhost:5173', 'http://127.0.0.1:5173'] 
        : config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - separate limits for different types of routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.isProduction() ? 50 : 1000, // More lenient in development
    message: 'Too many authentication attempts, please try again later'
});

const standardLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: config.isProduction() ? 100 : 1000, // More lenient in development
    message: 'Too many requests, please try again later'
});

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter);

// Apply standard rate limiting to all other routes
app.use('/api', standardLimiter);

// Development-only middleware
if (config.isDevelopment()) {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/wifi', require('./routes/wifi.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/passwords', require('./routes/password.routes'));
app.use('/api/bills', require('./routes/bill.routes'));
app.use('/api/accounts', require('./routes/account.routes'));
app.use('/api/contacts', require('./routes/contact.routes'));
app.use('/api/system', require('./routes/system.routes'));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        await initDatabase();
        app.listen(config.port, () => {
            console.log(`Server running in ${config.env} mode on port ${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer(); 