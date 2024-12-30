const User = require('../models/user');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

class ProfileController {
    static async getProfile(req, res, next) {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Remove sensitive information
            delete user.password;
            
            res.json(user);
        } catch (error) {
            next(error.statusCode ? error : new AppError(error.message, 500));
        }
    }

    static async updateProfile(req, res, next) {
        try {
            const {
                displayName,
                email,
                dateOfBirth,
                themePreference,
                languagePreference
            } = req.body;

            const updated = await User.updateProfile(req.user.id, {
                displayName,
                email,
                dateOfBirth,
                themePreference,
                languagePreference
            });

            if (!updated) {
                throw new AppError('Failed to update profile', 400);
            }

            logger.info('Profile updated', {
                userId: req.user.id,
                updates: req.body
            });

            res.json({ message: 'Profile updated successfully' });
        } catch (error) {
            next(error.statusCode ? error : new AppError(error.message, 500));
        }
    }

    static async updateAvatar(req, res, next) {
        try {
            // Here you would handle file upload
            // For now, we'll just update the URL
            const { avatarUrl } = req.body;

            const updated = await User.updateProfile(req.user.id, {
                avatarUrl
            });

            if (!updated) {
                throw new AppError('Failed to update avatar', 400);
            }

            res.json({ message: 'Avatar updated successfully' });
        } catch (error) {
            next(error.statusCode ? error : new AppError(error.message, 500));
        }
    }

    static async updatePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;

            const user = await User.findById(req.user.id);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            const isValid = await User.verifyPassword(user, currentPassword);
            if (!isValid) {
                throw new AppError('Current password is incorrect', 401);
            }

            await User.updatePassword(req.user.id, newPassword);

            logger.info('Password updated', {
                userId: req.user.id
            });

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            next(error.statusCode ? error : new AppError(error.message, 500));
        }
    }
}

module.exports = ProfileController; 