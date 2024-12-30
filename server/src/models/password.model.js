const crypto = require('crypto');
const db = require('../db');
const AppError = require('../utils/AppError');
const Encryption = require('../utils/encryption');

class Password {
    static async create({ title, username, password, url, is_child_visible, createdBy }) {
        const { encryptedData, iv } = Encryption.encrypt(password);
        const result = await db.run(
            `INSERT INTO passwords (title, username, password, iv, url, is_child_visible, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, username, encryptedData, iv, url, is_child_visible ? 1 : 0, createdBy]
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
            // Non-parent users see only passwords marked as visible to children
            return db.all(
                `SELECT passwords.*, users.username as creator_name
                FROM passwords
                LEFT JOIN users ON passwords.created_by = users.id
                WHERE passwords.is_child_visible = 1
                ORDER BY passwords.title ASC`
            );
        }
    }

    static async findById(passwordId) {
        const password = await db.get(
            `SELECT passwords.*, users.username as creator_name
            FROM passwords
            LEFT JOIN users ON passwords.created_by = users.id
            WHERE passwords.id = ?`,
            [passwordId]
        );

        if (password) {
            password.password = Encryption.decrypt(password.password, password.iv);
        }

        return password;
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

        const { title, username, password: newPassword, url, is_child_visible } = data;
        let encryptedData, iv;
        
        if (newPassword) {
            const encrypted = Encryption.encrypt(newPassword);
            encryptedData = encrypted.encryptedData;
            iv = encrypted.iv;
        } else {
            encryptedData = password.password;
            iv = password.iv;
        }

        await db.run(
            `UPDATE passwords
            SET title = ?,
                username = ?,
                password = ?,
                iv = ?,
                url = ?,
                is_child_visible = ?
            WHERE id = ?`,
            [title, username, encryptedData, iv, url, is_child_visible ? 1 : 0, passwordId]
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

    static async getDecrypted(passwordId, userId) {
        // First check if the user is a parent
        const user = await db.get('SELECT account_type FROM users WHERE id = ?', [userId]);
        
        // Get the password record
        const password = await db.get(
            `SELECT passwords.*, users.username as creator_name
            FROM passwords
            LEFT JOIN users ON passwords.created_by = users.id
            WHERE passwords.id = ?`,
            [passwordId]
        );

        if (!password) {
            throw new AppError('Password not found', 404);
        }

        // Check access:
        // - Allow if user is parent
        // - Allow if user is creator
        // - Allow if password is child-visible and user is a child
        if (user.account_type !== 'PARENT' && 
            password.created_by !== userId && 
            !(user.account_type === 'CHILD' && password.is_child_visible === 1)) {
            throw new AppError('Access denied', 403);
        }

        // Decrypt the password
        password.password = Encryption.decrypt(password.password, password.iv);
        return password;
    }
}

module.exports = Password; 