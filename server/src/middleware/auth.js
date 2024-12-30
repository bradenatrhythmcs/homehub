const jwt = require('jsonwebtoken');
const { JWT_SECRET, TOKEN_PREFIX } = require('../config/auth');
const User = require('../models/user');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            console.log('No authorization header');
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if the header starts with Bearer
        if (!authHeader.startsWith(TOKEN_PREFIX)) {
            console.log('Invalid token format');
            return res.status(401).json({ error: 'Invalid token format' });
        }

        const token = authHeader.slice(TOKEN_PREFIX.length + 1); // +1 for the space

        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ error: 'Authentication required' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token decoded:', { userId: decoded.id });
            
            const user = await User.findById(decoded.id);
            
            if (!user) {
                console.log('User not found:', decoded.id);
                return res.status(401).json({ error: 'Invalid user' });
            }

            req.user = user;
            next();
        } catch (err) {
            console.error('Token verification failed:', {
                message: err.message,
                name: err.name,
                expiredAt: err.expiredAt
            });
            
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

const adminRequired = (req, res, next) => {
    if (!req.user) {
        console.log('No user in request');
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.user.is_admin) {
        console.log('Non-admin access attempt:', {
            userId: req.user.id,
            username: req.user.username,
            isAdmin: req.user.is_admin
        });
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
};

module.exports = {
    authenticateToken,
    adminRequired
}; 