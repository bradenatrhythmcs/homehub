const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Protected routes
router.use(authMiddleware);
router.get('/check', (req, res) => {
    res.json({ user: req.user });
});

// Logout endpoint - just a 200 response since JWT handling is client-side
router.post('/logout', (req, res) => res.sendStatus(200));

module.exports = router; 