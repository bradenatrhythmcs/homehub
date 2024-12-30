const express = require('express');
const router = express.Router();
const WiFiNetwork = require('../models/wifi');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const { wifiValidators } = require('../middleware/validators');
const validate = require('../middleware/validate.middleware');
const AppError = require('../utils/AppError');

// Public route - Get all networks
router.get('/', async (req, res, next) => {
    try {
        const networks = await WiFiNetwork.findAll();
        res.json(networks);
    } catch (error) {
        next(error);
    }
});

// Public route - Get latest network
router.get('/latest', async (req, res, next) => {
    try {
        const networks = await WiFiNetwork.findAll();
        const latestNetwork = networks[0]; // Networks are already ordered by created_at DESC
        res.json(latestNetwork || null);
    } catch (error) {
        next(error);
    }
});

// Protect admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin only - Create network
router.post('/', validate(wifiValidators.create), async (req, res, next) => {
    try {
        const network = await WiFiNetwork.create(req.body);
        res.status(201).json(network);
    } catch (error) {
        next(error);
    }
});

// Admin only - Delete network
router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await WiFiNetwork.delete(Number(req.params.id));
        if (!deleted) {
            throw new AppError('Network not found', 404);
        }
        res.json({ message: 'Network deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 