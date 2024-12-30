const WifiNetwork = require('../models/wifi-network');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

class WifiController {
    static async createNetwork(req, res, next) {
        try {
            const { ssid, password, encryptionType = 'WPA', isHidden = false } = req.body;
            
            if (!ssid || !password) {
                return res.status(400).json({ message: 'SSID and password are required' });
            }

            const networkId = await WifiNetwork.create({
                ssid,
                password,
                encryptionType,
                isHidden,
                createdBy: req.user.id
            });

            logger.info('Network created', {
                networkId,
                ssid,
                createdBy: req.user.id
            });

            res.status(201).json({ message: 'Network created successfully', networkId });
        } catch (error) {
            logger.error('Error creating network', {
                error: error.message,
                user: req.user.id
            });
            next(error.statusCode ? error : new AppError(error.message, 500));
        }
    }

    static async getNetworks(req, res) {
        try {
            const networks = await WifiNetwork.findAll();
            res.json(networks);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    static async getNetwork(req, res) {
        try {
            const network = await WifiNetwork.findById(req.params.id);
            if (!network) {
                return res.status(404).json({ message: 'Network not found' });
            }
            res.json(network);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    static async deleteNetwork(req, res, next) {
        try {
            const { id } = req.params;
            const network = await WifiNetwork.findById(id);
            
            if (!network) {
                throw new AppError('Network not found', 404);
            }

            await WifiNetwork.delete(id);
            res.json({ message: 'Network deleted successfully' });
        } catch (error) {
            next(error.statusCode ? error : new AppError(error.message, 500));
        }
    }

    static async updateNetwork(req, res, next) {
        try {
            const { id } = req.params;
            const { ssid, password, encryptionType, isHidden } = req.body;
            
            const network = await WifiNetwork.findById(id);
            if (!network) {
                throw new AppError('Network not found', 404);
            }

            await WifiNetwork.update(id, {
                ssid,
                password,
                encryptionType,
                isHidden
            });

            res.json({ message: 'Network updated successfully' });
        } catch (error) {
            next(error.statusCode ? error : new AppError(error.message, 500));
        }
    }
}

module.exports = WifiController; 