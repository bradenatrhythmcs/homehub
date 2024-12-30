const { runQuery, getQuery } = require('./database');
const AppError = require('../utils/AppError');

class WiFiNetwork {
    static async create(networkData) {
        const { ssid, password, encryptionType } = networkData;
        
        try {
            // Insert the network
            const result = await runQuery(
                `INSERT INTO wifi_networks (ssid, password, encryption_type) 
                 VALUES (?, ?, ?)`,
                [ssid, password, encryptionType]
            );

            if (!result || typeof result.lastID !== 'number') {
                throw new AppError('Failed to create network', 500);
            }

            // Fetch the created network
            const [network] = await getQuery(
                'SELECT * FROM wifi_networks WHERE id = ?',
                [result.lastID]
            );

            if (!network) {
                throw new AppError('Network created but not found', 500);
            }

            return network;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Database error while creating network', 500);
        }
    }

    static async findAll() {
        try {
            return await getQuery(
                'SELECT * FROM wifi_networks ORDER BY created_at DESC'
            );
        } catch (error) {
            throw new AppError('Failed to fetch networks', 500);
        }
    }

    static async delete(id) {
        try {
            const result = await runQuery(
                'DELETE FROM wifi_networks WHERE id = ?',
                [id]
            );
            return result.changes > 0;
        } catch (error) {
            throw new AppError('Failed to delete network', 500);
        }
    }
}

module.exports = WiFiNetwork; 