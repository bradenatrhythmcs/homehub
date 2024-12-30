const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AppError('No token provided', 401, 'AUTH_ERROR');
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                ...decoded,
                is_admin: decoded.is_admin
            };
            next();
        } catch (jwtError) {
            throw new AppError('Invalid or expired token', 401, 'AUTH_ERROR');
        }
    } catch (error) {
        next(error);
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.is_admin !== 1) {
        return next(new AppError('Admin access required', 403, 'AUTH_ERROR'));
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware }; 