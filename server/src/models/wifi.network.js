const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const Encryption = require('../utils/encryption');

class WifiNetwork {
    static async findAll() {
        const query = `
            SELECT n.*, u.username as creator_name
            FROM wifi_networks n
            LEFT JOIN users u ON n.created_by = u.id
            ORDER BY n.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows.map(network => this.decryptNetwork(network));
    }

    static async findById(id) {
        const query = `
            SELECT n.*, u.username as creator_name
            FROM wifi_networks n
            LEFT JOIN users u ON n.created_by = u.id
            WHERE n.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0] ? this.decryptNetwork(result.rows[0]) : null;
    }

    static async create({ ssid, password, createdBy }) {
        const id = uuidv4();
        const encryptedPassword = Encryption.encrypt(password);

        const query = `
            INSERT INTO wifi_networks (
                id, ssid, password, password_iv, created_by
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const result = await db.query(query, [
            id,
            ssid,
            encryptedPassword.encryptedData,
            encryptedPassword.iv,
            createdBy
        ]);

        return this.decryptNetwork(result.rows[0]);
    }

    static async update(id, { ssid, password }) {
        let updateFields = [];
        let values = [];
        let paramCount = 1;

        if (ssid) {
            updateFields.push(`ssid = $${paramCount}`);
            values.push(ssid);
            paramCount++;
        }

        if (password) {
            const encryptedPassword = Encryption.encrypt(password);
            updateFields.push(`
                password = $${paramCount},
                password_iv = $${paramCount + 1}
            `);
            values.push(encryptedPassword.encryptedData, encryptedPassword.iv);
            paramCount += 2;
        }

        if (updateFields.length === 0) {
            return null;
        }

        values.push(id);
        const query = `
            UPDATE wifi_networks
            SET ${updateFields.join(', ')},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0] ? this.decryptNetwork(result.rows[0]) : null;
    }

    static async delete(id) {
        const query = 'DELETE FROM wifi_networks WHERE id = $1';
        await db.query(query, [id]);
        return true;
    }

    static decryptNetwork(network) {
        if (!network) return null;

        const decryptedNetwork = { ...network };
        
        if (network.password && network.password_iv) {
            decryptedNetwork.password = Encryption.decrypt(
                network.password,
                network.password_iv
            );
        }

        delete decryptedNetwork.password_iv;
        return decryptedNetwork;
    }
}

module.exports = WifiNetwork; 