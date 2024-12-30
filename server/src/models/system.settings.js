const db = require('../db');
const { encrypt, decrypt } = require('../utils/encryption');

class SystemSettings {
    static async initialize() {
        const query = `
            CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                is_encrypted INTEGER DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.run(query);
    }

    static async get(key) {
        const query = 'SELECT value, is_encrypted FROM system_settings WHERE key = ?';
        const result = await db.get(query, [key]);
        
        if (!result) return null;
        
        return result.is_encrypted ? decrypt(result.value) : result.value;
    }

    static async set(key, value, shouldEncrypt = false) {
        const storedValue = shouldEncrypt ? encrypt(value) : value;
        const query = `
            INSERT INTO system_settings (key, value, is_encrypted, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET
                value = excluded.value,
                is_encrypted = excluded.is_encrypted,
                updated_at = CURRENT_TIMESTAMP
        `;
        await db.run(query, [key, storedValue, shouldEncrypt ? 1 : 0]);
    }

    static async getGitHubToken() {
        return await this.get('github_token');
    }

    static async setGitHubToken(token) {
        await this.set('github_token', token, true);
    }

    static async getAllSettings() {
        const query = 'SELECT key, value, is_encrypted, updated_at FROM system_settings';
        const results = await db.all(query);
        
        return results.map(result => ({
            key: result.key,
            value: result.is_encrypted ? decrypt(result.value) : result.value,
            updatedAt: result.updated_at
        }));
    }

    static async deleteSetting(key) {
        const query = 'DELETE FROM system_settings WHERE key = ?';
        await db.run(query, [key]);
    }
}

module.exports = SystemSettings; 