// Default to a secure random string if JWT_SECRET is not set in environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

module.exports = {
    JWT_SECRET,
    JWT_EXPIRY,
    // Add other auth-related configuration here
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    TOKEN_HEADER: 'Authorization',
    TOKEN_PREFIX: 'Bearer'
}; 