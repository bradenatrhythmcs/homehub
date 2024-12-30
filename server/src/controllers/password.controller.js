const Password = require('../models/password.model');
const AppError = require('../utils/AppError');

class PasswordController {
    static async getAllPasswords(req, res, next) {
        try {
            const passwords = await Password.findAll(req.user.id);
            res.json(passwords);
        } catch (error) {
            console.error('Error in getAllPasswords:', error);
            next(new AppError(error.message || 'Error fetching passwords', 500));
        }
    }

    static async getPassword(req, res, next) {
        try {
            const password = await Password.findById(req.params.id);
            if (!password) {
                throw new AppError('Password not found', 404);
            }

            // Only allow parent users or the creator to view the password
            if (req.user.account_type !== 'PARENT' && password.created_by !== req.user.id) {
                throw new AppError('Not authorized to view this password', 403);
            }

            res.json(password);
        } catch (error) {
            next(error);
        }
    }

    static async createPassword(req, res, next) {
        try {
            if (req.user.account_type !== 'PARENT') {
                throw new AppError('Only parent accounts can create passwords', 403);
            }

            const { title, username, password, url, is_child_visible } = req.body;
            const result = await Password.create({
                title,
                username,
                password,
                url,
                is_child_visible,
                createdBy: req.user.id
            });

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async updatePassword(req, res, next) {
        try {
            const password = await Password.findById(req.params.id);
            if (!password) {
                throw new AppError('Password not found', 404);
            }

            // Only allow parent users or the creator to update the password
            if (req.user.account_type !== 'PARENT' && password.created_by !== req.user.id) {
                throw new AppError('Not authorized to update this password', 403);
            }

            const { title, username, password: newPassword, url, is_child_visible } = req.body;
            const result = await Password.update(req.params.id, req.user.id, {
                title,
                username,
                password: newPassword,
                url,
                is_child_visible
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async deletePassword(req, res, next) {
        try {
            const password = await Password.findById(req.params.id);
            if (!password) {
                throw new AppError('Password not found', 404);
            }

            // Only allow the creator to delete the password
            if (password.created_by !== req.user.id) {
                throw new AppError('Not authorized to delete this password', 403);
            }

            await Password.delete(req.params.id, req.user.id);
            res.json({ message: 'Password deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PasswordController; 