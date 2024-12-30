const User = require('../models/user');
const { AppError } = require('../middleware/error.middleware');

class UserController {
    static async getAllUsers(req, res, next) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            next(new AppError('Error fetching users', 500));
        }
    }

    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const { username, isAdmin } = req.body;

            // Only admins can update admin status
            if (isAdmin !== undefined && !req.user.isAdmin) {
                throw new AppError('Admin privileges required', 403);
            }

            const updated = await User.update(id, { username, isAdmin });
            if (!updated) {
                throw new AppError('User not found', 404);
            }

            res.json({ message: 'User updated successfully' });
        } catch (error) {
            next(error.statusCode ? error : new AppError(error.message, 500));
        }
    }

    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;

            // Prevent self-deletion
            if (id === req.user.id) {
                throw new AppError('Cannot delete your own account', 400);
            }

            const deleted = await User.delete(id);
            if (!deleted) {
                throw new AppError('User not found', 404);
            }

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            next(error.statusCode ? error : new AppError(error.message, 500));
        }
    }
}

module.exports = UserController; 