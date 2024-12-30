const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken, adminRequired } = require('../middleware/auth');
const User = require('../models/user');
const Category = require('../models/category');

const BACKUP_DIR = path.join(__dirname, '../../data/backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(adminRequired);

// Category Management Routes
router.get('/categories', async (req, res) => {
    try {
        console.log('Fetching categories...');
        const categories = await Category.getAllWithUsage();
        console.log('Categories fetched:', categories);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            errno: error.errno
        });
        res.status(500).json({ 
            error: 'Failed to fetch categories',
            details: error.message,
            code: error.code
        });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const category = await Category.create(name.trim(), color);
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        if (error.message === 'Category already exists') {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to create category' });
        }
    }
});

router.put('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;

        if (name) {
            if (typeof name !== 'string' || !name.trim()) {
                return res.status(400).json({ error: 'Invalid category name' });
            }
            const category = await Category.rename(id, name.trim());
            res.json(category);
        } else if (color) {
            if (typeof color !== 'string' || !color.trim()) {
                return res.status(400).json({ error: 'Invalid color value' });
            }
            const category = await Category.updateColor(id, color.trim());
            res.json(category);
        } else {
            res.status(400).json({ error: 'No valid update parameters provided' });
        }
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.message === 'Category not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Category already exists') {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to update category' });
        }
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Category.delete(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting category:', error);
        if (error.message === 'Category not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Category is in use') {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to delete category' });
        }
    }
});

// User Management Routes
// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        // Remove sensitive data
        users.forEach(user => delete user.password);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent admin from deleting themselves
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const deleted = await User.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Reset user password
router.post('/users/:id/reset-password', async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.updatePassword(id, new_password);
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_admin, account_type } = req.body;

        // Prevent admin from changing their own role
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot modify your own role' });
        }

        const updated = await User.update(id, { 
            isAdmin: is_admin,
            accountType: account_type
        });

        if (!updated) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = await User.findById(id);
        delete user.password;

        res.json(user);
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Database backup routes
// Create a database backup
router.post('/backup', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.sqlite`);
        
        // Copy the current database file
        fs.copyFileSync(
            path.join(__dirname, '../../data/database.sqlite'),
            backupPath
        );

        res.json({ message: 'Backup created successfully', filename: `backup-${timestamp}.sqlite` });
    } catch (error) {
        console.error('Backup creation failed:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// Get list of backups
router.get('/backups', async (req, res) => {
    try {
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.endsWith('.sqlite'))
            .map(file => {
                const stats = fs.statSync(path.join(BACKUP_DIR, file));
                return {
                    filename: file,
                    created: stats.birthtime,
                    size: stats.size
                };
            })
            .sort((a, b) => b.created - a.created);

        res.json(backups);
    } catch (error) {
        console.error('Failed to list backups:', error);
        res.status(500).json({ error: 'Failed to list backups' });
    }
});

// Restore from backup
router.post('/restore/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const backupPath = path.join(BACKUP_DIR, filename);
        const dbPath = path.join(__dirname, '../../data/database.sqlite');

        // Verify backup exists
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ error: 'Backup file not found' });
        }

        // Create a temporary backup of current database
        const tempBackup = path.join(BACKUP_DIR, 'pre-restore-backup.sqlite');
        fs.copyFileSync(dbPath, tempBackup);

        try {
            // Copy backup file to main database
            fs.copyFileSync(backupPath, dbPath);
            // Remove temporary backup
            fs.unlinkSync(tempBackup);
            res.json({ message: 'Database restored successfully' });
        } catch (error) {
            // If restore fails, try to recover from temp backup
            if (fs.existsSync(tempBackup)) {
                fs.copyFileSync(tempBackup, dbPath);
                fs.unlinkSync(tempBackup);
            }
            throw error;
        }
    } catch (error) {
        console.error('Restore failed:', error);
        res.status(500).json({ error: 'Failed to restore database' });
    }
});

// Delete a backup
router.delete('/backup/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const backupPath = path.join(BACKUP_DIR, filename);

        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ error: 'Backup file not found' });
        }

        fs.unlinkSync(backupPath);
        res.json({ message: 'Backup deleted successfully' });
    } catch (error) {
        console.error('Delete failed:', error);
        res.status(500).json({ error: 'Failed to delete backup' });
    }
});

module.exports = router; 