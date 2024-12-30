const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const PasswordController = require('../controllers/password.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const Password = require('../models/password.model');
const AppError = require('../utils/AppError');

// Validation schemas
const passwordValidators = {
    create: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ max: 100 })
            .withMessage('Title must not exceed 100 characters'),
        body('username')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Username must not exceed 100 characters'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 1, max: 500 })
            .withMessage('Password must not exceed 500 characters'),
        body('url')
            .optional({ nullable: true, checkFalsy: true })
            .trim()
            .isURL()
            .withMessage('If provided, URL must be valid'),
        body('isChildVisible')
            .optional()
            .isBoolean()
            .withMessage('isChildVisible must be a boolean value')
    ],
    update: [
        param('id')
            .isInt()
            .withMessage('Invalid password ID'),
        body('title')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Title must not exceed 100 characters'),
        body('username')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Username must not exceed 100 characters'),
        body('password')
            .optional()
            .isLength({ min: 1, max: 500 })
            .withMessage('Password must not exceed 500 characters'),
        body('url')
            .optional()
            .trim()
            .isURL()
            .withMessage('Invalid URL format'),
        body('isChildVisible')
            .optional()
            .isBoolean()
            .withMessage('isChildVisible must be a boolean value')
    ]
};

// All routes require authentication
router.use(authMiddleware);

// Get all passwords (filtered by user type and visibility)
router.get('/', PasswordController.getAllPasswords);

// Get a specific password
router.get('/:id', 
    param('id').isInt().withMessage('Invalid password ID'),
    validate(passwordValidators.update),
    PasswordController.getPassword
);

// Create a new password (parent only)
router.post('/',
    validate(passwordValidators.create),
    PasswordController.createPassword
);

// Update a password (parent only)
router.put('/:id',
    validate(passwordValidators.update),
    PasswordController.updatePassword
);

// Delete a password (parent only)
router.delete('/:id',
    param('id').isInt().withMessage('Invalid password ID'),
    validate(passwordValidators.update),
    PasswordController.deletePassword
);

// Add this route after your other password routes
router.get('/:id/decrypt', authMiddleware, async (req, res, next) => {
    try {
        const passwordId = parseInt(req.params.id);
        const userId = req.user.id;

        const decryptedPassword = await Password.getDecrypted(passwordId, userId);
        
        if (!decryptedPassword) {
            throw new AppError('Password not found or access denied', 404);
        }

        res.json({ decryptedPassword: decryptedPassword.password });
    } catch (error) {
        console.error('Decrypt route error:', error);
        next(error);
    }
});

module.exports = router; 