const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const AppError = require('../utils/AppError');
const UserController = require('../controllers/user.controller');

// Public routes
router.get('/profiles', async (req, res, next) => {
    try {
        const users = await User.findAll();
        // Remove sensitive information
        const profiles = users.map(user => ({
            id: user.id,
            username: user.username,
            account_type: user.account_type
        }));
        res.json(profiles);
    } catch (error) {
        next(error);
    }
});

// Get upcoming birthdays (public route)
router.get('/birthdays/upcoming', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const birthdays = await User.getUpcomingBirthdays(limit);
        res.json(birthdays);
    } catch (error) {
        next(error);
    }
});

// Get all users with minimal info
router.get('/all', async (req, res, next) => {
    try {
        const users = await User.findAll();
        // Remove sensitive information and only return necessary fields
        const usersList = users.map(user => ({
            id: user.id,
            username: user.username,
            account_type: user.account_type
        }));
        res.json(usersList);
    } catch (error) {
        next(error);
    }
});

// Protected routes below this line
router.use(authMiddleware);

// Get user profile by ID
router.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Remove sensitive data
        delete user.password;

        // Add full avatar URL if avatar exists
        if (user.avatar_path) {
            user.avatar_url = `${process.env.API_URL}/uploads/${user.avatar_path}`;
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});

// Get user by username - needs to be before /:id route to prevent conflicts
router.get('/by-username/:username', async (req, res, next) => {
    try {
        const user = await User.findByUsername(req.params.username);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Remove sensitive data
        delete user.password;

        // Add full avatar URL if avatar exists
        if (user.avatar_path) {
            user.avatar_url = `${process.env.API_URL}/uploads/${user.avatar_path}`;
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});

// Admin only routes
router.use(adminMiddleware);

// Update user
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, isAdmin, dateOfBirth } = req.body;

        const updated = await User.update(id, { username, isAdmin, dateOfBirth });
        if (!updated) {
            throw new AppError('User not found', 404);
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        next(error);
    }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await User.delete(id);
        if (!deleted) {
            throw new AppError('User not found', 404);
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 