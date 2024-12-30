const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { authMiddleware } = require('../middleware/auth.middleware');
const AppError = require('../utils/AppError');

// All routes require authentication
router.use(authMiddleware);

// Get current user's profile
router.get('/', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Remove sensitive data
        delete user.password;

        res.json(user);
    } catch (error) {
        next(error);
    }
});

// Update current user's profile
router.put('/', async (req, res, next) => {
    try {
        const { username } = req.body;
        if (!username) {
            throw new AppError('Username is required', 400);
        }

        // Check if username is already taken by another user
        const existingUser = await User.findByUsername(username);
        if (existingUser && existingUser.id !== req.user.id) {
            throw new AppError('Username is already taken', 400);
        }

        const updated = await User.update(req.user.id, { username });
        if (!updated) {
            throw new AppError('Failed to update profile', 500);
        }

        const user = await User.findById(req.user.id);
        delete user.password;
        res.json(user);
    } catch (error) {
        next(error);
    }
});

// Update current user's password
router.put('/password', async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;
        if (!current_password || !new_password) {
            throw new AppError('Current password and new password are required', 400);
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        const isValidPassword = await User.verifyPassword(req.user.id, current_password);
        if (!isValidPassword) {
            throw new AppError('Current password is incorrect', 400);
        }

        const updated = await User.updatePassword(req.user.id, new_password);
        if (!updated) {
            throw new AppError('Failed to update password', 500);
        }

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 