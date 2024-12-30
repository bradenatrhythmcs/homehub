const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config/auth');

class User {
    static async findById(id) {
        try {
            const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
            if (user) {
                delete user.password; // Don't send password
            }
            return user;
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    static async findByUsername(username) {
        try {
            return await db.get('SELECT * FROM users WHERE username = ?', [username]);
        } catch (error) {
            console.error('Error in findByUsername:', error);
            throw error;
        }
    }

    static async authenticate(username, password) {
        try {
            const user = await this.findByUsername(username);
            
            if (!user) {
                return null;
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return null;
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRY }
            );

            // Don't send password
            delete user.password;

            return {
                user,
                token
            };
        } catch (error) {
            console.error('Error in authenticate:', error);
            throw error;
        }
    }

    static async create(userData) {
        const { username, password, date_of_birth, account_type = 'CHILD', is_admin = false } = userData;

        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await db.run(
                `INSERT INTO users (
                    username, 
                    password, 
                    date_of_birth, 
                    account_type, 
                    is_admin
                ) VALUES (?, ?, ?, ?, ?)`,
                [username, hashedPassword, date_of_birth, account_type, is_admin]
            );

            const user = await this.findById(result.lastID);
            return user;
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }

    static async findAll() {
        try {
            const users = await db.all('SELECT * FROM users ORDER BY username ASC');
            users.forEach(user => delete user.password);
            return users;
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    static async update(id, updates) {
        const allowedUpdates = ['username', 'date_of_birth', 'account_type', 'is_admin', 'display_name', 'email', 'theme_preference', 'language_preference'];
        const updateFields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key) && updates[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return false;
        }

        values.push(id);

        try {
            const result = await db.run(
                `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    }

    static async updatePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const result = await db.run(
                'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, id]
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error in updatePassword:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
            return result.changes > 0;
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }
}

module.exports = User; 