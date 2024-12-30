const db = require('../db');

class WifiNetwork {
    static async findById(id) {
        try {
            const network = await db.get(
                `SELECT w.*, u.username as created_by_username
                FROM wifi_networks w
                LEFT JOIN users u ON w.created_by = u.id
                WHERE w.id = ?`,
                [id]
            );
            return network;
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    static async findAll(userId) {
        try {
            const networks = await db.all(
                `SELECT w.*, u.username as created_by_username
                FROM wifi_networks w
                LEFT JOIN users u ON w.created_by = u.id
                WHERE w.created_by = ?`,
                [userId]
            );
            return networks;
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    static async create({ ssid, password, encryption_type = 'WPA', is_hidden = false, created_by }) {
        try {
            const result = await db.run(
                `INSERT INTO wifi_networks (ssid, password, encryption_type, is_hidden, created_by)
                VALUES (?, ?, ?, ?, ?)`,
                [ssid, password, encryption_type, is_hidden, created_by]
            );
            return result.lastID;
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }

    static async update(id, { ssid, password, encryption_type, is_hidden }) {
        try {
            await db.run(
                `UPDATE wifi_networks
                SET ssid = ?, password = ?, encryption_type = ?, is_hidden = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                [ssid, password, encryption_type, is_hidden, id]
            );
            return id;
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            await db.run('DELETE FROM wifi_networks WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }
}

module.exports = WifiNetwork; 