const { body, param } = require('express-validator');

const userValidators = {
    login: [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    register: [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/\d/)
            .withMessage('Password must contain at least one number')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter'),
        body('date_of_birth')
            .notEmpty()
            .withMessage('Date of birth is required')
            .custom((value) => {
                // Accept both ISO format and simple YYYY-MM-DD format
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    throw new Error('Invalid date format');
                }
                if (date > new Date()) {
                    throw new Error('Date of birth cannot be in the future');
                }
                return true;
            })
    ],
    update: [
        param('id').isInt().withMessage('Invalid user ID'),
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username can only contain letters, numbers, underscores and dashes'),
        body('dateOfBirth')
            .optional()
            .isISO8601()
            .withMessage('Invalid date format'),
        body('isAdmin')
            .optional()
            .isBoolean()
            .withMessage('isAdmin must be a boolean value')
    ]
};

const wifiValidators = {
    create: [
        body('ssid')
            .trim()
            .notEmpty()
            .withMessage('SSID is required')
            .isLength({ max: 32 })
            .withMessage('SSID must not exceed 32 characters'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
            .isLength({ min: 8, max: 63 })
            .withMessage('Password must be between 8 and 63 characters'),
        body('encryptionType')
            .optional()
            .isIn(['WPA', 'WPA2', 'WPA3', 'WEP', 'NONE'])
            .withMessage('Invalid encryption type'),
        body('isHidden')
            .optional()
            .isBoolean()
            .withMessage('isHidden must be a boolean value')
    ],
    update: [
        param('id').isInt().withMessage('Invalid network ID'),
        body('ssid')
            .optional()
            .trim()
            .isLength({ max: 32 })
            .withMessage('SSID must not exceed 32 characters'),
        body('password')
            .optional()
            .trim()
            .isLength({ min: 8, max: 63 })
            .withMessage('Password must be between 8 and 63 characters'),
        body('encryptionType')
            .optional()
            .isIn(['WPA', 'WPA2', 'WPA3', 'WEP', 'NONE'])
            .withMessage('Invalid encryption type'),
        body('isHidden')
            .optional()
            .isBoolean()
            .withMessage('isHidden must be a boolean value')
    ]
};

const profileValidators = {
    updateProfile: [
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters'),
        body('avatar_url')
            .optional()
            .trim()
            .isURL()
            .withMessage('Invalid URL format')
    ],
    updatePassword: [
        body('current_password')
            .notEmpty()
            .withMessage('Current password is required'),
        body('new_password')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters long')
            .matches(/\d/)
            .withMessage('New password must contain at least one number')
            .matches(/[A-Z]/)
            .withMessage('New password must contain at least one uppercase letter')
    ]
};

const adminValidators = {
    deleteUser: [
        param('id')
            .isInt()
            .withMessage('Invalid user ID')
    ],
    resetPassword: [
        param('id')
            .isInt()
            .withMessage('Invalid user ID'),
        body('new_password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/\d/)
            .withMessage('Password must contain at least one number')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
    ],
    updateUser: [
        param('id').isInt().withMessage('Invalid user ID'),
        body('is_admin').optional().isBoolean().withMessage('Invalid admin status'),
        body('account_type').optional().isIn(['PARENT', 'CHILD']).withMessage('Invalid account type'),
        body('date_of_birth').optional().isISO8601().withMessage('Invalid date format')
    ]
};

const accountValidators = {
    create: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ max: 100 })
            .withMessage('Title must not exceed 100 characters'),
        body('category_id')
            .notEmpty()
            .withMessage('Category is required')
            .isInt()
            .withMessage('Invalid category ID'),
        body('owner_id')
            .notEmpty()
            .withMessage('Owner is required')
            .isInt()
            .withMessage('Invalid owner ID'),
        body('account_number')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Account number must not exceed 50 characters'),
        body('company_name')
            .trim()
            .notEmpty()
            .withMessage('Company name is required')
            .isLength({ max: 100 })
            .withMessage('Company name must not exceed 100 characters'),
        body('note')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Note must not exceed 500 characters'),
        body('password_id')
            .optional()
            .isInt()
            .withMessage('Invalid password ID'),
        body('bill_id')
            .optional()
            .isInt()
            .withMessage('Invalid bill ID')
    ],
    update: [
        param('id')
            .isInt()
            .withMessage('Invalid account ID'),
        body('title')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Title must not exceed 100 characters'),
        body('category_id')
            .optional()
            .isInt()
            .withMessage('Invalid category ID'),
        body('owner_id')
            .optional()
            .isInt()
            .withMessage('Invalid owner ID'),
        body('account_number')
            .optional()
            .trim()
            .isLength({ max: 50 })
            .withMessage('Account number must not exceed 50 characters'),
        body('company_name')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Company name must not exceed 100 characters'),
        body('note')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Note must not exceed 500 characters'),
        body('password_id')
            .optional()
            .isInt()
            .withMessage('Invalid password ID'),
        body('bill_id')
            .optional()
            .isInt()
            .withMessage('Invalid bill ID')
    ]
};

module.exports = {
    userValidators,
    wifiValidators,
    profileValidators,
    adminValidators,
    accountValidators
}; 