const db = require('../db');
const AppError = require('../utils/AppError');

class Password {
    static async create({ title, username, password, url, notes, createdBy }) {
        const result = await db.run(
            `INSERT INTO passwords (title, username, password, url, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [title, username, password, url, notes, createdBy]
        );

        return this.findById(result.lastID);
    }

    static async findAll(userId) {
        // First check if the user is a parent
        const user = await db.get('SELECT account_type FROM users WHERE id = ?', [userId]);
        
        if (user.account_type === 'PARENT') {
            // Parent users can see all passwords
            return db.all(
                `SELECT passwords.*, users.username as creator_name
                FROM passwords
                LEFT JOIN users ON passwords.created_by = users.id
                ORDER BY passwords.title ASC`
            );
        } else {
            // Non-parent users only see their own passwords
            return db.all(
                `SELECT passwords.*, users.username as creator_name
                FROM passwords
                LEFT JOIN users ON passwords.created_by = users.id
                WHERE passwords.created_by = ?
                ORDER BY passwords.title ASC`,
                [userId]
            );
        }
    }

    static async findById(passwordId) {
        return db.get(
            `SELECT passwords.*, users.username as creator_name
            FROM passwords
            LEFT JOIN users ON passwords.created_by = users.id
            WHERE passwords.id = ?`,
            [passwordId]
        );
    }

    static async update(passwordId, userId, data) {
        const [password, user] = await Promise.all([
            this.findById(passwordId),
            db.get('SELECT account_type FROM users WHERE id = ?', [userId])
        ]);

        if (!password) {
            throw new AppError('Password not found', 404);
        }

        // Allow update if user is a parent or the creator
        if (user.account_type !== 'PARENT' && password.created_by !== userId) {
            throw new AppError('Not authorized to update this password', 403);
        }

        const { title, username, password: newPassword, url, notes } = data;

        await db.run(
            `UPDATE passwords
            SET title = ?,
                username = ?,
                password = ?,
                url = ?,
                notes = ?
            WHERE id = ?`,
            [title, username, newPassword, url, notes, passwordId]
        );

        return this.findById(passwordId);
    }

    static async delete(passwordId, userId) {
        const [password, user] = await Promise.all([
            this.findById(passwordId),
            db.get('SELECT account_type FROM users WHERE id = ?', [userId])
        ]);

        if (!password) {
            throw new AppError('Password not found', 404);
        }

        // Allow deletion if user is a parent or the creator
        if (user.account_type !== 'PARENT' && password.created_by !== userId) {
            throw new AppError('Not authorized to delete this password', 403);
        }

        await db.run('DELETE FROM passwords WHERE id = ?', [passwordId]);
    }
}

module.exports = Password; 